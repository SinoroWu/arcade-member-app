"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_1 = require("../modules/auth/auth.service");
const dynamic_qr_service_1 = require("../modules/member/dynamic-qr.service");
class AuthController {
    async register(req, res, next) {
        try {
            const result = await auth_service_1.authService.register(req.body);
            res.status(201).json(result);
        }
        catch (e) {
            next(e);
        }
    }
    async login(req, res, next) {
        try {
            const { account, password } = req.body;
            const result = await auth_service_1.authService.login(account, password);
            res.json(result);
        }
        catch (e) {
            next(e);
        }
    }
    async getMe(req, res, next) {
        try {
            const user = await auth_service_1.authService.getUserById(req.user.userId);
            if (!user)
                return res.status(404).json({ error: '會員不存在' });
            const { passwordHash, ...safeUser } = user;
            res.json(safeUser);
        }
        catch (e) {
            next(e);
        }
    }
    async getDynamicQr(req, res, next) {
        try {
            const qrData = await dynamic_qr_service_1.dynamicQrService.generateDynamicCode(req.user.userId);
            res.json(qrData);
        }
        catch (e) {
            next(e);
        }
    }
    async verifyQr(req, res, next) {
        try {
            const { token } = req.body;
            const userId = await dynamic_qr_service_1.dynamicQrService.verifyAndConsumeDynamicCode(token);
            res.json({ success: true, userId });
        }
        catch (e) {
            next(e);
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
