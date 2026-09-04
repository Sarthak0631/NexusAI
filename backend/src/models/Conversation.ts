import mongoose, { Document, Schema } from "mongoose";

export interface IConversationSource {
    documentId: string;
    documentName: string;
    chunkIndex: number;
    score: number;
    text: string;
}

export interface IConversationMessage {
    role: "user" | "assistant";
    content: string;
    sources?: IConversationSource[];
    createdAt: Date;
}

export interface IConversation extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    messages: IConversationMessage[];
    createdAt: Date;
    updatedAt: Date;
}

const conversationMessageSchema =
    new Schema<IConversationMessage>(
        {
            role: {
                type: String,
                enum: ["user", "assistant"],
                required: true,
            },

            content: {
                type: String,
                required: true,
            },

            sources: {
                type: [
                    {
                        documentId: {
                            type: String,
                            required: true,
                        },

                        documentName: {
                            type: String,
                            required: true,
                        },

                        chunkIndex: {
                            type: Number,
                            required: true,
                        },

                        score: {
                            type: Number,
                            required: true,
                        },

                        text: {
                            type: String,
                            required: true,
                        },
                    },
                ],
                default: undefined,
            },

            createdAt: {
                type: Date,
                default: Date.now,
            },
        },
        {
            _id: true,
        }
    );

const conversationSchema =
    new Schema<IConversation>(
        {
            userId: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
                index: true,
            },

            title: {
                type: String,
                required: true,
                trim: true,
                default: "New Conversation",
            },

            messages: {
                type: [conversationMessageSchema],
                default: [],
            },
        },
        {
            timestamps: true,
        }
    );

conversationSchema.index({
    userId: 1,
    updatedAt: -1,
});

const ConversationModel =
    mongoose.model<IConversation>(
        "Conversation",
        conversationSchema
    );

export default ConversationModel;