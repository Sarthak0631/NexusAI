import { Router } from "express";

import {
  askMultiAgent,
} from "../controllers/multi-agent.controller";

import {
  validateQuestion,
} from "../middleware/validation.middleware";

import {
  authenticate,
} from "../middleware/auth.middleware";

import {
  aiRateLimiter,
} from "../middleware/rate-limit.middleware";

const router =
  Router();


router.post(
  "/ask",
  aiRateLimiter,
  authenticate,
  validateQuestion,
  askMultiAgent
);


export default router;