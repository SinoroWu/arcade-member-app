"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentGatewayService = exports.PaymentGatewayService = void 0;
const db_1 = require("../db");
const wallet_service_1 = require("../wallet/wallet.service");
class PaymentGatewayService {
    // 儲值方案定義
    rechargeTiers = [
        { amount: 100, tokens: 50, bonus: 0, label: '新手小試', tag: '基本' },
        { amount: 300, tokens: 160, bonus: 10, label: '超值同樂', tag: '熱門' },
        { amount: 500, tokens: 280, bonus: 30, label: '達人暢玩', tag: '超值 +12%' },
        { amount: 1000, tokens: 600, bonus: 100, label: 'VIP 尊榮大包', tag: '最高送 100 枚' },
    ];
    // 1. 現場櫃台現金/實體刷卡儲值 (現行主用)
    async handleCashierTopup(dto) {
        const { userId, amount, targetTokens, bonusTokens = 0, staffId = 'STAFF_01' } = dto;
        const totalTokens = targetTokens + bonusTokens;
        const orderNo = `ORD_OFF_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const paymentRecord = {
            id: `pay_${Date.now()}`,
            userId,
            orderNo,
            amount,
            targetTokens,
            bonusTokens,
            paymentMethod: dto.paymentMethod || 'OFFLINE_CASH',
            status: 'SUCCESS',
            paidAt: new Date(),
            createdAt: new Date(),
        };
        if (db_1.dbManager.prisma && !db_1.dbManager.isUsingMock) {
            await db_1.dbManager.prisma.paymentOrder.create({
                data: {
                    id: paymentRecord.id,
                    userId,
                    orderNo,
                    amount,
                    targetTokens,
                    bonusTokens,
                    paymentMethod: paymentRecord.paymentMethod,
                    status: 'SUCCESS',
                    paidAt: new Date(),
                },
            });
        }
        else {
            db_1.dbManager.memoryStore.paymentOrders.set(paymentRecord.id, paymentRecord);
        }
        // 寫入錢包代幣交易帳本
        const txResult = await wallet_service_1.walletService.applyTransaction({
            userId,
            assetType: 'TOKEN',
            amount: totalTokens,
            txType: 'OFFLINE_TOPUP',
            description: `門市櫃台儲值 NT$${amount} (購買 ${targetTokens} 枚 + 贈送 ${bonusTokens} 枚)`,
            paymentOrderId: paymentRecord.id,
            metadata: { orderNo, staffId, amount },
        });
        // 獲得儲值經驗值 (儲值 1 元 = 2 EXP)
        await wallet_service_1.walletService.applyTransaction({
            userId,
            assetType: 'EXP',
            amount: amount * 2,
            txType: 'OFFLINE_TOPUP',
            description: `儲值回饋經驗值: NT$${amount}`,
            paymentOrderId: paymentRecord.id,
        });
        return {
            success: true,
            orderNo,
            amount,
            tokensDeposited: totalTokens,
            balanceAfter: txResult.balanceAfter,
            message: `儲值成功！已為會員注入 ${totalTokens} 枚代幣`,
        };
    }
    // 2. [預留擴充] 線上金流訂單建立與 Webhook (信用卡 / LINE Pay / 綠界)
    async createOnlinePaymentOrder(dto) {
        const { userId, amount, targetTokens, bonusTokens = 0 } = dto;
        const orderNo = `ORD_ONL_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const order = {
            id: `pay_${Date.now()}`,
            userId,
            orderNo,
            amount,
            targetTokens,
            bonusTokens,
            paymentMethod: dto.paymentMethod,
            status: 'PENDING',
            createdAt: new Date(),
        };
        db_1.dbManager.memoryStore.paymentOrders.set(order.id, order);
        return {
            success: true,
            orderNo,
            paymentMethod: dto.paymentMethod,
            amount,
            targetTokens: targetTokens + bonusTokens,
            paymentGatewayUrl: `https://payment-mock.arcade.io/pay?orderNo=${orderNo}&amount=${amount}`,
            note: '線上金流適配器已就緒，開通第三方商戶金鑰即可直接對接。',
        };
    }
}
exports.PaymentGatewayService = PaymentGatewayService;
exports.paymentGatewayService = new PaymentGatewayService();
