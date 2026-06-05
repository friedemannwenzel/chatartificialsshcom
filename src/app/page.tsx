"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
 
import { MessageInputBar } from "@/components/MessageInputBar";
import { AIModel } from "@/lib/models";
import { storage } from "@/lib/storage";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { MarketingPage } from "@/components/marketing/MarketingPage";

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
        <div className="chat-surface relative flex h-full flex-col">
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6">
            <span className="bg-gradient-to-b from-ink to-dim bg-clip-text text-center text-5xl font-semibold tracking-tight text-transparent sm:text-6xl">
              Here to help!
            </span>
            <span className="text-sm text-faint">Pick a model, turn on search or reasoning, and ask anything.</span>
          </div>

          {/* Message Input Bar */}
          <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-4xl px-4">
            <MessageInputBar
              onSendMessage={handleSendMessage}
              disabled={isLoading}
              placeholder="Type your message to start a new conversation..."
            />
          </div>
        </div>
      </SignedIn>
      
      <SignedOut>
        <MarketingPage />
      </SignedOut>
    </>
  );
}
