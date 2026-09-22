<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';

interface PhotoItem {
  id: string;
  title: string;
  machine: string;
  prizeAmount: string;
  winner: string;
  date: string;
  likes: number;
  bgGradient: string;
  badgeText: string;
}

const mockPhotos: PhotoItem[] = [
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

const selectedPhoto = ref<PhotoItem | null>(null);

// Lock background scroll when photo is opened
let cleanupPhotoLock: (() => void) | null = null;

watch(selectedPhoto, (photo) => {
  if (photo) {
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    const preventScroll = (e: TouchEvent | WheelEvent) => {
      e.preventDefault();
    };

    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });

    cleanupPhotoLock = () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);
    };
  } else {
    if (cleanupPhotoLock) {
      cleanupPhotoLock();
      cleanupPhotoLock = null;
    }
  }
});

onUnmounted(() => {
  if (cleanupPhotoLock) {
    cleanupPhotoLock();
    cleanupPhotoLock = null;
  }
});
</script>

<template>
  <div class="container py-2" data-bs-theme="dark">
    <!-- Photos Grid directly at top -->
    <div class="row g-3">
      <div v-for="item in mockPhotos" :key="item.id" class="col-12 col-sm-6">
        <div
          class="card border-0 rounded-4 overflow-hidden shadow-sm h-100 cursor-pointer transition-all hover-glow"
          @click="selectedPhoto = item"
          style="background-color: rgba(18, 22, 38, 0.9); border: 1px solid rgba(255, 255, 255, 0.08); cursor: pointer; transition: all 0.25s ease;"
        >
          <!-- Photo Canvas Banner -->
          <div
            class="position-relative d-flex flex-column align-items-center justify-content-center p-4 text-center"
            :style="{ height: '200px', background: item.bgGradient }"
          >
            <h4 class="fw-bold font-orbitron text-white text-glow-gold mb-1">
              {{ item.prizeAmount }}
            </h4>
            <p class="text-white text-opacity-75 small mb-0">{{ item.machine }}</p>
          </div>

          <!-- Photo Info -->
          <div class="card-body p-3">
            <h6 class="fw-bold text-white mb-0 line-clamp-2" style="font-size: 13px;">
              {{ item.title }}
            </h6>
          </div>
        </div>
      </div>
    </div>

    <!-- Photo Zoom Modal -->
    <div
      v-if="selectedPhoto"
      class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3 user-select-none"
      style="background-color: rgba(0, 0, 0, 0.85); backdrop-filter: blur(10px); z-index: 1060; cursor: pointer;"
      @click="selectedPhoto = null"
    >
      <div
        class="card border-0 rounded-4 shadow-lg overflow-hidden w-100"
        style="max-width: 560px; background-color: #0a0c14; border: 1px solid rgba(0, 245, 212, 0.4); cursor: default;"
        @click.stop
      >
        <div
          class="p-5 text-center d-flex flex-column align-items-center justify-content-center"
          :style="{ height: '320px', background: selectedPhoto.bgGradient }"
        >
          <h2 class="fw-bold font-orbitron text-white text-glow-gold mb-2">
            {{ selectedPhoto.prizeAmount }}
          </h2>
          <h5 class="text-white">{{ selectedPhoto.machine }}</h5>
          <p class="text-white text-opacity-75 small mb-0">官方紀錄認證照片</p>
        </div>

        <!-- Modal Photo Info -->
        <div class="card-body p-3 bg-dark">
          <h6 class="fw-bold text-white mb-0" style="font-size: 14px;">
            {{ selectedPhoto.title }}
          </h6>
        </div>
      </div>
    </div>
  </div>
</template>
