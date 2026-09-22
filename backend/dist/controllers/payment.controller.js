"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentController = exports.PaymentController = void 0;
const payment_gateway_service_1 = require("../modules/payment/payment-gateway.service");
class PaymentController {
    getTiers(_req, res) {
        res.json(payment_gateway_service_1.paymentGatewayService.rechargeTiers);
    }
    async cashierTopup(req, res, next) {
        try {
            const result = await payment_gateway_service_1.paymentGatewayService.handleCashierTopup(req.body);
            res.json(result);
        }
        catch (e) {
            next(e);
        }
    }
    async createOnlinePayment(req, res, next) {
        try {
            const result = await payment_gateway_service_1.paymentGatewayService.createOnlinePaymentOrder({
                ...req.body,
                userId: req.user.userId,
            });
            res.json(result);
        }
        catch (e) {
            next(e);
        }
    }
}
exports.PaymentController = PaymentController;
exports.paymentController = new PaymentController();
