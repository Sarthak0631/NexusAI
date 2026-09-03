import { Response } from "express";

import {
    AuthRequest,
} from "../middleware/auth.middleware";

import {
    runMultiAgent,
} from "../services/multi-agent.service";


export async function askMultiAgent(
    req: AuthRequest,
    res: Response
) {

    try {

        if (!req.userId) {

            return res.status(401).json({
                success: false,
                message:
                    "Authentication required",
            });

        }


        const {
            question,
        } = req.body;


        if (
            !question ||
            typeof question !==
            "string" ||
            !question.trim()
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Question is required",
            });

        }


        const result =
            await runMultiAgent(
                question.trim(),
                req.userId.toString()
            );


        return res.status(200).json({
            success: true,

            question:
                question.trim(),

            answer:
                result.answer,

            research:
                result.research,

            analysis:
                result.analysis,

            usage:
                result.usage,

            cost:
                result.cost,
        });

    } catch (error) {

        console.error(
            "Multi-agent error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to execute multi-agent workflow",

        });
    }
}