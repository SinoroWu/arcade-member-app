"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rewardService = exports.RewardService = void 0;
const db_1 = require("../db");
const wallet_service_1 = require("../wallet/wallet.service");
class RewardService {
    // 1. 取得商城獎品與兌換商品列表
    async getRewardItems() {
        if (db_1.dbManager.prisma && !db_1.dbManager.isUsingMock) {
            return db_1.dbManager.prisma.rewardItem.findMany({
                where: { isActive: true },
                orderBy: { requiredTickets: 'asc' },
            });
        }
        return Array.from(db_1.dbManager.memoryStore.rewardItems.values()).filter((i) => i.isActive);
    }
    // 2. 會員使用彩票或紅利兌換獎品/票券
    async redeemRewardItem(userId, rewardItemId) {
        let item = null;
        if (db_1.dbManager.prisma && !db_1.dbManager.isUsingMock) {
            item = await db_1.dbManager.prisma.rewardItem.findUnique({ where: { id: rewardItemId } });
        }
        else {
            item = db_1.dbManager.memoryStore.rewardItems.get(rewardItemId);
        }
        if (!item) {
            throw new Error('找不到該兌換獎品！');
        }
        if (item.stockQuantity <= 0) {
            throw new Error('該獎品已兌換完畢，庫存不足！');
        }
        // 檢查並扣除彩票或紅利點數
        if (item.requiredTickets > 0) {
            await wallet_service_1.walletService.applyTransaction({
                userId,
                assetType: 'TICKET',
                amount: -item.requiredTickets,
                txType: 'REWARD_REDEEM',
                description: `兌換獎品: ${item.title} (消耗 ${item.requiredTickets} 彩票)`,
                metadata: { rewardItemId: item.id, itemTitle: item.title },
            });
        }
        if (item.requiredPoints > 0) {
            await wallet_service_1.walletService.applyTransaction({
                userId,
                assetType: 'POINT',
                amount: -item.requiredPoints,
                txType: 'REWARD_REDEEM',
                description: `兌換獎品: ${item.title} (消耗 ${item.requiredPoints} 紅利點數)`,
                metadata: { rewardItemId: item.id, itemTitle: item.title },
            });
        }
        // 減少庫存
        item.stockQuantity -= 1;
        // 建立會員專屬核銷票券 (有效期限 30 天)
        const voucherId = `vch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const voucherCode = `VCH-${Date.now().toString().slice(-4)}-${Math.floor(1000 + Math.random() * 9000)}`;
        const expireAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const voucher = {
            id: voucherId,
            userId,
            rewardItemId: item.id,
            voucherCode,
            status: 'UNUSED',
            expireAt,
            createdAt: new Date(),
            rewardItem: item,
        };
        if (db_1.dbManager.prisma && !db_1.dbManager.isUsingMock) {
            await db_1.dbManager.prisma.userVoucher.create({
                data: {
                    id: voucher.id,
                    userId: voucher.userId,
                    rewardItemId: voucher.rewardItemId,
                    voucherCode: voucher.voucherCode,
                    status: 'UNUSED',
                    expireAt: voucher.expireAt,
                },
            });
        }
        else {
            db_1.dbManager.memoryStore.userVouchers.set(voucher.id, voucher);
        }
        return {
            success: true,
            voucherCode,
            voucher,
            message: `🎉 兌換成功！已發送「${item.title}」至您的票券匣`,
        };
    }
    // 3. 取得會員的所有票券
    async getUserVouchers(userId) {
        if (db_1.dbManager.prisma && !db_1.dbManager.isUsingMock) {
            return db_1.dbManager.prisma.userVoucher.findMany({
                where: { userId },
                include: { rewardItem: true },
                orderBy: { createdAt: 'desc' },
            });
        }
        const list = Array.from(db_1.dbManager.memoryStore.userVouchers.values())
            .filter((v) => v.userId === userId)
            .map((v) => {
            const rewardItem = db_1.dbManager.memoryStore.rewardItems.get(v.rewardItemId);
            return { ...v, rewardItem };
        });
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    // 4. 現場工作人員核銷票券 (Staff Portal)
    async redeemVoucherByStaff(voucherCode, staffId = 'STAFF_01') {
        let voucher = null;
        if (db_1.dbManager.prisma && !db_1.dbManager.isUsingMock) {
            voucher = await db_1.dbManager.prisma.userVoucher.findUnique({
                where: { voucherCode },
                include: { rewardItem: true, user: true },
            });
        }
        else {
            for (const v of db_1.dbManager.memoryStore.userVouchers.values()) {
                if (v.voucherCode === voucherCode) {
                    voucher = v;
                    voucher.rewardItem = db_1.dbManager.memoryStore.rewardItems.get(v.rewardItemId);
                    voucher.user = db_1.dbManager.memoryStore.users.get(v.userId);
                    break;
                }
            }
        }
        if (!voucher) {
            throw new Error(`查無此票券核銷代碼: ${voucherCode}`);
        }
        if (voucher.status === 'USED') {
            throw new Error(`此票券已於 ${new Date(voucher.redeemedAt).toLocaleString()} 核銷過！`);
        }
        if (new Date() > new Date(voucher.expireAt)) {
            voucher.status = 'EXPIRED';
            throw new Error('此票券已過期！');
        }
        voucher.status = 'USED';
        voucher.redeemedAt = new Date();
        voucher.redeemedBy = staffId;
        if (db_1.dbManager.prisma && !db_1.dbManager.isUsingMock) {
            await db_1.dbManager.prisma.userVoucher.update({
                where: { id: voucher.id },
                data: { status: 'USED', redeemedAt: new Date(), redeemedBy: staffId },
            });
        }
        return {
            success: true,
            voucherCode,
            prizeName: voucher.rewardItem?.title || '獎品',
            recipient: voucher.user?.name || voucher.userId,
            redeemedAt: voucher.redeemedAt,
            message: `核銷成功！請交付獎品「${voucher.rewardItem?.title}」給顧客。`,
        };
    }
}
exports.RewardService = RewardService;
exports.rewardService = new RewardService();
