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
    id: "gpt-5.1",
    name: "GPT-5.1",
    provider: "openai",
    description: "Flagship model from OpenAI",
    maxTokens: 1048576,
    supportsStreaming: true,
    supportsWebSearch: false,
    capabilities: ["text", "vision", "code"],
    isReasoningModel: false,
    supportsVision: true,
    supportsFileUpload: true,
    supportsThinkingStream: false,
  },
  {
    id: "gpt-5-mini",
    name: "GPT-5 Mini",
    provider: "openai",
    description: "Smaller, faster GPT-5 variant",
    maxTokens: 400000,
    supportsStreaming: true,
    supportsWebSearch: false,
    capabilities: ["text", "vision", "code"],
    isReasoningModel: false,
    supportsVision: true,
    supportsFileUpload: true,
    supportsThinkingStream: false,
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
    id: "grok-4-1-fast-non-reasoning",
    name: "Grok 4.1 Fast Non-Reasoning",
    provider: "xai",
    description: "xAI's blazing fast non-reasoning model with exceptional cost-efficiency",
    maxTokens: 2000000,
    supportsStreaming: true,
    supportsWebSearch: false,
    capabilities: ["text", "vision", "code"],
    isReasoningModel: false,
    supportsVision: true,
    supportsFileUpload: false,
    supportsThinkingStream: false,
  },
  {
    id: "grok-4-1-fast-reasoning",
    name: "Grok 4.1 Fast Reasoning",
    provider: "xai",
    description: "xAI's blazing fast reasoning model with exceptional cost-efficiency",
    maxTokens: 2000000,
    supportsStreaming: true,
    supportsWebSearch: false,
    capabilities: ["text", "vision", "code", "reasoning"],
    isReasoningModel: true,
    supportsVision: true,
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