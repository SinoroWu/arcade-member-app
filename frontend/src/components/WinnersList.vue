<script setup lang="ts">
import { ref, computed } from 'vue';

interface WinnerRecord {
  id: string;
  rank?: number;
  winner: string;
  avatarTier: string;
  branch: 'F' | 'W' | 'S';
  branchName: string;
  machine: string;
  prizeType: 'TOKEN' | 'TICKET' | 'POINT';
  prizeAmount: string;
  timeAgo: string;
  timestamp: string;
  jpLevel: 'GRAND' | 'MAJOR' | 'MINI';
}

const mockWinners: WinnerRecord[] = [
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
  {
    id: 'w8',
    winner: '代幣獵手***404',
    avatarTier: 'SILVER 白銀會員',
    branch: 'W',
    branchName: 'W 店',
    machine: 'COIN-505 奇蹟推推樂',
    prizeType: 'TOKEN',
    prizeAmount: '25,000 代幣',
    timeAgo: '4 小時前',
    timestamp: '2026-08-30 11:30',
    jpLevel: 'MAJOR',
  },
  {
    id: 'w9',
    winner: '神準發射***808',
    avatarTier: 'BRONZE 青銅會員',
    branch: 'S',
    branchName: 'S 店',
    machine: 'FISH-888 金龍狂怒',
    prizeType: 'POINT',
    prizeAmount: '36,000 積分',
    timeAgo: '5 小時前',
    timestamp: '2026-08-30 10:15',
    jpLevel: 'MINI',
  },
];

const selectedBranch = ref<string>('ALL');
const filterType = ref<string>('ALL');

const filteredWinners = computed(() => {
  return mockWinners.filter((w) => {
    const matchBranch = selectedBranch.value === 'ALL' || w.branch === selectedBranch.value;
    const matchPrize = filterType.value === 'ALL' || w.prizeType === filterType.value;
    return matchBranch && matchPrize;
  });
});
</script>

<template>
  <div class="container py-2" data-bs-theme="dark">
    <!-- Branch Store Filter (Above Prize Filter) -->
    <div class="d-flex gap-2 mb-2">
      <button
        v-for="b in [
          { id: 'ALL', name: '全部門市' },
          { id: 'F', name: 'F 店' },
          { id: 'W', name: 'W 店' },
          { id: 'S', name: 'S 店' },
        ]"
        :key="b.id"
        @click="selectedBranch = b.id"
        :class="[
          'btn btn-sm rounded-pill px-3 py-1.5 fw-semibold',
          selectedBranch === b.id
            ? 'btn-primary text-white fw-bold shadow-sm'
            : 'btn-outline-secondary text-secondary'
        ]"
        style="font-size: 12px;"
      >
        {{ b.name }}
      </button>
    </div>

    <!-- Prize Type Filter -->
    <div class="d-flex gap-2 mb-3">
      <button
        v-for="type in ['ALL', 'TOKEN', 'TICKET', 'POINT']"
        :key="type"
        @click="filterType = type"
        :class="[
          'btn btn-sm rounded-pill px-3 py-1.5 fw-semibold',
          filterType === type ? 'btn-info text-dark fw-bold' : 'btn-outline-secondary text-secondary'
        ]"
        style="font-size: 12px;"
      >
        {{ type === 'ALL' ? '全部大獎' : type === 'TOKEN' ? '代幣大獎' : type === 'TICKET' ? '彩票大獎' : '積分大獎' }}
      </button>
    </div>

    <!-- Winner List Table -->
    <div class="card border-0 rounded-4 shadow-sm overflow-hidden" style="background-color: rgba(18, 22, 38, 0.92);">
      <div class="table-responsive">
        <table class="table table-dark table-hover mb-0 align-middle">
          <thead class="table-dark text-secondary small border-bottom border-secondary-subtle">
            <tr>
              <th class="py-3 ps-4" style="font-size: 12px;">排名/獎別</th>
              <th class="py-3" style="font-size: 12px;">獲獎玩家</th>
              <th class="py-3" style="font-size: 12px;">門市/機台</th>
              <th class="py-3 text-end" style="font-size: 12px;">獲獎數量</th>
              <th class="py-3 text-end pe-4" style="font-size: 12px;">時間</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="filteredWinners.length > 0">
              <tr v-for="(w, idx) in filteredWinners" :key="w.id" class="border-bottom border-secondary-subtle">
                <td class="ps-4 py-3">
                  <div class="d-flex align-items-center gap-2">
                    <div
                      v-if="w.rank"
                      class="d-flex align-items-center justify-content-center rounded-circle font-orbitron fw-bold"
                      :style="{
                        width: '28px',
                        height: '28px',
                        background:
                          w.rank === 1
                            ? 'linear-gradient(135deg, #ffd166, #ff007f)'
                            : w.rank === 2
                            ? 'linear-gradient(135deg, #00f5d4, #00bbf9)'
                            : 'linear-gradient(135deg, #cd7f32, #7928ca)',
                        color: '#050811',
                        fontSize: '12px',
                      }"
                    >
                      {{ w.rank }}
                    </div>
                    <span v-else class="text-secondary small font-monospace ps-2">#{{ idx + 1 }}</span>
                    
                    <span v-if="w.jpLevel === 'GRAND'" class="badge bg-danger text-white border border-danger fw-bold font-orbitron">GRAND JP</span>
                    <span v-else-if="w.jpLevel === 'MAJOR'" class="badge bg-warning text-dark border border-warning fw-bold font-orbitron">MAJOR JP</span>
                    <span v-else class="badge bg-info text-dark border border-info fw-bold font-orbitron">MINI JP</span>
                  </div>
                </td>

                <td>
                  <div class="fw-bold text-white small">{{ w.winner }}</div>
                  <div class="text-secondary" style="font-size: 10px;">{{ w.avatarTier }}</div>
                </td>

                <td>
                  <div class="d-flex align-items-center gap-1.5">
                    <span class="badge bg-primary-subtle text-primary border border-primary-subtle font-orbitron" style="font-size: 10px;">
                      {{ w.branchName }}
                    </span>
                    <span class="badge bg-dark border border-secondary-subtle text-info small">
                      <i class="bi bi-controller me-1" />
                      {{ w.machine }}
                    </span>
                  </div>
                </td>

                <td class="text-end">
                  <span class="font-orbitron fw-bold text-warning" style="font-size: 13px;">
                    {{ w.prizeAmount }}
                  </span>
                </td>

                <td class="text-end pe-4">
                  <div class="text-white small font-monospace">{{ w.timeAgo }}</div>
                  <div class="text-secondary" style="font-size: 10px;">{{ w.timestamp }}</div>
                </td>
              </tr>
            </template>
            <tr v-else>
              <td colspan="5" class="text-center py-5 text-secondary">
                <i class="bi bi-search fs-3 d-block mb-2 text-secondary opacity-50" />
                查無符合該分店與大獎條件的中獎紀錄
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
