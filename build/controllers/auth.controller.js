"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const client_1 = require("@prisma/client");
const app_1 = require("../app");
const OTPAuth = __importStar(require("otpauth"));
const hi_base32_1 = require("hi-base32");
const RegisterUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        yield app_1.prisma.user.create({
            data: {
                name,
                email,
                password: crypto_1.default.createHash("sha256").update(password).digest("hex"),
            },
        });
        res.status(201).json({
            status: "success",
            message: "Registrado correctamente, ya puedes empezar a comprar.",
        });
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                return res.status(409).json({
                    status: "fail",
                    message: "Email already exist, please use another email address",
                });
            }
        }
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});
const LoginUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield app_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({
                status: "fail",
                message: "No user with that email exists",
            });
        }
        // Obtén todas las órdenes del usuario utilizando su id
        const orders = yield app_1.prisma.order.findMany({ where: { userId: user.id } });
        res.status(200).json({
            status: "success",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                otp_enabled: user.otp_enabled,
                orders: orders,
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
const generateRandomBase32 = () => {
    const buffer = crypto_1.default.randomBytes(15);
    const base32 = (0, hi_base32_1.encode)(buffer).replace(/=/g, "").substring(0, 24);
    return base32;
};
const GenerateOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id } = req.body;
        const user = yield app_1.prisma.user.findUnique({ where: { id: user_id } });
        if (!user) {
            return res.status(404).json({
                status: "fail",
                message: "No user with that email exists",
            });
        }
        const base32_secret = generateRandomBase32();
        let totp = new OTPAuth.TOTP({
            issuer: "codevoweb.com",
            label: "CodevoWeb",
            algorithm: "SHA1",
            digits: 6,
            secret: base32_secret,
        });
        let otpauth_url = totp.toString();
        yield app_1.prisma.user.update({
            where: { id: user_id },
            data: {
                otp_auth_url: otpauth_url,
                otp_base32: base32_secret,
            },
        });
        res.status(200).json({
            base32: base32_secret,
            otpauth_url,
        });
    }
    catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});
const VerifyOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id, token } = req.body;
        const message = "Token is invalid or user doesn't exist";
        const user = yield app_1.prisma.user.findUnique({ where: { id: user_id } });
        if (!user) {
            return res.status(401).json({
                status: "fail",
                message,
            });
        }
        let totp = new OTPAuth.TOTP({
            issuer: "codevoweb.com",
            label: "CodevoWeb",
            algorithm: "SHA1",
            digits: 6,
            secret: user.otp_base32,
        });
        let delta = totp.validate({ token });
        if (delta === null) {
            return res.status(401).json({
                status: "fail",
                message,
            });
        }
        const updatedUser = yield app_1.prisma.user.update({
            where: { id: user_id },
            data: {
                otp_enabled: true,
                otp_verified: true,
            },
        });
        res.status(200).json({
            otp_verified: true,
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                otp_enabled: updatedUser.otp_enabled,
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
const ValidateOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id, token } = req.body;
        const user = yield app_1.prisma.user.findUnique({ where: { id: user_id } });
        const message = "Token is invalid or user doesn't exist";
        if (!user) {
            return res.status(401).json({
                status: "fail",
                message,
            });
        }
        let totp = new OTPAuth.TOTP({
            issuer: "codevoweb.com",
            label: "CodevoWeb",
            algorithm: "SHA1",
            digits: 6,
            secret: user.otp_base32,
        });
        let delta = totp.validate({ token, window: 1 });
        if (delta === null) {
            return res.status(401).json({
                status: "fail",
                message,
            });
        }
        res.status(200).json({
            otp_valid: true,
        });
    }
    catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});
const DisableOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id } = req.body;
        const user = yield app_1.prisma.user.findUnique({ where: { id: user_id } });
        if (!user) {
            return res.status(401).json({
                status: "fail",
                message: "Este usuario no existe.",
            });
        }
        const updatedUser = yield app_1.prisma.user.update({
            where: { id: user_id },
            data: {
                otp_enabled: false,
            },
        });
        res.status(200).json({
            otp_disabled: true,
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                otp_enabled: updatedUser.otp_enabled,
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
exports.default = {
    RegisterUser,
    LoginUser,
    GenerateOTP,
    VerifyOTP,
    ValidateOTP,
    DisableOTP,
};
