"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, ArrowDown } from "lucide-react";
import { Doc } from "../../convex/_generated/dataModel";
import { ModelSelector } from "./ModelSelector";
import { AIModel, DEFAULT_MODEL } from "@/lib/models";
import { MessageContent } from "./MessageContent";
import { useUser } from "@clerk/nextjs";

interface ChatInterfaceProps {
  chatId: string;
  messages: Doc<"messages">[];
  chatExists?: boolean;
}

export function ChatInterface({ chatId, messages, chatExists = true }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState<AIModel>(DEFAULT_MODEL);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useUser();

  const addMessage = useMutation(api.chats.addMessage);
  const updateChatTitle = useMutation(api.chats.updateChatTitle);
  const createChat = useMutation(api.chats.createChat);

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

  const handleAIResponse = useCallback(async () => {
    if (isLoading || messages.length === 0) return;
    
    setIsLoading(true);
    setStreamingMessage("");

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
        }),
      });

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

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
              assistantMessage += parsed.content || "";
              setStreamingMessage(assistantMessage);
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
    } catch (error) {
      console.error("Error getting AI response:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, selectedModel.id, chatId, addMessage, updateChatTitle]);

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
        handleAIResponse();
      }
    }
  }, [messages, isLoading, streamingMessage, handleAIResponse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !user?.id) return;

    const userMessage = input.trim();
    setInput("");

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
        content: userMessage,
        role: "user",
      });

      // The AI response will be triggered automatically by the useEffect
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Scrollable chat area with bottom padding for fixed input */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto pb-40" ref={scrollAreaRef}>
          <div className="space-y-4 max-w-4xl py-4 mx-auto pt-6">
            {messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    message.role === "user"
                      ? "bg-primary/90 text-primary-foreground shadow-lg"
                      : "bg-card/70 backdrop-blur-xl border border-white/20 shadow-md"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <MessageContent content={message.content} />
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  )}
                </div>
              </div>
            ))}

            {streamingMessage && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl p-4 bg-card/70 backdrop-blur-xl border border-white/20 shadow-md">
                  <MessageContent content={streamingMessage} />
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

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <div className="absolute bottom-44 left-1/2 transform -translate-x-1/2">
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

      {/* Fixed input bar styled like sidebar */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card/70 backdrop-blur-2xl border border-white/20 rounded-[var(--radius)] shadow-[0_24px_64px_rgba(0,0,0,0.15)] p-4">
            <div className="space-y-4">
              <div className="flex justify-center">
                <ModelSelector
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your message..."
                      className="min-h-[60px] max-h-[120px] resize-none bg-background/50 border-white/10 rounded-[var(--radius)] backdrop-blur-xl"
                      disabled={isLoading}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={!input.trim() || isLoading}
                    size="lg"
                    className="h-[60px] w-[60px] rounded-[var(--radius)] bg-primary/20 hover:bg-primary/30 border border-white/10"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 