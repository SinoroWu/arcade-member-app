"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const hardware_controller_1 = require("../controllers/hardware.controller");
const router = (0, express_1.Router)();
router.get('/machines', (req, res, next) => hardware_controller_1.hardwareController.getMachines(req, res, next));
router.post('/swipe', (req, res, next) => hardware_controller_1.hardwareController.swipeMachine(req, res, next));
router.post('/dispense-tickets', (req, res, next) => hardware_controller_1.hardwareController.dispenseTickets(req, res, next));
exports.default = router;
