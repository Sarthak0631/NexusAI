import { Router } from "express";

import {
  askLangGraph,
} from "../controllers/langgraph.controller";

import {
  authenticate,
} from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/ask",
  authenticate,
  askLangGraph
);

export default router;