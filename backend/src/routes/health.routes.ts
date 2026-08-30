import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    service: "NexusAI Backend",
  });
});

export default router;