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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const client_1 = require("@prisma/client");
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const body_parser_1 = __importDefault(require("body-parser"));
exports.prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Express configuration
        app.use((0, cors_1.default)({
            origin: ["http://localhost:3000"],
            credentials: true,
        }));
        app.use(body_parser_1.default.json());
        app.use(body_parser_1.default.urlencoded({ extended: true }));
        app.use((0, helmet_1.default)()); // Enable Helmet
        app.use((0, morgan_1.default)('dev')); // Enable Morgan
        //  Define Express routes
        //  Health Checker
        app.get("/api/healthchecker", (req, res) => {
            res.status(200).json({
                status: "success",
                message: "Bienvenido a la API de Parkware",
            });
        });
        app.use("/api/auth", auth_route_1.default);
        app.all("*", (req, res) => {
            return res.status(404).json({
                status: "fail",
                message: `Ruta: ${req.originalUrl} no encontrada.`,
            });
        });
        // Start Express server
        const PORT = 9000;
        app.listen(PORT, () => {
            console.info(`Server started on port: ${PORT}`);
        });
    });
}
main()
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    yield exports.prisma.$disconnect();
}))
    .catch((e) => __awaiter(void 0, void 0, void 0, function* () {
    console.error(e);
    yield exports.prisma.$disconnect();
    process.exit(1);
}));
