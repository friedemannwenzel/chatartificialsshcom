"use client";

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { MessageSquare, Sparkles, Zap, Send } from "lucide-react";
import { useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Textarea } from "@/components/ui/textarea";
import { ModelSelector } from "@/components/ModelSelector";
import { AIModel, DEFAULT_MODEL } from "@/lib/models";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export default function HomePage() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>(DEFAULT_MODEL);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useUser();
  const router = useRouter();

  const createChat = useMutation(api.chats.createChat);
  const addMessage = useMutation(api.chats.addMessage);
  const updateChatTitle = useMutation(api.chats.updateChatTitle);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !user?.id) return;

    const userMessage = input.trim();
    const newChatId = uuidv4();
    
    setInput("");
    setIsLoading(true);

    try {
      // Create new chat
      await createChat({
        chatId: newChatId,
        userId: user.id,
      });

      // Add user message
      await addMessage({
        chatId: newChatId,
        content: userMessage,
        role: "user",
      });

      // Generate title from first message
      const title = userMessage.length > 40 
        ? userMessage.substring(0, 40) + "..."
        : userMessage;
      
      await updateChatTitle({
        chatId: newChatId,
        title,
      });

      // Redirect to the new chat
      router.push(`/c/${newChatId}`);
    } catch (error) {
      console.error("Error creating chat:", error);
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
    <>
      <SignedIn>
        <div className="flex flex-col h-full relative">
          {/* Main content area */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto pb-40">
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md mx-auto p-8">
                  <div className="mb-8">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Welcome to T3 Chat</h1>
                    <p className="text-muted-foreground">
                      Start a conversation with AI and unlock new possibilities.
                    </p>
                  </div>

                  <div className="grid gap-4 text-left">
                    <div className="flex items-start gap-3 p-4 border rounded-lg">
                      <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">AI-Powered Conversations</h3>
                        <p className="text-sm text-muted-foreground">
                          Chat with advanced language models for any task
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 border rounded-lg">
                      <Zap className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Real-time Responses</h3>
                        <p className="text-sm text-muted-foreground">
                          Get instant, streaming responses to your questions
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mt-6">
                    Type your message below to start a new conversation
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Fixed input bar styled like ChatInterface */}
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
                          placeholder="Type your message to start a new conversation..."
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
      </SignedIn>
      
      <SignedOut>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="mb-8">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-4xl font-bold mb-2">T3 Chat</h1>
              <p className="text-muted-foreground text-lg">
                The ultimate AI chat experience
              </p>
            </div>

            <SignInButton mode="modal">
              <Button size="lg" className="w-full">
                Get Started
              </Button>
            </SignInButton>

            <p className="text-sm text-muted-foreground mt-4">
              Sign in to start chatting with AI
            </p>
          </div>
        </div>
      </SignedOut>
    </>
  );
}
