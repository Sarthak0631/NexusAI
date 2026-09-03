import { Router } from "express";

import {
  askAgent,
} from "../controllers/agent.controller";

import {
  authenticate,
} from "../middleware/auth.middleware";


const router =
  Router();


router.post(
  "/ask",
  authenticate,
  askAgent
);


export default router;