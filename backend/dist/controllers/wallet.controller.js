"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletController = exports.WalletController = void 0;
const wallet_service_1 = require("../modules/wallet/wallet.service");
const auth_service_1 = require("../modules/auth/auth.service");
class WalletController {
    async getBalances(req, res, next) {
        try {
            const balances = await wallet_service_1.walletService.getBalances(req.user.userId);
            const user = await auth_service_1.authService.getUserById(req.user.userId);
            res.json({ balances, user });
        }
        catch (e) {
            next(e);
        }
    }
    async getHistory(req, res, next) {
        try {
            const assetType = req.query.assetType;
            const history = await wallet_service_1.walletService.getTransactionHistory(req.user.userId, assetType);
            res.json(history);
        }
        catch (e) {
            next(e);
        }
    }
}
exports.WalletController = WalletController;
exports.walletController = new WalletController();
