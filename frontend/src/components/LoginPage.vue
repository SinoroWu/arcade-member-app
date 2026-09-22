<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { api } from '../services/api';

const emit = defineEmits<{
  (e: 'login-success'): void;
}>();

const account = ref<string>('');
const password = ref<string>('');
const accountError = ref<boolean>(false);
const passwordError = ref<boolean>(false);
const isLoading = ref<boolean>(false);

// Lock body/html scrolling completely while on LoginPage
onMounted(() => {
  const originalBodyOverflow = document.body.style.overflow;
  const originalHtmlOverflow = document.documentElement.style.overflow;
  const originalTouchAction = document.body.style.touchAction;

  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
  document.body.style.touchAction = 'none';

  onUnmounted(() => {
    document.body.style.overflow = originalBodyOverflow;
    document.documentElement.style.overflow = originalHtmlOverflow;
    document.body.style.touchAction = originalTouchAction;
  });
});

// Strictly allow ONLY half-width Arabic numbers (0-9) and navigation/editing keys
const handleNumericKeyDown = (e: KeyboardEvent) => {
  if (['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) {
    return;
  }
  if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x', 'r'].includes(e.key.toLowerCase())) {
    return;
  }
  if (!/^[0-9]$/.test(e.key)) {
    e.preventDefault();
  }
};

const handleAccountPaste = (e: ClipboardEvent) => {
  e.preventDefault();
  const pastedData = e.clipboardData?.getData('text') || '';
  account.value = pastedData.replace(/[^\d]/g, '').slice(0, 8);
  if (accountError.value) accountError.value = false;
};

const handlePasswordPaste = (e: ClipboardEvent) => {
  e.preventDefault();
  const pastedData = e.clipboardData?.getData('text') || '';
  password.value = pastedData.replace(/[^\d]/g, '').slice(0, 4);
  if (passwordError.value) passwordError.value = false;
};

const handleSubmit = async () => {
  let hasLocalError = false;
  if (!account.value.trim()) {
    accountError.value = true;
    hasLocalError = true;
  }
  if (!password.value.trim()) {
    passwordError.value = true;
    hasLocalError = true;
  }

  if (hasLocalError) return;

  isLoading.value = true;

  try {
    await api.login(account.value.trim(), password.value.trim());
    accountError.value = false;
    passwordError.value = false;
    emit('login-success');
  } catch (err: any) {
    console.error('Login failed:', err);
    const errMsg = err?.message || '';
    if (errMsg.includes('密碼')) {
      passwordError.value = true;
      accountError.value = false;
    } else if (errMsg.includes('帳號') || errMsg.includes('會員') || errMsg.includes('無此')) {
      accountError.value = true;
      passwordError.value = false;
    } else {
      accountError.value = true;
      passwordError.value = true;
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div
    class="container-fluid vh-100 w-100 d-flex flex-column align-items-center position-fixed top-0 start-0 overflow-hidden"
    style="padding-top: 100px; padding-bottom: 80px; touch-action: none; overscroll-behavior: none; height: 100vh; width: 100vw;"
    data-bs-theme="dark"
  >
    <!-- Background Decorative Ambient Lights -->
    <div
      class="position-absolute rounded-circle pointer-events-none"
      style="top: -10%; left: -10%; width: 400px; height: 400px; background: radial-gradient(circle, rgba(121, 40, 202, 0.25) 0%, transparent 70%); filter: blur(50px); z-index: 0;"
    />
    <div
      class="position-absolute rounded-circle pointer-events-none"
      style="bottom: -10%; right: -10%; width: 400px; height: 400px; background: radial-gradient(circle, rgba(0, 245, 212, 0.2) 0%, transparent 70%); filter: blur(50px); z-index: 0;"
    />

    <!-- Main Content Area -->
    <div class="row justify-content-center w-100 position-relative" style="z-index: 1;">
      <div class="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">

        <!-- Brand Header (Strictly 100px from top of viewport) -->
        <div class="text-center mb-4">
          <div
            class="d-inline-flex align-items-center justify-content-center p-1 rounded-4 mb-3"
            style="background: linear-gradient(135deg, #7928ca, #ff007f, #00f5d4); box-shadow: 0 0 25px rgba(0, 245, 212, 0.4);"
          >
            <div
              class="d-flex align-items-center justify-content-center rounded-4"
              style="width: 60px; height: 60px; background-color: #0a0c14;"
            >
              <i class="bi bi-controller fs-1" style="color: #00f5d4;" />
            </div>
          </div>

          <h1
            class="font-orbitron fw-black display-6 text-uppercase tracking-wider mb-0"
            style="background: linear-gradient(90deg, #00f5d4, #ffffff, #ff007f); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: 2px;"
          >
            菲納星娛樂
          </h1>
        </div>

        <!-- Main Card -->
        <div
          class="card border-0 rounded-4 shadow-lg"
          style="background-color: rgba(18, 22, 38, 0.85); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(0, 245, 212, 0.3); box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 245, 212, 0.15);"
        >
          <div class="card-body p-4 p-sm-5">
            <!-- Login Form -->
            <form @submit.prevent="handleSubmit" novalidate autocorrect="off" autocapitalize="off" autocomplete="off" class="d-flex flex-column gap-3">
              <!-- Account Input -->
              <div>
                <div :class="['input-group cyber-input-group', { 'has-error': accountError }]">
                  <span class="input-group-text bg-dark-subtle text-secondary py-2.5">
                    <i class="bi bi-person fs-5" />
                  </span>
                  <input
                    type="text"
                    name="account"
                    maxlength="8"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    autocomplete="off"
                    class="form-control bg-dark text-white font-monospace small py-2.5"
                    placeholder="輸入無卡號"
                    :value="account"
                    @keydown="handleNumericKeyDown"
                    @paste="handleAccountPaste"
                    @input="(e: any) => {
                      account = e.target.value.replace(/[^\d]/g, '').slice(0, 8);
                      if (accountError) accountError = false;
                    }"
                  />
                </div>
              </div>

              <!-- Password Input -->
              <div class="mb-2">
                <div :class="['input-group cyber-input-group', { 'has-error': passwordError }]">
                  <span class="input-group-text bg-dark-subtle text-secondary py-2.5">
                    <i class="bi bi-key-fill fs-5" />
                  </span>
                  <input
                    type="text"
                    name="password"
                    maxlength="4"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    autocomplete="off"
                    class="form-control bg-dark text-white small py-2.5 font-monospace"
                    placeholder="輸入末四碼"
                    :value="password"
                    @keydown="handleNumericKeyDown"
                    @paste="handlePasswordPaste"
                    @input="(e: any) => {
                      password = e.target.value.replace(/[^\d]/g, '').slice(0, 4);
                      if (passwordError) passwordError = false;
                    }"
                  />
                </div>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                :disabled="isLoading"
                class="btn btn-lg w-100 py-2.5 rounded-3 d-flex align-items-center justify-content-center shadow mt-1 font-orbitron"
                :style="{
                  background: 'linear-gradient(135deg, #121626, #0a0c14)',
                  border: (accountError || passwordError) ? '1.5px solid rgba(255, 0, 127, 0.7)' : '1.5px solid rgba(0, 245, 212, 0.5)',
                  boxShadow: (accountError || passwordError)
                    ? '0 4px 20px rgba(255, 0, 127, 0.4), inset 0 0 15px rgba(255, 0, 127, 0.2)'
                    : '0 4px 20px rgba(0, 245, 212, 0.25), inset 0 0 15px rgba(255, 0, 127, 0.12)',
                  transition: 'all 0.25s ease-in-out',
                }"
              >
                <template v-if="isLoading">
                  <span class="spinner-border spinner-border-sm me-2" style="color: #00f5d4;" role="status" aria-hidden="true" />
                  <span
                    class="fw-bold"
                    style="background: linear-gradient(90deg, #00f5d4, #ffffff, #ff007f); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: 2px; font-size: 1rem;"
                  >
                    正在著陸 菲納星...
                  </span>
                </template>
                <template v-else>
                  <span
                    class="fw-black"
                    style="background: linear-gradient(90deg, #00f5d4, #ffffff, #ff007f); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: 2px; font-size: 1.1rem;"
                  >
                    著陸 菲納星
                  </span>
                </template>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Badges pinned strictly 20px from bottom -->
    <div
      class="position-fixed start-0 end-0 d-flex justify-content-center align-items-center gap-3 text-secondary small px-3 pointer-events-none"
      style="bottom: 20px; z-index: 10;"
    >
      <span class="d-inline-flex align-items-center gap-1">
        <i class="bi bi-shield-check text-info" />
        <span>雙重記帳安全認證</span>
      </span>
      <span>•</span>
      <span class="d-inline-flex align-items-center gap-1">
        <i class="bi bi-qr-code text-danger" />
        <span>30秒動態防偽電子卡</span>
      </span>
    </div>
  </div>
</template>
