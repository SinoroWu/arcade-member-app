<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { User, WalletBalances, WheelSegment } from '../types';
import { api } from '../services/api';
import { Calendar, Sparkles, Trophy, Zap, Play, CheckCircle2 } from 'lucide-vue-next';
import confetti from 'canvas-confetti';

interface Props {
  user: User;
  balances: WalletBalances | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'refresh-wallet'): void;
}>();

const segments = ref<WheelSegment[]>([]);
const isSpinning = ref<boolean>(false);
const rotationDegrees = ref<number>(0);
const spinResult = ref<any>(null);
const checkinMsg = ref<string | null>(null);
const isCheckedInToday = ref<boolean>(false);
const streakDays = ref<number>(1);

const fetchWheelData = async () => {
  try {
    const data = await api.getWheelSegments();
    segments.value = data;
  } catch (e) {
    console.error(e);
  }
};

onMounted(() => {
  fetchWheelData();
});

const handleCheckIn = async () => {
  try {
    const res = await api.dailyCheckin();
    checkinMsg.value = res.message;
    isCheckedInToday.value = true;
    if (res.streakDays) streakDays.value = res.streakDays;

    if (!res.alreadyCheckedIn) {
      confetti({
        particleCount: 70,
        spread: 50,
        origin: { y: 0.7 },
      });
      emit('refresh-wallet');
    }
  } catch (e: any) {
    alert(e.message || '簽到失敗');
  }
};

const handleSpin = async () => {
  if (isSpinning.value) return;
  if ((props.balances?.POINT || 0) < 20) {
    alert('紅利點數不足 20 點，快去簽到領取點數！');
    return;
  }

  try {
    isSpinning.value = true;
    spinResult.value = null;

    const res = await api.spinWheel();

    const sliceAngle = 360 / segments.value.length;
    const targetIndex = res.segmentId;
    
    const extraSpins = 5 * 360;
    const targetDegree = extraSpins + (360 - targetIndex * sliceAngle - sliceAngle / 2);

    rotationDegrees.value = targetDegree;

    setTimeout(() => {
      isSpinning.value = false;
      spinResult.value = res;
      emit('refresh-wallet');

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
      });
    }, 4000);
  } catch (e: any) {
    isSpinning.value = false;
    alert(e.message || '轉盤抽獎失敗');
  }
};

// SVG arc calculation helper
const getArcPath = (idx: number) => {
  const angle = 360 / segments.value.length;
  const startAngle = idx * angle;
  const endAngle = (idx + 1) * angle;

  const x1 = 150 + 140 * Math.cos((Math.PI * (startAngle - 90)) / 180);
  const y1 = 150 + 140 * Math.sin((Math.PI * (startAngle - 90)) / 180);
  const x2 = 150 + 140 * Math.cos((Math.PI * (endAngle - 90)) / 180);
  const y2 = 150 + 140 * Math.sin((Math.PI * (endAngle - 90)) / 180);

  return `M150,150 L${x1},${y1} A140,140 0 0,1 ${x2},${y2} Z`;
};

const getTextTransform = (idx: number) => {
  const angle = 360 / segments.value.length;
  const startAngle = idx * angle;
  const textAngle = startAngle + angle / 2 - 90;
  const textRad = (Math.PI * textAngle) / 180;
  const tx = 150 + 90 * Math.cos(textRad);
  const ty = 150 + 90 * Math.sin(textRad);
  return { tx, ty, rotate: `rotate(${textAngle + 90}, ${tx}, ${ty})` };
};
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <!-- 7-Day Daily Streak Check-in -->
    <div class="glass-panel p-6 mb-8 border border-[rgba(0,245,212,0.3)] glow-cyan">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <div class="flex items-center gap-2">
            <Calendar class="w-5 h-5 text-[#00f5d4]" />
            <h3 class="font-orbitron font-bold text-lg text-white">7 日連續簽到好禮</h3>
          </div>
          <p class="text-xs text-gray-400 mt-1">天天簽到領紅利點數，第 7 天特獎加贈 2 枚實體代幣！</p>
        </div>

        <button
          @click="handleCheckIn"
          :disabled="isCheckedInToday"
          :class="[
            'px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all',
            isCheckedInToday
              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/50'
              : 'btn-neon-cyan'
          ]"
        >
          <template v-if="isCheckedInToday">
            <CheckCircle2 class="w-4 h-4" />
            <span>今日已簽到</span>
          </template>
          <template v-else>
            <Zap class="w-4 h-4" />
            <span>立即簽到領點數</span>
          </template>
        </button>
      </div>

      <div v-if="checkinMsg" class="p-3 bg-[#161a2e] rounded-xl border border-[rgba(0,245,212,0.3)] text-xs text-[#00f5d4] mb-4 flex items-center gap-2">
        <Sparkles class="w-4 h-4 shrink-0" />
        <span>{{ checkinMsg }}</span>
      </div>

      <!-- 7-Day Milestone Streak Cards -->
      <div class="grid grid-cols-7 gap-2">
        <div
          v-for="day in [1, 2, 3, 4, 5, 6, 7]"
          :key="day"
          :class="[
            'p-2.5 rounded-xl text-center border transition-all',
            streakDays >= day
              ? 'bg-[rgba(0,245,212,0.15)] border-[#00f5d4]'
              : streakDays === day
              ? 'bg-[#1e2440] border-[#ffd166] pulse-badge'
              : 'bg-[#121626] border-[rgba(255,255,255,0.06)]'
          ]"
        >
          <span class="text-[10px] font-bold text-gray-400 block mb-1">D{{ day }}</span>
          <div class="font-orbitron font-extrabold text-xs text-[#ffd166]">
            +{{ 10 + (day - 1) * 5 }}
          </div>
          <span class="text-[9px] text-gray-400 block">點數</span>
          <div v-if="day === 7" class="mt-1 text-[8px] font-bold text-[#ff007f] bg-pink-950/80 rounded py-0.5 border border-pink-700/50">
            +2 代幣
          </div>
        </div>
      </div>
    </div>

    <!-- Lucky Spin Wheel Section -->
    <div class="glass-panel p-6 text-center relative overflow-hidden">
      <div class="max-w-md mx-auto">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(255,0,127,0.15)] border border-[#ff007f]/40 text-[#ff007f] text-xs font-bold mb-3">
          <Trophy class="w-3.5 h-3.5" />
          <span>幸運電玩大轉盤 (每抽 20 點)</span>
        </div>

        <h3 class="font-orbitron font-extrabold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-[#00f5d4] via-white to-[#ff007f] mb-1">
          菲納星幸運大轉盤
        </h3>
        <p class="text-xs text-gray-400 mb-6">
          最高可抽中 10 枚代幣或 150 張彩票，獎勵即時注入帳本！
        </p>

        <!-- Wheel Graphic Container -->
        <div class="relative w-[300px] h-[300px] sm:w-[320px] sm:h-[320px] mx-auto my-4 flex items-center justify-center">
          <!-- Pointer / Arrow on top -->
          <div class="absolute -top-3 z-30 transform -translate-x-1/2 left-1/2 filter drop-shadow-[0_0_8px_#00f5d4]">
            <div class="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-[#00f5d4]" />
          </div>

          <!-- Rotating Wheel Disc (SVG) -->
          <svg
            viewBox="0 0 300 300"
            class="w-full h-full rounded-full shadow-[0_0_40px_rgba(0,245,212,0.2)] border-4 border-[#1e2440]"
            :style="{
              transform: `rotate(${rotationDegrees}deg)`,
              transition: isSpinning ? 'transform 4s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none',
            }"
          >
            <g v-for="(seg, idx) in segments" :key="seg.id">
              <path
                :d="getArcPath(idx)"
                :fill="idx % 2 === 0 ? '#181d33' : '#101426'"
                stroke="rgba(0,245,212,0.3)"
                stroke-width="1.5"
              />
              <text
                :x="getTextTransform(idx).tx"
                :y="getTextTransform(idx).ty"
                :fill="seg.color"
                font-size="10"
                font-weight="bold"
                font-family="Outfit, sans-serif"
                text-anchor="middle"
                dominant-baseline="middle"
                :transform="getTextTransform(idx).rotate"
              >
                {{ seg.label }}
              </text>
            </g>
            <circle cx="150" cy="150" r="145" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="2" />
          </svg>

          <!-- Center Spin Trigger Button -->
          <button
            @click="handleSpin"
            :disabled="isSpinning"
            class="absolute z-20 w-16 h-16 rounded-full bg-gradient-to-tr from-[#ff007f] to-[#00f5d4] p-[3px] shadow-2xl active:scale-95 transition-transform"
          >
            <div class="w-full h-full bg-[#0a0c14] rounded-full flex flex-col items-center justify-center text-white font-orbitron font-extrabold text-[11px] hover:text-[#00f5d4]">
              <Play class="w-4 h-4 fill-white text-white mb-0.5" />
              <span>SPIN</span>
            </div>
          </button>
        </div>

        <!-- Winning Announcement Banner -->
        <div v-if="spinResult" class="mt-4 p-4 bg-[rgba(0,245,212,0.15)] border border-[#00f5d4] rounded-2xl glow-cyan animate-pulse">
          <h4 class="font-orbitron font-extrabold text-lg text-white mb-1">
            {{ spinResult.message }}
          </h4>
          <p class="text-xs text-[#00f5d4]">獎勵已即時存入您的會員資產帳本中！</p>
        </div>
      </div>
    </div>
  </div>
</template>
