<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { User, WalletBalances, Transaction, AssetType, RechargeTier } from '../types';
import { api } from '../services/api';
import {
  Coins,
  Ticket,
  Stars,
  CreditCard,
  History,
  CheckCircle2,
  Zap,
} from 'lucide-vue-next';
import confetti from 'canvas-confetti';

interface Props {
  user: User;
  balances: WalletBalances | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'refresh'): void;
}>();

const history = ref<Transaction[]>([]);
const selectedAssetFilter = ref<AssetType | 'ALL'>('ALL');
const isLoadingHistory = ref<boolean>(false);
const isTopupModalOpen = ref<boolean>(false);
const tiers = ref<RechargeTier[]>([]);
const selectedTier = ref<RechargeTier | null>(null);
const isSubmittingTopup = ref<boolean>(false);
const topupSuccessMsg = ref<string | null>(null);

const fetchHistory = async () => {
  try {
    isLoadingHistory.value = true;
    const data = await api.getTransactionHistory(
      selectedAssetFilter.value === 'ALL' ? undefined : selectedAssetFilter.value
    );
    history.value = data;
  } catch (e) {
    console.error('Failed to load transaction history:', e);
  } finally {
    isLoadingHistory.value = false;
  }
};

const fetchTiers = async () => {
  try {
    const data = await api.getRechargeTiers();
    tiers.value = data;
    if (data.length > 0) selectedTier.value = data[1]; // Default to popular tier
  } catch (e) {
    console.error(e);
  }
};

onMounted(() => {
  fetchHistory();
  fetchTiers();
});

watch([selectedAssetFilter, () => props.user.id], () => {
  fetchHistory();
});

const handleExecuteTopup = async () => {
  if (!selectedTier.value) return;
  try {
    isSubmittingTopup.value = true;
    const res = await api.cashierTopup({
      userId: props.user.id,
      amount: selectedTier.value.amount,
      targetTokens: selectedTier.value.tokens,
      bonusTokens: selectedTier.value.bonus,
      paymentMethod: 'OFFLINE_CASH',
    });

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });

    topupSuccessMsg.value = res.message;
    emit('refresh');
    fetchHistory();
    setTimeout(() => {
      isTopupModalOpen.value = false;
      topupSuccessMsg.value = null;
    }, 1500);
  } catch (e: any) {
    alert(e.message || '儲值失敗');
  } finally {
    isSubmittingTopup.value = false;
  }
};

const formatTxTypeBadge = (txType: string) => {
  switch (txType) {
    case 'OFFLINE_TOPUP':
      return { label: '門市儲值', bg: 'bg-emerald-950/80', text: 'text-emerald-400', border: 'border-emerald-700/50' };
    case 'MACHINE_PLAY':
      return { label: '機台投幣', bg: 'bg-rose-950/80', text: 'text-rose-400', border: 'border-rose-700/50' };
    case 'MACHINE_REWARD':
      return { label: '過關出票', bg: 'bg-pink-950/80', text: 'text-pink-400', border: 'border-pink-700/50' };
    case 'REWARD_REDEEM':
      return { label: '禮品兌換', bg: 'bg-amber-950/80', text: 'text-amber-400', border: 'border-amber-700/50' };
    case 'DAILY_CHECKIN':
      return { label: '每日簽到', bg: 'bg-purple-950/80', text: 'text-purple-400', border: 'border-purple-700/50' };
    case 'LUCKY_WHEEL':
      return { label: '幸運輪盤', bg: 'bg-cyan-950/80', text: 'text-cyan-400', border: 'border-cyan-700/50' };
    default:
      return { label: txType, bg: 'bg-gray-900', text: 'text-gray-300', border: 'border-gray-700' };
  }
};
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <!-- Top Assets Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <!-- Tokens Card -->
      <div class="glass-card p-5 border-l-4 border-l-[#00f5d4] relative overflow-hidden">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs text-gray-400 font-semibold">遊戲代幣 (Tokens)</span>
          <div class="w-8 h-8 rounded-lg bg-[rgba(0,245,212,0.15)] flex items-center justify-center">
            <Coins class="w-4 h-4 text-[#00f5d4]" />
          </div>
        </div>
        <div class="flex items-baseline gap-1.5">
          <span class="font-orbitron font-extrabold text-3xl text-white">
            {{ balances?.TOKEN?.toLocaleString() || '0' }}
          </span>
          <span class="text-xs text-gray-400">枚</span>
        </div>
        <p class="text-[11px] text-gray-400 mt-2">全場實體街機投幣遊玩</p>
      </div>

      <!-- Tickets Card -->
      <div class="glass-card p-5 border-l-4 border-l-[#ff007f] relative overflow-hidden">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs text-gray-400 font-semibold">機台彩票 (Tickets)</span>
          <div class="w-8 h-8 rounded-lg bg-[rgba(255,0,127,0.15)] flex items-center justify-center">
            <Ticket class="w-4 h-4 text-[#ff007f]" />
          </div>
        </div>
        <div class="flex items-baseline gap-1.5">
          <span class="font-orbitron font-extrabold text-3xl text-[#ff007f]">
            {{ balances?.TICKET?.toLocaleString() || '0' }}
          </span>
          <span class="text-xs text-gray-400">張</span>
        </div>
        <p class="text-[11px] text-gray-400 mt-2">可於商城兌換限量景品與模型</p>
      </div>

      <!-- Points Card -->
      <div class="glass-card p-5 border-l-4 border-l-[#ffd166] relative overflow-hidden">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs text-gray-400 font-semibold">紅利點數 (Points)</span>
          <div class="w-8 h-8 rounded-lg bg-[rgba(255,209,102,0.15)] flex items-center justify-center">
            <Stars class="w-4 h-4 text-[#ffd166]" />
          </div>
        </div>
        <div class="flex items-baseline gap-1.5">
          <span class="font-orbitron font-extrabold text-3xl text-[#ffd166]">
            {{ balances?.POINT?.toLocaleString() || '0' }}
          </span>
          <span class="text-xs text-gray-400">點</span>
        </div>
        <p class="text-[11px] text-gray-400 mt-2">簽到贈送，可用於轉盤抽獎與折價券</p>
      </div>

      <!-- Action / Top-up CTA Card -->
      <div class="glass-card p-5 flex flex-col justify-between border border-[rgba(0,245,212,0.3)] bg-gradient-to-br from-[#161a2e] to-[#121626]">
        <div>
          <div class="flex items-center gap-1.5 text-xs text-[#00f5d4] font-bold mb-1">
            <Zap class="w-3.5 h-3.5" />
            <span>快速儲值</span>
          </div>
          <p class="text-xs text-gray-300">支援門市櫃台現場儲值與代幣包購點</p>
        </div>
        <button
          @click="isTopupModalOpen = true"
          class="btn-neon-cyan text-xs w-full mt-3 py-2"
        >
          <CreditCard class="w-4 h-4" />
          <span>立即儲值代幣</span>
        </button>
      </div>
    </div>

    <!-- Double-Entry Transaction Ledger Audit Table -->
    <div class="glass-panel p-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div class="flex items-center gap-2">
          <History class="w-5 h-5 text-[#00f5d4]" />
          <h3 class="font-orbitron font-bold text-lg text-white">資產雙重記帳明細帳本 (Ledger)</h3>
        </div>

        <!-- Filter Pills -->
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="filter in (['ALL', 'TOKEN', 'TICKET', 'POINT', 'EXP'] as const)"
            :key="filter"
            @click="selectedAssetFilter = filter"
            :class="[
              'px-3 py-1 rounded-lg text-xs font-semibold transition-all',
              selectedAssetFilter === filter
                ? 'bg-[#00f5d4] text-[#0a0c14] font-bold shadow-md'
                : 'bg-[#161a2e] text-gray-400 hover:text-white border border-[rgba(255,255,255,0.06)]'
            ]"
          >
            {{ filter === 'ALL' ? '全部資產' : filter }}
          </button>
        </div>
      </div>

      <!-- Ledger List -->
      <div class="overflow-x-auto">
        <div v-if="isLoadingHistory" class="py-12 text-center text-gray-400">
          正在讀取不可竄改的交易帳本...
        </div>
        <div v-else-if="history.length === 0" class="py-12 text-center text-gray-500">
          尚無相關交易紀錄
        </div>
        <table v-else class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-[rgba(255,255,255,0.08)] text-gray-400 font-mono">
              <th class="pb-3 font-semibold">交易時間</th>
              <th class="pb-3 font-semibold">類型</th>
              <th class="pb-3 font-semibold">項目與說明</th>
              <th class="pb-3 font-semibold">異動金額</th>
              <th class="pb-3 font-semibold">異動後餘額</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[rgba(255,255,255,0.05)]">
            <tr v-for="tx in history" :key="tx.id" class="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
              <td class="py-3.5 text-gray-400 font-mono">
                {{ new Date(tx.createdAt).toLocaleString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }}
              </td>
              <td class="py-3.5">
                <span
                  :class="[
                    'px-2 py-0.5 rounded text-[11px] font-medium border',
                    formatTxTypeBadge(tx.txType).bg,
                    formatTxTypeBadge(tx.txType).text,
                    formatTxTypeBadge(tx.txType).border
                  ]"
                >
                  {{ formatTxTypeBadge(tx.txType).label }}
                </span>
              </td>
              <td class="py-3.5 text-white font-medium">
                <div>{{ tx.description }}</div>
                <span v-if="tx.machine" class="text-[10px] text-gray-400 font-mono">
                  設備: {{ tx.machine.machineCode }}
                </span>
              </td>
              <td class="py-3.5 font-orbitron font-bold">
                <span :class="['inline-flex items-center gap-0.5', Number(tx.amount) > 0 ? 'text-[#00f5d4]' : 'text-rose-400']">
                  {{ Number(tx.amount) > 0 ? '+' : '' }}{{ Number(tx.amount).toLocaleString() }} {{ tx.assetType }}
                </span>
              </td>
              <td class="py-3.5 font-mono text-gray-300">
                {{ Number(tx.balanceAfter).toLocaleString() }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Top-up Modal -->
    <div v-if="isTopupModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div class="glass-panel p-6 max-w-md w-full border border-[rgba(0,245,212,0.3)] glow-cyan">
        <h3 class="font-orbitron font-bold text-lg text-white mb-2 flex items-center gap-2">
          <Coins class="w-5 h-5 text-[#00f5d4]" />
          <span>門市櫃台儲值方案</span>
        </h3>
        <p class="text-xs text-gray-400 mb-4">
          選擇方案後由現場櫃台確認收款，即時自動入帳至您的會員錢包。
        </p>

        <div v-if="topupSuccessMsg" class="p-4 bg-emerald-950/80 border border-emerald-500 rounded-xl text-center text-emerald-300 font-bold my-6">
          <CheckCircle2 class="w-8 h-8 text-emerald-400 mx-auto mb-2 animate-bounce" />
          {{ topupSuccessMsg }}
        </div>

        <template v-else>
          <div class="grid grid-cols-2 gap-3 mb-6">
            <div
              v-for="tier in tiers"
              :key="tier.amount"
              @click="selectedTier = tier"
              :class="[
                'p-3.5 rounded-xl border cursor-pointer transition-all',
                selectedTier?.amount === tier.amount
                  ? 'bg-[rgba(0,245,212,0.15)] border-[#00f5d4] shadow-lg'
                  : 'bg-[#161a2e] border-[rgba(255,255,255,0.08)] hover:border-gray-500'
              ]"
            >
              <div class="flex justify-between items-center mb-1">
                <span class="text-xs font-bold text-white">NT$ {{ tier.amount }}</span>
                <span class="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#00f5d4]/20 text-[#00f5d4]">
                  {{ tier.tag }}
                </span>
              </div>
              <div class="font-orbitron font-extrabold text-lg text-[#00f5d4]">
                {{ tier.tokens }} <span class="text-xs font-normal text-gray-300">枚</span>
              </div>
              <div v-if="tier.bonus > 0" class="text-[10px] text-[#ffd166] font-semibold mt-1">
                + 額外加贈 {{ tier.bonus }} 枚
              </div>
            </div>
          </div>

          <div class="flex gap-3">
            <button
              @click="isTopupModalOpen = false"
              class="btn-outline flex-1 text-xs"
              :disabled="isSubmittingTopup"
            >
              取消
            </button>
            <button
              @click="handleExecuteTopup"
              :disabled="isSubmittingTopup || !selectedTier"
              class="btn-neon-cyan flex-1 text-xs"
            >
              {{ isSubmittingTopup ? '正在處理儲值...' : `確認儲值 NT$ ${selectedTier?.amount}` }}
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
