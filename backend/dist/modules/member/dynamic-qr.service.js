"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamicQrService = exports.DynamicQrService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const qrcode_1 = __importDefault(require("qrcode"));
const db_1 = require("../db");
const config_1 = require("../../config");
class DynamicQrService {
    // 產生 30 秒自動更新的防偽動態條碼
    async generateDynamicCode(userId) {
        const timestamp = Date.now();
        const nonce = crypto_1.default.randomBytes(6).toString('hex');
        // 生成防竄改 HMAC 簽章
        const hmac = crypto_1.default
            .createHmac('sha256', config_1.config.qrSecret)
            .update(`${userId}:${timestamp}:${nonce}`)
            .digest('hex')
            .substring(0, 12);
        const token = `ARCADE_V1_${userId}_${timestamp}_${nonce}_${hmac}`;
        const expiresAt = timestamp + config_1.config.qrValidDurationSec * 1000;
        // 存入快取 (單次使用 & 短效 TTL)
        db_1.dbManager.memoryStore.activeDynamicQrs.set(token, {
            userId,
            expiresAt,
            token,
        });
        // 產生 QR Code Base64 影像
        const qrDataUrl = await qrcode_1.default.toDataURL(token, {
            errorCorrectionLevel: 'M',
            margin: 2,
            color: {
                dark: '#00F5D4', // 霓虹青色
                light: '#141726', // 深色背景
            },
            width: 280,
        });
        return {
            token,
            qrDataUrl,
            expiresInSeconds: config_1.config.qrValidDurationSec,
            refreshIntervalSeconds: config_1.config.qrRefreshDurationSec,
            timestamp,
        };
    }
    // 現場設備 (機台/讀卡機/櫃台) 掃描並單次原子銷毀驗證
    async verifyAndConsumeDynamicCode(token) {
        const now = Date.now();
        const entry = db_1.dbManager.memoryStore.activeDynamicQrs.get(token);
        if (!entry) {
            throw new Error('此會員動態條碼已失效或已被使用，請請顧客刷新重試！');
        }
        if (now > entry.expiresAt) {
            db_1.dbManager.memoryStore.activeDynamicQrs.delete(token);
            throw new Error('動態條碼已逾期 (超過60秒)，請刷新會員卡！');
        }
        // 原子操作：立即銷毀，防止重放攻擊 (Replay Attack) 與翻拍盜刷
        db_1.dbManager.memoryStore.activeDynamicQrs.delete(token);
        return entry.userId;
    }
}
exports.DynamicQrService = DynamicQrService;
exports.dynamicQrService = new DynamicQrService();
