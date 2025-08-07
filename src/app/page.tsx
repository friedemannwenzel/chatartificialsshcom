"use client";

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { MessageSquare} from "lucide-react";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
 
import { MessageInputBar } from "@/components/MessageInputBar";
import { AIModel } from "@/lib/models";
import { storage } from "@/lib/storage";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  

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

    // Persist the initial message locally and navigate immediately
    storage.setPendingInitialMessage(newChatId, {
      content: finalContent,
      model,
      webSearch,
      attachments,
    });

    router.push(`/c/${newChatId}`);
  };

  return (
    <>
      <SignedIn>
        <div className="flex flex-col h-full relative">
          <div className="flex-1 flex items-center justify-center">
            <span className="text-6xl font-semibold text-center text-[#A7A7A7]">Here to help!</span>
          </div>

          {/* Message Input Bar */}
          <div className="absolute bottom-0 max-w-4xl mx-auto left-0 right-0">
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
              <h1 className="text-4xl font-bold mb-2">ArtificialSSH Chat</h1>
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
