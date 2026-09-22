<script setup lang="ts">
import { ref } from 'vue';

interface EventItem {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  tagClass: string;
  reward: string;
  dateRange: string;
  timeLeft: string;
  rules: string[];
  joined: boolean;
  bgGradient: string;
  icon: string;
}

const mockEvents: EventItem[] = [
  {
    id: 'e1',
    title: '【週末狂歡】雙倍彩票狂熱祭',
    subtitle: '全館機台彩票產出 200% 爆發！',
    tag: '火熱進行中',
    tagClass: 'bg-danger-subtle text-danger border border-danger-subtle',
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
    icon: 'bi-fire',
  },
  {
    id: 'e2',
    title: '【漁皇爭霸】百萬捕魚王排位賽',
    subtitle: '擊殺深海巨獸，角逐 1,000,000 彩票總獎池',
    tag: '即將開戰',
    tagClass: 'bg-warning-subtle text-warning border border-warning-subtle',
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
    icon: 'bi-tsunami',
  },
  {
    id: 'e3',
    title: '【儲值回饋】新季首儲 150% 瘋狂送',
    subtitle: '線上/現場儲值享高達 150% 代幣加贈',
    tag: '常駐福利',
    tagClass: 'bg-info-subtle text-info border border-info-subtle',
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
    icon: 'bi-gift-fill',
  },
];

const events = ref<EventItem[]>(mockEvents);
const selectedEvent = ref<EventItem | null>(null);

const handleJoin = (id: string) => {
  events.value = events.value.map((ev) => (ev.id === id ? { ...ev, joined: true } : ev));
};
</script>

<template>
  <div class="container py-2" data-bs-theme="dark">
    <!-- Events List -->
    <div class="d-flex flex-column gap-3">
      <div
        v-for="event in events"
        :key="event.id"
        class="card border-0 rounded-4 shadow-sm overflow-hidden cursor-pointer"
        @click="selectedEvent = event"
        :style="{
          backgroundColor: 'rgba(18, 22, 38, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          background: event.bgGradient,
          cursor: 'pointer',
          transition: 'all 0.25s ease',
        }"
      >
        <div class="card-body p-4">
          <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <div class="d-flex align-items-start gap-3">
              <div
                class="d-flex align-items-center justify-content-center rounded-3 p-3 shadow"
                style="width: 54px; height: 54px; background-color: rgba(10, 12, 20, 0.85); border: 1px solid rgba(255, 255, 255, 0.1);"
              >
                <i :class="['bi', event.icon, 'fs-4 text-warning']" />
              </div>
              <div>
                <div class="d-flex align-items-center gap-2 mb-1">
                  <span :class="['badge rounded-pill', event.tagClass]" style="font-size: 10px;">
                    {{ event.tag }}
                  </span>
                  <span class="text-secondary small font-monospace" style="font-size: 11px;">
                    <i class="bi bi-stopwatch me-1" />
                    {{ event.timeLeft }}
                  </span>
                </div>
                <h5 class="fw-bold text-white mb-1">{{ event.title }}</h5>
                <p class="text-secondary small mb-2">{{ event.subtitle }}</p>
                <div class="d-flex align-items-center gap-2">
                  <span class="badge bg-dark bg-opacity-75 text-info border border-info-subtle">
                    🎁 {{ event.reward }}
                  </span>
                  <span class="text-secondary small" style="font-size: 11px;">
                    {{ event.dateRange }}
                  </span>
                </div>
              </div>
            </div>

            <div class="d-flex align-items-center gap-2 align-self-stretch align-self-md-auto justify-content-end">
              <button
                v-if="event.joined"
                class="btn btn-sm btn-outline-success fw-bold px-3 py-2 rounded-3 disabled"
                style="font-size: 12px;"
              >
                <i class="bi bi-check-circle-fill me-1" />
                已報名參加
              </button>
              <button
                v-else
                @click.stop="handleJoin(event.id)"
                class="btn btn-sm btn-info fw-bold text-dark px-3 py-2 rounded-3 shadow-sm"
                style="font-size: 12px; background: linear-gradient(135deg, #00f5d4, #00bbf9); border: none;"
              >
                立即報名
              </button>
              <button
                @click.stop="selectedEvent = event"
                class="btn btn-sm btn-outline-secondary text-white px-3 py-2 rounded-3"
                style="font-size: 12px;"
              >
                詳情
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Event Details Modal -->
    <div
      v-if="selectedEvent"
      class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style="background-color: rgba(0, 0, 0, 0.85); backdrop-filter: blur(10px); z-index: 1060;"
      @click="selectedEvent = null"
    >
      <div
        class="card border-0 rounded-4 shadow-lg overflow-hidden w-100"
        style="max-width: 520px; background-color: #0a0c14; border: 1px solid rgba(255, 209, 102, 0.4);"
        @click.stop
      >
        <div
          class="p-4"
          :style="{ background: selectedEvent.bgGradient }"
        >
          <span :class="['badge rounded-pill mb-2', selectedEvent.tagClass]">
            {{ selectedEvent.tag }}
          </span>
          <h5 class="fw-bold text-white mb-1">{{ selectedEvent.title }}</h5>
          <p class="text-white-50 small mb-2">{{ selectedEvent.subtitle }}</p>
          <div class="badge bg-dark bg-opacity-75 text-warning font-orbitron p-2 rounded-3">
            獎勵：{{ selectedEvent.reward }}
          </div>
        </div>

        <div class="card-body p-4 bg-dark">
          <h6 class="fw-bold text-info mb-2">
            <i class="bi bi-info-circle-fill me-1" />
            活動規則說明
          </h6>
          <ul class="text-secondary small ps-3 mb-4 d-flex flex-column gap-1.5">
            <li v-for="(r, i) in selectedEvent.rules" :key="i">{{ r }}</li>
          </ul>

          <div class="d-flex justify-content-between align-items-center">
            <span class="text-secondary small">時間：{{ selectedEvent.dateRange }}</span>
            <button
              @click="selectedEvent = null"
              class="btn btn-sm btn-outline-info rounded-3 px-3 fw-bold"
            >
              關閉
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
