import { dbManager } from '../db';
import { walletService } from '../wallet/wallet.service';
import { dynamicQrService } from '../member/dynamic-qr.service';

export interface MachineSwipeDto {
  machineCode: string;
  dynamicToken: string;
  tokensToDeduct?: number;
}

export interface TicketDispenseDto {
  machineCode: string;
  userId: string;
  ticketCount: number;
}

export class HardwareBridgeService {
  // 取得全店機台列表
  async getAllMachines() {
    if (dbManager.prisma && !dbManager.isUsingMock) {
      return dbManager.prisma.machine.findMany({
        orderBy: { machineCode: 'asc' },
      });
    }
    return Array.from(dbManager.memoryStore.machines.values());
  }

  // 1. 機台投幣 (掃描動態會員條碼 -> 驗證 -> 扣代幣 -> 回傳硬體脈衝訊號)
  async handleMachineSwipe(dto: MachineSwipeDto) {
    const { machineCode, dynamicToken } = dto;

    // 尋找機台
    let machine: any = null;
    if (dbManager.prisma && !dbManager.isUsingMock) {
      machine = await dbManager.prisma.machine.findUnique({ where: { machineCode } });
    } else {
      for (const m of dbManager.memoryStore.machines.values()) {
        if (m.machineCode === machineCode) {
          machine = m;
          break;
        }
      }
    }

    if (!machine) {
      throw new Error(`找不到機台代碼: ${machineCode}`);
    }

    if (machine.status !== 'ONLINE') {
      throw new Error(`機台狀態目前為: ${machine.status}，暫停服務！`);
    }

    // 驗證動態會員 QR Code (支援直接傳入 userId 作為測試輔助)
    let userId = '';
    if (dynamicToken.startsWith('ARCADE_V1_')) {
      userId = await dynamicQrService.verifyAndConsumeDynamicCode(dynamicToken);
    } else {
      userId = dynamicToken; // Direct user ID for testing simulator
    }

    const cost = dto.tokensToDeduct !== undefined ? dto.tokensToDeduct : Number(machine.tokenCostPerPlay);

    // 扣除代幣
    const txResult = await walletService.applyTransaction({
      userId,
      assetType: 'TOKEN',
      amount: -cost,
      txType: 'MACHINE_PLAY',
      description: `機台投幣遊玩: ${machine.name} (${machine.machineCode})`,
      machineId: machine.id,
      metadata: { machineCode, machineName: machine.name, cost },
    });

    // 獲得經驗值 (投幣 1 枚 = 10 EXP)
    await walletService.applyTransaction({
      userId,
      assetType: 'EXP',
      amount: cost * 10,
      txType: 'MACHINE_PLAY',
      description: `遊玩獎勵經驗值: ${machine.name}`,
      machineId: machine.id,
    });

    return {
      success: true,
      command: 'TRIGGER_PULSE',
      pulseCount: cost,
      machineCode: machine.machineCode,
      machineName: machine.name,
      tokensDeducted: cost,
      remainingTokens: txResult.balanceAfter,
      userId,
      timestamp: new Date().toISOString(),
    };
  }

  // 2. 機台出票 (遊戲結束過關 -> 機台計數器回傳 -> 存入彩票)
  async handleTicketDispensed(dto: TicketDispenseDto) {
    const { machineCode, userId, ticketCount } = dto;

    if (ticketCount <= 0) {
      throw new Error('出票數量必須大於 0');
    }

    let machine: any = null;
    if (dbManager.prisma && !dbManager.isUsingMock) {
      machine = await dbManager.prisma.machine.findUnique({ where: { machineCode } });
    } else {
      for (const m of dbManager.memoryStore.machines.values()) {
        if (m.machineCode === machineCode) {
          machine = m;
          break;
        }
      }
    }

    const machineName = machine ? machine.name : machineCode;

    // 存入彩票
    const txResult = await walletService.applyTransaction({
      userId,
      assetType: 'TICKET',
      amount: ticketCount,
      txType: 'MACHINE_REWARD',
      description: `機台過關出票獎勵: ${machineName}`,
      machineId: machine ? machine.id : undefined,
      metadata: { machineCode, ticketCount },
    });

    // 經驗值加成 (每 5 張彩票 = 1 EXP)
    const expGain = Math.max(1, Math.floor(ticketCount / 5));
    await walletService.applyTransaction({
      userId,
      assetType: 'EXP',
      amount: expGain,
      txType: 'MACHINE_REWARD',
      description: `出票獲得經驗值: ${machineName}`,
      machineId: machine ? machine.id : undefined,
    });

    return {
      success: true,
      ticketCount,
      totalTicketsAfter: txResult.balanceAfter,
      machineName,
      message: `🎉 成功入票 ${ticketCount} 張彩票！`,
    };
  }
}

export const hardwareBridgeService = new HardwareBridgeService();
