"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Paperclip, X, AlertTriangle, ArrowUp, ArrowDown, ChevronUp, Brain, Eye, FileText, Square } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { models, AIModel } from "@/lib/models";
import { storage, CloudSyncOptions, UserPreferences } from "@/lib/storage";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { generateUploadButton } from "@uploadthing/react";
import { ProviderIcon } from "@/components/ProviderIcon";
import type { MessageAttachmentRouter } from "@/app/api/uploadthing/core";

interface MessageInputBarProps {
  onSendMessage: (content: string, model: AIModel, webSearch?: boolean, attachments?: Array<{ url: string; name: string; type: string; size?: number }>, reasoningEffort?: ReasoningEffort) => void;
  disabled?: boolean;
  placeholder?: string;
  showScrollButton?: boolean;
  onScrollToBottom?: () => void;
  showStopButton?: boolean;
  onStopGeneration?: () => void;
}

type ReasoningEffort = "minimal" | "low" | "medium" | "high" | "xhigh";

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

const getReasoningEffortOptions = (provider: string): ReasoningEffort[] => {
  return provider === "xai"
    ? ["low", "medium", "high", "xhigh"]
    : ["minimal", "low", "medium", "high"];
};

export function MessageInputBar({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Type your message here...",
  showScrollButton = false,
  onScrollToBottom,
  showStopButton = false,
  onStopGeneration
}: MessageInputBarProps) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<Array<{ url: string; name: string; type: string; size?: number }>>([]);
  const [uploadingFiles, setUploadingFiles] = useState<Array<{ name: string; progress: number }>>([]);
  const [selectedModel, setSelectedModel] = useState<AIModel>(() => storage.getSelectedModel());
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [reasoningEffort, setReasoningEffort] = useState<ReasoningEffort>(() => storage.getSelectedModel().defaultReasoningEffort || "medium");
  const [rateLimitError, setRateLimitError] = useState<string>("");
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const modelSelectorRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();

  const updateSelectedModel = useMutation(api.preferences.updateSelectedModel);
  const setUserPreferences = useMutation(api.preferences.setUserPreferences);
  const getUserPreferences = useQuery(
    api.preferences.getUserPreferences,
    user?.id ? { userId: user.id } : "skip"
  );

  useAutoSizeTextArea(textAreaRef.current, message);

  useEffect(() => {
    if (getUserPreferences && user?.id) {
      const cloudModel = getUserPreferences.selectedModel;
      if (cloudModel && cloudModel.id !== selectedModel.id) {
        const validCloudModel = cloudModel as AIModel;
        setSelectedModel(validCloudModel);
        storage.setSelectedModel(validCloudModel);
      }
    }
  }, [getUserPreferences, user?.id, selectedModel.id]);

  // Handle closing the model selector when clicking outside
  useEffect(() => {
    if (!modelSelectorOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        modelSelectorRef.current &&
        !modelSelectorRef.current.contains(event.target as Node)
      ) {
        setModelSelectorOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
    };
  }, [modelSelectorOpen]);

  const handleModelChange = (model: AIModel) => {
    setSelectedModel(model);
    setReasoningEffort(model.defaultReasoningEffort || "medium");
    setModelSelectorOpen(false);
    
    const cloudSync: CloudSyncOptions | undefined = user?.id ? {
      userId: user.id,
      updateCloudPreferences: async (userId: string, preferences: UserPreferences) => {
        await setUserPreferences({
          userId,
          selectedModel: preferences.selectedModel,
        });
      },
    } : undefined;

    storage.setSelectedModel(model, cloudSync);
    
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

    setRateLimitError("");
    onSendMessage(trimmed, selectedModel, webSearchEnabled, attachments, reasoningEffort);
    setMessage("");
    setAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
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
    xai: "Grok",
  };

  return (
    <div className="">
      <div className="max-w-full mx-auto p-0">
        <div className="flex flex-col gap-0">
          {rateLimitError && (
            <Alert variant="destructive" className="mb-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{rateLimitError}</AlertDescription>
            </Alert>
          )}

          {/* Attachments and scroll button bar */}
          {(attachments.length > 0 || uploadingFiles.length > 0 || showScrollButton || showStopButton) && (
            <div className="flex flex-wrap items-center gap-2 py-2 min-h-[52px]">
              {/* Completed attachments */}
              {attachments.map((file, index) => (
                <div
                  key={`attachment-${index}`}
                  className="flex items-center gap-2 bg-elevated rounded-[20px] px-3 py-3 text-xs border border-line shadow-none group hover:cursor-pointer text-dim"
                >
                  <Paperclip className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate max-w-32 font-medium">{file.name}</span>
                  <button
                    className="h-4 w-4 p-0 ml-1  rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:cursor-pointer"
                    onClick={() => removeAttachment(index)}
                    tabIndex={-1}
                    type="button"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {/* Uploading files with progress */}
              {uploadingFiles.map((file, index) => (
                <div
                  key={`uploading-${index}`}
                  className="flex items-center gap-2 bg-elevated rounded-[20px] px-3 py-3 text-xs border border-line shadow-none relative overflow-hidden"
                >
                  {/* Progress background */}
                  <div
                    className="absolute inset-0 bg-hover/40 transition-all duration-300"
                    style={{
                      width: `${file.progress}%`,
                    }}
                  />
                  
                  {/* Content */}
                  <div className="relative z-10 flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-line-strong border-t-transparent" />
                    <span className="truncate max-w-32 font-medium text-dim">{file.name}</span>
                    <span className="text-dim text-[10px] font-mono">{Math.round(file.progress)}%</span>
                  </div>
                </div>
              ))}

              {/* Scroll to bottom button */}
              {showScrollButton && (
                <div className="flex-1 flex justify-end">
                  <Button
                    onClick={onScrollToBottom}
                    size="sm"
                    className="py-3 px-4 rounded-[20px] bg-elevated text-faint hover:text-dim border border-line shadow-lg hover:bg-hover transition-all duration-200 hover:cursor-pointer flex items-center gap-2"
                    variant="secondary"
                    type="button"
                  >
                    <span className="text-sm">Scroll to bottom</span>
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {showStopButton && (
                <div className="flex-1 flex justify-center">
                  <button
                    onClick={onStopGeneration}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-line bg-elevated text-dim hover:bg-hover transition-colors text-sm hover:cursor-pointer"
                    type="button"
                  >
                    <Square className="w-3 h-3 fill-current" />
                    Stop generating
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Message Input Bar */}
          <div className="relative w-full bg-elevated rounded-t-[20px] border-t border-l border-r border-line flex flex-col">
            {/* Textarea */}
            <div className="w-full px-3 py-1">
              <Textarea
                ref={textAreaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                className="min-h-[40px] max-h-[120px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-base text-ink placeholder:text-faint px-0"
                rows={1}
                style={{
                  background: "transparent",
                  boxShadow: "none",
                  fontSize: "1rem",
                  paddingLeft: 0,
                  paddingRight: 0,
                }}
              />
            </div>
            <div className="flex items-center w-full px-3 py-1 gap-2">
              {/* Model Selector */}
              <div className="relative" ref={modelSelectorRef}>
                <button
                  type="button"
                  onClick={() => setModelSelectorOpen(!modelSelectorOpen)}
                  className="flex items-center gap-2 h-8 px-3 text-xs font-medium rounded-full border border-line-strong bg-elevated hover:bg-hover focus:outline-none transition hover:cursor-pointer text-dim"
                  style={{ minWidth: 0 }}
                >
                  <ProviderIcon provider={selectedModel.provider} size={16} className="w-4 h-4" />
                  <span className="truncate max-w-[100px]">{selectedModel.name}</span>
                  {modelSelectorOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {/* Model Dropdown */}
                {modelSelectorOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-80 bg-elevated border border-line rounded-[20px] shadow-lg z-50">
                    <div className="max-h-64 overflow-y-auto">
                      {Object.entries(groupedModels).map(([provider, providerModels]) => (
                        <div key={provider} className="p-2">
                          <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground">
                            <ProviderIcon provider={provider} size={16} className="w-4 h-4" />
                            {providerLabels[provider as keyof typeof providerLabels]}
                          </div>
                          {providerModels.map((model) => (
                            <TooltipProvider key={model.id}>
                              <button
                                onClick={() => handleModelChange(model)}
                                className={`w-full flex items-center justify-between p-2 hover:bg-muted/50 rounded-[20px] text-left hover:cursor-pointer ${
                                  selectedModel.id === model.id ? "bg-muted/30" : ""
                                }`}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span className="font-medium text-xs">{model.name}</span>
                                  <div className="flex items-center gap-1 ml-2">
                                    {model.isReasoningModel && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Brain className="w-3 h-3 text-dim" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Reasoning Model</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    )}
                                    {model.supportsVision && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Eye className="w-3 h-3 text-green-400" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Vision Capabilities</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    )}
                                    {model.supportsFileUpload && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <FileText className="w-3 h-3 text-purple-400" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>File Upload Support</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    )}
                                    {selectedModel.id === model.id && (
                                      <div className="w-2 h-2 bg-primary rounded-full ml-1" />
                                    )}
                                  </div>
                                </div>
                              </button>
                            </TooltipProvider>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Web Search Toggle */}
              {selectedModel.supportsWebSearch && (
                <button
                  type="button"
                  onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                  className={`flex items-center gap-1 h-8 px-3 text-xs rounded-full border border-line bg-elevated transition hover:cursor-pointer text-faint ${
                    webSearchEnabled
                      ? "text-dim border-line-strong hover:cursor-pointer"
                      : "hover:bg-hover hover:cursor-pointer"
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  Search
                </button>
              )}

              {selectedModel.supportsReasoningEffort && (
                <DropdownMenu>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="flex items-center gap-2 h-8 px-3 text-xs font-medium rounded-full border border-line-strong bg-elevated hover:bg-hover focus:outline-none transition hover:cursor-pointer text-dim"
                          >
                            <Brain className="w-4 h-4 text-dim" />
                            <span className="truncate max-w-[100px]">{reasoningEffort}</span>
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Reasoning effort</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <DropdownMenuContent align="start" className="bg-elevated border-line text-dim">
                    {getReasoningEffortOptions(selectedModel.provider).map((effort) => (
                      <DropdownMenuItem
                        key={effort}
                        onClick={() => setReasoningEffort(effort)}
                        className="text-xs hover:cursor-pointer focus:bg-hover focus:text-ink"
                      >
                        <Brain className="mr-2 h-3.5 w-3.5 text-dim" />
                        {effort}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Upload Button */}
              {(selectedModel.supportsVision || selectedModel.supportsFileUpload) ? (
                <AttachmentUploadButton
                  endpoint="messageAttachment"
                  onUploadBegin={(name: string) => {
                    setUploadingFiles((prev) => [...prev, { name, progress: 0 }]);
                  }}
                  onUploadProgress={(progress: number) => {
                    setUploadingFiles((prev) => 
                      prev.map((file, index) => 
                        index === prev.length - 1 ? { ...file, progress } : file
                      )
                    );
                  }}
                  onClientUploadComplete={(res: Array<{ url: string; name: string; type: string; size: number }>) => {
                    if (!res) return;
                    const files = res.map((f) => ({
                      url: f.url,
                      name: f.name,
                      type: f.type,
                      size: f.size,
                    }));
                    setAttachments((prev) => [...prev, ...files]);
                    setUploadingFiles([]);
                  }}
                  onUploadError={() => {
                    setUploadingFiles([]);
                  }}
                  className=""
                  appearance={{
                    allowedContent: "hidden",
                    button: "",
                  }}
                  content={{
                    button: ({ isUploading, uploadProgress }) => (
                      <div
                        className={`border rounded-[20px] transition-all duration-200 p-2 flex items-center justify-center relative overflow-hidden
                          ${attachments.length > 0
                            ? " border-line-strong text-dim hover:bg-hover"
                            : "bg-transparent border-line text-faint hover:bg-hover hover:text-dim"
                          }
                          ${isUploading ? "border-line-strong text-dim" : ""}
                          hover:cursor-pointer
                        `}
                      >
                        {isUploading && (
                          <div
                            className="absolute inset-0 bg-hover transition-all duration-300"
                            style={{
                              width: `${uploadProgress}%`,
                            }}
                          />
                        )}
                        <div className="relative z-10 flex items-center justify-center">
                          {isUploading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-line-strong border-t-transparent" />
                          ) : (
                            <Paperclip className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    ),
                  }}
                />
              ) : (
                <div
                  className="border rounded-[20px] transition-all duration-200 p-2 flex items-center justify-center bg-transparent border-line text-faint opacity-50 cursor-not-allowed"
                  title="This model doesn't support file uploads"
                >
                  <Paperclip className="w-4 h-4" />
                </div>
              )}

              {/* Spacer */}
              <div className="flex-1" />

              {/* Send Button */}
              <button
                type="button"
                onClick={handleSend}
                disabled={disabled || (!message.trim() && attachments.length === 0)}
                className={`flex items-center justify-center h-8 w-8 rounded-full border border-ink bg-ink text-white transition p-0 hover:cursor-pointer hover:bg-body ${
                  disabled || (!message.trim() && attachments.length === 0)
                    ? "opacity-40 cursor-not-allowed"
                    : ""
                }`}
                style={{ marginRight: 0 }}
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
