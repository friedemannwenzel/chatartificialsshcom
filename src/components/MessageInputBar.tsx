"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Globe, ChevronDown, Sparkles, Brain, Eye, X, Paperclip, FileText, Image as ImageIcon, FileVideo, FileAudio, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { models, AIModel } from "@/lib/models";
import { storage, CloudSyncOptions, UserPreferences } from "@/lib/storage";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Image from "next/image";
import { generateUploadButton } from "@uploadthing/react";
import type { MessageAttachmentRouter } from "@/app/api/uploadthing/core";

interface MessageInputBarProps {
  onSendMessage: (content: string, model: AIModel, webSearch?: boolean, attachments?: Array<{ url: string; name: string; type: string; size?: number }>) => void;
  disabled?: boolean;
  placeholder?: string;
}

const getProviderIcon = (provider: string) => {
  switch (provider) {
    case 'openai':
      return "/OpenAI.svg";
    case 'google':
      return "/Gemini.svg";
    case 'anthropic':
      return "/Anthropic.svg";
    case 'xai':
      return "/Xai.svg";
    default:
      return null;
  }
};

const getModelIcon = (model: AIModel) => {
  if (model.capabilities?.includes('reasoning')) {
    return <Brain className="w-4 h-4" />;
  }
  if (model.capabilities?.includes('vision')) {
    return <Eye className="w-4 h-4" />;
  }
  if (model.capabilities?.includes('web-search')) {
    return <Globe className="w-4 h-4" />;
  }
  return <Sparkles className="w-4 h-4" />;
};



// Auto-resize textarea hook
const useAutoSizeTextArea = (
  textAreaRef: HTMLTextAreaElement | null,
  value: string
) => {
  useEffect(() => {
    if (textAreaRef) {
      textAreaRef.style.height = "0px";
      const scrollHeight = textAreaRef.scrollHeight;
      textAreaRef.style.height = Math.min(scrollHeight, 200) + "px";
    }
  }, [textAreaRef, value]);
};

const AttachmentUploadButton = generateUploadButton<MessageAttachmentRouter>();

export function MessageInputBar({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Type your message here..." 
}: MessageInputBarProps) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<Array<{ url: string; name: string; type: string; size?: number }>>([]);
  const [selectedModel, setSelectedModel] = useState<AIModel>(() => storage.getSelectedModel());
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<string>("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useUser();

  // Convex mutations and queries
  const updateSelectedModel = useMutation(api.preferences.updateSelectedModel);
  const setUserPreferences = useMutation(api.preferences.setUserPreferences);
  const getUserPreferences = useQuery(
    api.preferences.getUserPreferences,
    user?.id ? { userId: user.id } : "skip"
  );

  useAutoSizeTextArea(textAreaRef.current, message);

  // Load preferences from cloud on component mount
  useEffect(() => {
    if (user?.id) {
      const cloudSync: CloudSyncOptions = {
        userId: user.id,
        updateCloudPreferences: async (userId: string, preferences: UserPreferences) => {
          await setUserPreferences({
            userId,
            selectedModel: preferences.selectedModel,
            theme: preferences.theme,
          });
        },
        getCloudPreferences: async () => {
          return null;
        },
      };

      storage.loadFromCloud(cloudSync).then((preferences) => {
        if (preferences.selectedModel.id !== selectedModel.id) {
          setSelectedModel(preferences.selectedModel);
        }
      });
    }
  }, [user?.id, setUserPreferences, selectedModel.id]);

  // Sync cloud preferences when they're loaded
  useEffect(() => {
    if (getUserPreferences && user?.id) {
      const cloudModel = getUserPreferences.selectedModel;
      if (cloudModel && cloudModel.id !== selectedModel.id) {
        const validCloudModel = cloudModel as AIModel;
        setSelectedModel(validCloudModel);
        storage.setSelectedModel(validCloudModel);
      }
    }
  }, [getUserPreferences, selectedModel.id, user?.id]);

  const handleModelChange = (model: AIModel) => {
    setSelectedModel(model);
    
    const cloudSync: CloudSyncOptions | undefined = user?.id ? {
      userId: user.id,
      updateCloudPreferences: async (userId: string, preferences: UserPreferences) => {
        await setUserPreferences({
          userId,
          selectedModel: preferences.selectedModel,
          theme: preferences.theme,
        });
      },
    } : undefined;

    storage.setSelectedModel(model, cloudSync);
    
    // Also update just the model in the cloud
    if (user?.id) {
      updateSelectedModel({
        userId: user.id,
        selectedModel: model,
      });
    }
  };

  const handleSend = async () => {
    if (disabled) return;

    const trimmed = message.trim();
    const hasContent = trimmed.length > 0 || attachments.length > 0;
    if (!hasContent) return;

    // Clear any previous rate limit error
    setRateLimitError("");

    // Check rate limit before sending
    try {
      const response = await fetch('/api/rate-limit', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to check rate limit');
      }

      const rateLimit = await response.json();
      
      if (!rateLimit.canSendMessage) {
        const resetDate = new Date(rateLimit.resetDate).toLocaleDateString();
        setRateLimitError(`Rate limit exceeded. You have used ${rateLimit.currentCount}/${rateLimit.limit} messages this week. Your limit resets on ${resetDate}.`);
        return;
      }

      onSendMessage(trimmed, selectedModel, webSearchEnabled, attachments);
      setMessage("");
      setAttachments([]);
    } catch (error) {
      console.error('Rate limit check failed:', error);
      setRateLimitError("Failed to check rate limit. Please try again.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const groupedModels = models.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, AIModel[]>);

  const providerLabels = {
    openai: "OpenAI",
    google: "Google",
    anthropic: "Anthropic",
    xai: "xAI",
  };

  const providerIcon = getProviderIcon(selectedModel.provider);

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (fileName: string) => {
    const lower = fileName.toLowerCase();
    if ([".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg"].some(ext => lower.endsWith(ext))) {
      return <ImageIcon className="w-4 h-4" />;
    }
    if ([".mp4", ".mov", ".avi", ".webm", ".mkv"].some(ext => lower.endsWith(ext))) {
      return <FileVideo className="w-4 h-4" />;
    }
    if ([".mp3", ".wav", ".flac", ".aac", ".ogg"].some(ext => lower.endsWith(ext))) {
      return <FileAudio className="w-4 h-4" />;
    }
    if (lower.endsWith(".pdf")) {
      return <FileText className="w-4 h-4 text-red-600" />;
    }
    if ([".doc", ".docx", ".txt", ".rtf"].some(ext => lower.endsWith(ext))) {
      return <FileText className="w-4 h-4 text-blue-600" />;
    }
    if ([".xls", ".xlsx", ".csv"].some(ext => lower.endsWith(ext))) {
      return <FileText className="w-4 h-4 text-green-600" />;
    }
    if ([".ppt", ".pptx"].some(ext => lower.endsWith(ext))) {
      return <FileText className="w-4 h-4 text-orange-600" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  return (
    <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-4xl mx-auto p-4">
        <div className="flex flex-col gap-3">
          {/* Rate Limit Error Alert */}
          {rateLimitError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{rateLimitError}</AlertDescription>
            </Alert>
          )}
          {/* Model Selection and Web Search Row */}
          <div className="flex items-center gap-3 flex-wrap">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 h-9 px-3"
                >
                  <div className="flex items-center gap-2">
                    {providerIcon && (
                      <Image
                        src={providerIcon}
                        alt={selectedModel.provider}
                        width={16}
                        height={16}
                        className="w-4 h-4"
                      />
                    )}
                    <span className="font-medium">{selectedModel.name}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-80">
                {Object.entries(groupedModels).map(([provider, providerModels]) => (
                  <div key={provider}>
                    <DropdownMenuLabel className="flex items-center gap-2">
                      {getProviderIcon(provider) && (
                        <Image
                          src={getProviderIcon(provider)!}
                          alt={provider}
                          width={16}
                          height={16}
                          className="w-4 h-4"
                        />
                      )}
                      {providerLabels[provider as keyof typeof providerLabels]}
                    </DropdownMenuLabel>
                    {providerModels.map((model) => (
                      <DropdownMenuItem
                        key={model.id}
                        onSelect={() => handleModelChange(model)}
                        className="flex items-center justify-between py-2"
                      >
                        <div className="flex items-center gap-2">
                          {getModelIcon(model)}
                          <div className="flex flex-col">
                            <span className="font-medium">{model.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {model.description}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {model.supportsWebSearch && (
                            <Globe className="w-3 h-3 text-muted-foreground" />
                          )}
                          {selectedModel.id === model.id && (
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                        </div>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Web Search Toggle - Only show for Gemini models */}
            {selectedModel.supportsWebSearch && (
              <div
                className="flex items-center gap-2 cursor-pointer select-none"
                onClick={() => setWebSearchEnabled((prev) => !prev)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setWebSearchEnabled((prev) => !prev);
                  }
                }}
                aria-pressed={webSearchEnabled}
              >
                <Globe className={`w-4 h-4 ${webSearchEnabled ? "text-blue-600" : "text-muted-foreground"}`} />
                <span className={`text-sm font-medium ${webSearchEnabled ? "text-blue-600" : ""}`}>
                  Web Search
                </span>
              </div>
            )}

            {/* Upload Button */}
            <AttachmentUploadButton
              endpoint="messageAttachment"
              onClientUploadComplete={(res: Array<{ url: string; name: string; type: string; size: number }>) => {
                if (!res) return;
                const files = res.map((f) => ({
                  url: f.url,
                  name: f.name,
                  type: f.type,
                  size: f.size,
                }));
                setAttachments((prev) => [...prev, ...files]);
              }}
              onUploadError={() => {}}
              className="ut-button:h-9 ut-button:w-9 ut-button:p-0 ut-button:bg-muted ut-button:hover:bg-muted/70 ut-button:rounded-md ut-button:text-foreground"
              appearance={{
                allowedContent: "hidden",
              }}
              content={{
                button: () => <Paperclip className="w-4 h-4" />,
              }}
            />
          </div>

          {/* Attached Files Display */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 text-sm border"
                >
                  {getFileIcon(file.name)}
                  <span className="truncate max-w-32">{file.name}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-4 w-4 p-0 hover:bg-destructive/20"
                    onClick={() => removeAttachment(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Message Input Row */}
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <Textarea
                ref={textAreaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                className="min-h-[44px] max-h-[200px] resize-none pr-12"
                rows={1}
              />
              <div className="absolute right-2 top-2">
                <Button
                  size="sm"
                  onClick={handleSend}
                  disabled={disabled || !message.trim()}
                  className="h-8 w-8 p-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}