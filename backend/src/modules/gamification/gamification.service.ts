import { dbManager } from '../db';
import { walletService } from '../wallet/wallet.service';

export interface WheelSegment {
  id: number;
  label: string;
  assetType: 'POINT' | 'TOKEN' | 'TICKET' | 'EXP';
  amount: number;
  color: string;
  weight: number; // Probability weighting
}

export class GamificationService {
  public wheelSegments: WheelSegment[] = [
    { id: 0, label: '+20 紅利點數', assetType: 'POINT', amount: 20, color: '#00F5D4', weight: 30 },
    { id: 1, label: '+2 枚代幣', assetType: 'TOKEN', amount: 2, color: '#FF007F', weight: 20 },
    { id: 2, label: '+50 張彩票', assetType: 'TICKET', amount: 50, color: '#FFD166', weight: 20 },
    { id: 3, label: '+50 紅利點數', assetType: 'POINT', amount: 50, color: '#7928CA', weight: 15 },
    { id: 4, label: '🔥 大獎 +10 代幣', assetType: 'TOKEN', amount: 10, color: '#FF0055', weight: 5 },
    { id: 5, label: '+150 張彩票', assetType: 'TICKET', amount: 150, color: '#00C2FF', weight: 5 },
    { id: 6, label: '+100 經驗值', assetType: 'EXP', amount: 100, color: '#10B981', weight: 15 },
    { id: 7, label: '+10 紅利點數', assetType: 'POINT', amount: 10, color: '#F59E0B', weight: 35 },
  ];

  // 1. 每日簽到領取獎勵
  async checkInToday(userId: string) {
    const todayStr = new Date().toISOString().split('T')[0];
    const checkinKey = `${userId}_${todayStr}`;

    // 檢查今天是否已簽到
    const existing = dbManager.memoryStore.dailyCheckins.get(checkinKey);
    if (existing) {
      return {
        alreadyCheckedIn: true,
        message: '您今天已經完成簽到囉！明天再來領取好禮',
        streakDays: existing.streakDays,
      };
    }

    // 計算連續簽到天數 (Streak)
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const yesterdayCheckin = dbManager.memoryStore.dailyCheckins.get(`${userId}_${yesterday}`);
    const streakDays = yesterdayCheckin ? (yesterdayCheckin.streakDays % 7) + 1 : 1;

    // 依天數給予階梯式獎勵 (第 7 天加贈代幣)
    const pointReward = 10 + (streakDays - 1) * 5; // Day 1: 10, Day 7: 40 points
    const tokenReward = streakDays === 7 ? 2 : 0; // Day 7 bonus 2 tokens

    const record = {
      id: `chk_${Date.now()}`,
      userId,
      checkinDate: todayStr,
      rewardPoint: pointReward,
      streakDays,
      createdAt: new Date(),
    };

    dbManager.memoryStore.dailyCheckins.set(checkinKey, record);

    // 寫入點數帳本
    await walletService.applyTransaction({
      userId,
      assetType: 'POINT',
      amount: pointReward,
      txType: 'DAILY_CHECKIN',
      description: `連續簽到第 ${streakDays} 天獎勵 (+${pointReward} 點)`,
    });

    // 若第 7 天加贈代幣
    if (tokenReward > 0) {
      await walletService.applyTransaction({
        userId,
        assetType: 'TOKEN',
        amount: tokenReward,
        txType: 'DAILY_CHECKIN',
        description: `連續簽到 7 天滿貫特獎 (+${tokenReward} 代幣)`,
      });
    }

    return {
      alreadyCheckedIn: false,
      success: true,
      streakDays,
      pointReward,
      tokenReward,
      message: `🎉 簽到成功！連續簽到第 ${streakDays} 天，獲得 ${pointReward} 紅利點數${tokenReward > 0 ? ` + ${tokenReward} 枚代幣！` : ''}`,
    };
  }

  // 2. 幸運大轉盤抽獎
  async spinLuckyWheel(userId: string) {
    const SPIN_COST_POINTS = 20;

    // 1. 先扣除 20 紅利點數
    await walletService.applyTransaction({
      userId,
      assetType: 'POINT',
      amount: -SPIN_COST_POINTS,
      txType: 'LUCKY_WHEEL',
      description: `幸運大轉盤抽獎消耗 ${SPIN_COST_POINTS} 點`,
    });

    // 2. 權重隨機計算中獎獎項
    const totalWeight = this.wheelSegments.reduce((acc, cur) => acc + cur.weight, 0);
    let randomNum = Math.random() * totalWeight;
    let selectedSegment = this.wheelSegments[0];

    for (const seg of this.wheelSegments) {
      if (randomNum < seg.weight) {
        selectedSegment = seg;
        break;
      }
      randomNum -= seg.weight;
    }

    // 3. 發放獎勵入帳
    await walletService.applyTransaction({
      userId,
      assetType: selectedSegment.assetType,
      amount: selectedSegment.amount,
      txType: 'LUCKY_WHEEL',
      description: `幸運大轉盤抽中: ${selectedSegment.label}`,
      metadata: { segmentId: selectedSegment.id, label: selectedSegment.label },
    });

    return {
      success: true,
      segmentId: selectedSegment.id,
      label: selectedSegment.label,
      assetType: selectedSegment.assetType,
      amount: selectedSegment.amount,
      message: `🎊 恭喜抽中【${selectedSegment.label}】！`,
    };
  }
}

export const gamificationService = new GamificationService();
