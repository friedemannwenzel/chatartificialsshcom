"use client";

import { useState } from "react";
import { MoreHorizontal, RotateCcw, Edit, Copy, GitBranch, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessageActionsProps {
  messageId: string;
  messageIndex: number;
  role: "user" | "assistant";
  content: string;
  model?: string;
  onRetry: (messageIndex: number) => void;
  onEdit: (messageId: string, content: string) => void;
  onCopy: (content: string, messageId: string) => void;
  onBranch: (messageIndex: number) => void;
  hoveredMessage: string | null;
  setHoveredMessage: (id: string | null) => void;
  copiedMessage: string | null;
}

export function MessageActions({
  messageId,
  messageIndex,
  role,
  content,
  model,
  onRetry,
  onEdit,
  onCopy,
  onBranch,
  hoveredMessage,
  setHoveredMessage,
  copiedMessage,
}: MessageActionsProps) {
  const isHovered = hoveredMessage === messageId;
  const showActions = isHovered;
  const isCopied = copiedMessage === messageId;

  return (
    <div className={`flex ${role === "user" ? "justify-end" : "justify-start"} mt-2`}>
      <div 
        className="flex items-center gap-1"
        onMouseEnter={() => setHoveredMessage(messageId)}
        onMouseLeave={() => setHoveredMessage(null)}
      >
        {!showActions ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 transition-opacity duration-200 hover:bg-[#2C2C2C] cursor-pointer text-[#A7A7A7]"
          >
            <MoreHorizontal className="h-3 w-3 text-[#A7A7A7]" />
          </Button>
        ) : (
          <div className="flex items-center gap-1 text-[#5D5D5D] hover:text-[#A7A7A7]">
            {role === "user" ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:text-[#A7A7A7] transition-colors cursor-pointer"
                  onClick={() => onRetry(messageIndex)}
                  title="Retry"
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:text-[#A7A7A7] transition-colors cursor-pointer"
                  onClick={() => onEdit(messageId, content)}
                  title="Edit"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:text-[#A7A7A7] transition-colors cursor-pointer"
                  onClick={() => onCopy(content, messageId)}
                  title="Copy"
                >
                  {isCopied ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:text-[#A7A7A7] transition-colors cursor-pointer"
                  onClick={() => onRetry(messageIndex)}
                  title="Retry"
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:text-[#A7A7A7] transition-colors cursor-pointer"
                  onClick={() => onCopy(content, messageId)}
                  title="Copy"
                >
                  {isCopied ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:text-[#A7A7A7] transition-colors cursor-pointer"
                  onClick={() => onBranch(messageIndex)}
                  title="Branch"
                >
                  <GitBranch className="h-3 w-3" />
                </Button>
                {model && (
                  <span className="text-xs text-muted-foreground px-2 py-1 bg-white/5 rounded-[20px] ml-2">
                    {model}
                  </span>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 