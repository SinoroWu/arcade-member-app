<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Machine, User, WalletBalances } from '../types';
import { api } from '../services/api';
import {
  Gamepad2,
  Coins,
  Ticket,
  Zap,
  CheckCircle2,
  Cpu,
  ScanLine,
  UserCheck,
  PackageCheck,
} from 'lucide-vue-next';
import confetti from 'canvas-confetti';

interface Props {
  currentUser: User | null;
  balances: WalletBalances | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'refresh-wallet'): void;
}>();

const machines = ref<Machine[]>([]);
const selectedMachine = ref<Machine | null>(null);
const simDynamicToken = ref<string>('');
const dispenseTicketAmount = ref<number>(50);
const isProcessing = ref<boolean>(false);
const machineLog = ref<string[]>([]);
const voucherCodeInput = ref<string>('');
const voucherVerifyResult = ref<any>(null);
const playingMachineId = ref<string | null>(null);

const fetchMachines = async () => {
  try {
    const list = await api.getMachines();
    machines.value = list;
    if (list.length > 0) selectedMachine.value = list[0];
  } catch (e) {
    console.error(e);
  }
};

onMounted(() => {
  fetchMachines();
});

const addLog = (msg: string) => {
  const timestamp = new Date().toLocaleTimeString();
  machineLog.value = [`[${timestamp}] ${msg}`, ...machineLog.value.slice(0, 15)];
};

// 1. Simulate Swiping Member QR Code to Start Machine
const handleSimulateSwipe = async (machine: Machine) => {
  if (!props.currentUser) {
    alert('請先登入或註冊會員！');
    return;
  }

  try {
    isProcessing.value = true;
    addLog(`📡 [讀卡機] 掃描到會員卡，正在向 IoT Gateway 發送扣幣請求...`);

    const tokenToUse = simDynamicToken.value.trim() || props.currentUser.id;
    const res = await api.swipeMachine(machine.machineCode, tokenToUse);

    addLog(`⚡ [IoT Bridge] 驗證成功！扣除 ${res.tokensDeducted} 枚代幣，向機台發送脈衝信號 (Pulse: ${res.pulseCount})`);
    addLog(`🎮 [機台] ${machine.name} 啟動遊戲！玩家剩餘代幣: ${res.remainingTokens}`);

    playingMachineId.value = machine.id;
    emit('refresh-wallet');

    confetti({
      particleCount: 50,
      spread: 40,
      origin: { y: 0.7 },
    });
  } catch (e: any) {
    addLog(`❌ [錯誤] 投幣失敗: ${e.message}`);
    alert(`投幣失敗: ${e.message}`);
  } finally {
    isProcessing.value = false;
  }
};

// 2. Simulate Game Over & Ticket Dispensing
const handleSimulateTicketDispense = async (machine: Machine) => {
  if (!props.currentUser) return;

  try {
    isProcessing.value = true;
    addLog(`🎰 [機台感應器] 遊戲結束！感應器計數回傳出票: ${dispenseTicketAmount.value} 張...`);

    const res = await api.dispenseTickets(machine.machineCode, props.currentUser.id, dispenseTicketAmount.value);

    addLog(`🎉 [錢包記帳] ${res.message} 累計彩票餘額: ${res.totalTicketsAfter}`);
    playingMachineId.value = null;
    emit('refresh-wallet');

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.5 },
    });
  } catch (e: any) {
    addLog(`❌ [錯誤] 出票入帳失敗: ${e.message}`);
    alert(e.message);
  } finally {
    isProcessing.value = false;
  }
};

// 3. Simulate Staff Cashier Quick Top-up
const handleQuickStaffTopup = async () => {
  if (!props.currentUser) return;

  try {
    isProcessing.value = true;
    const res = await api.cashierTopup({
      userId: props.currentUser.id,
      amount: 500,
      targetTokens: 280,
      bonusTokens: 30,
      paymentMethod: 'OFFLINE_CASH',
    });

    addLog(`💰 [門市櫃台] 工作人員完成現金儲值 NT$500，為會員注入 310 枚代幣`);
    alert(res.message);
    emit('refresh-wallet');
  } catch (e: any) {
    alert(e.message);
  } finally {
    isProcessing.value = false;
  }
};

// 4. Staff Verify Customer Voucher Code
const handleStaffVerifyVoucher = async () => {
  if (!voucherCodeInput.value.trim()) {
    alert('請輸入核銷代碼！');
    return;
  }

  try {
    isProcessing.value = true;
    const res = await api.staffVerifyVoucher(voucherCodeInput.value.trim());
    voucherVerifyResult.value = res;
    addLog(`🎟️ [票券核銷] 工作人員成功核銷票券 ${voucherCodeInput.value}: ${res.prizeName}`);
    emit('refresh-wallet');
  } catch (e: any) {
    alert(e.message || '核銷失敗');
  } finally {
    isProcessing.value = false;
  }
};
</script>

<template>
  <div class="max-w-6xl mx-auto space-y-8">
    <!-- Simulator Banner -->
    <div class="glass-panel p-6 border border-[#ff007f]/40 glow-pink">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <Cpu class="w-6 h-6 text-[#ff007f]" />
            <h2 class="font-orbitron font-extrabold text-xl text-white">
              HARDWARE & STAFF SIMULATION PLATFORM
            </h2>
          </div>
          <p class="text-xs text-gray-300 mt-1">
            實體機台 IoT 對接模擬器與門市工作人員專用核銷後台
          </p>
        </div>

        <div class="flex items-center gap-2 bg-[#0d101d] px-3.5 py-2 rounded-xl border border-[rgba(255,255,255,0.08)]">
          <UserCheck class="w-4 h-4 text-[#00f5d4]" />
          <div class="text-xs">
            <span class="text-gray-400">目前連線玩家: </span>
            <span class="font-bold text-white">{{ currentUser?.name || '未登入' }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left 2 Cols: Arcade Machine Simulator Rack -->
      <div class="lg:col-span-2 space-y-6">
        <div class="glass-panel p-6">
          <h3 class="font-orbitron font-bold text-base text-white mb-4 flex items-center gap-2">
            <Gamepad2 class="w-5 h-5 text-[#00f5d4]" />
            <span>全館實體街機對接機架 (Machine Rack)</span>
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div
              v-for="machine in machines"
              :key="machine.id"
              @click="selectedMachine = machine"
              :class="[
                'glass-card p-4 border cursor-pointer transition-all',
                selectedMachine?.id === machine.id
                  ? 'border-[#00f5d4] bg-[rgba(0,245,212,0.1)]'
                  : 'border-[rgba(255,255,255,0.08)]'
              ]"
            >
              <div class="flex justify-between items-start mb-2">
                <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/60 text-[#00f5d4]">
                  {{ machine.machineCode }}
                </span>
                <span
                  :class="[
                    'text-[10px] font-bold px-2 py-0.5 rounded-full',
                    playingMachineId === machine.id
                      ? 'bg-rose-950/80 text-rose-400 border border-rose-500/50 animate-pulse'
                      : 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/50'
                  ]"
                >
                  {{ playingMachineId === machine.id ? '🎮 遊戲進行中' : '連線就緒 (ONLINE)' }}
                </span>
              </div>

              <h4 class="font-bold text-white text-sm mb-1">{{ machine.name }}</h4>
              <p class="text-xs text-gray-400 mb-3">{{ machine.category }} • {{ machine.storeBranch }}</p>

              <div class="flex justify-between items-center text-xs font-orbitron pt-2 border-t border-[rgba(255,255,255,0.06)]">
                <span class="text-gray-400">單次投幣:</span>
                <span class="text-[#00f5d4] font-bold">
                  {{ Number(machine.tokenCostPerPlay) }} 枚代幣
                </span>
              </div>

              <!-- Machine Actions -->
              <div class="mt-3 flex gap-2">
                <button
                  @click.stop="handleSimulateSwipe(machine)"
                  :disabled="isProcessing"
                  class="btn-neon-cyan text-[11px] py-1.5 px-3 flex-1"
                >
                  <Zap class="w-3.5 h-3.5" />
                  <span>刷卡投幣</span>
                </button>

                <button
                  v-if="playingMachineId === machine.id"
                  @click.stop="handleSimulateTicketDispense(machine)"
                  :disabled="isProcessing"
                  class="btn-neon-pink text-[11px] py-1.5 px-3 flex-1 animate-bounce"
                >
                  <Ticket class="w-3.5 h-3.5" />
                  <span>過關出票</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Ticket Dispenser Settings -->
          <div class="p-4 bg-[#121626] rounded-xl border border-[rgba(255,255,255,0.06)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-2">
              <Ticket class="w-5 h-5 text-[#ff007f]" />
              <div>
                <h4 class="text-xs font-bold text-white">出票感應器計數設定</h4>
                <p class="text-[11px] text-gray-400">模擬機台遊玩通關後回傳之彩票數量</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button
                v-for="amt in [30, 50, 120, 300]"
                :key="amt"
                @click="dispenseTicketAmount = amt"
                :class="[
                  'px-3 py-1 rounded-lg text-xs font-orbitron font-bold transition-all',
                  dispenseTicketAmount === amt
                    ? 'bg-[#ff007f] text-white shadow-md'
                    : 'bg-[#1a1e36] text-gray-400 hover:text-white'
                ]"
              >
                +{{ amt }} 張
              </button>
            </div>
          </div>
        </div>

        <!-- Real-time IoT Terminal Logs -->
        <div class="glass-panel p-5 bg-[#090b10]">
          <div class="flex items-center justify-between mb-3">
            <span class="font-mono text-xs text-[#00f5d4] flex items-center gap-2">
              <Cpu class="w-4 h-4" />
              <span>IoT Hardware Gateway 通訊即時日誌 (MQTT / WebSocket)</span>
            </span>
            <span class="text-[10px] text-gray-500 font-mono">LIVE FEED</span>
          </div>

          <div class="bg-[#05070c] p-3.5 rounded-xl font-mono text-[11px] h-40 overflow-y-auto space-y-1 border border-[rgba(255,255,255,0.05)] text-gray-300">
            <div v-if="machineLog.length === 0" class="text-gray-600 italic">
              等待硬體事件觸發... 點擊上方機台「刷卡投幣」即可觀察完整通訊流程
            </div>
            <div
              v-else
              v-for="(log, idx) in machineLog"
              :key="idx"
              :class="log.includes('❌') ? 'text-rose-400' : log.includes('⚡') ? 'text-[#00f5d4]' : log.includes('🎉') ? 'text-[#ffd166]' : ''"
            >
              {{ log }}
            </div>
          </div>
        </div>
      </div>

      <!-- Right Col: Staff Cashier & Voucher Verification Counter -->
      <div class="space-y-6">
        <!-- Staff Quick Cashier -->
        <div class="glass-panel p-6 border border-[#ffd166]/40">
          <h3 class="font-orbitron font-bold text-base text-white mb-2 flex items-center gap-2">
            <Coins class="w-5 h-5 text-[#ffd166]" />
            <span>門市櫃台儲值工作站</span>
          </h3>
          <p class="text-xs text-gray-400 mb-4">
            現場收款後一鍵為顧客注入代幣與累計經驗值。
          </p>

          <button
            @click="handleQuickStaffTopup"
            :disabled="isProcessing || !currentUser"
            class="btn-neon-cyan w-full text-xs py-2.5 mb-2"
          >
            <Coins class="w-4 h-4" />
            <span>櫃台收款 NT$500 (注入 310 代幣)</span>
          </button>
        </div>

        <!-- Staff Prize Voucher Scanner -->
        <div class="glass-panel p-6 border border-[#00f5d4]/40">
          <h3 class="font-orbitron font-bold text-base text-white mb-2 flex items-center gap-2">
            <PackageCheck class="w-5 h-5 text-[#00f5d4]" />
            <span>店員獎品核銷掃描機</span>
          </h3>
          <p class="text-xs text-gray-400 mb-4">
            輸入顧客 APP 出示的票券代碼（如: VCH-xxxx-xxxx）完成核銷並交付獎品。
          </p>

          <div class="space-y-3">
            <input
              type="text"
              placeholder="輸入或貼上核銷代碼 (VCH-...)"
              v-model="voucherCodeInput"
              class="w-full bg-[#0d101d] border border-[rgba(255,255,255,0.1)] rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#00f5d4]"
            />

            <button
              @click="handleStaffVerifyVoucher"
              :disabled="isProcessing"
              class="btn-neon-pink w-full text-xs py-2.5"
            >
              <ScanLine class="w-4 h-4" />
              <span>執行核銷並交付景品</span>
            </button>
          </div>

          <div v-if="voucherVerifyResult" class="mt-4 p-3.5 bg-emerald-950/80 border border-emerald-500 rounded-xl text-xs text-emerald-300 space-y-1">
            <p class="font-bold flex items-center gap-1">
              <CheckCircle2 class="w-4 h-4 text-emerald-400" />
              <span>{{ voucherVerifyResult.message }}</span>
            </p>
            <p>領取顧客: <span class="text-white font-bold">{{ voucherVerifyResult.recipient }}</span></p>
            <p>獎品名稱: <span class="text-white font-bold">{{ voucherVerifyResult.prizeName }}</span></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
