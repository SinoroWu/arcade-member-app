<script setup lang="ts">
import { ref } from 'vue';
import { api } from '../services/api';
import { Gamepad2, Sparkles, X } from 'lucide-vue-next';

interface Props {
  isOpen: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'login-success'): void;
}>();

const isRegister = ref<boolean>(false);
const account = ref<string>('0912345678');
const password = ref<string>('password123');
const name = ref<string>('');
const error = ref<string | null>(null);
const isLoading = ref<boolean>(false);

const handleSubmit = async () => {
  error.value = null;
  isLoading.value = true;

  try {
    if (isRegister.value) {
      if (!name.value.trim()) throw new Error('請輸入會員姓名/暱稱');
      await api.register(account.value, name.value, password.value);
    } else {
      await api.login(account.value, password.value);
    }
    emit('login-success');
    emit('close');
  } catch (err: any) {
    error.value = err.message || '登入失敗';
  } finally {
    isLoading.value = false;
  }
};

const handleDemoLogin = async () => {
  account.value = '0912345678';
  password.value = 'password123';
  isLoading.value = true;
  try {
    await api.login('0912345678', 'password123');
    emit('login-success');
    emit('close');
  } catch (e: any) {
    error.value = e.message;
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <div class="glass-panel p-6 max-w-md w-full border border-[#00f5d4]/40 glow-cyan relative">
      <button
        @click="emit('close')"
        class="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg"
      >
        <X class="w-5 h-5" />
      </button>

      <div class="text-center mb-6">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7928ca] to-[#00f5d4] p-[2px] mx-auto mb-3 flex items-center justify-center">
          <div class="w-full h-full bg-[#0a0c14] rounded-[14px] flex items-center justify-center">
            <Gamepad2 class="w-6 h-6 text-[#00f5d4]" />
          </div>
        </div>
        <h3 class="font-orbitron font-extrabold text-xl text-white">
          {{ isRegister ? '註冊會員帳號' : '會員登入' }}
        </h3>
        <p class="text-xs text-gray-400 mt-1">
          {{ isRegister ? '建立您的專屬遊戲場 VIP 數位會員卡' : '登入查看代幣、彩票與電子票券' }}
        </p>
      </div>

      <div v-if="error" class="p-3 bg-rose-950/80 border border-rose-500 rounded-xl text-xs text-rose-300 mb-4">
        {{ error }}
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div v-if="isRegister">
          <label class="block text-xs font-semibold text-gray-300 mb-1">玩家姓名 / 暱稱</label>
          <input
            type="text"
            required
            placeholder="例如：電玩達人 Ken"
            v-model="name"
            class="w-full bg-[#0d101d] border border-[rgba(255,255,255,0.1)] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00f5d4]"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-300 mb-1">手機號碼 / 會員帳號</label>
          <input
            type="text"
            required
            placeholder="例如：0912345678"
            v-model="account"
            class="w-full bg-[#0d101d] border border-[rgba(255,255,255,0.1)] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00f5d4]"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-300 mb-1">密碼</label>
          <input
            type="password"
            required
            placeholder="密碼"
            v-model="password"
            class="w-full bg-[#0d101d] border border-[rgba(255,255,255,0.1)] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00f5d4]"
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="btn-neon-cyan w-full text-xs py-3 font-bold"
        >
          {{ isLoading ? '處理中...' : isRegister ? '建立會員卡' : '立即登入' }}
        </button>
      </form>

      <!-- Demo Fast Login Shortcut -->
      <div class="mt-4 pt-4 border-t border-[rgba(255,255,255,0.08)]">
        <button
          type="button"
          @click="handleDemoLogin"
          :disabled="isLoading"
          class="w-full py-2.5 rounded-xl text-xs font-bold bg-[#161a2e] hover:bg-[#202642] text-[#ffd166] border border-[#ffd166]/30 flex items-center justify-center gap-1.5 transition-all"
        >
          <Sparkles class="w-3.5 h-3.5 text-[#ffd166]" />
          <span>一鍵以示範玩家帳號登入 (Alex / 1280 代幣)</span>
        </button>
      </div>

      <div class="mt-4 text-center">
        <button
          type="button"
          @click="isRegister = !isRegister; error = null;"
          class="text-xs text-gray-400 hover:text-[#00f5d4] transition-colors"
        >
          {{ isRegister ? '已有帳號？點此登入' : '還沒有會員卡？點此免費註冊' }}
        </button>
      </div>
    </div>
  </div>
</template>
