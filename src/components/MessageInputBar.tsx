"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Globe, ChevronDown, Sparkles, Brain, Eye, Zap } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import { models, AIModel } from "@/lib/models";
import { storage, CloudSyncOptions, UserPreferences } from "@/lib/storage";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Image from "next/image";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface MessageInputBarProps {
  onSendMessage: (content: string, model: AIModel, webSearch?: boolean) => void;
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

const getProviderColor = (provider: string) => {
  switch (provider) {
    case 'openai':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'google':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'anthropic':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    case 'xai':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
  }
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

export function MessageInputBar({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Type your message here..." 
}: MessageInputBarProps) {
  const [message, setMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState<AIModel>(() => storage.getSelectedModel());
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
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
        getCloudPreferences: async (userId: string) => {
          return null;
        },
      };

      storage.loadFromCloud(cloudSync).then((preferences) => {
        if (preferences.selectedModel.id !== selectedModel.id) {
          setSelectedModel(preferences.selectedModel);
        }
      });
    }
  }, [user?.id, setUserPreferences]);

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

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim(), selectedModel, webSearchEnabled);
      setMessage("");
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

  return (
    <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-4xl mx-auto p-4">
        <div className="flex flex-col gap-3">
          {/* Model Selection and Web Search Row */}
          <div className="flex items-center gap-3">
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

            {/* Model Capabilities */}
            <div className="flex items-center gap-1 ml-auto">
              {selectedModel.capabilities?.map((capability) => (
                <Badge
                  key={capability}
                  variant="secondary"
                  className={`text-xs px-2 py-0.5 ${getProviderColor(selectedModel.provider)}`}
                >
                  {capability}
                </Badge>
              ))}
            </div>
          </div>

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
                className="min-h-[44px] max-h-[200px] resize-none pr-24"
                rows={1}
              />
              <div className="absolute right-2 top-2 flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  disabled
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
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