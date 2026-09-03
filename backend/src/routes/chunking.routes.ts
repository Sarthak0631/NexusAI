import { Router } from "express";
import { createChunks } from "../controllers/chunking.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, createChunks);

export default router;