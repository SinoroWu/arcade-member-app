"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gamificationController = exports.GamificationController = void 0;
const gamification_service_1 = require("../modules/gamification/gamification.service");
class GamificationController {
    getWheelSegments(_req, res) {
        res.json(gamification_service_1.gamificationService.wheelSegments);
    }
    async checkin(req, res, next) {
        try {
            const result = await gamification_service_1.gamificationService.checkInToday(req.user.userId);
            res.json(result);
        }
        catch (e) {
            next(e);
        }
    }
    async spinWheel(req, res, next) {
        try {
            const result = await gamification_service_1.gamificationService.spinLuckyWheel(req.user.userId);
            res.json(result);
        }
        catch (e) {
            next(e);
        }
    }
}
exports.GamificationController = GamificationController;
exports.gamificationController = new GamificationController();
