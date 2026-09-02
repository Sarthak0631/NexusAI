import { Router } from "express";

import { chatWithAI } from "../controllers/chat.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  chatWithAI
);

export default router;