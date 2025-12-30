/**
 * This is a API server
 */

import dotenv from "dotenv";
// load env as early as possible
dotenv.config();

import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import translateRoutes from "./routes/translate.js";
import reversoRoutes from "./routes/reverso.js";

// for esm mode
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: express.Application = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/**
 * API Routes
 */
app.use("/api/auth", authRoutes);
app.use("/api/translate", translateRoutes);
app.use("/api/reverso", reversoRoutes);

/**
 * health
 */
app.use(
  "/api/health",
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: "ok",
    });
  }
);

/**
 * Serve frontend build from Express
 */
const distPath = path.resolve(__dirname, "../dist");
app.use(express.static(distPath));

// Ensure SPA fallback (index.html) works for deep links
app.get("*", (req: Request, res: Response) => {
  // Only fallback for non-API routes
  if (!req.path.startsWith("/api/")) {
    res.sendFile(path.resolve(distPath, "index.html"));
  } else {
    res.status(404).json({
      success: false,
      error: "API not found",
    });
  }
});

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: "Server internal error",
  });
});

export default app;
