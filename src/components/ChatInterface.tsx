"use client";

import { useState, useRef, useEffect, useCallback, memo } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Brain, AlertCircle, Globe } from "lucide-react";
import { Doc } from "../../convex/_generated/dataModel";
import { MessageInputBar } from "./MessageInputBar";
import { MessageActions } from "./MessageActions";
import { SearchGroundingDetails } from "./SearchGroundingDetails";
import { AIModel } from "@/lib/models";
import { storage } from "@/lib/storage";
import { MessageContent } from "./MessageContent";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { generateChatTitle } from "@/lib/generateChatTitle";

interface GroundingMetadata {
  groundingChunks: Array<{
    web?: {
      uri: string;
      title: string;
    };
  }>;
  groundingSupports: Array<{
    segment: {
      startIndex: number;
      endIndex: number;
      text: string;
    };
    groundingChunkIndices: number[];
    confidenceScores: number[];
  }>;
  webSearchQueries: string[];
  searchEntryPoint?: {
    renderedContent: string;
  };
}

interface ChatInterfaceProps {
  chatId: string;
  messages: Doc<"messages">[];
  chatExists?: boolean;
}

// Memoized message row to prevent re-renders on hover/streaming changes in other messages
const MessageRow = memo(function MessageRow({
  message,
  messageIndex,
  isHovered,
  isEditing,
  editText,
  isCopied,
  cachedModelName,
  onMouseEnter,
  onMouseLeave,
  onEditTextChange,
  onCancelEdit,
  onSaveEdit,
  onRetry,
  onEdit,
  onCopy,
  onBranch,
  onSetHovered,
}: {
  message: Doc<"messages">;
  messageIndex: number;
  isHovered: boolean;
  isEditing: boolean;
  editText: string;
  isCopied: boolean;
  cachedModelName: string | undefined;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onEditTextChange: (text: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onRetry: (index: number) => void;
  onEdit: (id: string, content: string) => void;
  onCopy: (content: string, id: string) => void;
  onBranch: (index: number) => void;
  onSetHovered: (id: string | null) => void;
}) {
  return (
    <div
      className={`flex flex-col ${
        message.role === "user" ? "items-end" : "items-start"
      }`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className={` rounded-[20px] pt-3 relative group flex items-center justify-center ${
          message.role === "user"
            ? "bg-[#2C2C2C] text-[#A7A7A7] px-4"
            : "text-[#A7A7A7]"
        }`}
      >
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editText}
              onChange={(e) => onEditTextChange(e.target.value)}
              className="min-h-[60px] resize-none bg-background/50 border-white/10"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancelEdit}
                className="h-8 px-3 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={onSaveEdit}
                className="h-8 px-3 text-xs"
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          <MessageContent content={message.content} />
        )}
      </div>
      {message.role === "assistant" && message.groundingMetadata && (
        <SearchGroundingDetails groundingMetadata={message.groundingMetadata} />
      )}
      {message.role === "assistant" && message.reasoningContent && (
        <details className="mt-3 max-w-[80%] rounded-[15px] border border-[#2C2C2C] bg-[#0A0A0A] px-3 py-2 text-[#A7A7A7]">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-blue-400">
            <Brain className="h-4 w-4" />
            Reasoning
          </summary>
          <div className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-[#7A7A7A]">
            {message.reasoningContent}
          </div>
        </details>
      )}
      {!isEditing && (
        <MessageActions
          messageId={message._id}
          messageIndex={messageIndex}
          role={message.role}
          content={message.content}
          model={cachedModelName}
          onRetry={onRetry}
          onEdit={onEdit}
          onCopy={onCopy}
          onBranch={onBranch}
          hoveredMessage={isHovered ? message._id : null}
          setHoveredMessage={onSetHovered}
          copiedMessage={isCopied ? message._id : null}
        />
      )}
    </div>
  );
});

export function ChatInterface({ chatId, messages, chatExists = true }: ChatInterfaceProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [streamingThinking, setStreamingThinking] = useState("");
  const [streamingSearchStatus, setStreamingSearchStatus] = useState<"idle" | "searching" | "completed">("idle");
  const [streamingGroundingMetadata, setStreamingGroundingMetadata] = useState<GroundingMetadata | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const router = useRouter();
  const [pendingModel, setPendingModel] = useState<AIModel | undefined>();
  const [pendingWebSearch, setPendingWebSearch] = useState<boolean | undefined>();
  const [pendingReasoningEffort, setPendingReasoningEffort] = useState<string | undefined>();
  const [pendingUsageLimitPassword, setPendingUsageLimitPassword] = useState<string | undefined>();

  // Refs for stable callback access (avoids re-creating handleAIResponse on every stream tick)
  const abortControllerRef = useRef<AbortController | null>(null);
  const isLoadingRef = useRef(false);
  const scrollRafRef = useRef<number | null>(null);

  // Cache model name to avoid repeated localStorage reads during render
  const cachedModelName = useRef<string>(storage.getSelectedModel().name);
  useEffect(() => {
    cachedModelName.current = storage.getSelectedModel().name;
  }, [pendingModel]);

  const addMessage = useMutation(api.chats.addMessage);
  const updateChatTitle = useMutation(api.chats.updateChatTitle);
  const createChat = useMutation(api.chats.createChat);
  const deleteMessagesFromIndex = useMutation(api.chats.deleteMessagesFromIndex);

  useEffect(() => {
    if (!user?.id || !chatId) return;
    const pending = storage.consumePendingInitialMessage(chatId);
    if (!pending) return;
    const run = async () => {
      try {
        if (!chatExists) {
          await createChat({ chatId, userId: user.id });
        }
        await addMessage({
          chatId,
          content: pending.content,
          role: "user",
          attachments: pending.attachments,
        });
        setPendingModel(pending.model);
        setPendingWebSearch(pending.webSearch);
      } catch (e) {
        console.error("Failed to persist pending initial message:", e);
      }
    };
    run();
  }, [user?.id, chatId, chatExists, createChat, addMessage]);

  const copyToClipboard = useCallback(async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessage(messageId);
      setTimeout(() => setCopiedMessage(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }, []);

  const handleRetry = useCallback(async (messageIndex: number) => {
    if (messages[messageIndex].role === "user") {
      const messageContent = messages[messageIndex].content;
      try {
        await deleteMessagesFromIndex({ chatId, fromIndex: messageIndex });
        await addMessage({ chatId, content: messageContent, role: "user" });
      } catch (error) {
        console.error("Error retrying message:", error);
      }
    } else if (messageIndex > 0 && messages[messageIndex - 1].role === "user") {
      try {
        await deleteMessagesFromIndex({ chatId, fromIndex: messageIndex });
      } catch (error) {
        console.error("Error retrying assistant message:", error);
      }
    }
  }, [messages, chatId, deleteMessagesFromIndex, addMessage]);

  const handleEdit = useCallback((messageId: string, content: string) => {
    setEditingMessage(messageId);
    setEditText(content);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingMessage || !editText.trim()) return;
    console.log("Save edit:", editingMessage, editText);
    setEditingMessage(null);
    setEditText("");
  }, [editingMessage, editText]);

  const handleCancelEdit = useCallback(() => {
    setEditingMessage(null);
    setEditText("");
  }, []);

  const handleBranch = useCallback(async (messageIndex: number) => {
    if (!user?.id) return;
    try {
      const newChatId = uuidv4();
      await createChat({ chatId: newChatId, userId: user.id });
      const messagesToCopy = messages.slice(0, messageIndex + 1);
      for (const message of messagesToCopy) {
        await addMessage({
          chatId: newChatId,
          content: message.content,
          role: message.role,
          attachments: message.attachments,
          reasoningContent: message.reasoningContent,
          groundingMetadata: message.groundingMetadata,
        });
      }
      if (messagesToCopy.length > 0 && messagesToCopy[0].role === "user") {
        const title = messagesToCopy[0].content.length > 40
          ? messagesToCopy[0].content.substring(0, 40) + "... (Branch)"
          : messagesToCopy[0].content + " (Branch)";
        await updateChatTitle({ chatId: newChatId, title });
      }
      router.push(`/c/${newChatId}`);
    } catch (error) {
      console.error("Error creating branch:", error);
    }
  }, [user?.id, messages, createChat, addMessage, updateChatTitle, router]);

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, []);

  // Throttled scroll handler using rAF
  const checkScrollPosition = useCallback(() => {
    if (scrollRafRef.current) return;
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null;
      if (scrollAreaRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShowScrollButton(prev => {
          if (prev === !isNearBottom) return prev;
          return !isNearBottom;
        });
      }
    });
  }, []);

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      scrollArea.addEventListener('scroll', checkScrollPosition, { passive: true });
      checkScrollPosition();
      return () => {
        scrollArea.removeEventListener('scroll', checkScrollPosition);
        if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
      };
    }
  }, [checkScrollPosition]);

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === "user") {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  const handleStopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const handleAIResponse = useCallback(async (model?: AIModel, webSearch?: boolean, reasoningEffort?: string, usageLimitPassword?: string) => {
    if (isLoadingRef.current || messages.length === 0) return;

    isLoadingRef.current = true;
    setIsLoading(true);
    setStreamingMessage("");
    setStreamingThinking("");
    setStreamingSearchStatus("idle");
    setStreamError(null);

    // Abort any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const selectedModel = model || storage.getSelectedModel();
    cachedModelName.current = selectedModel.name;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            attachments: msg.attachments,
          })),
          model: selectedModel.id,
          webSearch,
          reasoningEffort,
          usageLimitPassword: usageLimitPassword || storage.getUsageLimitPassword() || undefined,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Request failed (${response.status})`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";
      let currentThinking = "";
      let groundingMetadata: GroundingMetadata | null = null;
      let buffer = "";
      let lastTextFlush = 0;
      let lastThinkingFlush = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.error) {
                setStreamError(parsed.error);
                continue;
              }
              if (parsed.content) {
                assistantMessage += parsed.content;
                const now = Date.now();
                if (now - lastTextFlush > 30) {
                  setStreamingMessage(assistantMessage);
                  lastTextFlush = now;
                  // Auto-scroll during streaming if near bottom
                  if (scrollAreaRef.current) {
                    const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
                    if (scrollHeight - scrollTop - clientHeight < 150) {
                      scrollToBottom();
                    }
                  }
                }
              }
              if (parsed.thinking) {
                currentThinking += parsed.thinking;
                const nowT = Date.now();
                if (nowT - lastThinkingFlush > 60) {
                  setStreamingThinking(currentThinking);
                  lastThinkingFlush = nowT;
                }
              }
              if (parsed.searchStatus) {
                setStreamingSearchStatus(parsed.searchStatus === "completed" ? "completed" : "searching");
              }
              if (parsed.groundingMetadata) {
                groundingMetadata = parsed.groundingMetadata;
                setStreamingGroundingMetadata(groundingMetadata);
              }
            } catch {
              // Ignore parsing errors for partial JSON
            }
          }
        }
      }

      if (assistantMessage) {
        // Final flush
        setStreamingMessage(assistantMessage);
        await addMessage({
          chatId,
          content: assistantMessage,
          role: "assistant",
          reasoningContent: currentThinking || undefined,
          groundingMetadata: groundingMetadata || undefined,
        });

        setStreamingMessage("");
        setStreamingThinking("");
        setStreamingSearchStatus("idle");
        setStreamingGroundingMetadata(null);

        // Fire-and-forget title generation (don't block UI)
        if (messages.length === 1) {
          const firstUserMessage = messages[0];
          generateChatTitle(firstUserMessage.content).then(generatedTitle => {
            if (generatedTitle) {
              updateChatTitle({ chatId, title: generatedTitle });
            }
          });
        }
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        // User cancelled - not an error
      } else {
        console.error("Error getting AI response:", error);
        setStreamError((error as Error).message || "Failed to get response. Please try again.");
      }
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [messages, chatId, addMessage, updateChatTitle, scrollToBottom]);

  // Trigger AI response if there's a user message without an assistant response
  useEffect(() => {
    const shouldTriggerResponse =
      messages.length > 0 &&
      messages[messages.length - 1].role === "user" &&
      !isLoadingRef.current &&
      !isLoading;

    if (shouldTriggerResponse) {
      const needsResponse = messages.length % 2 === 1;
      if (needsResponse) {
        handleAIResponse(pendingModel, pendingWebSearch, pendingReasoningEffort, pendingUsageLimitPassword);
      }
    }
  }, [messages, isLoading, handleAIResponse, pendingModel, pendingWebSearch, pendingReasoningEffort, pendingUsageLimitPassword]);

  const handleSendMessage = useCallback(async (content: string, model: AIModel, webSearch?: boolean, attachments?: Array<{ url: string; name: string; type: string; size?: number }>, reasoningEffort?: string) => {
    if (isLoading || !user?.id) return;

    const hasContent = content.trim().length > 0 || (attachments && attachments.length > 0);
    if (!hasContent) return;

    setStreamError(null);

    let finalContent = content.trim();
    if (attachments && attachments.length > 0) {
      attachments.forEach((file) => {
        const isImage = file.type?.startsWith("image/") ||
          (!file.type && [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg"].some(ext =>
            file.name.toLowerCase().endsWith(ext)
          ));
        if (isImage) {
          finalContent += `\n\n![${file.name}](${file.url})`;
        } else {
          finalContent += `\n\n[${file.name}](${file.url})`;
        }
      });
    }

    try {
      if (!chatExists) {
        await createChat({ chatId, userId: user.id });
      }
      await addMessage({ chatId, content: finalContent, role: "user", attachments });
      setPendingModel(model);
      setPendingWebSearch(webSearch);
      setPendingReasoningEffort(reasoningEffort);
      setPendingUsageLimitPassword(storage.getUsageLimitPassword() || undefined);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }, [isLoading, user?.id, chatExists, chatId, createChat, addMessage]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto pb-40" ref={scrollAreaRef}>
          <div className="space-y-4 max-w-4xl py-4 mx-auto pt-6">
            {messages.map((message, messageIndex) => (
              <MessageRow
                key={message._id}
                message={message}
                messageIndex={messageIndex}
                isHovered={hoveredMessage === message._id}
                isEditing={editingMessage === message._id}
                editText={editText}
                isCopied={copiedMessage === message._id}
                cachedModelName={message.role === "assistant" ? cachedModelName.current : undefined}
                onMouseEnter={() => setHoveredMessage(message._id)}
                onMouseLeave={() => setHoveredMessage(null)}
                onEditTextChange={setEditText}
                onCancelEdit={handleCancelEdit}
                onSaveEdit={handleSaveEdit}
                onRetry={handleRetry}
                onEdit={handleEdit}
                onCopy={copyToClipboard}
                onBranch={handleBranch}
                onSetHovered={setHoveredMessage}
              />
            ))}

            {/* Loading indicator - distinguishes thinking vs generating */}
            {isLoading && !streamingMessage && !streamingThinking && (
              <div
                className="flex flex-col items-start"
                onMouseEnter={() => setHoveredMessage("loading")}
                onMouseLeave={() => setHoveredMessage(null)}
              >
                {streamingSearchStatus === "searching" ? (
                  <div className="rounded-[20px] pt-3 relative group flex items-center justify-center text-[#A7A7A7]">
                    <div className="flex items-center gap-3 p-4">
                      <Globe className="h-4 w-4 animate-pulse text-blue-400" />
                      <span className="text-sm text-[#5D5D5D]">Searching...</span>
                    </div>
                  </div>
                ) : pendingModel?.isReasoningModel ? (
                  <div className="rounded-[20px] pt-3 relative group flex items-center justify-center text-[#A7A7A7]">
                    <div className="flex items-center gap-3 p-4">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#A7A7A7] border-t-transparent" />
                      <span className="text-sm text-[#5D5D5D]">Thinking...</span>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[20px] pt-3 relative group flex items-center justify-center text-[#A7A7A7]">
                    <div className="flex items-center gap-3 p-4">
                      <span className="text-sm text-[#5D5D5D]">Generating</span>
                      <span className="inline-flex gap-1 ml-1">
                        <span className="h-2 w-2 bg-[#5D5D5D] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="h-2 w-2 bg-[#5D5D5D] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="h-2 w-2 bg-[#5D5D5D] rounded-full animate-bounce"></span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {isLoading && streamingSearchStatus === "searching" && (streamingMessage || streamingThinking) && (
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2 rounded-[15px] border border-[#2C2C2C] bg-[#0A0A0A] px-3 py-2 text-sm text-[#5D5D5D]">
                  <Globe className="h-4 w-4 animate-pulse text-blue-400" />
                  Searching...
                </div>
              </div>
            )}

            {/* Thinking stream */}
            {streamingThinking && (
              <div
                className="flex flex-col items-start"
                onMouseEnter={() => setHoveredMessage("thinking")}
                onMouseLeave={() => setHoveredMessage(null)}
              >
                <div className="rounded-[20px] pt-3 relative group flex items-center justify-start text-[#A7A7A7] max-w-[80%]">
                  <div className="w-full">
                    <div className="flex items-center gap-2 mb-3 text-blue-400">
                      <Brain className="w-4 h-4" />
                      <span className="text-sm font-medium">Thinking</span>
                    </div>
                    <div className="text-sm text-[#5D5D5D] bg-[#0A0A0A] p-3 rounded-[15px] border border-[#2C2C2C]/50 whitespace-pre-wrap break-words">{streamingThinking}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Streaming message */}
            {streamingMessage && (
              <div
                className="flex flex-col items-start"
                onMouseEnter={() => setHoveredMessage("streaming")}
                onMouseLeave={() => setHoveredMessage(null)}
              >
                <div className="rounded-[20px] pt-3 relative group flex items-center justify-center text-[#A7A7A7]">
                  <MessageContent content={streamingMessage} />
                </div>
                {streamingGroundingMetadata && (
                  <SearchGroundingDetails groundingMetadata={streamingGroundingMetadata} />
                )}
                <MessageActions
                  messageId="streaming"
                  messageIndex={messages.length}
                  role="assistant"
                  content={streamingMessage}
                  model={cachedModelName.current}
                  onRetry={handleRetry}
                  onEdit={handleEdit}
                  onCopy={copyToClipboard}
                  onBranch={handleBranch}
                  hoveredMessage={hoveredMessage}
                  setHoveredMessage={setHoveredMessage}
                  copiedMessage={copiedMessage}
                />
              </div>
            )}

            {/* Error display */}
            {streamError && !isLoading && (
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2 px-4 py-3 rounded-[15px] bg-red-500/10 border border-red-500/20 text-red-400 text-sm max-w-[80%]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{streamError}</span>
                </div>
              </div>
            )}

            {messages.length === 0 && !streamingMessage && (
              <div className="text-center text-muted-foreground py-12">
                <p className="text-lg font-medium">Start a conversation</p>
                <p className="text-sm opacity-70 mt-1">Type a message below to begin</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 max-w-4xl mx-auto left-0 right-0">
        <MessageInputBar
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          placeholder="Type your message..."
          showScrollButton={showScrollButton}
          onScrollToBottom={scrollToBottom}
          showStopButton={isLoading && (Boolean(streamingMessage) || Boolean(streamingThinking))}
          onStopGeneration={handleStopGeneration}
        />
      </div>
    </div>
  );
}
