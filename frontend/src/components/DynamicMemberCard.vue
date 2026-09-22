<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { User, WalletBalances } from '../types';
import { api } from '../services/api';

interface Props {
  user: User;
  balances: WalletBalances | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'refresh-wallet'): void;
}>();

const qrDataUrl = ref<string>('');
const dynamicToken = ref<string>('');
const remainingSeconds = ref<number>(30);
const isLoading = ref<boolean>(false);
const isCopied = ref<boolean>(false);
const lastRefreshedAt = ref<string>('');

const fetchDynamicQr = async () => {
  try {
    isLoading.value = true;
    const res = await api.getDynamicQr();
    qrDataUrl.value = res.qrDataUrl;
    dynamicToken.value = res.token;
    remainingSeconds.value = res.refreshIntervalSeconds || 30;
    lastRefreshedAt.value = new Date().toLocaleTimeString();
  } catch (e: any) {
    console.error('Failed to load dynamic QR:', e);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchDynamicQr();
});

watch(() => props.user.id, () => {
  fetchDynamicQr();
});

// 30s Countdown timer
let timer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  timer = setInterval(() => {
    if (remainingSeconds.value <= 1) {
      fetchDynamicQr();
      remainingSeconds.value = 30;
    } else {
      remainingSeconds.value -= 1;
    }
  }, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const handleCopy = () => {
  navigator.clipboard.writeText(dynamicToken.value);
  isCopied.value = true;
  setTimeout(() => {
    isCopied.value = false;
  }, 2000);
};

const getTierDetails = (tier: string) => {
  switch (tier) {
    case 'VIP':
      return { name: 'VIP 頂級黑卡', maxExp: 20000, next: 'MAX LVL', color: '#ff007f', bgClass: 'bg-danger-subtle text-danger border border-danger-subtle' };
    case 'GOLD':
      return { name: 'GOLD 黃金尊爵', maxExp: 20000, next: 'VIP 黑卡 (需 20,000 EXP)', color: '#ffd166', bgClass: 'bg-warning-subtle text-warning border border-warning-subtle' };
    case 'SILVER':
      return { name: 'SILVER 白銀專屬', maxExp: 8000, next: 'GOLD 黃金 (需 8,000 EXP)', color: '#00f5d4', bgClass: 'bg-info-subtle text-info border border-info-subtle' };
    case 'BRONZE':
      return { name: 'BRONZE 青銅卡', maxExp: 3000, next: 'SILVER 白銀 (需 3,000 EXP)', color: '#cd7f32', bgClass: 'bg-secondary-subtle text-secondary border border-secondary-subtle' };
    default:
      return { name: 'NORMAL 一般會員', maxExp: 1000, next: 'BRONZE 青銅 (需 1,000 EXP)', color: '#9ca3af', bgClass: 'bg-dark-subtle text-secondary border border-secondary-subtle' };
  }
};

const tierDetails = computed(() => getTierDetails(props.user.tier));
const currentExp = computed(() => props.balances?.EXP ?? props.user.expPoints);
const expPercentage = computed(() => Math.min(100, Math.round((currentExp.value / tierDetails.value.maxExp) * 100)));

// Circular countdown calculation
const circleRadius = 18;
const circumference = 2 * Math.PI * circleRadius;
const strokeDashoffset = computed(() => circumference - (remainingSeconds.value / 30) * circumference);
</script>

<template>
  <div class="container px-0" style="max-width: 480px;" data-bs-theme="dark">
    <!-- Dynamic Member VIP Card -->
    <div class="card vip-card-container border-0 rounded-4 p-4 text-white mb-4 shadow-lg position-relative overflow-hidden">
      <div class="laser-scanline" />

      <!-- Card Header -->
      <div class="d-flex align-items-center justify-content-between position-relative mb-3" style="z-index: 2;">
        <div class="d-flex align-items-center gap-2">
          <div
            class="d-flex align-items-center justify-content-center rounded-3"
            style="width: 36px; height: 36px; background-color: rgba(0, 245, 212, 0.15); border: 1px solid rgba(0, 245, 212, 0.4);"
          >
            <i class="bi bi-qr-code fs-5" style="color: #00f5d4;" />
          </div>
          <div>
            <h6 class="font-orbitron fw-bold mb-0 text-white tracking-wider" style="font-size: 13px;">
              ELECTRONIC PASS
            </h6>
            <p class="text-secondary small mb-0" style="font-size: 11px;">
              動態防偽電子會員卡 (Bootstrap 5.3)
            </p>
          </div>
        </div>

        <span
          :class="['badge rounded-pill px-3 py-1.5 font-orbitron fw-bold d-flex align-items-center gap-1 shadow-sm', tierDetails.bgClass]"
          style="font-size: 11px;"
        >
          <i class="bi bi-stars" />
          <span>{{ tierDetails.name }}</span>
        </span>
      </div>

      <!-- Dynamic QR Code Area -->
      <div
        class="card bg-dark rounded-4 p-3 border position-relative d-flex flex-column align-items-center my-2 shadow-sm"
        style="border-color: rgba(0, 245, 212, 0.25); z-index: 2;"
      >
        <!-- Anti-screenshot Watermark -->
        <div class="w-100 d-flex justify-content-between text-secondary small font-monospace mb-2" style="font-size: 10px;">
          <span style="color: rgba(0, 245, 212, 0.6);">SECURE TOTP TOKEN</span>
          <span>{{ lastRefreshedAt }}</span>
        </div>

        <!-- QR Code Container -->
        <div
          class="p-2 rounded-3 border mb-3 position-relative"
          style="background-color: #121626; border-color: rgba(255, 255, 255, 0.1);"
        >
          <div v-if="isLoading && !qrDataUrl" class="d-flex align-items-center justify-content-center" style="width: 190px; height: 190px;">
            <div class="spinner-border text-info" role="status" />
          </div>
          <img
            v-else
            :src="qrDataUrl"
            alt="Dynamic Member QR Code"
            class="rounded-2 img-fluid shadow"
            style="width: 190px; height: 190px;"
          />
        </div>

        <!-- 30s Countdown Ring & Dynamic Status -->
        <div class="d-flex align-items-center justify-content-between w-100 px-2">
          <div class="d-flex align-items-center gap-3">
            <!-- SVG Ring Timer -->
            <div class="position-relative d-flex align-items-center justify-content-center">
              <svg width="40" height="40" class="transform" style="transform: rotate(-90deg);">
                <circle
                  cx="20"
                  cy="20"
                  :r="circleRadius"
                  stroke="rgba(255, 255, 255, 0.1)"
                  stroke-width="3"
                  fill="transparent"
                />
                <circle
                  cx="20"
                  cy="20"
                  :r="circleRadius"
                  stroke="#00f5d4"
                  stroke-width="3"
                  fill="transparent"
                  :stroke-dasharray="circumference"
                  :stroke-dashoffset="strokeDashoffset"
                  stroke-linecap="round"
                  style="transition: stroke-dashoffset 1s linear;"
                />
              </svg>
              <span
                class="position-absolute font-orbitron fw-bold small"
                style="color: #00f5d4; font-size: 11px;"
              >
                {{ remainingSeconds }}
              </span>
            </div>

            <div>
              <p class="fw-semibold text-white small mb-0 d-flex align-items-center gap-1">
                <i class="bi bi-shield-check text-info" />
                <span>30 秒防偽自動更新</span>
              </p>
              <p class="text-secondary small mb-0" style="font-size: 11px;">
                出示機台或櫃台掃描即可扣幣/積點
              </p>
            </div>
          </div>

          <button
            @click="fetchDynamicQr"
            :disabled="isLoading"
            title="手動刷新條碼"
            class="btn btn-sm btn-outline-info rounded-3 p-2 ms-2 d-flex align-items-center justify-content-center"
            style="width: 36px; height: 36px;"
          >
            <i :class="['bi bi-arrow-repeat fs-6', { 'spinner-border spinner-border-sm': isLoading }]" />
          </button>
        </div>
      </div>

      <!-- Member Info Footer -->
      <div
        class="mt-3 pt-3 border-top d-flex align-items-center justify-content-between small position-relative"
        style="border-color: rgba(255, 255, 255, 0.1); z-index: 2;"
      >
        <div>
          <span class="text-secondary d-block" style="font-size: 11px;">會員姓名</span>
          <span class="fw-bold text-white small">{{ user.name }}</span>
        </div>
        <div>
          <span class="text-secondary d-block" style="font-size: 11px;">綁定無卡號 / 手機</span>
          <span class="font-monospace text-white small">{{ user.account }}</span>
        </div>
        <button
          @click="handleCopy"
          class="btn btn-sm btn-outline-info d-flex align-items-center gap-1.5 px-2.5 py-1 rounded-2 fw-semibold"
          style="font-size: 11px;"
        >
          <i :class="isCopied ? 'bi bi-check-lg text-success' : 'bi bi-clipboard'" />
          <span>{{ isCopied ? '已複製' : '複製 Token' }}</span>
        </button>
      </div>
    </div>

    <!-- 4 Wallet Fast Balances Grid (Bootstrap 5.3) -->
    <div class="row g-2 mb-4">
      <!-- Token Balance -->
      <div class="col-6 col-md-3">
        <div class="card h-100 bg-dark border-secondary-subtle rounded-3 p-2.5 text-center shadow-sm">
          <div class="text-secondary small mb-1" style="font-size: 11px;">
            <i class="bi bi-coin text-warning me-1" />
            <span>代幣餘額</span>
          </div>
          <div class="font-orbitron fw-bold fs-6 text-warning">
            {{ balances?.TOKEN?.toLocaleString() || '0' }}
          </div>
        </div>
      </div>

      <!-- Ticket Balance -->
      <div class="col-6 col-md-3">
        <div class="card h-100 bg-dark border-secondary-subtle rounded-3 p-2.5 text-center shadow-sm">
          <div class="text-secondary small mb-1" style="font-size: 11px;">
            <i class="bi bi-ticket-perforated text-danger me-1" />
            <span>彩票餘額</span>
          </div>
          <div class="font-orbitron fw-bold fs-6 text-danger">
            {{ balances?.TICKET?.toLocaleString() || '0' }}
          </div>
        </div>
      </div>

      <!-- Point Balance -->
      <div class="col-6 col-md-3">
        <div class="card h-100 bg-dark border-secondary-subtle rounded-3 p-2.5 text-center shadow-sm">
          <div class="text-secondary small mb-1" style="font-size: 11px;">
            <i class="bi bi-star-fill text-info me-1" />
            <span>會員積分</span>
          </div>
          <div class="font-orbitron fw-bold fs-6 text-info">
            {{ balances?.POINT?.toLocaleString() || '0' }}
          </div>
        </div>
      </div>

      <!-- EXP Balance -->
      <div class="col-6 col-md-3">
        <div class="card h-100 bg-dark border-secondary-subtle rounded-3 p-2.5 text-center shadow-sm">
          <div class="text-secondary small mb-1" style="font-size: 11px;">
            <i class="bi bi-lightning-charge text-success me-1" />
            <span>累計經驗</span>
          </div>
          <div class="font-orbitron fw-bold fs-6 text-success">
            {{ currentExp.toLocaleString() }}
          </div>
        </div>
      </div>
    </div>

    <!-- VIP Tier EXP Progress Bar (Bootstrap 5.3) -->
    <div class="card bg-dark border-secondary-subtle rounded-4 p-3.5 shadow-sm">
      <div class="d-flex align-items-center justify-content-between mb-2">
        <span class="small fw-bold text-white d-flex align-items-center gap-1.5">
          <i class="bi bi-stars text-warning" />
          <span>VIP 等級經驗值</span>
        </span>
        <span class="font-orbitron fw-bold small text-warning">
          {{ currentExp.toLocaleString() }} / {{ tierDetails.maxExp.toLocaleString() }} EXP
        </span>
      </div>

      <div class="progress" role="progressbar" style="height: 8px; background-color: rgba(255, 255, 255, 0.08);">
        <div
          class="progress-bar rounded-pill"
          :style="{
            width: `${expPercentage}%`,
            background: 'linear-gradient(90deg, #ffd166, #ff007f, #00f5d4)',
            transition: 'width 0.6s ease',
          }"
        />
      </div>

      <p class="text-secondary small text-end mt-2 mb-0" style="font-size: 11px;">
        下一階：<span class="text-white fw-semibold">{{ tierDetails.next }}</span>
      </p>
    </div>
  </div>
</template>
