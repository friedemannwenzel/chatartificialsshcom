"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Brain } from "lucide-react";
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

export function ChatInterface({ chatId, messages, chatExists = true }: ChatInterfaceProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [streamingThinking, setStreamingThinking] = useState("");
  const [streamingGroundingMetadata, setStreamingGroundingMetadata] = useState<GroundingMetadata | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const router = useRouter();
  const [pendingModel, setPendingModel] = useState<AIModel | undefined>();
  const [pendingWebSearch, setPendingWebSearch] = useState<boolean | undefined>();

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

  // Message action functions
  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessage(messageId);
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopiedMessage(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleRetry = async (messageIndex: number) => {
    if (messages[messageIndex].role === "user") {
      // For user messages, resend the message and remove all subsequent messages
      const messageContent = messages[messageIndex].content;
      
      try {
        // Remove all messages from this point onwards (including the current message)
        await deleteMessagesFromIndex({
          chatId,
          fromIndex: messageIndex,
        });
        
        // Add the message again to trigger a new AI response
        await addMessage({
          chatId,
          content: messageContent,
          role: "user",
        });
      } catch (error) {
        console.error("Error retrying message:", error);
      }
    } else if (messageIndex > 0 && messages[messageIndex - 1].role === "user") {
      // For assistant messages, remove this message and regenerate response
      try {
        // Remove all messages from this assistant message onwards
        await deleteMessagesFromIndex({
          chatId,
          fromIndex: messageIndex,
        });
        
        // The AI response will be automatically triggered by the useEffect
        // since we now have a user message without a response
      } catch (error) {
        console.error("Error retrying assistant message:", error);
      }
    }
  };

  const handleEdit = (messageId: string, content: string) => {
    setEditingMessage(messageId);
    setEditText(content);
  };

  const handleSaveEdit = async () => {
    if (!editingMessage || !editText.trim()) return;
    
    // TODO: Implement message editing in the database
    console.log("Save edit:", editingMessage, editText);
    setEditingMessage(null);
    setEditText("");
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditText("");
  };

  const handleBranch = async (messageIndex: number) => {
    if (!user?.id) return;
    
    try {
      // Create a new chat ID
      const newChatId = uuidv4();
      
      // Create the new chat
      await createChat({
        chatId: newChatId,
        userId: user.id,
      });

      // Copy all messages up to and including the selected message
      const messagesToCopy = messages.slice(0, messageIndex + 1);
      
      for (const message of messagesToCopy) {
        await addMessage({
          chatId: newChatId,
          content: message.content,
          role: message.role,
        });
      }

      // Set the title based on the first message if it exists
      if (messagesToCopy.length > 0 && messagesToCopy[0].role === "user") {
        const title = messagesToCopy[0].content.length > 40 
          ? messagesToCopy[0].content.substring(0, 40) + "... (Branch)"
          : messagesToCopy[0].content + " (Branch)";
        
        await updateChatTitle({
          chatId: newChatId,
          title,
        });
      }

      // Navigate to the new chat
      router.push(`/c/${newChatId}`);
    } catch (error) {
      console.error("Error creating branch:", error);
    }
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  const checkScrollPosition = () => {
    if (scrollAreaRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    }
  };

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      scrollArea.addEventListener('scroll', checkScrollPosition);
      checkScrollPosition(); // Check initial position
      
      return () => {
        scrollArea.removeEventListener('scroll', checkScrollPosition);
      };
    }
  }, []);

  // Only scroll to bottom for new user messages, not during streaming
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === "user") {
      scrollToBottom();
    }
  }, [messages]);

  const handleAIResponse = useCallback(async (model?: AIModel, webSearch?: boolean) => {
    if (isLoading || messages.length === 0) return;
    
    setIsLoading(true);
    setStreamingMessage("");
    setStreamingThinking("");

    // Use provided model or get from storage
    const selectedModel = model || storage.getSelectedModel();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            attachments: msg.attachments,
          })),
          model: selectedModel.id,
          webSearch,
        }),
      });

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
        
        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") {
              break;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                assistantMessage += parsed.content;
                const now = Date.now();
                if (now - lastTextFlush > 50) {
                  setStreamingMessage(assistantMessage);
                  lastTextFlush = now;
                }
              }
              if (parsed.thinking) {
                currentThinking += parsed.thinking;
                const nowT = Date.now();
                if (nowT - lastThinkingFlush > 80) {
                  setStreamingThinking(currentThinking);
                  lastThinkingFlush = nowT;
                }
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
        if (assistantMessage !== streamingMessage) {
          setStreamingMessage(assistantMessage);
        }
        await addMessage({
          chatId,
          content: assistantMessage,
          role: "assistant",
          groundingMetadata: groundingMetadata || undefined,
        });

        // Clear streaming preview after persistence to avoid flicker
        setStreamingMessage("");
        setStreamingThinking("");
        setStreamingGroundingMetadata(null);

        // Auto-generate title if this is the first message
        if (messages.length === 1) {
          const firstUserMessage = messages[0];
          const generatedTitle = await generateChatTitle(firstUserMessage.content);
          if (generatedTitle) {
            await updateChatTitle({
              chatId,
              title: generatedTitle,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, chatId, addMessage, updateChatTitle, streamingMessage]);

  // Trigger AI response if there's a user message without an assistant response
  useEffect(() => {
    const shouldTriggerResponse = 
      messages.length > 0 && 
      messages[messages.length - 1].role === "user" &&
      !isLoading &&
      !streamingMessage &&
      !streamingThinking;
    
    if (shouldTriggerResponse) {
      // Check if this is an odd number of messages (user message without response)
      const needsResponse = messages.length % 2 === 1;
      
      if (needsResponse) {
        handleAIResponse(pendingModel, pendingWebSearch);
      }
    }
  }, [messages, isLoading, streamingMessage, streamingThinking, handleAIResponse, pendingModel, pendingWebSearch]);

  const handleSendMessage = async (content: string, model: AIModel, webSearch?: boolean, attachments?: Array<{ url: string; name: string; type: string; size?: number }>) => {
    if (isLoading || !user?.id) return;
    
    const hasContent = content.trim().length > 0 || (attachments && attachments.length > 0);
    if (!hasContent) return;

    // Combine text content with attachments as markdown
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
      // Create chat if it doesn't exist
      if (!chatExists) {
        await createChat({
          chatId,
          userId: user.id,
        });
      }

      await addMessage({
        chatId,
        content: finalContent,
        role: "user",
        attachments,
      });

      setPendingModel(model);
      setPendingWebSearch(webSearch);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };



  return (
    <div className="flex flex-col h-full relative">
      {/* Scrollable chat area with bottom padding for fixed input */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto pb-40" ref={scrollAreaRef}>
          <div className="space-y-4 max-w-4xl py-4 mx-auto pt-6">
            {messages.map((message, messageIndex) => (
              <div
                key={message._id}
                className={`flex flex-col ${
                  message.role === "user" ? "items-end" : "items-start"
                }`}
                onMouseEnter={() => setHoveredMessage(message._id)}
                onMouseLeave={() => setHoveredMessage(null)}
              >
                <div
                  className={` rounded-[20px] pt-3 relative group flex items-center justify-center ${
                    message.role === "user"
                      ? "bg-[#2C2C2C] text-[#A7A7A7] px-4"
                      : "text-[#A7A7A7]"
                  }`}
                >
                  {editingMessage === message._id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="min-h-[60px] resize-none bg-background/50 border-white/10"
                        autoFocus
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelEdit}
                          className="h-8 px-3 text-xs"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
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
                {editingMessage !== message._id && (
                  <MessageActions
                    messageId={message._id}
                    messageIndex={messageIndex}
                    role={message.role}
                    content={message.content}
                    model={message.role === "assistant" ? storage.getSelectedModel().name : undefined}
                    onRetry={handleRetry}
                    onEdit={handleEdit}
                    onCopy={copyToClipboard}
                    onBranch={handleBranch}
                    hoveredMessage={hoveredMessage}
                    setHoveredMessage={setHoveredMessage}
                    copiedMessage={copiedMessage}
                  />
                )}
              </div>
            ))}

            {isLoading && !streamingMessage && !streamingThinking && (
              <div 
                className="flex flex-col items-start"
                onMouseEnter={() => setHoveredMessage("loading")}
                onMouseLeave={() => setHoveredMessage(null)}
              >
                {pendingModel?.isReasoningModel ? (
                  <div className="rounded-[20px] pt-3 relative group flex items-center justify-center text-[#A7A7A7]">
                    <div className="flex items-center gap-3 p-4">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#A7A7A7] border-t-transparent" />
                      <span className="text-sm text-[#5D5D5D]">Thinking...</span>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[20px] pt-3 relative group flex items-center justify-center text-[#A7A7A7]">
                    <div className="flex items-center gap-3 p-4">
                      <span className="text-sm text-[#5D5D5D]">Typing</span>
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
                  model={storage.getSelectedModel().name}
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

            {messages.length === 0 && !streamingMessage && (
              <div className="text-center text-muted-foreground py-12">
                <p className="text-lg font-medium">Start a conversation</p>
                <p className="text-sm opacity-70 mt-1">Type a message below to begin</p>
              </div>
            )}
          </div>
        </div>
      </div>



      {/* Message Input Bar */}
      <div className="absolute bottom-0 max-w-4xl mx-auto left-0 right-0">
        <MessageInputBar
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          placeholder="Type your message..."
          showScrollButton={showScrollButton}
          onScrollToBottom={scrollToBottom}
        />
      </div>
    </div>
  );
} 