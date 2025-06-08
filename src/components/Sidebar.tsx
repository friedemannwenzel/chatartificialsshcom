"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export function Sidebar() {
  const { user } = useUser();
  const router = useRouter();
  const params = useParams();
  const currentChatId = params?.id as string;

  const chats = useQuery(
    api.chats.getChatsByUser,
    user?.id ? { userId: user.id } : "skip"
  );

  const handleNewChat = () => {
    const newChatId = uuidv4();
    router.push(`/c/${newChatId}`);
  };

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Chats</h2>
        <Button
          onClick={handleNewChat}
          size="sm"
          className="h-8 w-8 p-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {chats?.map((chat) => (
            <Link
              key={chat._id}
              href={`/c/${chat.chatId}`}
              className={`flex items-center gap-3 rounded-md p-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${
                currentChatId === chat.chatId ? "bg-accent" : ""
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span className="truncate">
                {chat.title || "New Chat"}
              </span>
            </Link>
          ))}
          
          {chats?.length === 0 && (
            <div className="text-center text-muted-foreground p-4">
              No chats yet. Start a new conversation!
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
} 