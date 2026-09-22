"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
class AppError extends Error {
    message;
    statusCode;
    constructor(message, statusCode = 400) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.name = 'AppError';
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, next) => {
    console.error(`[Error] ${req.method} ${req.url}:`, err.message || err);
    const status = err.statusCode || err.status || 500;
    const message = err.message || '伺服器內部錯誤，請稍後再試！';
    res.status(status).json({
        error: message,
        status,
        timestamp: new Date().toISOString(),
    });
};
exports.errorHandler = errorHandler;
