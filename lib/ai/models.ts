export const DEFAULT_CHAT_MODEL: string = 'gemini-2.0-flash-exp';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
  contextLength: number;
  provider: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash Experimental',
    description: 'Latest experimental model with advanced capabilities',
    contextLength: 1000000,
    provider: 'Google',
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    description: 'Premium model with enhanced reasoning and performance',
    contextLength: 2000000,
    provider: 'Google',
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    description: 'Fast and efficient model for quick responses',
    contextLength: 1000000,
    provider: 'Google',
  },
  {
    id: 'gemini-2.0-flash-reasoning',
    name: 'Gemini 2.0 Flash Reasoning',
    description: 'Specialized model for complex reasoning tasks',
    contextLength: 1000000,
    provider: 'Google',
  },
];
