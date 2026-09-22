<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';

interface VideoItem {
  id: string;
  title: string;
  machine: string;
  category: string;
  prizeAmount: string;
  winner: string;
  date: string;
  duration: string;
  views: number;
  likes: number;
  thumbnailGradient: string;
  icon: string;
}

const mockVideos: VideoItem[] = [
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
    icon: 'bi-lightning-charge-fill',
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
    icon: 'bi-water',
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
    icon: 'bi-coin',
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
    icon: 'bi-trophy-fill',
  },
];

const selectedVideo = ref<VideoItem | null>(null);

// Lock background scroll when expanded video is open
let cleanupVideoLock: (() => void) | null = null;

watch(selectedVideo, (video) => {
  if (video) {
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    const preventScroll = (e: TouchEvent | WheelEvent) => {
      e.preventDefault();
    };

    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });

    cleanupVideoLock = () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);
    };
  } else {
    if (cleanupVideoLock) {
      cleanupVideoLock();
      cleanupVideoLock = null;
    }
  }
});

onUnmounted(() => {
  if (cleanupVideoLock) {
    cleanupVideoLock();
    cleanupVideoLock = null;
  }
});
</script>

<template>
  <div class="container py-2" data-bs-theme="dark">
    <!-- Videos Grid -->
    <div class="row g-3">
      <div v-for="item in mockVideos" :key="item.id" class="col-12 col-md-6">
        <div
          class="card border-0 rounded-4 overflow-hidden shadow-sm h-100 cursor-pointer transition-all hover-glow"
          @click="selectedVideo = item"
          style="background-color: rgba(18, 22, 38, 0.9); border: 1px solid rgba(255, 255, 255, 0.08); cursor: pointer; transition: all 0.25s ease;"
        >
          <!-- Thumbnail Area with Play Button -->
          <div
            class="position-relative d-flex align-items-center justify-content-center cursor-pointer overflow-hidden"
            :style="{ height: '190px', background: item.thumbnailGradient }"
          >
            <i :class="['bi', item.icon, 'text-white opacity-25']" style="font-size: 70px;" />
            
            <!-- Play Button Overlay -->
            <div
              class="position-absolute d-flex align-items-center justify-content-center rounded-circle shadow-lg"
              style="width: 54px; height: 54px; background-color: rgba(0, 0, 0, 0.65); border: 2px solid #ffffff; backdrop-filter: blur(8px); transition: transform 0.2s ease;"
            >
              <i class="bi bi-play-fill text-white fs-2 ps-1" />
            </div>
          </div>

          <!-- Video Content Details -->
          <div class="card-body p-3">
            <h6 class="fw-bold text-white mb-0 line-clamp-2" style="font-size: 14px;">
              {{ item.title }}
            </h6>
          </div>
        </div>
      </div>
    </div>

    <!-- Video Expanded Playback Modal -->
    <div
      v-if="selectedVideo"
      class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3 user-select-none"
      style="background-color: rgba(0, 0, 0, 0.85); backdrop-filter: blur(10px); z-index: 1060; cursor: pointer;"
      @click="selectedVideo = null"
    >
      <div
        class="card border-0 rounded-4 shadow-lg overflow-hidden w-100"
        style="max-width: 560px; background-color: #0a0c14; border: 1px solid rgba(0, 245, 212, 0.4); cursor: default;"
        @click.stop
      >
        <!-- Expanded Video Playback Canvas -->
        <div
          class="position-relative d-flex flex-column justify-content-between p-4 text-center overflow-hidden"
          :style="{ height: '320px', background: selectedVideo.thumbnailGradient }"
        >
          <!-- Background dark overlay for playback clarity -->
          <div class="position-absolute top-0 start-0 w-100 h-100 bg-black bg-opacity-60" style="z-index: 1;" />

          <!-- Center Visualizer & Big Win Animation -->
          <div class="text-center my-auto position-relative" style="z-index: 2;">
            <div class="d-flex justify-content-center align-items-end gap-1.5 mb-3" style="height: 40px;">
              <span class="bg-info rounded-pill" style="width: 5px; height: 70%; animation: badgePulse 0.8s infinite;" />
              <span class="bg-warning rounded-pill" style="width: 5px; height: 100%; animation: badgePulse 0.6s infinite 0.2s;" />
              <span class="bg-danger rounded-pill" style="width: 5px; height: 85%; animation: badgePulse 0.7s infinite 0.1s;" />
              <span class="bg-success rounded-pill" style="width: 5px; height: 60%; animation: badgePulse 0.9s infinite 0.3s;" />
              <span class="bg-info rounded-pill" style="width: 5px; height: 90%; animation: badgePulse 0.5s infinite;" />
            </div>
            <h2 class="fw-bold font-orbitron text-white text-glow-gold mb-2">
              {{ selectedVideo.prizeAmount }}
            </h2>
            <h5 class="text-white mb-0">{{ selectedVideo.machine }}</h5>
          </div>

          <!-- Bottom Playback Progress Bar -->
          <div class="position-relative w-100" style="z-index: 2;">
            <div class="progress" style="height: 4px; background-color: rgba(255, 255, 255, 0.2);">
              <div
                class="progress-bar progress-bar-striped progress-bar-animated bg-info"
                role="progressbar"
                style="width: 65%;"
              />
            </div>
          </div>
        </div>

        <!-- Modal Video Info -->
        <div class="card-body p-3 bg-dark">
          <h6 class="fw-bold text-white mb-0" style="font-size: 14px;">
            {{ selectedVideo.title }}
          </h6>
        </div>
      </div>
    </div>
  </div>
</template>
