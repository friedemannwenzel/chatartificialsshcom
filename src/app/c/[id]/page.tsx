"use client";

import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { ChatInterface } from "@/components/ChatInterface";
import { useEffect } from "react";

export default function ChatPage() {
  const params = useParams();
  const { user } = useUser();
  const chatId = params?.id as string;

  const chat = useQuery(
    api.chats.getChatById,
    chatId ? { chatId } : "skip"
  );

  const messages = useQuery(
    api.chats.getMessagesByChat,
    chatId ? { chatId } : "skip"
  );

  const createChat = useMutation(api.chats.createChat);

  useEffect(() => {
    if (user?.id && chatId && chat === null) {
      createChat({
        chatId,
        userId: user.id,
      });
    }
  }, [user?.id, chatId, chat, createChat]);

  if (!user || !chatId) {
    return <div>Loading...</div>;
  }

  return (
    <ChatInterface 
      chatId={chatId}
      messages={messages || []}
    />
  );
} 