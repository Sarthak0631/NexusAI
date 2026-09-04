"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  ChatMessage,
  Conversation,
  SourceReference,
  DocumentDetails,
} from "../../types/chat";

import {
  createConversation,
  getConversation,
  getConversations,
  streamMultiAgentAnswer,
  getDocumentDetails,
} from "../../services/conversation.service";

import ConversationSidebar from "../../components/chat/ConversationSidebar";
import ChatWindow from "../../components/chat/ChatWindow";
import DocumentViewer from "../../components/chat/DocumentViewer";

export default function ChatPage() {
  const [
    conversations,
    setConversations,
  ] = useState<Conversation[]>([]);

  const [
    activeConversationId,
    setActiveConversationId,
  ] = useState<string | null>(null);

  const [
    messages,
    setMessages,
  ] = useState<ChatMessage[]>([]);

  const [
    activeTitle,
    setActiveTitle,
  ] = useState(
    "New Conversation"
  );

  const [
    loadingConversations,
    setLoadingConversations,
  ] = useState(true);

  const [
    loadingChat,
    setLoadingChat,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [
    selectedDocument,
    setSelectedDocument,
  ] =
    useState<DocumentDetails | null>(
      null
    );

  const [
    selectedChunkIndex,
    setSelectedChunkIndex,
  ] =
    useState<number | undefined>(
      undefined
    );

  const [
    loadingDocument,
    setLoadingDocument,
  ] = useState(false);

  /* =====================================================
     Load Conversations
  ===================================================== */

  useEffect(() => {
    loadConversations();
  }, []);

  async function handleSourceClick(
    source: SourceReference
  ) {
    try {
      setLoadingDocument(true);
      setError(null);

      const response =
        await getDocumentDetails(
          source.documentId
        );

      setSelectedDocument(
        response.document
      );

      setSelectedChunkIndex(
        source.chunkIndex
      );
    } catch (error) {
      console.error(
        "Failed to load document:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load document"
      );
    } finally {
      setLoadingDocument(false);
    }
  }

  async function loadConversations() {
    try {
      setLoadingConversations(true);
      setError(null);

      const response =
        await getConversations();

      setConversations(
        response.conversations
      );

      /*
        Automatically open the most
        recently updated conversation.
      */

      if (
        response.conversations.length >
        0
      ) {
        const first =
          response.conversations[0];

        await selectConversation(
          first._id
        );
      }
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load conversations"
      );
    } finally {
      setLoadingConversations(false);
    }
  }

  /* =====================================================
     Select Conversation
  ===================================================== */

  async function selectConversation(
    conversationId: string
  ) {
    try {
      setLoadingChat(true);
      setError(null);

      const response =
        await getConversation(
          conversationId
        );

      setActiveConversationId(
        conversationId
      );

      setMessages(
        response.conversation
          .messages ?? []
      );

      setActiveTitle(
        response.conversation.title
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load conversation"
      );
    } finally {
      setLoadingChat(false);
    }
  }

  /* =====================================================
     Create New Conversation
  ===================================================== */

  async function handleNewConversation() {
    try {
      setError(null);

      const response =
        await createConversation(
          "New Conversation"
        );

      const newConversation =
        response.conversation;

      setConversations(
        (previous) => [
          newConversation,
          ...previous,
        ]
      );

      setActiveConversationId(
        newConversation._id
      );

      setActiveTitle(
        newConversation.title
      );

      setMessages([]);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create conversation"
      );
    }
  }

  /* =====================================================
     Send Message
  ===================================================== */

  async function handleSendMessage(
    question: string
  ) {
    if (!activeConversationId) {
      setError(
        "Please create or select a conversation first."
      );

      return;
    }

    const conversationId =
      activeConversationId;

    const userMessage: ChatMessage = {
      role: "user",
      content: question,
      createdAt:
        new Date().toISOString(),
    };

    /*
      Immediately display the user's message.
    */

    setMessages(
      (previous) => [
        ...previous,
        userMessage,
      ]
    );

    /*
      Create an empty assistant message.
  
      Streaming chunks will be appended
      to this message.
    */

    const assistantMessageId =
      `streaming-${Date.now()}`;

    const assistantMessage: ChatMessage = {
      _id: assistantMessageId,
      role: "assistant",
      content: "",
      createdAt:
        new Date().toISOString(),
    };

    setMessages(
      (previous) => [
        ...previous,
        assistantMessage,
      ]
    );

    try {
      setLoadingChat(true);
      setError(null);

      await streamMultiAgentAnswer(
        conversationId,
        question,
        (chunk) => {
          /*
            Append every incoming chunk
            to the assistant message.
          */

          setMessages(
            (previous) =>
              previous.map(
                (message) =>
                  message._id ===
                    assistantMessageId
                    ? {
                      ...message,
                      content:
                        message.content +
                        chunk,
                    }
                    : message
              )
          );
        },
        async (sources) => {
          /*
            Attach source references to the
            streamed assistant message.
          */

          setMessages(
            (previous) =>
              previous.map(
                (message) =>
                  message._id ===
                    assistantMessageId
                    ? {
                      ...message,
                      sources,
                    }
                    : message
              )
          );

          /*
            Refresh conversation list.
          */

          try {
            const response =
              await getConversations();

            setConversations(
              response.conversations
            );
          } catch (error) {
            console.error(
              "Failed to refresh conversations:",
              error
            );
          }
        }
      );
    } catch (error) {
      console.error(
        "Streaming error:",
        error
      );

      /*
        Remove the empty/incomplete
        assistant response.
      */

      setMessages(
        (previous) =>
          previous.filter(
            (message) =>
              message._id !==
              assistantMessageId
          )
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to generate response"
      );
    } finally {
      setLoadingChat(false);
    }
  }

  return (
    <main className="flex h-[100dvh] min-h-0 w-full overflow-hidden bg-white">
      <ConversationSidebar
        conversations={conversations}
        activeConversationId={
          activeConversationId
        }
        onSelectConversation={
          selectConversation
        }
        onNewConversation={
          handleNewConversation
        }
        loading={
          loadingConversations
        }
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {error && (
          <div className="shrink-0 border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:px-6">
            {error}
          </div>
        )}

        <ChatWindow
          messages={messages}
          onSend={handleSendMessage}
          onSourceClick={
            handleSourceClick
          }
          loading={loadingChat}
          title={activeTitle}
        />
      </div>

      {selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          selectedChunkIndex={
            selectedChunkIndex
          }
          onClose={() => {
            setSelectedDocument(null);
            setSelectedChunkIndex(
              undefined
            );
          }}
        />
      )}
    </main>
  );
}