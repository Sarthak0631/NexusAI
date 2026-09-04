import {
    Request,
    Response,
} from "express";

import {
    getConversationById,
    addMessageToConversation,
} from "../services/conversation.service";

import {
    retrieveAndRerankChunks,
} from "../services/retrieval.service";

import {
    streamFinalAnswer,
} from "../services/streaming.service";

import {
    buildSourceReferences,
} from "../services/source.service";

export async function streamMultiAgentAnswer(
    req: Request,
    res: Response
) {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const question =
            typeof req.body?.question === "string"
                ? req.body.question.trim()
                : "";

        const conversationId =
            typeof req.body?.conversationId ===
                "string"
                ? req.body.conversationId.trim()
                : "";

        if (!question) {
            return res.status(400).json({
                success: false,
                message: "Question is required",
            });
        }

        if (!conversationId) {
            return res.status(400).json({
                success: false,
                message:
                    "conversationId is required",
            });
        }

        /*
          Verify that the conversation belongs
          to the authenticated user.
        */

        const conversation =
            await getConversationById(
                conversationId,
                userId
            );

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message:
                    "Conversation not found",
            });
        }

        /*
          Prepare previous conversation history.
        */

        const history =
            conversation.messages
                .slice(-10)
                .map(
                    (message) =>
                        `${message.role === "user"
                            ? "User"
                            : "Assistant"
                        }: ${message.content}`
                )
                .join("\n\n");

        /*
          Save user message.
        */

        const chunks =
            await retrieveAndRerankChunks(
                question,
                userId,
                10,
                3
            );

        const sources =
            await buildSourceReferences(
                chunks
            );

        const research =
            chunks
                .map(
                    (chunk, index) =>
                        `[Source ${index + 1}]
                            Document: ${sources[index]?.documentName ??
                        "Unknown document"
                        }
                            Relevance Score: ${chunk.score.toFixed(3)
                        }

                            Content:
                            ${chunk.text.slice(
                            0,
                            1200
                        )}`
                )
                .join("\n\n");

        /*
          For this streaming endpoint we use
          the retrieved information directly
          and ask the final model to generate
          the answer progressively.
        */

        const analysis =
            research ||
            "No relevant information was found in the uploaded documents.";

        /*
          Configure Server-Sent Events.
        */

        res.status(200);

        res.setHeader(
            "Content-Type",
            "text/event-stream"
        );

        res.setHeader(
            "Cache-Control",
            "no-cache"
        );

        res.setHeader(
            "Connection",
            "keep-alive"
        );

        res.flushHeaders();

        /*
          Tell frontend that generation started.
        */

        res.write(
            `event: start\ndata: ${JSON.stringify({
                conversationId,
            })}\n\n`
        );

        let fullAnswer = "";

        /*
          Stream generated content.
        */

        await streamFinalAnswer(
            {
                question,
                research,
                analysis,
                history,
            },
            (chunk) => {
                fullAnswer += chunk;

                res.write(
                    `event: chunk\ndata: ${JSON.stringify({
                        content: chunk,
                    })}\n\n`
                );
            }
        );

        /*
          Save completed assistant answer
          to MongoDB.
        */

        await addMessageToConversation(
            conversationId,
            userId,
            "assistant",
            fullAnswer,
            sources
        );

        /*
          Tell frontend generation completed.
        */

        res.write(
            `event: done\ndata: ${JSON.stringify({
                success: true,
                conversationId,
                sources,
            })}\n\n`
        );

        res.end();
    } catch (error) {
        console.error(
            "Streaming multi-agent error:",
            error
        );

        /*
          If headers have already been sent,
          we cannot send a normal JSON response.
        */

        if (!res.headersSent) {
            return res.status(500).json({
                success: false,
                message:
                    "Failed to stream AI response",
            });
        }

        res.write(
            `event: error\ndata: ${JSON.stringify({
                success: false,
                message:
                    "Failed to generate response",
            })}\n\n`
        );

        res.end();
    }
}