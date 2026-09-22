"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rewardController = exports.RewardController = void 0;
const reward_service_1 = require("../modules/reward/reward.service");
class RewardController {
    async getItems(_req, res, next) {
        try {
            const items = await reward_service_1.rewardService.getRewardItems();
            res.json(items);
        }
        catch (e) {
            next(e);
        }
    }
    async redeemItem(req, res, next) {
        try {
            const { rewardItemId } = req.body;
            const result = await reward_service_1.rewardService.redeemRewardItem(req.user.userId, rewardItemId);
            res.json(result);
        }
        catch (e) {
            next(e);
        }
    }
    async getMyVouchers(req, res, next) {
        try {
            const vouchers = await reward_service_1.rewardService.getUserVouchers(req.user.userId);
            res.json(vouchers);
        }
        catch (e) {
            next(e);
        }
    }
    async staffVerifyVoucher(req, res, next) {
        try {
            const { voucherCode, staffId } = req.body;
            const result = await reward_service_1.rewardService.redeemVoucherByStaff(voucherCode, staffId);
            res.json(result);
        }
        catch (e) {
            next(e);
        }
    }
}
exports.RewardController = RewardController;
exports.rewardController = new RewardController();
