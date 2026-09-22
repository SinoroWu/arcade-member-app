<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { User, WalletBalances } from '../types';

export type AppTabType =
  | 'card'
  | 'wallet'
  | 'videos'
  | 'photos'
  | 'events'
  | 'winners'
  | 'mall'
  | 'wheel';

interface Props {
  user: User | null;
  balances: WalletBalances | null;
  activeView: 'app' | 'simulator';
  activeAppTab: AppTabType;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'switch-view', view: 'app' | 'simulator'): void;
  (e: 'select-app-tab', tab: AppTabType): void;
  (e: 'open-login'): void;
  (e: 'logout'): void;
}>();

const isUserMenuOpen = ref<boolean>(false);
const menuRef = ref<HTMLDivElement | null>(null);

// Close dropdown menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    isUserMenuOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});

// Lock background page scrolling and interactions when user menu is open
let cleanupScrollLock: (() => void) | null = null;

watch(isUserMenuOpen, (isOpen) => {
  if (isOpen) {
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    const preventBackgroundScroll = (e: TouchEvent | WheelEvent) => {
      if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
        e.preventDefault();
      }
    };

    window.addEventListener('wheel', preventBackgroundScroll, { passive: false });
    window.addEventListener('touchmove', preventBackgroundScroll, { passive: false });

    cleanupScrollLock = () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
      window.removeEventListener('wheel', preventBackgroundScroll);
      window.removeEventListener('touchmove', preventBackgroundScroll);
    };
  } else {
    if (cleanupScrollLock) {
      cleanupScrollLock();
      cleanupScrollLock = null;
    }
  }
});

onUnmounted(() => {
  if (cleanupScrollLock) {
    cleanupScrollLock();
    cleanupScrollLock = null;
  }
});

const getTierBadge = (tier: string = 'NORMAL') => {
  switch (tier) {
    case 'VIP':
      return { text: 'VIP 黑卡尊榮', color: '#ff007f', bgClass: 'bg-danger-subtle text-danger border border-danger-subtle' };
    case 'GOLD':
      return { text: 'GOLD 黃金尊爵', color: '#ffd166', bgClass: 'bg-warning-subtle text-warning border border-warning-subtle' };
    case 'SILVER':
      return { text: 'SILVER 白銀會員', color: '#00f5d4', bgClass: 'bg-info-subtle text-info border border-info-subtle' };
    case 'BRONZE':
      return { text: 'BRONZE 青銅會員', color: '#cd7f32', bgClass: 'bg-secondary-subtle text-secondary border border-secondary-subtle' };
    default:
      return { text: 'NORMAL 一般會員', color: '#9ca3af', bgClass: 'bg-dark-subtle text-secondary border border-secondary-subtle' };
  }
};

const handleTabClick = (tabId: AppTabType) => {
  emit('select-app-tab', tabId);
  emit('switch-view', 'app');
  isUserMenuOpen.value = false;
};
</script>

<template>
  <!-- Full-screen backdrop overlay to freeze underlying background page -->
  <div
    v-if="isUserMenuOpen"
    class="position-fixed top-0 start-0 w-100 h-100"
    style="background-color: rgba(5, 8, 17, 0.45); backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px); z-index: 1040; touch-action: none;"
    @click="isUserMenuOpen = false"
    @touchmove.prevent
    @wheel.prevent
  />

  <nav
    class="navbar navbar-expand sticky-top py-2.5 px-3 mb-4"
    style="background-color: rgba(18, 22, 38, 0.92); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5); z-index: 1045;"
    data-bs-theme="dark"
  >
    <div class="container-fluid max-w-7xl px-0 px-sm-3 d-flex align-items-center justify-content-between gap-2">
      
      <!-- Brand Logo & Name -->
      <div
        class="d-flex align-items-center gap-2 cursor-pointer text-decoration-none"
        @click="emit('switch-view', 'app')"
        style="cursor: pointer;"
      >
        <div
          class="d-flex align-items-center justify-content-center rounded-3 p-0.5"
          style="width: 38px; height: 38px; background: linear-gradient(135deg, #7928ca, #ff007f, #00f5d4); box-shadow: 0 0 15px rgba(0, 245, 212, 0.35);"
        >
          <div
            class="d-flex align-items-center justify-content-center rounded-3 w-100 h-100"
            style="background-color: #0a0c14;"
          >
            <i class="bi bi-controller fs-5" style="color: #00f5d4;" />
          </div>
        </div>
        <div>
          <div class="d-flex align-items-center">
            <span
              class="font-orbitron fw-bold fs-5 tracking-wider"
              style="background: linear-gradient(90deg, #00f5d4, #ffffff, #ff007f); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: 1px;"
            >
              菲納星娛樂
            </span>
          </div>
          <p class="text-secondary small mb-0 d-none d-md-block" style="font-size: 11px;">
            電子遊戲場全方位智能會員系統
          </p>
        </div>
      </div>

      <!-- Center Mode Switcher -->
      <div class="d-none d-sm-flex align-items-center bg-dark p-1 rounded-3 border border-secondary-subtle">
        <button
          @click="emit('switch-view', 'app')"
          :class="['btn btn-sm d-flex align-items-center gap-1.5 px-3 py-1 rounded-2 fw-semibold', activeView === 'app' ? 'btn-info text-dark fw-bold shadow-sm' : 'text-secondary btn-link text-decoration-none']"
          style="font-size: 12px;"
        >
          <i class="bi bi-person-badge" />
          <span>玩家會員 App</span>
        </button>
        <button
          @click="emit('switch-view', 'simulator')"
          :class="['btn btn-sm d-flex align-items-center gap-1.5 px-3 py-1 rounded-2 fw-semibold', activeView === 'simulator' ? 'btn-danger text-white fw-bold shadow-sm' : 'text-secondary btn-link text-decoration-none']"
          style="font-size: 12px;"
        >
          <i class="bi bi-tools" />
          <span>機台 / 門市模擬器</span>
        </button>
      </div>

      <!-- User Status Bar & User Avatar Dropdown -->
      <div class="d-flex align-items-center gap-2 gap-sm-3 position-relative" ref="menuRef">
        <template v-if="user">
          <!-- Token quick pill -->
          <div
            class="d-none d-md-flex align-items-center gap-2 px-3 py-1 rounded-pill border"
            style="background-color: rgba(22, 26, 46, 0.8); border-color: rgba(0, 245, 212, 0.3);"
          >
            <i class="bi bi-coin text-warning fs-6" />
            <span class="font-orbitron fw-bold small" style="color: #00f5d4;">
              {{ balances?.TOKEN?.toLocaleString() || '0' }}
            </span>
            <span class="text-secondary small" style="font-size: 11px;">枚</span>
          </div>

          <!-- Clickable User Avatar Area with Popover Menu -->
          <div
            class="d-flex align-items-center gap-2 cursor-pointer p-1 rounded-3"
            @click="isUserMenuOpen = !isUserMenuOpen"
            :style="{
              cursor: 'pointer',
              backgroundColor: isUserMenuOpen ? 'rgba(0, 245, 212, 0.12)' : 'transparent',
              border: isUserMenuOpen ? '1px solid rgba(0, 245, 212, 0.4)' : '1px solid transparent',
              transition: 'all 0.2s ease',
            }"
          >
            <div class="text-end d-none d-sm-block">
              <div class="fw-bold text-white small leading-tight">{{ user.name }}</div>
              <span :class="['badge rounded-pill', getTierBadge(user.tier).bgClass]" style="font-size: 9px; padding: 2px 8px;">
                {{ getTierBadge(user.tier).text }}
              </span>
            </div>

            <div class="position-relative">
              <img
                :src="user.avatarUrl"
                :alt="user.name"
                class="rounded-circle border border-2 shadow-sm"
                :style="{
                  width: '38px',
                  height: '38px',
                  borderColor: isUserMenuOpen ? '#ff007f' : '#00f5d4',
                  transition: 'border-color 0.2s ease',
                }"
              />
            </div>
          </div>

          <!-- User Avatar Menu Dropdown (8 Features + Logout) -->
          <div
            v-if="isUserMenuOpen"
            class="position-absolute end-0 top-100 mt-2 card border-0 rounded-4 shadow-lg p-2 overflow-y-auto"
            style="width: 270px; max-height: 85vh; background-color: rgba(18, 22, 38, 0.96); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(0, 245, 212, 0.35); box-shadow: 0 15px 35px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0, 245, 212, 0.2); z-index: 1050;"
          >
            <!-- Dropdown User Info Header -->
            <div class="p-2.5 rounded-3 bg-dark border border-secondary-subtle mb-2">
              <div class="d-flex align-items-center gap-2 mb-1.5">
                <img
                  :src="user.avatarUrl"
                  :alt="user.name"
                  class="rounded-circle border border-1 border-info"
                  style="width: 32px; height: 32px;"
                />
                <div class="overflow-hidden">
                  <div class="fw-bold text-white small text-truncate">{{ user.name }}</div>
                  <div class="text-secondary font-monospace" style="font-size: 10px;">
                    卡號: {{ user.account }}
                  </div>
                </div>
              </div>
              <div class="d-flex justify-content-between align-items-center pt-1.5 border-top border-secondary-subtle">
                <span :class="['badge rounded-pill', getTierBadge(user.tier).bgClass]" style="font-size: 9px;">
                  {{ getTierBadge(user.tier).text }}
                </span>
                <span class="font-orbitron small text-warning fw-bold" style="font-size: 11px;">
                  <i class="bi bi-coin me-1" />
                  {{ balances?.TOKEN?.toLocaleString() || '0' }}
                </span>
              </div>
            </div>

            <!-- Action Buttons in Avatar Menu -->
            <div class="d-flex flex-column gap-1 mb-2">
              <!-- 1. 電子會員卡 -->
              <button
                @click="handleTabClick('card')"
                :class="['btn btn-sm d-flex align-items-center justify-content-between p-2 rounded-3 text-start transition-all', activeAppTab === 'card' && activeView === 'app' ? 'btn-info text-dark fw-bold shadow-sm' : 'btn-outline-dark text-white border-0 hover-bg-dark']"
                :style="{ background: activeAppTab === 'card' && activeView === 'app' ? 'linear-gradient(135deg, #00f5d4, #00bbf9)' : 'transparent' }"
              >
                <div class="d-flex align-items-center gap-2">
                  <i class="bi bi-qr-code-scan fs-6" />
                  <span class="small">電子會員卡</span>
                </div>
                <i v-if="activeAppTab === 'card' && activeView === 'app'" class="bi bi-check-circle-fill text-dark" />
              </button>

              <!-- 2. 我的錢包 -->
              <button
                @click="handleTabClick('wallet')"
                :class="['btn btn-sm d-flex align-items-center justify-content-between p-2 rounded-3 text-start transition-all', activeAppTab === 'wallet' && activeView === 'app' ? 'btn-info text-dark fw-bold shadow-sm' : 'btn-outline-dark text-white border-0 hover-bg-dark']"
                :style="{ background: activeAppTab === 'wallet' && activeView === 'app' ? 'linear-gradient(135deg, #00f5d4, #00bbf9)' : 'transparent' }"
              >
                <div class="d-flex align-items-center gap-2">
                  <i class="bi bi-wallet2 fs-6" />
                  <span class="small">我的錢包</span>
                </div>
                <i v-if="activeAppTab === 'wallet' && activeView === 'app'" class="bi bi-check-circle-fill text-dark" />
              </button>

              <!-- 3. 大牌影片 -->
              <button
                @click="handleTabClick('videos')"
                :class="['btn btn-sm d-flex align-items-center justify-content-between p-2 rounded-3 text-start transition-all', activeAppTab === 'videos' && activeView === 'app' ? 'btn-info text-dark fw-bold shadow-sm' : 'btn-outline-dark text-white border-0 hover-bg-dark']"
                :style="{
                  background: activeAppTab === 'videos' && activeView === 'app' ? 'linear-gradient(135deg, #ff007f, #7928ca)' : 'transparent',
                  color: activeAppTab === 'videos' && activeView === 'app' ? '#ffffff' : undefined,
                }"
              >
                <div class="d-flex align-items-center gap-2">
                  <i class="bi bi-camera-reels-fill fs-6 text-danger" />
                  <span class="small">大牌影片</span>
                </div>
                <i v-if="activeAppTab === 'videos' && activeView === 'app'" class="bi bi-check-circle-fill text-white" />
              </button>

              <!-- 4. 大牌相片 -->
              <button
                @click="handleTabClick('photos')"
                :class="['btn btn-sm d-flex align-items-center justify-content-between p-2 rounded-3 text-start transition-all', activeAppTab === 'photos' && activeView === 'app' ? 'btn-info text-dark fw-bold shadow-sm' : 'btn-outline-dark text-white border-0 hover-bg-dark']"
                :style="{ background: activeAppTab === 'photos' && activeView === 'app' ? 'linear-gradient(135deg, #00f5d4, #00bbf9)' : 'transparent' }"
              >
                <div class="d-flex align-items-center gap-2">
                  <i class="bi bi-images fs-6 text-info" />
                  <span class="small">大牌相片</span>
                </div>
                <i v-if="activeAppTab === 'photos' && activeView === 'app'" class="bi bi-check-circle-fill text-dark" />
              </button>

              <!-- 5. 限時活動 -->
              <button
                @click="handleTabClick('events')"
                :class="['btn btn-sm d-flex align-items-center justify-content-between p-2 rounded-3 text-start transition-all', activeAppTab === 'events' && activeView === 'app' ? 'btn-info text-dark fw-bold shadow-sm' : 'btn-outline-dark text-white border-0 hover-bg-dark']"
                :style="{
                  background: activeAppTab === 'events' && activeView === 'app' ? 'linear-gradient(135deg, #ffd166, #ff007f)' : 'transparent',
                  color: activeAppTab === 'events' && activeView === 'app' ? '#050811' : undefined,
                }"
              >
                <div class="d-flex align-items-center gap-2">
                  <i class="bi bi-stars fs-6 text-warning" />
                  <span class="small">限時活動</span>
                </div>
                <i v-if="activeAppTab === 'events' && activeView === 'app'" class="bi bi-check-circle-fill text-dark" />
              </button>

              <!-- 6. 中獎名單 -->
              <button
                @click="handleTabClick('winners')"
                :class="['btn btn-sm d-flex align-items-center justify-content-between p-2 rounded-3 text-start transition-all', activeAppTab === 'winners' && activeView === 'app' ? 'btn-info text-dark fw-bold shadow-sm' : 'btn-outline-dark text-white border-0 hover-bg-dark']"
                :style="{ background: activeAppTab === 'winners' && activeView === 'app' ? 'linear-gradient(135deg, #00f5d4, #00bbf9)' : 'transparent' }"
              >
                <div class="d-flex align-items-center gap-2">
                  <i class="bi bi-trophy-fill fs-6 text-warning" />
                  <span class="small">中獎名單</span>
                </div>
                <i v-if="activeAppTab === 'winners' && activeView === 'app'" class="bi bi-check-circle-fill text-dark" />
              </button>

              <!-- 7. 禮品商城 -->
              <button
                @click="handleTabClick('mall')"
                :class="['btn btn-sm d-flex align-items-center justify-content-between p-2 rounded-3 text-start transition-all', activeAppTab === 'mall' && activeView === 'app' ? 'btn-info text-dark fw-bold shadow-sm' : 'btn-outline-dark text-white border-0 hover-bg-dark']"
                :style="{ background: activeAppTab === 'mall' && activeView === 'app' ? 'linear-gradient(135deg, #00f5d4, #00bbf9)' : 'transparent' }"
              >
                <div class="d-flex align-items-center gap-2">
                  <i class="bi bi-bag-heart fs-6" />
                  <span class="small">禮品商城</span>
                </div>
                <i v-if="activeAppTab === 'mall' && activeView === 'app'" class="bi bi-check-circle-fill text-dark" />
              </button>

              <!-- 8. 簽到抽獎 -->
              <button
                @click="handleTabClick('wheel')"
                :class="['btn btn-sm d-flex align-items-center justify-content-between p-2 rounded-3 text-start transition-all', activeAppTab === 'wheel' && activeView === 'app' ? 'btn-info text-dark fw-bold shadow-sm' : 'btn-outline-dark text-white border-0 hover-bg-dark']"
                :style="{ background: activeAppTab === 'wheel' && activeView === 'app' ? 'linear-gradient(135deg, #00f5d4, #00bbf9)' : 'transparent' }"
              >
                <div class="d-flex align-items-center gap-2">
                  <i class="bi bi-gift fs-6" />
                  <span class="small">簽到抽獎</span>
                </div>
                <i v-if="activeAppTab === 'wheel' && activeView === 'app'" class="bi bi-check-circle-fill text-dark" />
              </button>
            </div>

            <hr class="border-secondary-subtle my-1.5" />

            <!-- Logout Button inside Avatar Menu -->
            <button
              @click="isUserMenuOpen = false; emit('logout');"
              class="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center gap-2 w-100 py-2 rounded-3 fw-bold mt-1"
            >
              <i class="bi bi-box-arrow-right fs-6" />
              <span>登出系統</span>
            </button>
          </div>
        </template>
        <template v-else>
          <button @click="emit('open-login')" class="btn btn-sm btn-info fw-bold px-3 py-1.5 rounded-3">
            會員登入
          </button>
        </template>
      </div>
    </div>
  </nav>
</template>
