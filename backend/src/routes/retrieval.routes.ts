import { Router } from "express";
import { retrieveDocuments } from "../controllers/retrieval.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, retrieveDocuments);

export default router;