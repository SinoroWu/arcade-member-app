export type MembershipTier = 'NORMAL' | 'BRONZE' | 'SILVER' | 'GOLD' | 'VIP';

export interface User {
  id: string;
  account: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  tier: MembershipTier;
  expPoints: number;
  createdAt: string;
}

export interface WalletBalances {
  TOKEN: number;
  TICKET: number;
  POINT: number;
  EXP: number;
}

export type AssetType = 'TOKEN' | 'TICKET' | 'POINT' | 'EXP';

export interface Transaction {
  id: string;
  userId: string;
  assetType: AssetType;
  amount: number | string;
  balanceAfter: number | string;
  txType: string;
  description: string;
  machineId?: string;
  paymentOrderId?: string;
  metadata?: string;
  createdAt: string;
  machine?: {
    name: string;
    machineCode: string;
  };
}

export interface Machine {
  id: string;
  machineCode: string;
  name: string;
  category: string;
  storeBranch: string;
  tokenCostPerPlay: number | string;
  status: 'ONLINE' | 'OFFLINE' | 'IN_USE' | 'MAINTENANCE';
  hardwareIp?: string;
  mqttTopic?: string;
}

export interface RewardItem {
  id: string;
  title: string;
  description?: string;
  category: 'PHYSICAL' | 'DIGITAL';
  requiredTickets: number;
  requiredPoints: number;
  stockQuantity: number;
  imageUrl: string;
  isActive: boolean;
}

export interface UserVoucher {
  id: string;
  userId: string;
  rewardItemId: string;
  voucherCode: string;
  status: 'UNUSED' | 'USED' | 'EXPIRED';
  expireAt: string;
  redeemedAt?: string;
  rewardItem: RewardItem;
}

export interface RechargeTier {
  amount: number;
  tokens: number;
  bonus: number;
  label: string;
  tag: string;
}

export interface WheelSegment {
  id: number;
  label: string;
  assetType: 'POINT' | 'TOKEN' | 'TICKET' | 'EXP';
  amount: number;
  color: string;
  weight: number;
}
