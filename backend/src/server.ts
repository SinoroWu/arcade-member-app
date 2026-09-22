import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import path from 'path';
import fs from 'fs';
import { config } from './config';
import { seedInitialData } from './seed';
import { authService } from './modules/auth/auth.service';
import { walletService } from './modules/wallet/wallet.service';
import { dynamicQrService } from './modules/member/dynamic-qr.service';
import { hardwareBridgeService } from './modules/hardware/hardware-bridge.service';
import { paymentGatewayService } from './modules/payment/payment-gateway.service';
import { rewardService } from './modules/reward/reward.service';
import { gamificationService } from './modules/gamification/gamification.service';
import jwt from 'jsonwebtoken';

// Instantiate Ultra-Low Overhead Fastify Engine
const app = Fastify({
  logger: false, // Zero-cost logging overhead
  bodyLimit: 1048576, // 1MB limit for memory protection
});

// Register CORS with Fastify
app.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

// High-Performance JWT Auth PreHandler
const authPreHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ error: '未提供授權憑證，請先登入！' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    (req as any).user = decoded;
  } catch (err) {
    return reply.status(401).send({ error: '登入過期或憑證無效，請重新登入！' });
  }
};

// -------------------------------------------------------------
// 1. 認證模組 (Auth Routes)
// -------------------------------------------------------------
app.post('/api/auth/register', async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const result = await authService.register(req.body as any);
    return result;
  } catch (e: any) {
    return reply.status(400).send({ error: e.message });
  }
});

app.post('/api/auth/login', async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { account, password } = (req.body as any) || {};
    const result = await authService.login(account, password);
    return result;
  } catch (e: any) {
    return reply.status(400).send({ error: e.message });
  }
});

app.get('/api/auth/me', { preHandler: authPreHandler }, async (req: any, reply: FastifyReply) => {
  try {
    const user = await authService.getUserById(req.user.userId);
    if (!user) return reply.status(404).send({ error: '會員不存在' });
    const { passwordHash, ...safeUser } = user as any;
    return safeUser;
  } catch (e: any) {
    return reply.status(500).send({ error: e.message });
  }
});

// -------------------------------------------------------------
// 2. 動態防偽會員卡 (Dynamic QR Routes)
// -------------------------------------------------------------
app.get('/api/member/dynamic-qr', { preHandler: authPreHandler }, async (req: any, reply: FastifyReply) => {
  try {
    const qrData = await dynamicQrService.generateDynamicCode(req.user.userId);
    return qrData;
  } catch (e: any) {
    return reply.status(500).send({ error: e.message });
  }
});

app.post('/api/member/verify-qr', async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { token } = (req.body as any) || {};
    const userId = await dynamicQrService.verifyAndConsumeDynamicCode(token);
    return { success: true, userId };
  } catch (e: any) {
    return reply.status(400).send({ error: e.message });
  }
});

// -------------------------------------------------------------
// 3. 雙重記帳錢包模組 (Wallet & Ledger Routes)
// -------------------------------------------------------------
app.get('/api/wallet/balances', { preHandler: authPreHandler }, async (req: any, reply: FastifyReply) => {
  try {
    const balances = await walletService.getBalances(req.user.userId);
    const user = await authService.getUserById(req.user.userId);
    return { balances, user };
  } catch (e: any) {
    return reply.status(500).send({ error: e.message });
  }
});

app.get('/api/wallet/history', { preHandler: authPreHandler }, async (req: any, reply: FastifyReply) => {
  try {
    const assetType = req.query?.assetType as any;
    const history = await walletService.getTransactionHistory(req.user.userId, assetType);
    return history;
  } catch (e: any) {
    return reply.status(500).send({ error: e.message });
  }
});

// -------------------------------------------------------------
// 4. 機台與讀卡機硬體對接 (Hardware / IoT Bridge Routes)
// -------------------------------------------------------------
app.get('/api/hardware/machines', async (_req: FastifyRequest, reply: FastifyReply) => {
  try {
    const machines = await hardwareBridgeService.getAllMachines();
    return machines;
  } catch (e: any) {
    return reply.status(500).send({ error: e.message });
  }
});

// 模擬機台投幣 (玩家出示條碼或模擬點擊)
app.post('/api/hardware/swipe', async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const result = await hardwareBridgeService.handleMachineSwipe(req.body as any);
    return result;
  } catch (e: any) {
    return reply.status(400).send({ error: e.message });
  }
});

// 模擬機台出票 (遊戲結束過關)
app.post('/api/hardware/dispense-tickets', async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const result = await hardwareBridgeService.handleTicketDispensed(req.body as any);
    return result;
  } catch (e: any) {
    return reply.status(400).send({ error: e.message });
  }
});

// -------------------------------------------------------------
// 5. 儲值與金流模組 (Payment Routes)
// -------------------------------------------------------------
app.get('/api/payment/tiers', async (_req: FastifyRequest, _reply: FastifyReply) => {
  return paymentGatewayService.rechargeTiers;
});

// 現場櫃台儲值 (Staff Cashier Station)
app.post('/api/payment/cashier-topup', async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const result = await paymentGatewayService.handleCashierTopup(req.body as any);
    return result;
  } catch (e: any) {
    return reply.status(400).send({ error: e.message });
  }
});

// 預留線上刷卡
app.post('/api/payment/create-online', { preHandler: authPreHandler }, async (req: any, reply: FastifyReply) => {
  try {
    const result = await paymentGatewayService.createOnlinePaymentOrder({
      ...req.body,
      userId: req.user.userId,
    });
    return result;
  } catch (e: any) {
    return reply.status(400).send({ error: e.message });
  }
});

// -------------------------------------------------------------
// 6. 獎品商城與票券核銷 (Reward Mall Routes)
// -------------------------------------------------------------
app.get('/api/rewards/items', async (_req: FastifyRequest, reply: FastifyReply) => {
  try {
    const items = await rewardService.getRewardItems();
    return items;
  } catch (e: any) {
    return reply.status(500).send({ error: e.message });
  }
});

app.post('/api/rewards/redeem', { preHandler: authPreHandler }, async (req: any, reply: FastifyReply) => {
  try {
    const { rewardItemId } = (req.body as any) || {};
    const result = await rewardService.redeemRewardItem(req.user.userId, rewardItemId);
    return result;
  } catch (e: any) {
    return reply.status(400).send({ error: e.message });
  }
});

app.get('/api/rewards/my-vouchers', { preHandler: authPreHandler }, async (req: any, reply: FastifyReply) => {
  try {
    const vouchers = await rewardService.getUserVouchers(req.user.userId);
    return vouchers;
  } catch (e: any) {
    return reply.status(500).send({ error: e.message });
  }
});

// 現場店員核銷票券 (Staff Scanner)
app.post('/api/rewards/staff-verify-voucher', async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { voucherCode, staffId } = (req.body as any) || {};
    const result = await rewardService.redeemVoucherByStaff(voucherCode, staffId);
    return result;
  } catch (e: any) {
    return reply.status(400).send({ error: e.message });
  }
});

// -------------------------------------------------------------
// 7. 遊戲化簽到與輪盤 (Gamification Routes)
// -------------------------------------------------------------
app.get('/api/gamification/wheel-segments', async (_req: FastifyRequest, _reply: FastifyReply) => {
  return gamificationService.wheelSegments;
});

app.post('/api/gamification/checkin', { preHandler: authPreHandler }, async (req: any, reply: FastifyReply) => {
  try {
    const result = await gamificationService.checkInToday(req.user.userId);
    return result;
  } catch (e: any) {
    return reply.status(400).send({ error: e.message });
  }
});

app.post('/api/gamification/spin-wheel', { preHandler: authPreHandler }, async (req: any, reply: FastifyReply) => {
  try {
    const result = await gamificationService.spinLuckyWheel(req.user.userId);
    return result;
  } catch (e: any) {
    return reply.status(400).send({ error: e.message });
  }
});

// Health check
app.get('/api/health', async (_req: FastifyRequest, _reply: FastifyReply) => {
  return {
    status: 'ONLINE',
    service: 'Arcade Member Backend High-Performance Engine (Fastify)',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
  };
});

// Static frontend files serving (Single-Port Unified Deployment)
const possibleFrontendPaths = [
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(process.cwd(), '../frontend/dist'),
  path.resolve(process.cwd(), 'frontend/dist'),
];
const frontendDistPath = possibleFrontendPaths.find((p) => fs.existsSync(p));

if (frontendDistPath) {
  app.register(fastifyStatic, {
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
  await seedInitialData();
  try {
    await app.listen({ port: config.port, host: '0.0.0.0' });
    console.log(`\n======================================================`);
    console.log(`⚡ Arcade Member Fastify Server is running on port ${config.port}`);
    console.log(`🌐 Endpoint: http://localhost:${config.port}/api/health`);
    console.log(`======================================================\n`);
  } catch (err) {
    console.error('Server failed to start:', err);
    process.exit(1);
  }
}

bootstrap();
