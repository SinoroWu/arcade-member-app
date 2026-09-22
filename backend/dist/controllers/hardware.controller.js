"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hardwareController = exports.HardwareController = void 0;
const hardware_bridge_service_1 = require("../modules/hardware/hardware-bridge.service");
class HardwareController {
    async getMachines(_req, res, next) {
        try {
            const machines = await hardware_bridge_service_1.hardwareBridgeService.getAllMachines();
            res.json(machines);
        }
        catch (e) {
            next(e);
        }
    }
    async swipeMachine(req, res, next) {
        try {
            const result = await hardware_bridge_service_1.hardwareBridgeService.handleMachineSwipe(req.body);
            res.json(result);
        }
        catch (e) {
            next(e);
        }
    }
    async dispenseTickets(req, res, next) {
        try {
            const result = await hardware_bridge_service_1.hardwareBridgeService.handleTicketDispensed(req.body);
            res.json(result);
        }
        catch (e) {
            next(e);
        }
    }
}
exports.HardwareController = HardwareController;
exports.hardwareController = new HardwareController();
