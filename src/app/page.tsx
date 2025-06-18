"use client";

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { MessageSquare, Sparkles, Zap } from "lucide-react";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { MessageInputBar } from "@/components/MessageInputBar";
import { AIModel } from "@/lib/models";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  const createChat = useMutation(api.chats.createChat);
  const addMessage = useMutation(api.chats.addMessage);
  const updateChatTitle = useMutation(api.chats.updateChatTitle);

  const handleSendMessage = async (
    content: string,
    model: AIModel,
    webSearch?: boolean,
    attachments?: Array<{ url: string; name: string; type: string; size?: number }>
  ) => {
    if (isLoading || !user?.id) return;

    // Combine text content with attachments as markdown, mirroring ChatInterface behavior
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

    const hasContent = finalContent.length > 0 || (attachments && attachments.length > 0);
    if (!hasContent) return;

    const newChatId = uuidv4();
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
        content: finalContent,
        role: "user",
        attachments,
      });

      // Generate title from first message
      const titleSource = finalContent || "New chat";
      const title = titleSource.length > 40 
        ? titleSource.substring(0, 40) + "..."
        : titleSource;
      
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

          {/* Message Input Bar */}
          <div className="absolute bottom-0 left-0 right-0">
            <MessageInputBar
              onSendMessage={handleSendMessage}
              disabled={isLoading}
              placeholder="Type your message to start a new conversation..."
            />
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
