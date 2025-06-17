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
    id: "gpt-4.1",
    name: "GPT-4.1",
    provider: "openai",
    description: "OpenAI GPT-4.1 flagship model",
    maxTokens: 1000000,
    supportsStreaming: true,
    supportsWebSearch: false,
    capabilities: ["text", "vision", "code"]
  },
  {
    id: "gpt-4.1-mini",
    name: "GPT-4.1 Mini",
    provider: "openai",
    description: "OpenAI GPT-4.1 mini model for even faster and more affordable responses",
    maxTokens: 128000,
    supportsStreaming: true,
    supportsWebSearch: false,
    capabilities: ["text", "vision", "code"]
  },
  {
    id: "gpt-4.1-vision",
    name: "GPT-4.1 Vision",
    provider: "openai",
    description: "OpenAI GPT-4.1 model with advanced vision capabilities",
    maxTokens: 128000,
    supportsStreaming: true,
    supportsWebSearch: false,
    capabilities: ["text", "vision", "code"]
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "google",
    description: "Latest Gemini model with enhanced capabilities",
    maxTokens: 1048576,
    supportsStreaming: true,
    supportsWebSearch: true,
    capabilities: ["text", "vision", "audio", "web-search"]
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