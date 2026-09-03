import { Router } from "express";

import {
  askMultiAgent,
} from "../controllers/multi-agent.controller";

import {
  authenticate,
} from "../middleware/auth.middleware";


const router =
  Router();


router.post(
  "/ask",
  authenticate,
  askMultiAgent
);


export default router;