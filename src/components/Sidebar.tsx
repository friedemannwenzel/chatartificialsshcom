"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Plus, 
  MessageSquare, 
  PanelLeftClose, 
  PanelLeftOpen,
  Settings,
  Moon,
  Sun,
  Monitor
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { user } = useUser();
  const router = useRouter();
  const params = useParams();
  const currentChatId = params?.id as string;
  const { setTheme, theme } = useTheme();

  const chats = useQuery(
    api.chats.getChatsByUser,
    user?.id ? { userId: user.id } : "skip"
  );

  const handleNewChat = () => {
    const newChatId = uuidv4();
    router.push(`/c/${newChatId}`);
  };

  const groupChatsByDate = (chats: any[]) => {
    if (!chats) return {};
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const groups: Record<string, any[]> = {
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

    // Remove empty groups
    Object.keys(groups).forEach(key => {
      if (groups[key].length === 0) {
        delete groups[key];
      }
    });

    return groups;
  };

  const chatGroups = groupChatsByDate(chats || []);

  const getUserInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={cn(
      "flex h-full flex-col border-r bg-background transition-all duration-300",
      isCollapsed ? "w-12" : "w-64"
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center p-4 border-b",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {isCollapsed ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-8 w-8 p-0"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </Button>
        ) : (
          <div className="flex items-center gap-3 w-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-8 w-8 p-0"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
            
            <h2 className="text-lg font-semibold">T3 Chat</h2>
            <div className="flex items-center gap-1 ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    {theme === "light" ? (
                      <Sun className="h-4 w-4" />
                    ) : theme === "dark" ? (
                      <Moon className="h-4 w-4" />
                    ) : (
                      <Monitor className="h-4 w-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    <Sun className="mr-2 h-4 w-4" />
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <Moon className="mr-2 h-4 w-4" />
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    <Monitor className="mr-2 h-4 w-4" />
                    System
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button
                onClick={handleNewChat}
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {!isCollapsed && (
        <>
          {/* Chat History */}
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-4">
              {Object.entries(chatGroups).map(([groupName, groupChats]) => (
                <div key={groupName}>
                  <h3 className="text-xs font-medium text-muted-foreground mb-2 px-2">
                    {groupName}
                  </h3>
                  <div className="space-y-1">
                    {groupChats.map((chat) => (
                      <Link
                        key={chat._id}
                        href={`/c/${chat.chatId}`}
                        className={cn(
                          "flex items-center gap-3 rounded-md p-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors",
                          currentChatId === chat.chatId ? "bg-accent" : ""
                        )}
                      >
                        <span className="truncate">
                          {chat.title || "New Chat"}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              
              {Object.keys(chatGroups).length === 0 && (
                <div className="text-center text-muted-foreground p-4">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No chats yet</p>
                  <p className="text-xs">Start a new conversation!</p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* User Profile */}
          <div className="border-t p-2">
            <Link href="/settings">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-auto p-3"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.imageUrl} />
                  <AvatarFallback className="text-xs">
                    {getUserInitials(user?.fullName)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-medium truncate max-w-[120px]">
                    {user?.fullName || user?.emailAddresses[0]?.emailAddress || "User"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Free Plan
                  </span>
                </div>
                
                <Settings className="h-4 w-4 ml-auto opacity-60" />
              </Button>
            </Link>
          </div>
        </>
      )}

      {isCollapsed && (
        <div className="flex-1 flex flex-col items-center justify-center p-2">
          <Button
            onClick={handleNewChat}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 opacity-60 hover:opacity-100"
            title="New Chat"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
} 