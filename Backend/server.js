import exp from "express";
import { config } from "dotenv";
import dns from "dns";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import authAPI from "./APIs/authAPI.js";
import forgotPasswordAPI from "./APIs/forgotPasswordAPI.js";
import orderAPI from "./APIs/orderAPI.js";
import portfolioAPI from "./APIs/portfolioAPI.js";
import stockAPI from "./APIs/stockAPI.js";
import transactionAPI from "./APIs/transactionAPI.js";
import watchlistAPI from "./APIs/watchlistAPI.js";
import { connectDb } from "./config/db.js";
import logger from "./utils/logger.js";
import { verifyToken } from "./middlewares/verifyToken.js";
import { ensureSeedData, tickMarket } from "./utils/marketSimulation.js";


config();

// Helps Windows/network setups that fail DNS lookups for hosted MongoDB URLs.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = exp();
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173,http://localhost:5174,http://localhost:5175,https://stock-trading-simulator-bk46z51v.vercel.app")
  .split(",")
  .map((origin) => origin.trim());

function isPrivateNetworkViteOrigin(origin = "") {
  return /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+):517\d$/.test(origin);
}

app.use(
  cors({
    origin: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    credentials: true,
    optionsSuccessStatus: 204
  })
);

app.options("*", cors({ origin: true, credentials: true }));

app.use(cookieParser());
app.use(exp.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "stock-trading-simulator-api" });
});

app.use("/api/auth", authAPI);
app.use("/api/forgot-password", forgotPasswordAPI);
app.use("/api/market", stockAPI);
app.use("/api/stocks", stockAPI);
app.use("/api/portfolio", verifyToken, portfolioAPI);
app.use("/api/orders", verifyToken, orderAPI);
app.use("/api/orders/transactions", verifyToken, transactionAPI);
app.use("/api/transactions", verifyToken, transactionAPI);
app.use("/api/watchlist", verifyToken, watchlistAPI);

app.use((req, res) => {
  res.status(404).json({ message: `path ${req.url} is invalid` });
});

app.use((err, _req, res, _next) => {
  // Specific Mongoose / validation errors keep their responses
  if (err.name === "ValidationError" || err.name === "CastError") {
    logger.warn("Validation error:", err.message);
    return res.status(400).json({ message: "error occurred", error: err.message });
  }

  const errCode = err.code ?? err.cause?.code ?? err.errorResponse?.code;
  const keyValue = err.keyValue ?? err.cause?.keyValue ?? err.errorResponse?.keyValue;

  if (errCode === 11000 && keyValue) {
    const field = Object.keys(keyValue)[0];
    const value = keyValue[field];
    logger.warn("Duplicate key error:", field, value);
    return res.status(409).json({
      message: "error occurred",
      error: `${field} "${value}" already exists`
    });
  }

  // Client errors (4xx) are expected and should be logged as warnings
  if (err && err.status && err.status >= 400 && err.status < 500) {
    logger.warn("Client error:", err.status, err.message);
    return res.status(err.status).json({ message: err.message || "error occurred" });
  }

  // Server / unhandled errors
  logger.error("Unhandled error:", err?.message || err);
  res.status(500).json({
    message: "error occurred",
    error: err.message || "Server side error"
  });
});

const connectDB = async () => {
  try {
    await connectDb();
    await ensureSeedData();
    
    const port = process.env.PORT || 5002;
    const httpServer = app.listen(port, () => console.log(`server listening in ${port}`));

    setInterval(async () => {
      try {
        await tickMarket();
      } catch (err) {
        console.error("Market tick failed:", err);
      }
    }, 5000);
    
    logger.info("DB connected");

    httpServer.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        logger.error(`Port ${port} is already in use. Stop the existing backend or set PORT in .env.`);
        process.exit(1);
      }

      throw error;
    });
  } catch (err) {
    logger.error(err?.message || err);
  }
};

connectDB();
