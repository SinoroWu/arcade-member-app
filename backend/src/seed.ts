import { dbManager } from './modules/db';
import { authService } from './modules/auth/auth.service';
import { walletService } from './modules/wallet/wallet.service';

export async function seedInitialData() {
  console.log('🌱 Seeding initial arcade ecosystem data...');

  // 1. 建立預設機台 (Machines)
  const machines = [
    {
      id: 'mc_001',
      machineCode: 'MC-TP-001',
      name: '太鼓達人 14 代 街機版',
      category: '音樂節奏',
      storeBranch: '台北信義旗艦館 (B1)',
      tokenCostPerPlay: 2.0,
      status: 'ONLINE',
      hardwareIp: '192.168.1.101',
      mqttTopic: 'arcade/tp/mc-001/pulse',
    },
    {
      id: 'mc_002',
      machineCode: 'MC-TP-002',
      name: '頭文字 D THE ARCADE 雙人賽車',
      category: '體感賽車',
      storeBranch: '台北信義旗艦館 (B1)',
      tokenCostPerPlay: 3.0,
      status: 'ONLINE',
      hardwareIp: '192.168.1.102',
      mqttTopic: 'arcade/tp/mc-002/pulse',
    },
    {
      id: 'mc_003',
      machineCode: 'MC-TP-003',
      name: '街頭投籃王者 (Street Basketball King)',
      category: '運動休閒',
      storeBranch: '台北信義旗艦館 (B1)',
      tokenCostPerPlay: 2.0,
      status: 'ONLINE',
      hardwareIp: '192.168.1.103',
      mqttTopic: 'arcade/tp/mc-003/pulse',
    },
    {
      id: 'mc_004',
      machineCode: 'MC-TP-004',
      name: '極速瘋狂夾娃娃機 (雙爪爪力加強版)',
      category: '景品娃娃機',
      storeBranch: '台北信義旗艦館 (B1)',
      tokenCostPerPlay: 1.0,
      status: 'ONLINE',
      hardwareIp: '192.168.1.104',
      mqttTopic: 'arcade/tp/mc-004/pulse',
    },
    {
      id: 'mc_005',
      machineCode: 'MC-TP-005',
      name: '瘋狂大彩票機 (Monster Ticket Drop)',
      category: '彩票連線機',
      storeBranch: '台北信義旗艦館 (B1)',
      tokenCostPerPlay: 4.0,
      status: 'ONLINE',
      hardwareIp: '192.168.1.105',
      mqttTopic: 'arcade/tp/mc-005/pulse',
    },
    {
      id: 'mc_006',
      machineCode: 'MC-TP-006',
      name: '音響空間 Sound Voltex Valkyrie',
      category: '音樂節奏',
      storeBranch: '台北信義旗艦館 (B1)',
      tokenCostPerPlay: 3.0,
      status: 'ONLINE',
      hardwareIp: '192.168.1.106',
      mqttTopic: 'arcade/tp/mc-006/pulse',
    },
  ];

  machines.forEach((m) => {
    dbManager.memoryStore.machines.set(m.id, m);
  });

  // 2. 建立預設獎品商城品項 (Reward Items)
  const rewards = [
    {
      id: 'rw_001',
      title: 'Nintendo Switch OLED 旗艦遊戲主機',
      description: '原廠保固一年，附主機保護貼與收納包。',
      category: 'PHYSICAL',
      requiredTickets: 12000,
      requiredPoints: 0,
      stockQuantity: 15,
      imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=60',
      isActive: true,
    },
    {
      id: 'rw_002',
      title: '鬼滅之刃 炭治郎 日輪刀 特典發光吊飾',
      description: '具備 LED 炫彩呼吸燈效，金屬質感鑰匙圈。',
      category: 'PHYSICAL',
      requiredTickets: 450,
      requiredPoints: 0,
      stockQuantity: 40,
      imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=60',
      isActive: true,
    },
    {
      id: 'rw_003',
      title: '門市 100 元通用消費折抵券',
      description: '全館機台與櫃台儲值均可全額折抵使用。',
      category: 'DIGITAL',
      requiredTickets: 0,
      requiredPoints: 200,
      stockQuantity: 999,
      imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&auto=format&fit=crop&q=60',
      isActive: true,
    },
    {
      id: 'rw_004',
      title: 'VIP 暢飲吧 頂級特調飲品免費兌換券',
      description: '憑此券可於 VIP 休息區暢飲吧免費領取任選星級飲品一杯。',
      category: 'DIGITAL',
      requiredTickets: 150,
      requiredPoints: 50,
      stockQuantity: 200,
      imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop&q=60',
      isActive: true,
    },
    {
      id: 'rw_005',
      title: 'PS5 潮流電競後背包 (防潑水加厚款)',
      description: '大容量分層，專為攜帶遊戲主機與手把打造。',
      category: 'PHYSICAL',
      requiredTickets: 3500,
      requiredPoints: 0,
      stockQuantity: 5,
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60',
      isActive: true,
    },
  ];

  rewards.forEach((r) => {
    dbManager.memoryStore.rewardItems.set(r.id, r);
  });

  // 3. 建立測試示範會員 (Demo Member)
  try {
    const demoUser = await authService.register({
      account: '0912345678',
      password: 'password123',
      name: '菲納星尊爵 Alex',
      phone: '0912-345-678',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=AlexArcadeHero',
    });

    const userId = demoUser.user.id;

    // 給予初始代幣、彩票、紅利點數與經驗值
    await walletService.applyTransaction({
      userId,
      assetType: 'TOKEN',
      amount: 1280,
      txType: 'OFFLINE_TOPUP',
      description: '系統預載初始儲值代幣',
    });

    await walletService.applyTransaction({
      userId,
      assetType: 'TICKET',
      amount: 4650,
      txType: 'MACHINE_REWARD',
      description: '機台累積彩票入帳 (太鼓達人 & 彩票機)',
    });

    await walletService.applyTransaction({
      userId,
      assetType: 'POINT',
      amount: 350,
      txType: 'DAILY_CHECKIN',
      description: '簽到與活動紅利累積',
    });

    await walletService.applyTransaction({
      userId,
      assetType: 'EXP',
      amount: 8500, // Upgrade to GOLD
      txType: 'OFFLINE_TOPUP',
      description: '會員消費經驗值累積 (已達 GOLD 黃金尊爵等級)',
    });

    // 建立 8 碼無卡號示範帳號 (88888888 / 8888)
    const cardUser = await authService.register({
      account: '88888888',
      password: '8888',
      name: '菲納星貴賓 (無卡號 88888888)',
      phone: '0988-888-888',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=FeinaxingVIP',
    });

    await walletService.applyTransaction({
      userId: cardUser.user.id,
      assetType: 'TOKEN',
      amount: 8888,
      txType: 'OFFLINE_TOPUP',
      description: '尊爵無卡號初始儲值代幣',
    });

    console.log('✅ Demo Members Created: 0912345678 (8-digit suffix: 12345678 / 5678) & 88888888 / 8888');
  } catch (e) {
    // Already exists
  }

  console.log('✨ Arcade Seed Initialized Successfully!');
}
