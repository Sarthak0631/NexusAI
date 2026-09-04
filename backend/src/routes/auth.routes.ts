import { Router } from "express";

import {
  authRateLimiter,
} from "../middleware/rate-limit.middleware";

import {
  register,
  login,
  logout,
  getCurrentUser,
} from "../controllers/auth.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", authRateLimiter, register);
router.post("/login", authRateLimiter, login);
router.post("/logout", authRateLimiter, logout);

router.get(
  "/me",
  authenticate,
  getCurrentUser
);

export default router;