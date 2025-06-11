"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Bot, User } from "lucide-react";
import { Doc } from "../../convex/_generated/dataModel";
import { ModelSelector } from "./ModelSelector";
import { AIModel, DEFAULT_MODEL } from "@/lib/models";
import { MessageContent } from "./MessageContent";

interface ChatInterfaceProps {
  chatId: string;
  messages: Doc<"messages">[];
}

export function ChatInterface({ chatId, messages }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState<AIModel>(DEFAULT_MODEL);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const addMessage = useMutation(api.chats.addMessage);
  const updateChatTitle = useMutation(api.chats.updateChatTitle);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);
    setStreamingMessage("");

    try {
      await addMessage({
        chatId,
        content: userMessage,
        role: "user",
      });

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content,
            })),
            { role: "user", content: userMessage },
          ],
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
        if (messages.length === 0) {
          const title = userMessage.length > 40 
            ? userMessage.substring(0, 40) + "..."
            : userMessage;
          await updateChatTitle({
            chatId,
            title,
          });
        }
      }

      setStreamingMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
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
          <div className="space-y-4 max-w-5xl mx-auto p-4 pt-6">
            {messages.map((message) => (
              <div
                key={message._id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-[var(--radius)] bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
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
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-[var(--radius)] bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {streamingMessage && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="max-w-[80%] rounded-2xl p-4 bg-card/70 backdrop-blur-xl border border-white/20 shadow-md">
                  <MessageContent content={streamingMessage} />
                  <div className="w-2 h-4 bg-primary animate-pulse inline-block ml-1" />
                </div>
              </div>
            )}

            {messages.length === 0 && !streamingMessage && (
              <div className="text-center text-muted-foreground py-12">
                <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Start a conversation</p>
                <p className="text-sm opacity-70 mt-1">Type a message below to begin</p>
              </div>
            )}
          </div>
        </div>
      </div>

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