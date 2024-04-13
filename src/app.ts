import express, { Request, Response } from "express";
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from "@prisma/client";
import authRouter from "./routes/auth.route";
import bodyParser from 'body-parser';

export const prisma = new PrismaClient();
const app = express();

async function main() {
    // Express configuration
    app.use(
      cors({
        origin: ["http://localhost:3000"],
        credentials: true,
      })
    );
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(helmet()); // Enable Helmet
    app.use(morgan('dev')); // Enable Morgan
    //  Define Express routes
    //  Health Checker
    app.get("/api/healthchecker", (req: Request, res: Response) => {
        res.status(200).json({
            status: "success",
            message: "Bienvenido a la API de Parkware",
        });
    });
    app.use("/api/auth", authRouter);

    app.all("*", (req: Request, res: Response) => {
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
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });