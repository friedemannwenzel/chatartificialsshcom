"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Plus, 
  MessageSquare, 
  PanelLeft,
  X,
  Search,
  Settings
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { QuickUsageIndicator } from "./QuickUsageIndicator";

type SidebarState = "open" | "collapsed";

interface SidebarProps {
  state: SidebarState;
  onToggle: () => void;
  isVisible?: boolean;
}

export function Sidebar({ 
  state, 
  onToggle 
}: SidebarProps) {
  const { user } = useUser();
  const router = useRouter();
  const params = useParams();
  const currentChatId = params?.id as string;
  const [search, setSearch] = useState("");
  const [hoveredChat, setHoveredChat] = useState<string | null>(null);
  const deleteChat = useMutation(api.chats.deleteChat);

  const chats = useQuery(
    api.chats.getChatsByUser,
    user?.id ? { userId: user.id } : "skip"
  );

  const handleNewChat = () => {
    router.push('/');
  };

  interface Chat {
    _id: string;
    chatId: string;
    title?: string;
    createdAt: number;
  }

  const groupChatsByDate = (chats: Chat[]) => {
    if (!chats) return {};
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const groups: Record<string, Chat[]> = {
      Today: [],
      Yesterday: [],
      "This Week": [],
      "This Month": [],
      Older: [],
    };

    chats.forEach((chat) => {
      const chatDate = new Date(chat.createdAt);
      
      if (chatDate >= today) {
        groups.Today.push(chat);
      } else if (chatDate >= yesterday) {
        groups.Yesterday.push(chat);
      } else if (chatDate >= thisWeek) {
        groups["This Week"].push(chat);
      } else if (chatDate >= thisMonth) {
        groups["This Month"].push(chat);
      } else {
        groups.Older.push(chat);
      }
    });

    Object.keys(groups).forEach(key => {
      if (groups[key].length === 0) {
        delete groups[key];
      }
    });

    return groups;
  };

  const filteredChats = (chats || []).filter(chat =>
    chat.title?.toLowerCase().includes(search.toLowerCase())
  );
  const chatGroups = groupChatsByDate(filteredChats);

  const getUserInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // When completely collapsed, only show floating action button
  if (state === "collapsed") {
    return (
      <div className="fixed top-6 left-6 z-50 flex flex-col gap-3">
        <Button
          onClick={onToggle}
          className={cn(
            "h-12 w-12 rounded-full shadow-lg backdrop-blur-xl border border-white/20",
            "bg-card/80 hover:bg-card/90 text-foreground",
            "transition-all duration-300 ease-out",
            "hover:shadow-xl hover:scale-105 active:scale-95",
            "shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.16)]"
          )}
        >
          <PanelLeft className="h-5 w-5" />
        </Button>

        <Button
          onClick={handleNewChat}
          className={cn(
            "h-12 w-12 rounded-full shadow-lg backdrop-blur-xl border border-white/20",
            "bg-primary/20 hover:bg-primary/30 text-primary-foreground",
            "transition-all duration-300 ease-out",
            "hover:shadow-xl hover:scale-105 active:scale-95",
            "shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.16)]"
          )}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-80 h-full pr-6 flex items-center">
      <div className={cn(
        "w-full h-[calc(100vh-4rem)] rounded-r-[20px]",
        "bg-[#151515] backdrop-blur-2xl border-r border-t border-b border-[#2C2C2C]",
        "shadow-[0_24px_64px_rgba(0,0,0,0.15)]",
        "flex flex-col",
        "transition-all duration-300 ease-out"
      )}>
        <div className="p-4 flex-shrink-0 border-b border-[#2C2C2C]/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search chats..."
                  className="w-full rounded-[20px] border border-[#2C2C2C] bg-[#151515] px-3 py-1.5 pl-9 text-sm text-[#A7A7A7] hover:cursor-pointer focus:outline-none"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#5D5D5D]" />
              </div>
              
              <Button
                onClick={handleNewChat}
                size="sm"
                className={cn(
                  "h-8 w-8 rounded-full hover:cursor-pointer",
                  "bg-[#151515] hover:bg-[#2C2C2C]",
                  "border border-[#2C2C2C]"
                )}
              >
                <Plus className="h-5 w-5 text-[#5D5D5D]" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <ScrollArea className="h-full">
            <div className="px-4 py-4 space-y-4">
              {Object.entries(chatGroups).map(([groupName, groupChats]) => (
                <div key={groupName}>
                  <h3 className="text-xs font-medium text-muted-foreground mb-2 px-2 uppercase tracking-wider">
                    {groupName}
                  </h3>
                  <div className="space-y-1">
                    {groupChats.map((chat) => (
                      <div
                        key={chat._id}
                        onMouseEnter={() => setHoveredChat(chat._id)}
                        onMouseLeave={() => setHoveredChat(null)}
                        className="relative group"
                      >
                        <Link
                          href={`/c/${chat.chatId}`}
                          className={cn(
                            "flex items-center px-3 py-2 text-sm transition-all duration-200 border border-transparent w-full relative",
                            "rounded-[20px] min-h-[36px]",
                            "hover:bg-[#2C2C2C] hover:border-[#2C2C2C] hover:text-[#A7A7A7] hover:cursor-pointer",
                            currentChatId === chat.chatId 
                              ? "bg-[#2C2C2C] border-[#2C2C2C] shadow-md" 
                              : ""
                          )}
                        >
                          <span className={cn(
                            "block flex-1 min-w-0",
                            "truncate",
                            "max-w-[200px]",
                            currentChatId === chat.chatId 
                              ? "text-[#A7A7A7]" 
                              : "text-[#5D5D5D]"
                          )}>
                            {chat.title || "New Chat"}
                          </span>
                          {hoveredChat === chat._id && (
                            <button
                              onClick={async e => {
                                e.preventDefault();
                                e.stopPropagation();
                                await deleteChat({ chatId: chat.chatId });
                              }}
                              className={cn(
                                "absolute right-2 top-1/2 transform -translate-y-1/2",
                                "h-6 w-6 rounded-full",
                                "flex items-center justify-center",
                                "transition-all duration-200",
                                "hover:bg-red-500/20 hover:cursor-pointer",
                                "text-[#5D5D5D] hover:text-red-500",
                                "opacity-100 z-10"
                              )}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {Object.keys(chatGroups).length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <div className={cn(
                    "h-12 w-12 mx-auto mb-3 rounded-[20px]",
                    "bg-[#151515] border border-[#2C2C2C]",
                    "flex items-center justify-center"
                  )}>
                    <MessageSquare className="h-6 w-6 opacity-50" />
                  </div>
                  <p className="text-sm font-medium">No chats yet</p>
                  <p className="text-xs opacity-70 mt-1">Start a new conversation!</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="flex-shrink-0 p-4 border-t border-[#2C2C2C]/30 bg-[#151515] rounded-b-[20px]">
          <Link href="/settings">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 h-auto p-3 rounded-2xl",
                "hover:bg-[#2C2C2C] border border-[#2C2C2C] hover:cursor-pointer text-[#A7A7A7]",
                "transition-all duration-200",
                "shadow-sm hover:shadow-md"
              )}
            >
              <div className="flex items-center gap-3 flex-1">
                <Avatar className="h-8 w-8 ring-2 ring-white/20">
                  <AvatarImage src={user?.imageUrl} />
                  <AvatarFallback className="text-xs bg-[#151515]">
                    {getUserInitials(user?.fullName)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex flex-col items-start text-left flex-1 gap-1 min-w-0">
                  <span className="text-sm font-medium truncate max-w-[140px]">
                    {user?.fullName || user?.emailAddresses[0]?.emailAddress || "User"}
                  </span>
                  <QuickUsageIndicator />
                </div>
              </div>
              
              <Settings className="h-4 w-4 text-[#5D5D5D] opacity-70" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 