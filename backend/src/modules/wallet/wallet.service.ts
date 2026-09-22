import { dbManager } from '../db';

export type AssetType = 'TOKEN' | 'TICKET' | 'POINT' | 'EXP';
export type TransactionType =
  | 'OFFLINE_TOPUP'
  | 'ONLINE_PURCHASE'
  | 'MACHINE_PLAY'
  | 'MACHINE_REWARD'
  | 'REWARD_REDEEM'
  | 'DAILY_CHECKIN'
  | 'LUCKY_WHEEL'
  | 'STAFF_ADJUSTMENT';

export interface ApplyTxDto {
  userId: string;
  assetType: AssetType;
  amount: number; // positive = credit/deposit, negative = debit/spend
  txType: TransactionType;
  description: string;
  machineId?: string;
  paymentOrderId?: string;
  metadata?: any;
}

export class WalletService {
  // 1. 取得多資產餘額總覽 (O(1) 瞬時查詢)
  async getBalances(userId: string): Promise<Record<AssetType, number>> {
    if (dbManager.prisma && !dbManager.isUsingMock) {
      const groups = await dbManager.prisma.walletTransaction.groupBy({
        by: ['assetType'],
        where: { userId },
        _sum: { amount: true },
      });
      const res: Record<AssetType, number> = { TOKEN: 0, TICKET: 0, POINT: 0, EXP: 0 };
      groups.forEach((g: any) => {
        res[g.assetType as AssetType] = Number(g._sum.amount || 0);
      });
      return res;
    }

    // O(1) Instant Cache Lookup
    let userBal = dbManager.memoryStore.userBalances.get(userId);
    if (!userBal) {
      userBal = { TOKEN: 0, TICKET: 0, POINT: 0, EXP: 0 };
      dbManager.memoryStore.userBalances.set(userId, userBal);
    }
    return { ...userBal } as Record<AssetType, number>;
  }

  // 2. 雙重記帳核心原子化交易 (O(1) 高效原子記帳)
  async applyTransaction(dto: ApplyTxDto) {
    const { userId, assetType, amount, txType, description, machineId, paymentOrderId, metadata } = dto;

    if (dbManager.prisma && !dbManager.isUsingMock) {
      return dbManager.prisma.$transaction(async (prismaTx: any) => {
        const sumResult = await prismaTx.walletTransaction.aggregate({
          where: { userId, assetType },
          _sum: { amount: true },
        });
        const currentBal = Number(sumResult._sum.amount || 0);
        const newBal = currentBal + amount;

        if (newBal < 0) {
          throw new Error(`餘額不足！當前 ${assetType} 餘額為 ${currentBal}，無法扣除 ${Math.abs(amount)}`);
        }

        const record = await prismaTx.walletTransaction.create({
          data: {
            userId,
            assetType,
            amount,
            balanceAfter: newBal,
            txType,
            description,
            machineId,
            paymentOrderId,
            metadata: metadata ? JSON.stringify(metadata) : null,
          },
        });

        // Check VIP EXP Level Up if applicable
        if (assetType === 'EXP' || assetType === 'TOKEN') {
          await this.checkAndUpdateVipTier(userId, prismaTx);
        }

        return {
          success: true,
          transactionId: record.id,
          assetType,
          amount,
          balanceAfter: newBal,
        };
      });
    }

    // O(1) Ultra-Fast In-Memory Ledger Engine
    let userBal = dbManager.memoryStore.userBalances.get(userId);
    if (!userBal) {
      userBal = { TOKEN: 0, TICKET: 0, POINT: 0, EXP: 0 };
      dbManager.memoryStore.userBalances.set(userId, userBal);
    }

    const currentBal = userBal[assetType] || 0;
    const newBal = currentBal + amount;

    if (newBal < 0) {
      throw new Error(`餘額不足！當前 ${assetType} 餘額為 ${currentBal}，無法扣除 ${Math.abs(amount)}`);
    }

    // Update O(1) balance cache directly
    userBal[assetType] = newBal;

    const txId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const txRecord = {
      id: txId,
      userId,
      assetType,
      amount,
      balanceAfter: newBal,
      txType,
      description,
      machineId: machineId || null,
      paymentOrderId: paymentOrderId || null,
      metadata: metadata ? JSON.stringify(metadata) : null,
      createdAt: new Date(),
    };

    // Global append-only ledger
    dbManager.memoryStore.transactions.push(txRecord);

    // O(1) User-specific transaction list (Prepend for instant reverse-chronological retrieval)
    let userTxList = dbManager.memoryStore.userTransactions.get(userId);
    if (!userTxList) {
      userTxList = [];
      dbManager.memoryStore.userTransactions.set(userId, userTxList);
    }
    userTxList.unshift(txRecord);

    // Update user EXP and VIP Tier in memory
    const user = dbManager.memoryStore.users.get(userId);
    if (user) {
      if (assetType === 'EXP' && amount > 0) {
        user.expPoints = (user.expPoints || 0) + amount;
        user.tier = this.calculateTier(user.expPoints);
      }
    }

    return {
      success: true,
      transactionId: txId,
      assetType,
      amount,
      balanceAfter: newBal,
    };
  }

  // 3. 取得歷史交易明細 (O(k) 局部讀取)
  async getTransactionHistory(userId: string, assetType?: AssetType, limit = 50) {
    if (dbManager.prisma && !dbManager.isUsingMock) {
      return dbManager.prisma.walletTransaction.findMany({
        where: {
          userId,
          ...(assetType ? { assetType } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: { machine: true },
      });
    }

    // O(k) User-Indexed Lookup (Already sorted newest first)
    const userTxList = dbManager.memoryStore.userTransactions.get(userId) || [];
    const filtered = assetType ? userTxList.filter((t) => t.assetType === assetType) : userTxList;
    const slice = filtered.slice(0, limit);

    return slice.map((t) => {
      const machine = t.machineId ? dbManager.memoryStore.machines.get(t.machineId) : null;
      return { ...t, machine };
    });
  }

  private calculateTier(exp: number): 'NORMAL' | 'BRONZE' | 'SILVER' | 'GOLD' | 'VIP' {
    if (exp >= 20000) return 'VIP';
    if (exp >= 8000) return 'GOLD';
    if (exp >= 3000) return 'SILVER';
    if (exp >= 1000) return 'BRONZE';
    return 'NORMAL';
  }

  private async checkAndUpdateVipTier(userId: string, prismaTx: any) {
    const expSum = await prismaTx.walletTransaction.aggregate({
      where: { userId, assetType: 'EXP' },
      _sum: { amount: true },
    });
    const totalExp = Number(expSum._sum.amount || 0);
    const newTier = this.calculateTier(totalExp);

    await prismaTx.user.update({
      where: { id: userId },
      data: { expPoints: totalExp, tier: newTier },
    });
  }
}

export const walletService = new WalletService();
