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
  Settings,
  Moon,
  Sun,
  Monitor,
  X,
  Search
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { QuickUsageIndicator } from "./QuickUsageIndicator";

type SidebarState = "open" | "collapsed" | "hover";

interface SidebarProps {
  state: SidebarState;
  isHovering: boolean;
  isVisible: boolean;
  isFloating: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export function Sidebar({ 
  state, 
  isHovering, 
  isFloating, 
  onToggle, 
  onClose 
}: SidebarProps) {
  const { user } = useUser();
  const router = useRouter();
  const params = useParams();
  const currentChatId = params?.id as string;
  const { setTheme, theme } = useTheme();
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
  if (state === "collapsed" && !isHovering) {
    return (
      <div className="fixed top-6 left-6 z-50 flex flex-col gap-3">
        {/* Sidebar Toggle Button */}
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

        {/* New Chat Button */}
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

  // Floating sidebar (when hovering over collapsed state)
  if (isFloating) {
    return (
      <>
        {/* Backdrop Blur Overlay */}
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 transition-all duration-300"
          onClick={onClose}
        />
        
        {/* Floating Sidebar Panel */}
        <div 
          className="fixed inset-y-0 left-0 z-40 transition-all duration-300 ease-out"
          onMouseLeave={(e) => {
            // Add delay before closing to allow cursor to reach delete button
            setTimeout(() => {
              // Check if cursor is still outside the sidebar area
              const rect = e.currentTarget.getBoundingClientRect();
              if (e.clientX < rect.left || e.clientX > rect.right || 
                  e.clientY < rect.top || e.clientY > rect.bottom) {
                onClose();
              }
            }, 200);
          }}
        >
          <div className="h-full p-4 flex items-center">
            <div className={cn(
              "w-full h-[calc(100vh-2rem)] rounded-[var(--radius)]",
              "bg-card/70 backdrop-blur-2xl border border-white/20",
              "shadow-[0_24px_64px_rgba(0,0,0,0.15)]",
              "flex flex-col overflow-hidden",
              "transition-all duration-300 ease-out"
            )}>
              {/* Header with Search Bar */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold tracking-tight">ArtificialSSH</h2>
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={cn(
                            "h-8 w-8 rounded-full",
                            "hover:bg-white/10 border border-white/10",
                            "transition-all duration-200"
                          )}
                        >
                          {theme === "light" ? (
                            <Sun className="h-4 w-4" />
                          ) : theme === "dark" ? (
                            <Moon className="h-4 w-4" />
                          ) : (
                            <Monitor className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="end" 
                        className="backdrop-blur-xl bg-card/90 border border-white/20"
                      >
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
                      className={cn(
                        "h-8 w-8 rounded-full",
                        "bg-primary/20 hover:bg-primary/30",
                        "border border-white/10"
                      )}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Search Bar moved to header */}
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search chats..."
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              {/* Chat History */}
              <ScrollArea className="flex-1 h-full px-2">
                <div className="space-y-4 py-3">
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
                                "rounded-lg min-h-[36px]",
                                "hover:bg-white/10 hover:border-white/10 hover:shadow-lg",
                                currentChatId === chat.chatId 
                                  ? "bg-primary/20 border-primary/30 shadow-md" 
                                  : ""
                              )}
                            >
                              <span className="truncate block flex-1 pr-8">
                                {chat.title || "New Chat"}
                              </span>
                              {hoveredChat === chat._id && (
                                <button
                                  onClick={async e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    await deleteChat({ chatId: chat.chatId });
                                  }}
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded bg-card/90 hover:bg-destructive/20 transition-colors duration-200 border border-white/20 shadow-sm"
                                >
                                  <X className="w-3 h-3 text-destructive" />
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
                        "h-12 w-12 mx-auto mb-3 rounded-2xl",
                        "bg-white/5 border border-white/10",
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

              {/* User Profile - fixed at bottom */}
              <div className="sticky bottom-0 left-0 w-full p-4 bg-card/70 backdrop-blur-2xl border-t border-white/20">
                <Link href="/settings">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 h-auto p-3 rounded-2xl",
                      "hover:bg-white/10 border border-white/10",
                      "transition-all duration-200"
                    )}
                  >
                    <Avatar className="h-8 w-8 ring-2 ring-white/20">
                      <AvatarImage src={user?.imageUrl} />
                      <AvatarFallback className="text-xs bg-primary/20">
                        {getUserInitials(user?.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex flex-col items-start text-left flex-1">
                      <span className="text-sm font-medium truncate max-w-[160px]">
                        {user?.fullName || user?.emailAddresses[0]?.emailAddress || "User"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Free Plan
                      </span>
                    </div>
                    
                    <Settings className="h-4 w-4 opacity-60" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Normal sidebar (when open)
  return (
    <div className="w-80 h-full p-4 flex items-center">
      <div className={cn(
        "w-full h-[calc(100vh-2rem)] rounded-[var(--radius)]",
        "bg-card/70 backdrop-blur-2xl border border-white/20",
        "shadow-[0_24px_64px_rgba(0,0,0,0.15)]",
        "flex flex-col overflow-hidden",
        "transition-all duration-300 ease-out"
      )}>
        {/* Header with Search Bar */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold tracking-tight">ArtificialSSH</h2>
            <div className="flex items-center gap-2">
              <Button
                onClick={onToggle}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 rounded-full",
                  "hover:bg-white/10 border border-white/10",
                  "transition-all duration-200"
                )}
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={cn(
                      "h-8 w-8 rounded-full",
                      "hover:bg-white/10 border border-white/10",
                      "transition-all duration-200"
                    )}
                  >
                    {theme === "light" ? (
                      <Sun className="h-4 w-4" />
                    ) : theme === "dark" ? (
                      <Moon className="h-4 w-4" />
                    ) : (
                      <Monitor className="h-4 w-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end"
                  className="backdrop-blur-xl bg-card/90 border border-white/20"
                >
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
                className={cn(
                  "h-8 w-8 rounded-full",
                  "bg-primary/20 hover:bg-primary/30",
                  "border border-white/10"
                )}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Search Bar moved to header */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search chats..."
              className="w-full rounded-lg border border-input bg-background px-3 py-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        {/* Chat History */}
        <ScrollArea className="flex-1 h-full px-2">
          <div className="space-y-4 py-3">
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
                          "rounded-lg min-h-[36px]",
                          "hover:bg-white/10 hover:border-white/10 hover:shadow-lg",
                          currentChatId === chat.chatId 
                            ? "bg-primary/20 border-primary/30 shadow-md" 
                            : ""
                        )}
                      >
                        <span className="truncate block flex-1 pr-8">
                          {chat.title || "New Chat"}
                        </span>
                        {hoveredChat === chat._id && (
                          <button
                            onClick={async e => {
                              e.preventDefault();
                              e.stopPropagation();
                              await deleteChat({ chatId: chat.chatId });
                            }}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded bg-card/90 hover:bg-destructive/20 transition-colors duration-200 border border-white/20 shadow-sm"
                          >
                            <X className="w-3 h-3 text-destructive" />
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
                  "h-12 w-12 mx-auto mb-3 rounded-2xl",
                  "bg-white/5 border border-white/10",
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

        {/* User Profile - fixed at bottom */}
        <div className="sticky bottom-0 left-0 w-full p-4 bg-card/70 backdrop-blur-2xl border-t border-white/20">
          <Link href="/settings">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 h-auto p-3 rounded-2xl",
                "hover:bg-white/10 border border-white/10 hover:cursor-pointer",
                "transition-all duration-200"
              )}
            >
              <Avatar className="h-8 w-8 ring-2 ring-white/20">
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback className="text-xs bg-primary/20">
                  {getUserInitials(user?.fullName)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex flex-col items-start text-left flex-1 gap-1">
                <span className="text-sm font-medium truncate max-w-[160px]">
                  {user?.fullName || user?.emailAddresses[0]?.emailAddress || "User"}
                </span>
                <QuickUsageIndicator />
              </div>
              
              <Settings className="h-4 w-4 opacity-60" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 