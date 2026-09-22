"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbManager = exports.DatabaseManager = void 0;
const client_1 = require("@prisma/client");
const config_1 = require("../config");
// Ultra-High Performance Data Store supporting both Prisma/PostgreSQL and O(1) in-memory fallback
class DatabaseManager {
    static instance;
    prisma = null;
    isUsingMock = false;
    // In-memory state storage (O(1) indexed structures)
    memoryStore = {
        users: new Map(),
        // Global append-only transactions list (for audit)
        transactions: [],
        // User-Indexed balances cache for O(1) balance lookups
        userBalances: new Map(),
        // User-Indexed transactions list for O(1) history lookups
        userTransactions: new Map(),
        machines: new Map(),
        rewardItems: new Map(),
        userVouchers: new Map(),
        paymentOrders: new Map(),
        dailyCheckins: new Map(),
        activeDynamicQrs: new Map(),
    };
    constructor() {
        if (config_1.config.databaseUrl && !config_1.config.databaseUrl.includes('<<>>') && !config_1.config.databaseUrl.includes('YOUR-PASSWORD')) {
            try {
                this.prisma = new client_1.PrismaClient();
                console.log('[DB] Connecting to PostgreSQL database...');
            }
            catch (err) {
                console.warn('[DB] Prisma initialization failed, using in-memory engine:', err);
                this.isUsingMock = true;
            }
        }
        else {
            console.log('[DB] No active PostgreSQL DATABASE_URL found. Using Ultra-High Performance In-Memory Ledger Engine (O(1) Indexed).');
            this.isUsingMock = true;
        }
    }
    static getInstance() {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }
}
exports.DatabaseManager = DatabaseManager;
exports.dbManager = DatabaseManager.getInstance();
