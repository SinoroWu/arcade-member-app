<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RewardItem, UserVoucher, WalletBalances, User } from '../types';
import { api } from '../services/api';
import {
  Gift,
  Ticket,
  Stars,
  QrCode,
  CheckCircle2,
  ShoppingBag,
} from 'lucide-vue-next';
import confetti from 'canvas-confetti';

interface Props {
  user: User;
  balances: WalletBalances | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'refresh-wallet'): void;
}>();

const activeTab = ref<'mall' | 'vouchers'>('mall');
const items = ref<RewardItem[]>([]);
const vouchers = ref<UserVoucher[]>([]);
const isLoading = ref<boolean>(false);
const selectedItem = ref<RewardItem | null>(null);
const isRedeeming = ref<boolean>(false);
const redeemSuccessMsg = ref<string | null>(null);
const activeVoucherQr = ref<UserVoucher | null>(null);

const fetchItems = async () => {
  try {
    isLoading.value = true;
    const data = await api.getRewardItems();
    items.value = data;
  } catch (e) {
    console.error(e);
  } finally {
    isLoading.value = false;
  }
};

const fetchVouchers = async () => {
  try {
    const data = await api.getMyVouchers();
    vouchers.value = data;
  } catch (e) {
    console.error(e);
  }
};

onMounted(() => {
  fetchItems();
  fetchVouchers();
});

const handleRedeem = async () => {
  if (!selectedItem.value) return;

  const hasEnoughTickets = (props.balances?.TICKET || 0) >= selectedItem.value.requiredTickets;
  const hasEnoughPoints = (props.balances?.POINT || 0) >= selectedItem.value.requiredPoints;

  if (!hasEnoughTickets || !hasEnoughPoints) {
    alert('您的彩票或紅利點數不足！');
    return;
  }

  try {
    isRedeeming.value = true;
    const res = await api.redeemReward(selectedItem.value.id);

    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
    });

    redeemSuccessMsg.value = res.message;
    emit('refresh-wallet');
    fetchVouchers();
    fetchItems();

    setTimeout(() => {
      selectedItem.value = null;
      redeemSuccessMsg.value = null;
      activeTab.value = 'vouchers';
    }, 1500);
  } catch (e: any) {
    alert(e.message || '兌換失敗');
  } finally {
    isRedeeming.value = false;
  }
};
</script>

<template>
  <div class="max-w-5xl mx-auto">
    <!-- Tab Header -->
    <div class="flex items-center justify-between mb-6 pb-2 border-b border-[rgba(255,255,255,0.08)]">
      <div class="flex gap-2">
        <button
          @click="activeTab = 'mall'"
          :class="[
            'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2',
            activeTab === 'mall'
              ? 'bg-gradient-to-r from-[#00f5d4] to-[#00bbf9] text-[#0a0c14] shadow-md'
              : 'bg-[#161a2e] text-gray-400 hover:text-white border border-[rgba(255,255,255,0.06)]'
          ]"
        >
          <ShoppingBag class="w-4 h-4" />
          <span>彩票與點數兌換商城</span>
        </button>
        <button
          @click="activeTab = 'vouchers'"
          :class="[
            'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative',
            activeTab === 'vouchers'
              ? 'bg-gradient-to-r from-[#ff007f] to-[#7928ca] text-white shadow-md'
              : 'bg-[#161a2e] text-gray-400 hover:text-white border border-[rgba(255,255,255,0.06)]'
          ]"
        >
          <Gift class="w-4 h-4" />
          <span>我的電子票券匣</span>
          <span
            v-if="vouchers.filter((v) => v.status === 'UNUSED').length > 0"
            class="w-2 h-2 rounded-full bg-[#00f5d4] animate-ping"
          />
        </button>
      </div>

      <!-- Current Available Balances Banner -->
      <div class="hidden sm:flex items-center gap-4 text-xs font-orbitron bg-[#121626] px-4 py-1.5 rounded-full border border-[rgba(255,255,255,0.08)]">
        <span class="text-[#ff007f] font-bold flex items-center gap-1">
          <Ticket class="w-3.5 h-3.5" />
          {{ balances?.TICKET?.toLocaleString() || 0 }} 彩票
        </span>
        <span class="text-gray-600">|</span>
        <span class="text-[#ffd166] font-bold flex items-center gap-1">
          <Stars class="w-3.5 h-3.5" />
          {{ balances?.POINT?.toLocaleString() || 0 }} 紅利
        </span>
      </div>
    </div>

    <!-- MALL TAB -->
    <div v-if="activeTab === 'mall'">
      <div v-if="isLoading" class="py-16 text-center text-gray-400">正在載入商城景品...</div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="item in items"
          :key="item.id"
          class="glass-card overflow-hidden flex flex-col justify-between border border-[rgba(255,255,255,0.08)] hover:border-[#00f5d4]/40"
        >
          <div>
            <!-- Image Preview -->
            <div class="h-44 w-full bg-[#0d101d] overflow-hidden relative">
              <img
                :src="item.imageUrl"
                :alt="item.title"
                class="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
              <div class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/70 text-[#00f5d4] border border-[#00f5d4]/30 backdrop-blur-md">
                {{ item.category === 'PHYSICAL' ? '實體限量景品' : '電子抵用券' }}
              </div>
              <div class="absolute bottom-2 left-2.5 px-2 py-0.5 rounded text-[10px] font-mono text-gray-300 bg-black/60 backdrop-blur-sm">
                剩餘庫存: {{ item.stockQuantity }} 件
              </div>
            </div>

            <!-- Content -->
            <div class="p-4">
              <h4 class="font-bold text-white text-sm line-clamp-1 mb-1.5">
                {{ item.title }}
              </h4>
              <p class="text-xs text-gray-400 line-clamp-2 mb-3">
                {{ item.description }}
              </p>
            </div>
          </div>

          <!-- Price & Action -->
          <div class="p-4 pt-0 flex items-center justify-between border-t border-[rgba(255,255,255,0.05)] mt-2">
            <div class="font-orbitron font-bold">
              <div v-if="item.requiredTickets > 0" class="text-sm text-[#ff007f] flex items-center gap-1">
                <Ticket class="w-3.5 h-3.5" />
                <span>{{ item.requiredTickets.toLocaleString() }}</span>
                <span class="text-[10px] text-gray-400 font-normal">彩票</span>
              </div>
              <div v-if="item.requiredPoints > 0" class="text-sm text-[#ffd166] flex items-center gap-1">
                <Stars class="w-3.5 h-3.5" />
                <span>{{ item.requiredPoints.toLocaleString() }}</span>
                <span class="text-[10px] text-gray-400 font-normal">點數</span>
              </div>
            </div>

            <button
              @click="selectedItem = item"
              :disabled="!( (balances?.TICKET || 0) >= item.requiredTickets && (balances?.POINT || 0) >= item.requiredPoints && item.stockQuantity > 0 )"
              :class="[
                'text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all',
                ( (balances?.TICKET || 0) >= item.requiredTickets && (balances?.POINT || 0) >= item.requiredPoints && item.stockQuantity > 0 )
                  ? 'bg-gradient-to-r from-[#00f5d4] to-[#00bbf9] text-[#0a0c14] hover:shadow-lg'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              ]"
            >
              {{ item.stockQuantity <= 0 ? '已售罄' : ((balances?.TICKET || 0) >= item.requiredTickets && (balances?.POINT || 0) >= item.requiredPoints) ? '立即兌換' : '資產不足' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- VOUCHERS TAB -->
    <div v-if="activeTab === 'vouchers'">
      <div v-if="vouchers.length === 0" class="glass-panel p-12 text-center text-gray-400">
        <Gift class="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p class="text-sm font-bold text-white mb-1">您的票券匣空空如也</p>
        <p class="text-xs text-gray-500 mb-4">快去商城用遊玩累積的彩票或紅利兌換景品吧！</p>
        <button @click="activeTab = 'mall'" class="btn-neon-cyan text-xs">
          前往兌換商城
        </button>
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          v-for="voucher in vouchers"
          :key="voucher.id"
          :class="[
            'glass-card p-4 flex gap-4 border transition-all',
            voucher.status === 'UNUSED' ? 'border-[#00f5d4]/40 hover:border-[#00f5d4]' : 'border-gray-800 opacity-60'
          ]"
        >
          <img
            :src="voucher.rewardItem?.imageUrl || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300'"
            :alt="voucher.rewardItem?.title"
            class="w-20 h-20 object-cover rounded-xl bg-[#0d101d]"
          />
          <div class="flex-1 flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-start">
                <h4 class="font-bold text-white text-xs line-clamp-1">
                  {{ voucher.rewardItem?.title }}
                </h4>
                <span
                  :class="[
                    'text-[10px] font-bold px-2 py-0.5 rounded-full',
                    voucher.status === 'UNUSED' ? 'bg-[#00f5d4]/20 text-[#00f5d4]' : 'bg-gray-800 text-gray-400'
                  ]"
                >
                  {{ voucher.status === 'UNUSED' ? '可兌換' : voucher.status === 'USED' ? '已核銷' : '已過期' }}
                </span>
              </div>
              <p class="text-[11px] font-mono text-gray-400 mt-1">
                代碼: <span class="text-white font-bold">{{ voucher.voucherCode }}</span>
              </p>
            </div>

            <div class="flex justify-between items-center text-[10px] text-gray-400 pt-2 border-t border-[rgba(255,255,255,0.06)]">
              <span>
                效期至: {{ new Date(voucher.expireAt).toLocaleDateString('zh-TW') }}
              </span>
              <button
                v-if="voucher.status === 'UNUSED'"
                @click="activeVoucherQr = voucher"
                class="text-[#00f5d4] hover:underline font-bold flex items-center gap-1"
              >
                <QrCode class="w-3.5 h-3.5" />
                出示核銷碼
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Redeem Confirmation Modal -->
    <div v-if="selectedItem" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div class="glass-panel p-6 max-w-md w-full border border-[#00f5d4]/40 glow-cyan">
        <h3 class="font-orbitron font-bold text-lg text-white mb-2 flex items-center gap-2">
          <Gift class="w-5 h-5 text-[#00f5d4]" />
          <span>確認兌換景品</span>
        </h3>

        <div v-if="redeemSuccessMsg" class="p-4 bg-emerald-950/80 border border-emerald-500 rounded-xl text-center text-emerald-300 font-bold my-6">
          <CheckCircle2 class="w-8 h-8 text-emerald-400 mx-auto mb-2 animate-bounce" />
          {{ redeemSuccessMsg }}
        </div>

        <template v-else>
          <div class="p-4 bg-[#121626] rounded-xl border border-[rgba(255,255,255,0.08)] my-4 flex gap-3.5 items-center">
            <img
              :src="selectedItem.imageUrl"
              :alt="selectedItem.title"
              class="w-16 h-16 object-cover rounded-lg"
            />
            <div>
              <h4 class="font-bold text-white text-xs">{{ selectedItem.title }}</h4>
              <p class="text-[11px] text-gray-400 mt-1">{{ selectedItem.description }}</p>
              <div class="flex gap-3 text-xs font-orbitron font-bold mt-1.5">
                <span v-if="selectedItem.requiredTickets > 0" class="text-[#ff007f]">
                  {{ selectedItem.requiredTickets }} 彩票
                </span>
                <span v-if="selectedItem.requiredPoints > 0" class="text-[#ffd166]">
                  {{ selectedItem.requiredPoints }} 紅利
                </span>
              </div>
            </div>
          </div>

          <div class="flex gap-3 mt-4">
            <button
              @click="selectedItem = null"
              :disabled="isRedeeming"
              class="btn-outline flex-1 text-xs"
            >
              取消
            </button>
            <button
              @click="handleRedeem"
              :disabled="isRedeeming"
              class="btn-neon-cyan flex-1 text-xs"
            >
              {{ isRedeeming ? '正在兌換中...' : '確認扣點並領取票券' }}
            </button>
          </div>
        </template>
      </div>
    </div>

    <!-- Voucher Detail Modal for Staff Pickup -->
    <div v-if="activeVoucherQr" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div class="glass-panel p-6 max-w-sm w-full border border-[#00f5d4]/40 text-center">
        <h3 class="font-orbitron font-bold text-base text-white mb-1">門市景品核銷憑證</h3>
        <p class="text-xs text-gray-400 mb-4">請向門市櫃台店員出示此代碼兌換領取</p>

        <div class="p-4 bg-white rounded-2xl inline-block my-2 shadow-xl">
          <div class="font-mono font-extrabold text-2xl text-black tracking-widest py-3 px-4 bg-gray-100 rounded-lg border-2 border-dashed border-gray-400 mb-2">
            {{ activeVoucherQr.voucherCode }}
          </div>
          <p class="text-[10px] text-gray-600">專屬核銷代碼 (Staff Code)</p>
        </div>

        <div class="text-left bg-[#121626] p-3 rounded-xl border border-[rgba(255,255,255,0.06)] my-4 text-xs">
          <p class="text-gray-400">兌換獎品：<span class="text-white font-bold">{{ activeVoucherQr.rewardItem?.title }}</span></p>
          <p class="text-gray-400 mt-1">有效期限：<span class="text-white">{{ new Date(activeVoucherQr.expireAt).toLocaleDateString() }}</span></p>
        </div>

        <button
          @click="activeVoucherQr = null"
          class="btn-neon-cyan text-xs w-full"
        >
          完成並關閉
        </button>
      </div>
    </div>
  </div>
</template>
