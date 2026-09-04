import { Router } from "express";

import {
  createConversationController,
  getConversationsController,
  getConversationController,
} from "../controllers/conversation.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  createConversationController
);

router.get(
  "/",
  authenticate,
  getConversationsController
);

router.get(
  "/:id",
  authenticate,
  getConversationController
);

export default router;