"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("../app");
const CreateOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, eventId, status, totalAmount } = req.body;
        const printed = false;
        if (!userId || !eventId || !status || !totalAmount) {
            return res.status(400).json({
                status: "fail",
                message: "Missing required fields",
            });
        }
        const order = yield app_1.prisma.order.create({
            data: {
                userId,
                eventId,
                status,
                totalAmount,
                printed
            },
        });
        res.status(201).json({
            status: "success",
            order,
        });
    }
    catch (error) {
        console.log(error.message);
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});
const getOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId } = req.params;
        const order = yield app_1.prisma.order.findUnique({ where: { id: orderId } });
        if (!order) {
            return res.status(404).json({
                status: "fail",
                message: "No existe una orden con ese id.",
            });
        }
        res.status(200).json({
            status: "success",
            order: {
                userId: order.userId,
                eventId: order.eventId,
                status: order.status,
                totalAmount: order.totalAmount,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});
const UpdateOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, status, totalAmount, eventId } = req.body;
        const { orderId } = req.params;
        console.log(req.body);
        if (!orderId || !status || !totalAmount) {
            return res.status(400).json({
                status: "fail",
                message: "Missing required fields",
            });
        }
        // Realizar operación en la base de datos
        const order = yield app_1.prisma.order.update({
            where: { id: orderId },
            data: {
                userId,
                eventId,
                status,
                totalAmount,
            },
        });
        res.status(200).json({
            status: "success",
            order,
        });
    }
    catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});
const DeleteOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId } = req.params;
        // Validaciones adicionales
        if (!orderId) {
            return res.status(400).json({
                status: "fail",
                message: "Missing required fields",
            });
        }
        // Realizar operación en la base de datos
        yield app_1.prisma.order.delete({
            where: { id: orderId },
        });
        res.status(200).json({
            status: "success",
            message: "Order deleted successfully",
        });
    }
    catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});
exports.default = {
    CreateOrder,
    getOrder,
    UpdateOrder,
    DeleteOrder
};
