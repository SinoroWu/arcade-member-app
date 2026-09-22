"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const wallet_routes_1 = __importDefault(require("./wallet.routes"));
const hardware_routes_1 = __importDefault(require("./hardware.routes"));
const payment_routes_1 = __importDefault(require("./payment.routes"));
const reward_routes_1 = __importDefault(require("./reward.routes"));
const gamification_routes_1 = __importDefault(require("./gamification.routes"));
const content_routes_1 = __importDefault(require("./content.routes"));
const apiRouter = (0, express_1.Router)();
apiRouter.use('/auth', auth_routes_1.default);
apiRouter.use('/member', auth_routes_1.default); // Maintain backwards compatibility for /api/member/*
apiRouter.use('/wallet', wallet_routes_1.default);
apiRouter.use('/hardware', hardware_routes_1.default);
apiRouter.use('/payment', payment_routes_1.default);
apiRouter.use('/rewards', reward_routes_1.default);
apiRouter.use('/gamification', gamification_routes_1.default);
apiRouter.use('/content', content_routes_1.default);
// Health check route
apiRouter.get('/health', (_req, res) => {
    res.json({
        status: 'ONLINE',
        service: 'Arcade Member Backend Engine (Refactored)',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
    });
});
exports.default = apiRouter;
