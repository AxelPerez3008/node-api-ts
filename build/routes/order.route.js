"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const order_controller_1 = __importDefault(require("../controllers/order.controller"));
const router = express_1.default.Router();
router.post("/create", order_controller_1.default.CreateOrder);
router.put("/update/:orderId", order_controller_1.default.UpdateOrder);
router.get("/get/:orderId", order_controller_1.default.getOrder);
router.delete("delete/:orderId", order_controller_1.default.DeleteOrder);
exports.default = router;
