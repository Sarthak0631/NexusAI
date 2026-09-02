import { Router } from "express";
import { createEmbedding } from "../controllers/embedding.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, createEmbedding);

export default router;