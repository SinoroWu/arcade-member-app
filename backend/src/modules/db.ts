import { PrismaClient } from '@prisma/client';
import { config } from '../config';

// Ultra-High Performance Data Store supporting both Prisma/PostgreSQL and O(1) in-memory fallback
export class DatabaseManager {
  private static instance: DatabaseManager;
  public prisma: PrismaClient | null = null;
  public isUsingMock = false;

  // In-memory state storage (O(1) indexed structures)
  public memoryStore = {
    users: new Map<string, any>(),
    // Global append-only transactions list (for audit)
    transactions: [] as any[],
    // User-Indexed balances cache for O(1) balance lookups
    userBalances: new Map<string, Record<string, number>>(),
    // User-Indexed transactions list for O(1) history lookups
    userTransactions: new Map<string, any[]>(),
    machines: new Map<string, any>(),
    rewardItems: new Map<string, any>(),
    userVouchers: new Map<string, any>(),
    paymentOrders: new Map<string, any>(),
    dailyCheckins: new Map<string, any>(),
    activeDynamicQrs: new Map<string, { userId: string; expiresAt: number; token: string }>(),
  };

  private constructor() {
    if (config.databaseUrl && !config.databaseUrl.includes('<<>>') && !config.databaseUrl.includes('YOUR-PASSWORD')) {
      try {
        this.prisma = new PrismaClient();
        console.log('[DB] Connecting to PostgreSQL database...');
      } catch (err) {
        console.warn('[DB] Prisma initialization failed, using in-memory engine:', err);
        this.isUsingMock = true;
      }
    } else {
      console.log('[DB] No active PostgreSQL DATABASE_URL found. Using Ultra-High Performance In-Memory Ledger Engine (O(1) Indexed).');
      this.isUsingMock = true;
    }
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }
}

export const dbManager = DatabaseManager.getInstance();
