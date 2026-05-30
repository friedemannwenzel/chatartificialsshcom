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
  supportsReasoningEffort?: boolean;
  defaultReasoningEffort?: "minimal" | "low" | "medium" | "high" | "xhigh";
}

export const models: AIModel[] = [
  {
    id: "gemini-3-flash-preview",
    name: "Gemini 3.0 Flash Preview",
    provider: "google",
    description: "Latest Gemini model with enhanced capabilities",
    maxTokens: 1024000,
    supportsStreaming: true,
    supportsWebSearch: true,
    capabilities: ["text", "vision", "audio", "web-search"],
    isReasoningModel: true,
    supportsVision: true,
    supportsFileUpload: true,
    supportsThinkingStream: true,
  },
  {
    id: "gpt-5.5",
    name: "GPT-5.5",
    provider: "openai",
    description: "OpenAI's newest frontier model for complex reasoning and coding",
    maxTokens: 1050000,
    supportsStreaming: true,
    supportsWebSearch: true,
    capabilities: ["text", "vision", "code", "reasoning", "web-search"],
    isReasoningModel: false,
    supportsVision: true,
    supportsFileUpload: true,
    supportsThinkingStream: true,
    supportsReasoningEffort: true,
    defaultReasoningEffort: "medium",
  },
  {
    id: "gpt-5.4",
    name: "GPT-5.4",
    provider: "openai",
    description: "Affordable OpenAI model for coding and professional work",
    maxTokens: 1050000,
    supportsStreaming: true,
    supportsWebSearch: true,
    capabilities: ["text", "vision", "code", "reasoning", "web-search"],
    isReasoningModel: false,
    supportsVision: true,
    supportsFileUpload: true,
    supportsThinkingStream: true,
    supportsReasoningEffort: true,
    defaultReasoningEffort: "medium",
  },
  {
    id: "gpt-5.4-mini",
    name: "GPT-5.4 Mini",
    provider: "openai",
    description: "Strong mini model for coding, computer use, and high-volume workloads",
    maxTokens: 400000,
    supportsStreaming: true,
    supportsWebSearch: true,
    capabilities: ["text", "vision", "code", "reasoning", "web-search"],
    isReasoningModel: false,
    supportsVision: true,
    supportsFileUpload: true,
    supportsThinkingStream: true,
    supportsReasoningEffort: true,
    defaultReasoningEffort: "low",
  },
  {
    id: "gpt-5.4-nano",
    name: "GPT-5.4 Nano",
    provider: "openai",
    description: "Fast, low-cost model for simple high-volume tasks",
    maxTokens: 400000,
    supportsStreaming: true,
    supportsWebSearch: true,
    capabilities: ["text", "vision", "code", "reasoning", "web-search"],
    isReasoningModel: false,
    supportsVision: true,
    supportsFileUpload: true,
    supportsThinkingStream: true,
    supportsReasoningEffort: true,
    defaultReasoningEffort: "minimal",
  },
  {
    id: "grok-4.20-0309-reasoning",
    name: "Grok 4.20 Reasoning",
    provider: "xai",
    description: "xAI's latest reasoning model with extended thinking support",
    maxTokens: 1000000,
    supportsStreaming: true,
    supportsWebSearch: false,
    capabilities: ["text", "vision", "code", "reasoning"],
    isReasoningModel: true,
    supportsVision: true,
    supportsFileUpload: false,
    supportsThinkingStream: true,
    supportsReasoningEffort: true,
    defaultReasoningEffort: "medium",
  },
  {
    id: "grok-4.20-multi-agent",
    name: "Grok 4.20 Multi-Agent",
    provider: "xai",
    description: "xAI multi-agent reasoning model for the hardest prompts",
    maxTokens: 1000000,
    supportsStreaming: true,
    supportsWebSearch: false,
    capabilities: ["text", "vision", "code", "reasoning"],
    isReasoningModel: true,
    supportsVision: true,
    supportsFileUpload: false,
    supportsThinkingStream: true,
    supportsReasoningEffort: true,
    defaultReasoningEffort: "high",
  },
  {
    id: "grok-4.3",
    name: "Grok 4.3",
    provider: "xai",
    description: "xAI flagship chat model for agentic tool calling and reasoning",
    maxTokens: 1000000,
    supportsStreaming: true,
    supportsWebSearch: false,
    capabilities: ["text", "vision", "code", "reasoning"],
    isReasoningModel: true,
    supportsVision: true,
    supportsFileUpload: false,
    supportsThinkingStream: true,
  },
  {
    id: "grok-build-0.1",
    name: "Grok Build 0.1",
    provider: "xai",
    description: "xAI's fast coding model for agentic coding workflows",
    maxTokens: 256000,
    supportsStreaming: true,
    supportsWebSearch: false,
    capabilities: ["text", "code"],
    isReasoningModel: false,
    supportsVision: false,
    supportsFileUpload: false,
    supportsThinkingStream: false,
  },
  {
    id: "claude-sonnet-4-5-20250929",
    name: "Claude Sonnet 4.5",
    provider: "anthropic",
    description: "Anthropic's fast, intelligent model",
    maxTokens: 200000,
    supportsStreaming: true,
    supportsWebSearch: false,
    capabilities: ["text", "vision", "code"],
    isReasoningModel: false,
    supportsVision: true,
    supportsFileUpload: true,
    supportsThinkingStream: false,
  },
  {
    id: "claude-haiku-4-5-20251001",
    name: "Claude Haiku 4.5",
    provider: "anthropic",
    description: "Anthropic's fast, intelligent model",
    maxTokens: 200000,
    supportsStreaming: true,
    supportsWebSearch: false,
    capabilities: ["text", "vision", "code"],
    isReasoningModel: false,
    supportsVision: true,
    supportsFileUpload: true,
    supportsThinkingStream: false,
  },
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
