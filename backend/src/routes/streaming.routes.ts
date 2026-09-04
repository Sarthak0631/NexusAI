import { Router } from "express";

import {
  aiRateLimiter,
} from "../middleware/rate-limit.middleware";

import {
  authenticate,
} from "../middleware/auth.middleware";

import {
  validateQuestion,
  validateConversationId,
} from "../middleware/validation.middleware";

import {
  streamMultiAgentAnswer,
} from "../controllers/streaming.controller";

const router = Router();

router.post(
  "/ask",
  aiRateLimiter,
  authenticate,
  validateQuestion,
  validateConversationId,
  streamMultiAgentAnswer
);

export default router;