<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { User, WalletBalances } from './types';
import { api } from './services/api';
import Navbar, { AppTabType } from './components/Navbar.vue';
import LoginPage from './components/LoginPage.vue';
import DynamicMemberCard from './components/DynamicMemberCard.vue';
import WalletDashboard from './components/WalletDashboard.vue';
import JackpotVideos from './components/JackpotVideos.vue';
import JackpotPhotos from './components/JackpotPhotos.vue';
import LimitedEvents from './components/LimitedEvents.vue';
import WinnersList from './components/WinnersList.vue';
import RewardMall from './components/RewardMall.vue';
import LuckyWheel from './components/LuckyWheel.vue';
import StaffHardwareSimulator from './components/StaffHardwareSimulator.vue';

const user = ref<User | null>(null);
const balances = ref<WalletBalances | null>(null);
const activeView = ref<'app' | 'simulator'>('app');
const activeAppTab = ref<AppTabType>('card');
const isLoading = ref<boolean>(Boolean(api.getToken()));

const fetchUserData = async () => {
  try {
    isLoading.value = true;
    const token = api.getToken();
    if (!token) {
      user.value = null;
      balances.value = null;
      return;
    }
    const res = await api.getWalletBalances();
    user.value = res.user;
    balances.value = res.balances;
  } catch (e) {
    api.clearToken();
    user.value = null;
    balances.value = null;
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  const token = api.getToken();
  if (token) {
    fetchUserData();
  } else {
    isLoading.value = false;
  }
});

const handleLogout = () => {
  api.clearToken();
  user.value = null;
  balances.value = null;
  activeView.value = 'app';
  activeAppTab.value = 'card';
};
</script>

<template>
  <!-- 1. Loading State -->
  <div v-if="isLoading" class="min-vh-100 d-flex align-items-center justify-content-center bg-dark" data-bs-theme="dark">
    <div class="text-center">
      <div class="spinner-border text-info mb-3" role="status" style="width: 3rem; height: 3rem;" />
      <p class="font-orbitron small text-secondary">正在著陸 菲納星娛樂 會員系統...</p>
    </div>
  </div>

  <!-- 2. Unauthenticated -> Full-Screen Login Page as the FIRST Page -->
  <LoginPage v-else-if="!user" @login-success="fetchUserData" />

  <!-- 3. Authenticated -> Display Main Arcade Member App & Hardware Simulator -->
  <div v-else class="min-vh-100 d-flex flex-column justify-content-between pb-5" data-bs-theme="dark">
    <div>
      <!-- Navigation Bar with User Avatar Dropdown controlling all 8 Tabs & Logout -->
      <Navbar
        :user="user"
        :balances="balances"
        :active-view="activeView"
        :active-app-tab="activeAppTab"
        @switch-view="(v) => activeView = v"
        @select-app-tab="(t) => activeAppTab = t"
        @logout="handleLogout"
      />

      <!-- Main Content Area -->
      <main class="container max-w-7xl py-2 px-3 px-sm-4">
        <!-- Hardware & Staff Simulator -->
        <StaffHardwareSimulator
          v-if="activeView === 'simulator'"
          :current-user="user"
          :balances="balances"
          @refresh-wallet="fetchUserData"
        />

        <!-- Player Mobile App View -->
        <div v-else>
          <!-- 1. 電子會員卡 -->
          <DynamicMemberCard
            v-if="activeAppTab === 'card'"
            :user="user"
            :balances="balances"
            @refresh-wallet="fetchUserData"
          />

          <!-- 2. 我的錢包 -->
          <WalletDashboard
            v-else-if="activeAppTab === 'wallet'"
            :user="user"
            :balances="balances"
            @refresh="fetchUserData"
          />

          <!-- 3. 大牌影片 -->
          <JackpotVideos v-else-if="activeAppTab === 'videos'" />

          <!-- 4. 大牌相片 -->
          <JackpotPhotos v-else-if="activeAppTab === 'photos'" />

          <!-- 5. 限時活動 -->
          <LimitedEvents v-else-if="activeAppTab === 'events'" />

          <!-- 6. 中獎名單 -->
          <WinnersList v-else-if="activeAppTab === 'winners'" />

          <!-- 7. 禮品商城 -->
          <RewardMall
            v-else-if="activeAppTab === 'mall'"
            :user="user"
            :balances="balances"
            @refresh-wallet="fetchUserData"
          />

          <!-- 8. 簽到抽獎 -->
          <LuckyWheel
            v-else-if="activeAppTab === 'wheel'"
            :user="user"
            :balances="balances"
            @refresh-wallet="fetchUserData"
          />
        </div>
      </main>
    </div>
  </div>
</template>
