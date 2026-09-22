"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: parseInt(process.env.PORT || '3001', 10),
    jwtSecret: process.env.JWT_SECRET || 'arcade-secret-key-2026-neon-matrix',
    databaseUrl: process.env.DATABASE_URL || '',
    qrSecret: process.env.QR_SECRET || 'dynamic-qr-salt-arcade-2026',
    qrValidDurationSec: 60, // Total valid window
    qrRefreshDurationSec: 30, // UI refresh interval
};
