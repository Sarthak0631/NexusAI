import { Router } from "express";

import { askLangChainRAG } from "../controllers/rag-chain.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/ask",
  authenticate,
  askLangChainRAG
);

export default router;