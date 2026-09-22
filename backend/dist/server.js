"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const static_1 = __importDefault(require("@fastify/static"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const config_1 = require("./config");
const seed_1 = require("./seed");
const auth_service_1 = require("./modules/auth/auth.service");
const wallet_service_1 = require("./modules/wallet/wallet.service");
const dynamic_qr_service_1 = require("./modules/member/dynamic-qr.service");
const hardware_bridge_service_1 = require("./modules/hardware/hardware-bridge.service");
const payment_gateway_service_1 = require("./modules/payment/payment-gateway.service");
const reward_service_1 = require("./modules/reward/reward.service");
const gamification_service_1 = require("./modules/gamification/gamification.service");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Instantiate Ultra-Low Overhead Fastify Engine
const app = (0, fastify_1.default)({
    logger: false, // Zero-cost logging overhead
    bodyLimit: 1048576, // 1MB limit for memory protection
});
// Register CORS with Fastify
app.register(cors_1.default, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});
// High-Performance JWT Auth PreHandler
const authPreHandler = async (req, reply) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.status(401).send({ error: '未提供授權憑證，請先登入！' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
        req.user = decoded;
    }
    catch (err) {
        return reply.status(401).send({ error: '登入過期或憑證無效，請重新登入！' });
    }
};
// -------------------------------------------------------------
// 1. 認證模組 (Auth Routes)
// -------------------------------------------------------------
app.post('/api/auth/register', async (req, reply) => {
    try {
        const result = await auth_service_1.authService.register(req.body);
        return result;
    }
    catch (e) {
        return reply.status(400).send({ error: e.message });
    }
});
app.post('/api/auth/login', async (req, reply) => {
    try {
        const { account, password } = req.body || {};
        const result = await auth_service_1.authService.login(account, password);
        return result;
    }
    catch (e) {
        return reply.status(400).send({ error: e.message });
    }
});
app.get('/api/auth/me', { preHandler: authPreHandler }, async (req, reply) => {
    try {
        const user = await auth_service_1.authService.getUserById(req.user.userId);
        if (!user)
            return reply.status(404).send({ error: '會員不存在' });
        const { passwordHash, ...safeUser } = user;
        return safeUser;
    }
    catch (e) {
        return reply.status(500).send({ error: e.message });
    }
});
// -------------------------------------------------------------
// 2. 動態防偽會員卡 (Dynamic QR Routes)
// -------------------------------------------------------------
app.get('/api/member/dynamic-qr', { preHandler: authPreHandler }, async (req, reply) => {
    try {
        const qrData = await dynamic_qr_service_1.dynamicQrService.generateDynamicCode(req.user.userId);
        return qrData;
    }
    catch (e) {
        return reply.status(500).send({ error: e.message });
    }
});
app.post('/api/member/verify-qr', async (req, reply) => {
    try {
        const { token } = req.body || {};
        const userId = await dynamic_qr_service_1.dynamicQrService.verifyAndConsumeDynamicCode(token);
        return { success: true, userId };
    }
    catch (e) {
        return reply.status(400).send({ error: e.message });
    }
});
// -------------------------------------------------------------
// 3. 雙重記帳錢包模組 (Wallet & Ledger Routes)
// -------------------------------------------------------------
app.get('/api/wallet/balances', { preHandler: authPreHandler }, async (req, reply) => {
    try {
        const balances = await wallet_service_1.walletService.getBalances(req.user.userId);
        const user = await auth_service_1.authService.getUserById(req.user.userId);
        return { balances, user };
    }
    catch (e) {
        return reply.status(500).send({ error: e.message });
    }
});
app.get('/api/wallet/history', { preHandler: authPreHandler }, async (req, reply) => {
    try {
        const assetType = req.query?.assetType;
        const history = await wallet_service_1.walletService.getTransactionHistory(req.user.userId, assetType);
        return history;
    }
    catch (e) {
        return reply.status(500).send({ error: e.message });
    }
});
// -------------------------------------------------------------
// 4. 機台與讀卡機硬體對接 (Hardware / IoT Bridge Routes)
// -------------------------------------------------------------
app.get('/api/hardware/machines', async (_req, reply) => {
    try {
        const machines = await hardware_bridge_service_1.hardwareBridgeService.getAllMachines();
        return machines;
    }
    catch (e) {
        return reply.status(500).send({ error: e.message });
    }
});
// 模擬機台投幣 (玩家出示條碼或模擬點擊)
app.post('/api/hardware/swipe', async (req, reply) => {
    try {
        const result = await hardware_bridge_service_1.hardwareBridgeService.handleMachineSwipe(req.body);
        return result;
    }
    catch (e) {
        return reply.status(400).send({ error: e.message });
    }
});
// 模擬機台出票 (遊戲結束過關)
app.post('/api/hardware/dispense-tickets', async (req, reply) => {
    try {
        const result = await hardware_bridge_service_1.hardwareBridgeService.handleTicketDispensed(req.body);
        return result;
    }
    catch (e) {
        return reply.status(400).send({ error: e.message });
    }
});
// -------------------------------------------------------------
// 5. 儲值與金流模組 (Payment Routes)
// -------------------------------------------------------------
app.get('/api/payment/tiers', async (_req, _reply) => {
    return payment_gateway_service_1.paymentGatewayService.rechargeTiers;
});
// 現場櫃台儲值 (Staff Cashier Station)
app.post('/api/payment/cashier-topup', async (req, reply) => {
    try {
        const result = await payment_gateway_service_1.paymentGatewayService.handleCashierTopup(req.body);
        return result;
    }
    catch (e) {
        return reply.status(400).send({ error: e.message });
    }
});
// 預留線上刷卡
app.post('/api/payment/create-online', { preHandler: authPreHandler }, async (req, reply) => {
    try {
        const result = await payment_gateway_service_1.paymentGatewayService.createOnlinePaymentOrder({
            ...req.body,
            userId: req.user.userId,
        });
        return result;
    }
    catch (e) {
        return reply.status(400).send({ error: e.message });
    }
});
// -------------------------------------------------------------
// 6. 獎品商城與票券核銷 (Reward Mall Routes)
// -------------------------------------------------------------
app.get('/api/rewards/items', async (_req, reply) => {
    try {
        const items = await reward_service_1.rewardService.getRewardItems();
        return items;
    }
    catch (e) {
        return reply.status(500).send({ error: e.message });
    }
});
app.post('/api/rewards/redeem', { preHandler: authPreHandler }, async (req, reply) => {
    try {
        const { rewardItemId } = req.body || {};
        const result = await reward_service_1.rewardService.redeemRewardItem(req.user.userId, rewardItemId);
        return result;
    }
    catch (e) {
        return reply.status(400).send({ error: e.message });
    }
});
app.get('/api/rewards/my-vouchers', { preHandler: authPreHandler }, async (req, reply) => {
    try {
        const vouchers = await reward_service_1.rewardService.getUserVouchers(req.user.userId);
        return vouchers;
    }
    catch (e) {
        return reply.status(500).send({ error: e.message });
    }
});
// 現場店員核銷票券 (Staff Scanner)
app.post('/api/rewards/staff-verify-voucher', async (req, reply) => {
    try {
        const { voucherCode, staffId } = req.body || {};
        const result = await reward_service_1.rewardService.redeemVoucherByStaff(voucherCode, staffId);
        return result;
    }
    catch (e) {
        return reply.status(400).send({ error: e.message });
    }
});
// -------------------------------------------------------------
// 7. 遊戲化簽到與輪盤 (Gamification Routes)
// -------------------------------------------------------------
app.get('/api/gamification/wheel-segments', async (_req, _reply) => {
    return gamification_service_1.gamificationService.wheelSegments;
});
app.post('/api/gamification/checkin', { preHandler: authPreHandler }, async (req, reply) => {
    try {
        const result = await gamification_service_1.gamificationService.checkInToday(req.user.userId);
        return result;
    }
    catch (e) {
        return reply.status(400).send({ error: e.message });
    }
});
app.post('/api/gamification/spin-wheel', { preHandler: authPreHandler }, async (req, reply) => {
    try {
        const result = await gamification_service_1.gamificationService.spinLuckyWheel(req.user.userId);
        return result;
    }
    catch (e) {
        return reply.status(400).send({ error: e.message });
    }
});
// Health check
app.get('/api/health', async (_req, _reply) => {
    return {
        status: 'ONLINE',
        service: 'Arcade Member Backend High-Performance Engine (Fastify)',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
    };
});
// Static frontend files serving (Single-Port Unified Deployment)
const possibleFrontendPaths = [
    path_1.default.resolve(__dirname, '../../frontend/dist'),
    path_1.default.resolve(process.cwd(), '../frontend/dist'),
    path_1.default.resolve(process.cwd(), 'frontend/dist'),
];
const frontendDistPath = possibleFrontendPaths.find((p) => fs_1.default.existsSync(p));
if (frontendDistPath) {
    app.register(static_1.default, {
        root: frontendDistPath,
        prefix: '/',
    });
    app.setNotFoundHandler(async (req, reply) => {
        if (req.raw.url?.startsWith('/api')) {
            return reply.status(404).send({ error: 'API Endpoint Not Found' });
        }
        return reply.sendFile('index.html');
    });
    console.log(`[Frontend] Serving Vue 3 static assets from: ${frontendDistPath}`);
}
// Start Server & Seed
async function bootstrap() {
    await (0, seed_1.seedInitialData)();
    try {
        await app.listen({ port: config_1.config.port, host: '0.0.0.0' });
        console.log(`\n======================================================`);
        console.log(`⚡ Arcade Member Fastify Server is running on port ${config_1.config.port}`);
        console.log(`🌐 Endpoint: http://localhost:${config_1.config.port}/api/health`);
        console.log(`======================================================\n`);
    }
    catch (err) {
        console.error('Server failed to start:', err);
        process.exit(1);
    }
}
bootstrap();
