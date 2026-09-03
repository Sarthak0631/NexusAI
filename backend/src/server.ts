import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

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