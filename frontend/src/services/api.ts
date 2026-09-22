import {
  User,
  WalletBalances,
  Transaction,
  Machine,
  RewardItem,
  UserVoucher,
  RechargeTier,
  WheelSegment,
  AssetType,
} from '../types';

const API_BASE = '/api';

class ApiService {
  private tokenKey = 'arcade_auth_token';

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  clearToken() {
    localStorage.removeItem(this.tokenKey);
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '網路請求失敗');
    }

    return data as T;
  }

  // 1. Auth
  async login(account: string, password = 'password123') {
    const res = await this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ account, password }),
    });
    this.setToken(res.token);
    return res;
  }

  async register(account: string, name: string, password = 'password123') {
    const res = await this.request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ account, name, password }),
    });
    this.setToken(res.token);
    return res;
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // 2. Member & Dynamic QR
  async getDynamicQr(): Promise<{
    token: string;
    qrDataUrl: string;
    expiresInSeconds: number;
    refreshIntervalSeconds: number;
    timestamp: number;
  }> {
    return this.request('/member/dynamic-qr');
  }

  // 3. Wallet
  async getWalletBalances(): Promise<{ balances: WalletBalances; user: User }> {
    return this.request('/wallet/balances');
  }

  async getTransactionHistory(assetType?: AssetType): Promise<Transaction[]> {
    const q = assetType ? `?assetType=${assetType}` : '';
    return this.request(`/wallet/history${q}`);
  }

  // 4. Hardware Bridge (Arcade Machines)
  async getMachines(): Promise<Machine[]> {
    return this.request('/hardware/machines');
  }

  async swipeMachine(machineCode: string, dynamicToken: string, tokensToDeduct?: number) {
    return this.request<any>('/hardware/swipe', {
      method: 'POST',
      body: JSON.stringify({ machineCode, dynamicToken, tokensToDeduct }),
    });
  }

  async dispenseTickets(machineCode: string, userId: string, ticketCount: number) {
    return this.request<any>('/hardware/dispense-tickets', {
      method: 'POST',
      body: JSON.stringify({ machineCode, userId, ticketCount }),
    });
  }

  // 5. Payment & Cashier Top-up
  async getRechargeTiers(): Promise<RechargeTier[]> {
    return this.request('/payment/tiers');
  }

  async cashierTopup(data: {
    userId: string;
    amount: number;
    targetTokens: number;
    bonusTokens?: number;
    paymentMethod?: string;
  }) {
    return this.request<any>('/payment/cashier-topup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 6. Rewards Mall & Vouchers
  async getRewardItems(): Promise<RewardItem[]> {
    return this.request('/rewards/items');
  }

  async redeemReward(rewardItemId: string) {
    return this.request<any>('/rewards/redeem', {
      method: 'POST',
      body: JSON.stringify({ rewardItemId }),
    });
  }

  async getMyVouchers(): Promise<UserVoucher[]> {
    return this.request('/rewards/my-vouchers');
  }

  async staffVerifyVoucher(voucherCode: string) {
    return this.request<any>('/rewards/staff-verify-voucher', {
      method: 'POST',
      body: JSON.stringify({ voucherCode, staffId: 'STAFF_CASHIER_01' }),
    });
  }

  // 7. Gamification
  async getWheelSegments(): Promise<WheelSegment[]> {
    return this.request('/gamification/wheel-segments');
  }

  async dailyCheckin() {
    return this.request<any>('/gamification/checkin', {
      method: 'POST',
    });
  }

  async spinWheel() {
    return this.request<any>('/gamification/spin-wheel', {
      method: 'POST',
    });
  }
}

export const api = new ApiService();
