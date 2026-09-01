import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import healthRouter from "./routes/health.routes";
import userRouter from "./routes/user.routes";
import authRouter from "./routes/auth.routes";
import documentRouter from "./routes/document.routes";

import { connectDatabase } from "./config/database";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

app.use(cookieParser());

// Routes
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to NexusAI API",
  });
});

app.use("/api/health", healthRouter);

app.use("/api/users", userRouter);

app.use("/api/auth", authRouter);

app.use(
  "/api/documents",
  documentRouter
);

// Start server
async function startServer() {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(
      `NexusAI Backend running on http://localhost:${PORT}`
    );
  });
}

startServer();