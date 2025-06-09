export interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'google';
  description: string;
  maxTokens?: number;
  supportsStreaming: boolean;
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4.1',
    provider: 'openai',
    description: 'Most capable GPT-4 model with enhanced reasoning',
    maxTokens: 128000,
    supportsStreaming: true,
  },
  {
    id: 'gpt-4-turbo-preview',
    name: 'GPT-4.1 Mini',
    provider: 'openai',
    description: 'Faster, more efficient version of GPT-4.1',
    maxTokens: 128000,
    supportsStreaming: true,
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'Multimodal GPT-4 with vision capabilities',
    maxTokens: 128000,
    supportsStreaming: true,
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    description: 'Efficient multimodal model for everyday tasks',
    maxTokens: 128000,
    supportsStreaming: true,
  },
  {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash',
    provider: 'google',
    description: 'Latest Gemini model with enhanced performance',
    maxTokens: 1000000,
    supportsStreaming: true,
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    description: 'Fast and efficient Gemini model',
    maxTokens: 1000000,
    supportsStreaming: true,
  },
];

export const DEFAULT_MODEL = AI_MODELS[3]; // GPT-4o Mini 