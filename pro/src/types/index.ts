// Define common types used across the application

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

export interface CodeSnippet {
  language: string;
  code: string;
}

export interface ChatSession {
  id?: string;
  title: string;
  messages: Message[];
  timestamp: number;
  codeContext?: {
    language: string;
    code: string;
  };
}

export interface DeepseekResponse {
  choices: {
    message: {
      content: string;
    };
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  }[];
  error?: {
    message: string;
  };
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface SerpApiResponse {
  organic_results?: {
    title: string;
    link: string;
    snippet?: string;
  }[];
  error?: string;
}