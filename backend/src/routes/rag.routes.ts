import { Router } from "express";
import { askDocumentQuestion } from "../controllers/rag.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/ask",
  authenticate,
  askDocumentQuestion
);

export default router;