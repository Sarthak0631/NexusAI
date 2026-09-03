import { Response } from "express";

import { AuthRequest } from "../middleware/auth.middleware";

import {
    runLangGraphRAG,
} from "../services/langgraph.service";

export async function askLangGraph(
    req: AuthRequest,
    res: Response
) {
    try {
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const { question } = req.body;

        if (
            !question ||
            typeof question !== "string" ||
            !question.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Question is required",
            });
        }

        const result = await runLangGraphRAG(
            question.trim(),
            req.userId.toString()
        );

        return res.status(200).json({
            success: true,
            question: question.trim(),
            answer: result.answer,
            retrieval: {
                bestScore: result.bestScore,
                isRelevant: result.isRelevant,
            },
        });
    } catch (error) {
        console.error("LangGraph error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to execute LangGraph workflow",
        });
    }
}