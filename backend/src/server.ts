import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import healthRouter from "./routes/health.routes";
import userRouter from "./routes/user.routes";
import { connectDatabase } from "./config/database";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to NexusAI API",
  });
});

app.use("/api/health", healthRouter);

app.use("/api/users", userRouter);

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