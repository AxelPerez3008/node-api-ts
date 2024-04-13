"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const router = express_1.default.Router();
router.post("/register", auth_controller_1.default.RegisterUser);
router.post("/login", auth_controller_1.default.LoginUser);
router.post("/otp/generate", auth_controller_1.default.GenerateOTP);
router.post("/otp/verify", auth_controller_1.default.VerifyOTP);
router.post("/otp/validate", auth_controller_1.default.ValidateOTP);
router.post("/otp/disable", auth_controller_1.default.DisableOTP);
exports.default = router;
