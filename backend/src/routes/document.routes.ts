import { Router } from "express";

import {
  uploadDocument,
  getDocuments,
  deleteDocument,
} from "../controllers/document.controller";

import { authenticate } from "../middleware/auth.middleware";

import upload from "../middleware/upload.middleware";

const router = Router();


// Upload document
router.post(
  "/upload",
  authenticate,
  upload.single("document"),
  uploadDocument
);


// Get user's documents
router.get(
  "/",
  authenticate,
  getDocuments
);


// Delete user's document
router.delete(
  "/:id",
  authenticate,
  deleteDocument
);


export default router;