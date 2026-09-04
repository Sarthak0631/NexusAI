import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import healthRouter from "./routes/health.routes";
import userRouter from "./routes/user.routes";
import authRouter from "./routes/auth.routes";
import documentRouter from "./routes/document.routes";
import chatRouter from "./routes/chat.routes";
import embeddingRouter from "./routes/embedding.routes";
import pineconeRouter from "./routes/pinecone.routes";
import chunkingRouter from "./routes/chunking.routes";
import retrievalRouter from "./routes/retrieval.routes";
import ragRouter from "./routes/rag.routes";
import ragChainRouter from "./routes/rag-chain.routes";
import langGraphRouter from "./routes/langgraph.routes";
import agentRouter from "./routes/agent.routes";
import multiAgentRouter from "./routes/multi-agent.routes";
import conversationRoutes from "./routes/conversation.routes";
import streamingRoutes from "./routes/streaming.routes";

import { connectDatabase } from "./config/database";

import {
  apiRateLimiter,
} from "./middleware/rate-limit.middleware";

import {
  errorHandler,
} from "./middleware/error.middleware";

dotenv.config();

const app = express();

app.use(
  helmet()
);

const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ],
    credentials: true,
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);

app.use(cookieParser());

app.use(
  "/api",
  apiRateLimiter
);

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

app.use(
  "/api/chat",
  chatRouter
);

app.use("/api/embeddings", embeddingRouter);

app.use("/api/pinecone", pineconeRouter);

app.use("/api/chunks", chunkingRouter);

app.use("/api/retrieval", retrievalRouter);

app.use("/api/rag", ragRouter);

app.use("/api/rag-chain", ragChainRouter);

app.use(
  "/api/langgraph",
  langGraphRouter
);

app.use(
  "/api/agent",
  agentRouter
);

app.use(
  "/api/multi-agent",
  multiAgentRouter
);

app.use(
  "/api/conversations",
  conversationRoutes
);

app.use(
  "/api/streaming",
  streamingRoutes
);

app.use(
  errorHandler
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