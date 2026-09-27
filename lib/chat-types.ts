import type { UIMessage } from 'ai';

export interface ModelOption {
  id: string;
  label: string;
  description: string;
  category: string;
}

export const MODEL_OPTIONS: ModelOption[] = [
  {
    id: 'deepseek/deepseek-r1',
    label: 'DeepSeek R1',
    description: 'Logic & Reasoning',
    category: 'Reasoning',
  },
  {
    id: 'qwen/qwen-2.5-coder-32b-instruct',
    label: 'Qwen 2.5 Coder 32B',
    description: 'Coding',
    category: 'Coding',
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct',
    label: 'Llama 3.3 70B',
    description: 'Research & Context',
    category: 'Research',
  },
  {
    id: 'cognitivecomputations/dolphin-mixtral-8x7b',
    label: 'Dolphin Mixtral 8x7B',
    description: 'Uncensored',
    category: 'Uncensored',
  },
];

export const DEFAULT_ASSISTANT_PERSONALITY =
  'You are warm, curious, thoughtful, and direct. Be honest about uncertainty, and make complex ideas easy to follow.';

export const DEFAULT_RESPONSE_PREFERENCES =
  'Be clear and practical. Keep answers concise unless I ask for detail.';

export interface ChatSettings {
  model: string;
  assistantName: string;
  assistantTagline: string;
  assistantPersonality: string;
  responsePreferences: string;
  personalNotes: string;
  accentColor: string;
  temperature: number;
  topP: number;
}

export interface ChatConversation {
  id: string;
  title: string;
  pinned: boolean;
  updatedAt: number;
  messages: UIMessage[];
}

export const DEFAULT_SETTINGS: ChatSettings = {
  model: MODEL_OPTIONS[0].id,
  assistantName: 'Quazxi',
  assistantTagline: 'Beyond obvious',
  assistantPersonality: DEFAULT_ASSISTANT_PERSONALITY,
  responsePreferences: DEFAULT_RESPONSE_PREFERENCES,
  personalNotes: '',
  accentColor: '#f18d72',
  temperature: 0.7,
  topP: 0.9,
};

export const STORAGE_KEY = 'ai-chat-settings';
export const MESSAGES_STORAGE_KEY = 'ai-chat-messages';
export const CONVERSATIONS_STORAGE_KEY = 'ai-chat-conversations';
