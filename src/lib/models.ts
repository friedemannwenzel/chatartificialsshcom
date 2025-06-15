export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  maxTokens?: number;
  supportsStreaming: boolean;
  supportsWebSearch?: boolean;
  capabilities?: string[];
}

export const models: AIModel[] = [
  // OpenAI Models
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    description: "Most capable GPT-4 model with vision capabilities",
    maxTokens: 128000,
    supportsStreaming: true,
    supportsWebSearch: false,
    capabilities: ["text", "vision", "code"]
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai", 
    description: "Faster and more affordable GPT-4o model",
    maxTokens: 128000,
    supportsStreaming: true,
    supportsWebSearch: false,
    capabilities: ["text", "vision", "code"]
  },
  {
    id: "o1-mini",
    name: "o1-mini",
    provider: "openai",
    description: "Reasoning model optimized for STEM",
    maxTokens: 65536,
    supportsStreaming: false,
    supportsWebSearch: false,
    capabilities: ["reasoning", "math", "code"]
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "openai",
    description: "High-performance GPT-4 model with 128k context",
    maxTokens: 128000,
    supportsStreaming: true,
    supportsWebSearch: false,
    capabilities: ["text", "vision", "code"]
  },

  // Google Models
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "google",
    description: "Latest Gemini model with enhanced capabilities",
    maxTokens: 1048576,
    supportsStreaming: true,
    supportsWebSearch: true,
    capabilities: ["text", "vision", "audio", "web-search"]
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "google",
    description: "Most capable Gemini model with 2M token context",
    maxTokens: 2097152,
    supportsStreaming: true,
    supportsWebSearch: true,
    capabilities: ["text", "vision", "audio", "web-search"]
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    provider: "google",
    description: "Fast and efficient Gemini model",
    maxTokens: 1048576,
    supportsStreaming: true,
    supportsWebSearch: true,
    capabilities: ["text", "vision", "audio", "web-search"]
  },

  // Anthropic Models
  {
    id: "claude-3-5-sonnet-20241022",
    name: "Claude 3.5 Sonnet (New)",
    provider: "anthropic",
    description: "Latest Claude model with improved capabilities",
    maxTokens: 200000,
    supportsStreaming: true,
    supportsWebSearch: false,
    capabilities: ["text", "vision", "code"]
  },
  {
    id: "claude-3-5-sonnet-20240620",
    name: "Claude 3.5 Sonnet",
    provider: "anthropic",
    description: "Balanced model for most tasks",
    maxTokens: 200000,
    supportsStreaming: true,
    supportsWebSearch: false,
    capabilities: ["text", "vision", "code"]
  },
  {
    id: "claude-3-opus-20240229",
    name: "Claude 3 Opus",
    provider: "anthropic",
    description: "Most capable Claude model for complex tasks",
    maxTokens: 200000,
    supportsStreaming: true,
    supportsWebSearch: false,
    capabilities: ["text", "vision", "code"]
  },

  // xAI Models
  {
    id: "grok-beta",
    name: "Grok Beta",
    provider: "xai",
    description: "xAI's conversational AI model",
    maxTokens: 131072,
    supportsStreaming: true,
    supportsWebSearch: false,
    capabilities: ["text", "conversation"]
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