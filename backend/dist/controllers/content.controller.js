"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contentController = exports.ContentController = void 0;
// 示範資料庫/資料儲存：大牌影片、照片、限時活動與中獎名單
const mockVideos = [
    {
        id: 'v1',
        title: '【超大獎實況】雷神之槌 狂暴連線爆分 500,000 彩票！',
        machine: 'THOR-088 雷神之槌',
        category: 'SLOT機台',
        prizeAmount: '500,000 彩票',
        winner: '菲納星***668',
        date: '2026-08-29',
        duration: '01:45',
        views: 3820,
        likes: 428,
        thumbnailGradient: 'linear-gradient(135deg, #7928ca, #ff007f)',
        icon: 'lightning',
    },
    {
        id: 'v2',
        title: '【黃金海皇】深海覺醒！全場魚王秒殺狂吐 30,000 代幣',
        machine: 'OCEAN-007 海皇巨獸',
        category: '捕魚機',
        prizeAmount: '30,000 代幣',
        winner: '尊榮黑卡***999',
        date: '2026-08-28',
        duration: '02:18',
        views: 5120,
        likes: 689,
        thumbnailGradient: 'linear-gradient(135deg, #00f5d4, #00bbf9)',
        icon: 'waves',
    },
    {
        id: 'v3',
        title: '【推幣機奇蹟】彩金塔崩塌瞬間！千枚代幣瀑布傾瀉',
        machine: 'COIN-302 淘金帝國',
        category: '推幣機',
        prizeAmount: '18,888 代幣',
        winner: '白金玩家***231',
        date: '2026-08-27',
        duration: '00:58',
        views: 2940,
        likes: 310,
        thumbnailGradient: 'linear-gradient(135deg, #ffd166, #ff007f)',
        icon: 'coins',
    },
    {
        id: 'v4',
        title: '【賽馬王者】萬眾矚目第 12 局！冷門黑馬狂飆逆轉勝',
        machine: 'HORSE-01 皇家賽馬',
        category: '競技機',
        prizeAmount: '120,000 積分',
        winner: '幸運星***777',
        date: '2026-08-26',
        duration: '03:10',
        views: 4410,
        likes: 532,
        thumbnailGradient: 'linear-gradient(135deg, #10b981, #00f5d4)',
        icon: 'trophy',
    },
];
const mockPhotos = [
    {
        id: 'p1',
        title: '【JP 大彩金破表】五龍爭霸 盤面全開！狂中特等大獎',
        machine: 'DRAGON-01 五龍爭霸',
        prizeAmount: '888,888 彩票',
        winner: '尊爵黃金***168',
        date: '2026-08-29 21:30',
        likes: 890,
        bgGradient: 'linear-gradient(135deg, #ff007f, #ffd166)',
        badgeText: '🏆 GRAND JP',
    },
    {
        id: 'p2',
        title: '【777 滿盤爆裂】經典拉霸機 連環紅7大爆發！',
        machine: 'SLOT-777 經典拉霸',
        prizeAmount: '50,000 代幣',
        winner: 'VIP黑卡***001',
        date: '2026-08-28 18:45',
        likes: 620,
        bgGradient: 'linear-gradient(135deg, #00f5d4, #7928ca)',
        badgeText: '🔥 MEGA WIN',
    },
    {
        id: 'p3',
        title: '【金龍魚王被捕】雷射巨砲一擊必殺！金幣噴湧滿屏',
        machine: 'FISH-888 金龍狂怒',
        prizeAmount: '28,880 代幣',
        winner: '白銀戰神***552',
        date: '2026-08-27 15:20',
        likes: 415,
        bgGradient: 'linear-gradient(135deg, #00bbf9, #00f5d4)',
        badgeText: '⚡ SUPER HIT',
    },
    {
        id: 'p4',
        title: '【神秘箱連續開出】幸運推幣 突破紀錄累積獎池',
        machine: 'COIN-505 奇蹟推推樂',
        prizeAmount: '66,666 積分',
        winner: '新手幸運兒***921',
        date: '2026-08-26 22:10',
        likes: 380,
        bgGradient: 'linear-gradient(135deg, #7928ca, #ff007f)',
        badgeText: '🎁 BIG BONUS',
    },
];
const mockEvents = [
    {
        id: 'e1',
        title: '【週末狂歡】雙倍彩票狂熱祭',
        subtitle: '全館機台彩票產出 200% 爆發！',
        tag: '火熱進行中',
        reward: '200% 彩票加成 + 500 積分',
        dateRange: '每週六、日 14:00 - 22:00',
        timeLeft: '倒數 26 小時 15 分',
        rules: [
            '所有會員於活動期間投幣遊玩任意機台即可自動享有 200% 彩票倍率。',
            '活動期間累積遊玩滿 50 枚代幣額外贈送 500 點會員積分。',
            '彩票自動記入電子錢包，無需至櫃檯補登。',
        ],
        joined: true,
        bgGradient: 'linear-gradient(135deg, rgba(255, 0, 127, 0.25) 0%, rgba(121, 40, 202, 0.25) 100%)',
        icon: 'flame',
    },
    {
        id: 'e2',
        title: '【漁皇爭霸】百萬捕魚王排位賽',
        subtitle: '擊殺深海巨獸，角逐 1,000,000 彩票總獎池',
        tag: '即將開戰',
        reward: '總獎池 1,000,000 彩票',
        dateRange: '2026-09-01 至 2026-09-07',
        timeLeft: '1 天後開始',
        rules: [
            '於指定捕魚機累積捕獲魚王積分，即時登上前 50 名英雄榜。',
            '冠軍獨得 300,000 彩票 + VIP 尊榮黑卡體驗 30 天。',
            '參賽者全員享有限定參賽紀念勳章。',
        ],
        joined: false,
        bgGradient: 'linear-gradient(135deg, rgba(0, 245, 212, 0.25) 0%, rgba(0, 187, 249, 0.25) 100%)',
        icon: 'award',
    },
    {
        id: 'e3',
        title: '【儲值回饋】新季首儲 150% 瘋狂送',
        subtitle: '線上/現場儲值享高達 150% 代幣加贈',
        tag: '常駐福利',
        reward: '最高加贈 1,500 枚代幣',
        dateRange: '本月專屬',
        timeLeft: '倒數 5 天',
        rules: [
            '會員單筆儲值 NT$1,000 即贈 500 代幣（總計 1,500 枚）。',
            '儲值同時直接累積 VIP EXP，升階黃金/黑卡更快速。',
            '每位會員每月限領 3 次加碼優惠。',
        ],
        joined: false,
        bgGradient: 'linear-gradient(135deg, rgba(255, 209, 102, 0.25) 0%, rgba(16, 185, 129, 0.25) 100%)',
        icon: 'gift',
    },
];
const mockWinners = [
    {
        id: 'w1',
        rank: 1,
        winner: '菲納星***888',
        avatarTier: 'VIP 黑卡尊榮',
        branch: 'F',
        branchName: 'F 店',
        machine: 'THOR-088 雷神之槌',
        prizeType: 'TICKET',
        prizeAmount: '500,000 彩票',
        timeAgo: '5 分鐘前',
        timestamp: '2026-08-30 15:58',
        jpLevel: 'GRAND',
    },
    {
        id: 'w2',
        rank: 2,
        winner: '幸運金星***333',
        avatarTier: 'GOLD 黃金尊爵',
        branch: 'W',
        branchName: 'W 店',
        machine: 'OCEAN-007 海皇巨獸',
        prizeType: 'TOKEN',
        prizeAmount: '30,000 代幣',
        timeAgo: '22 分鐘前',
        timestamp: '2026-08-30 15:42',
        jpLevel: 'MAJOR',
    },
    {
        id: 'w3',
        rank: 3,
        winner: '戰神白銀***911',
        avatarTier: 'SILVER 白銀會員',
        branch: 'S',
        branchName: 'S 店',
        machine: 'COIN-302 淘金帝國',
        prizeType: 'TOKEN',
        prizeAmount: '18,888 代幣',
        timeAgo: '45 分鐘前',
        timestamp: '2026-08-30 15:18',
        jpLevel: 'MAJOR',
    },
    {
        id: 'w4',
        winner: '超新星***666',
        avatarTier: 'BRONZE 青銅會員',
        branch: 'F',
        branchName: 'F 店',
        machine: 'SLOT-777 幸運連線',
        prizeType: 'POINT',
        prizeAmount: '50,000 積分',
        timeAgo: '1 小時前',
        timestamp: '2026-08-30 15:01',
        jpLevel: 'MINI',
    },
    {
        id: 'w5',
        winner: '追夢玩家***520',
        avatarTier: 'NORMAL 一般會員',
        branch: 'W',
        branchName: 'W 店',
        machine: 'FISH-888 金龍狂怒',
        prizeType: 'TICKET',
        prizeAmount: '88,888 彩票',
        timeAgo: '2 小時前',
        timestamp: '2026-08-30 14:05',
        jpLevel: 'MAJOR',
    },
    {
        id: 'w6',
        winner: '黑馬霸主***112',
        avatarTier: 'VIP 黑卡尊榮',
        branch: 'S',
        branchName: 'S 店',
        machine: 'HORSE-01 皇家賽馬',
        prizeType: 'TOKEN',
        prizeAmount: '12,500 代幣',
        timeAgo: '3 小時前',
        timestamp: '2026-08-30 13:10',
        jpLevel: 'MINI',
    },
    {
        id: 'w7',
        winner: '星際奇俠***321',
        avatarTier: 'GOLD 黃金尊爵',
        branch: 'F',
        branchName: 'F 店',
        machine: 'DRAGON-01 五龍爭霸',
        prizeType: 'TICKET',
        prizeAmount: '168,888 彩票',
        timeAgo: '3 小時前',
        timestamp: '2026-08-30 12:45',
        jpLevel: 'GRAND',
    },
];
class ContentController {
    getVideos(_req, res) {
        res.json(mockVideos);
    }
    getPhotos(_req, res) {
        res.json(mockPhotos);
    }
    getEvents(_req, res) {
        res.json(mockEvents);
    }
    getWinners(req, res) {
        const { branch, prizeType } = req.query;
        let list = mockWinners;
        if (branch && branch !== 'ALL') {
            list = list.filter((w) => w.branch === branch);
        }
        if (prizeType && prizeType !== 'ALL') {
            list = list.filter((w) => w.prizeType === prizeType);
        }
        res.json(list);
    }
}
exports.ContentController = ContentController;
exports.contentController = new ContentController();
