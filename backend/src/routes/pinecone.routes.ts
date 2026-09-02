import { Router } from "express";
import { testPinecone } from "../controllers/pinecone.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/test", authenticate, testPinecone);

export default router;