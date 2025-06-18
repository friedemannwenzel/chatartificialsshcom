"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowDown, MoreHorizontal, RotateCcw, Edit, Copy, GitBranch, Check, ExternalLink, Globe, ChevronDown, ChevronRight } from "lucide-react";
import { Doc } from "../../convex/_generated/dataModel";
import { MessageInputBar } from "./MessageInputBar";
import { AIModel } from "@/lib/models";
import { storage } from "@/lib/storage";
import { MessageContent } from "./MessageContent";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

interface GroundingSupport {
  segment: {
    startIndex: number;
    endIndex: number;
    text: string;
  };
  groundingChunkIndices: number[];
  confidenceScores: number[];
}

interface GroundingMetadata {
  groundingChunks: GroundingChunk[];
  groundingSupports: GroundingSupport[];
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

// Search Grounding Details component with collapsible dropdown
const SearchGroundingDetails = ({ groundingMetadata }: { groundingMetadata: GroundingMetadata }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!groundingMetadata || !groundingMetadata.groundingChunks || groundingMetadata.groundingChunks.length === 0) {
    return null;
  }

  const webSources = groundingMetadata.groundingChunks
    .filter(chunk => chunk && chunk.web)
    .map(chunk => chunk.web!)
    .filter((source, index, self) => 
      index === self.findIndex(s => s.uri === source.uri)
    );

  if (webSources.length === 0) {
    return null;
  }

  return (
    <div className="mt-3">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
          >
            {isOpen ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
            <Globe className="w-3 h-3" />
            Search Grounding Details
            <Badge variant="secondary" className="text-xs ml-1">
              {webSources.length}
            </Badge>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Search Queries:
              </span>
              <div className="flex flex-wrap gap-1">
                {groundingMetadata.webSearchQueries.map((query, index) => (
                  <Badge key={index} variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    {query}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                Sources ({webSources.length}):
              </div>
              {webSources.map((source, index) => (
                <a
                  key={index}
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 p-2 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors group"
                >
                  <span className="text-xs font-mono text-blue-600 dark:text-blue-400 mt-0.5 min-w-[1.5rem]">
                    [{index + 1}]
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-blue-800 dark:text-blue-200 truncate group-hover:text-blue-900 dark:group-hover:text-blue-100">
                      {source.title}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 truncate">
                      {source.uri}
                    </div>
                  </div>
                  <ExternalLink className="w-3 h-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
                </a>
              ))}
              {groundingMetadata.searchEntryPoint?.renderedContent && (
                <div
                  className="mt-3"
                  dangerouslySetInnerHTML={{ __html: groundingMetadata.searchEntryPoint.renderedContent }}
                />
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export function ChatInterface({ chatId, messages, chatExists = true }: ChatInterfaceProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
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
      let groundingMetadata: GroundingMetadata | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              break;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                assistantMessage += parsed.content;
                setStreamingMessage(assistantMessage);
              }
              if (parsed.groundingMetadata) {
                groundingMetadata = parsed.groundingMetadata;
                setStreamingGroundingMetadata(groundingMetadata);
              }
            } catch {
              // Ignore parsing errors
            }
          }
        }
      }

      if (assistantMessage) {
        await addMessage({
          chatId,
          content: assistantMessage,
          role: "assistant",
          groundingMetadata: groundingMetadata || undefined,
        });

        // Auto-generate title if this is the first message
        if (messages.length === 1) {
          const firstUserMessage = messages[0];
          const title = firstUserMessage.content.length > 40 
            ? firstUserMessage.content.substring(0, 40) + "..."
            : firstUserMessage.content;
          await updateChatTitle({
            chatId,
            title,
          });
        }
      }

      setStreamingMessage("");
      setStreamingGroundingMetadata(null);
    } catch (error) {
      console.error("Error getting AI response:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, chatId, addMessage, updateChatTitle]);

  // Trigger AI response if there's a user message without an assistant response
  useEffect(() => {
    const shouldTriggerResponse = 
      messages.length > 0 && 
      messages[messages.length - 1].role === "user" &&
      !isLoading &&
      !streamingMessage;
    
    if (shouldTriggerResponse) {
      // Check if this is an odd number of messages (user message without response)
      const needsResponse = messages.length % 2 === 1;
      
      if (needsResponse) {
        handleAIResponse(pendingModel, pendingWebSearch);
      }
    }
  }, [messages, isLoading, streamingMessage, handleAIResponse, pendingModel, pendingWebSearch]);

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

      // Remember model & web search preference for upcoming AI response
      setPendingModel(model);
      setPendingWebSearch(webSearch);

      // Removed manual handleAIResponse call to avoid duplicate responses
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Message Actions Component
  const MessageActions = ({ 
    messageId, 
    messageIndex, 
    role, 
    content, 
    model 
  }: { 
    messageId: string; 
    messageIndex: number; 
    role: "user" | "assistant"; 
    content: string; 
    model?: string;
  }) => {
    const isHovered = hoveredMessage === messageId;
    const showActions = isHovered;
    const isCopied = copiedMessage === messageId;

    return (
      <div className={`flex ${role === "user" ? "justify-end" : "justify-start"} mt-2`}>
        <div 
          className="flex items-center gap-1"
          onMouseEnter={() => setHoveredMessage(messageId)}
          onMouseLeave={() => setHoveredMessage(null)}
        >
          {!showActions ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white/10 cursor-pointer"
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          ) : (
            <div className="flex items-center gap-1">
              {role === "user" ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => handleRetry(messageIndex)}
                    title="Retry"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => handleEdit(messageId, content)}
                    title="Edit"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => copyToClipboard(content, messageId)}
                    title="Copy"
                  >
                    {isCopied ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => handleRetry(messageIndex)}
                    title="Retry"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => copyToClipboard(content, messageId)}
                    title="Copy"
                  >
                    {isCopied ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => handleBranch(messageIndex)}
                    title="Branch"
                  >
                    <GitBranch className="h-3 w-3" />
                  </Button>
                  {model && (
                    <span className="text-xs text-muted-foreground px-2 py-1 bg-white/5 rounded ml-2">
                      {model}
                    </span>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
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
                  className={`max-w-[80%] rounded-2xl p-4 relative group ${
                    message.role === "user"
                      ? "bg-primary/90 text-primary-foreground shadow-lg"
                      : "bg-card/70 backdrop-blur-xl border border-white/20 shadow-md"
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
                    <>
                      {message.role === "assistant" ? (
                        <>
                          <MessageContent content={message.content} />
                          {message.groundingMetadata && (
                            <SearchGroundingDetails groundingMetadata={message.groundingMetadata} />
                          )}
                        </>
                      ) : (
                        <MessageContent content={message.content} />
                      )}
                    </>
                  )}
                </div>
                {editingMessage !== message._id && (
                  <MessageActions
                    messageId={message._id}
                    messageIndex={messageIndex}
                    role={message.role}
                    content={message.content}
                    model={message.role === "assistant" ? storage.getSelectedModel().name : undefined}
                  />
                )}
              </div>
            ))}

            {streamingMessage && (
              <div 
                className="flex flex-col items-start"
                onMouseEnter={() => setHoveredMessage("streaming")}
                onMouseLeave={() => setHoveredMessage(null)}
              >
                <div className="max-w-[80%] rounded-2xl p-4 bg-card/70 backdrop-blur-xl border border-white/20 shadow-md relative group">
                  <MessageContent content={streamingMessage} />
                  {streamingGroundingMetadata && (
                    <SearchGroundingDetails groundingMetadata={streamingGroundingMetadata} />
                  )}
                </div>
                <MessageActions
                  messageId="streaming"
                  messageIndex={messages.length}
                  role="assistant"
                  content={streamingMessage}
                  model={storage.getSelectedModel().name}
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

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <div className="absolute bottom-34 left-1/2 transform -translate-x-1/2">
          <Button
            onClick={scrollToBottom}
            size="sm"
            className="h-10 px-4 rounded-[var(--radius)] bg-card/80 backdrop-blur-xl border border-white/20 shadow-lg hover:bg-card/90 transition-all duration-200 hover:cursor-pointer flex items-center gap-2"
            variant="secondary"
          >
            <span className="text-sm">Scroll to bottom</span>
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Message Input Bar */}
      <div className="absolute bottom-0 left-0 right-0">
        <MessageInputBar
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          placeholder="Type your message..."
        />
      </div>
    </div>
  );
} 