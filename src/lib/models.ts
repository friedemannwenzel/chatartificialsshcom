export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  maxTokens?: number;
  supportsStreaming: boolean;
  supportsWebSearch?: boolean;
  capabilities?: string[];
  isReasoningModel?: boolean;
  supportsVision?: boolean;
  supportsFileUpload?: boolean;
  supportsThinkingStream?: boolean;
}

export const models: AIModel[] = [
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "google",
    description: "Latest Gemini model with enhanced capabilities",
    maxTokens: 1048576,
    supportsStreaming: true,
    supportsWebSearch: true,
    capabilities: ["text", "vision", "audio", "web-search"],
    isReasoningModel: true,
    supportsVision: true,
    supportsFileUpload: true,
    supportsThinkingStream: true,
  },
  {
    id: "gemini-2.5-flash-lite-preview-06-17",
    name: "Gemini 2.5 Flash Lite",
    provider: "google",
    description: "Latest Gemini model with enhanced capabilities",
    maxTokens: 1000000,
    supportsStreaming: true,
    supportsWebSearch: true,
    capabilities: ["text", "vision", "audio", "web-search"],
    isReasoningModel: false,
    supportsVision: true,
    supportsFileUpload: true,
    supportsThinkingStream: false,
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "google",
    description: "Latest Gemini model with enhanced capabilities",
    maxTokens: 1048576,
    supportsStreaming: true,
    supportsWebSearch: true,
    capabilities: ["text", "vision", "audio", "web-search"],
    isReasoningModel: false,
    supportsVision: true,
    supportsFileUpload: true,
    supportsThinkingStream: false,
  },
  {
    id: "grok-3-mini",
    name: "Grok 3 Mini",
    provider: "xai",
    description: "A lightweight model that thinks before responding.",
    maxTokens: 131072,
    supportsStreaming: true,
    supportsWebSearch: false,
    capabilities: ["text", "vision", "code"],
    isReasoningModel: true,
    supportsVision: true,
    supportsFileUpload: false,
    supportsThinkingStream: true,
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai", 
    description: "Fast, intelligent, flexible GPT model",
    maxTokens: 128000,
    supportsStreaming: true,
    supportsWebSearch: false,
    capabilities: ["text", "vision", "code"],
    isReasoningModel: false,
    supportsVision: true,
    supportsFileUpload: true,
    supportsThinkingStream: false,
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai", 
    description: "Fast, affordable small model for focused tasks",
    maxTokens: 128000,
    supportsStreaming: true,
    supportsWebSearch: false,
    capabilities: ["text", "vision", "code"],
    isReasoningModel: false,
    supportsVision: true,
    supportsFileUpload: true,
    supportsThinkingStream: false,
  },
  {
    id: "gpt-4.1",
    name: "GPT-4.1",
    provider: "openai", 
    description: "Flagship GPT model for complex tasks",
    maxTokens: 1047576,
    supportsStreaming: true,
    supportsWebSearch: false,
    capabilities: ["text", "vision", "code"],
    isReasoningModel: false,
    supportsVision: true,
    supportsFileUpload: true,
    supportsThinkingStream: false,
  },
  {
    id: "gpt-4.1-mini",
    name: "GPT-4.1 Mini",
    provider: "openai", 
    description: "Balanced for intelligence, speed, and cost",
    maxTokens: 1047576,
    supportsStreaming: true,
    supportsWebSearch: false,
    capabilities: ["text", "vision", "code"],
    isReasoningModel: false,
    supportsVision: true,
    supportsFileUpload: true,
    supportsThinkingStream: false,
  },
  {
    id: "gpt-4.1-nano",
    name: "GPT-4.1 Nano",
    provider: "openai", 
    description: "Fastest, most cost-effective GPT-4.1 model",
    maxTokens: 1047576,
    supportsStreaming: true,
    supportsWebSearch: false,
    capabilities: ["text", "vision", "code"],
    isReasoningModel: false,
    supportsVision: true,
    supportsFileUpload: true,
    supportsThinkingStream: false,
  },
  {
    id: "o4-mini",
    name: "o4 mini",
    provider: "openai", 
    description: "Faster, more affordable reasoning model",
    maxTokens: 200000,
    supportsStreaming: true,
    supportsWebSearch: false,
    capabilities: ["text", "vision", "code"],
    isReasoningModel: true,
    supportsVision: false,
    supportsFileUpload: false,
    supportsThinkingStream: true,
  }
];

export const getModelById = (id: string): AIModel | undefined => {
  return models.find(model => model.id === id);
};

export const getModelsByProvider = (provider: string): AIModel[] => {
  return models.filter(model => model.provider === provider);
};

export const getModelsWithWebSearch = (): AIModel[] => {
  return models.filter(model => model.supportsWebSearch);
}; 