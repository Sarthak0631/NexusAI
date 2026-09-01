import { Router } from "express";

import {
  uploadDocument,
} from "../controllers/document.controller";

import { authenticate } from "../middleware/auth.middleware";

import upload from "../middleware/upload.middleware";

const router = Router();

router.post(
  "/upload",
  authenticate,
  upload.single("document"),
  uploadDocument
);

export default router;