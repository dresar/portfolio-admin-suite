import { api } from '@/lib/api';

export interface AIAnalysisResult {
  summary: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  category: 'Inquiry' | 'Support' | 'Feedback' | 'Spam' | 'Collaboration' | 'Other';
  suggested_reply: string;
}

export interface SEOAnalysisResult {
  score: number;
  keywords: string[];
  suggestions: string[];
  title?: string;
  description?: string;
  error?: string;
}

export const aiService = {
  // AI Writing Assistant
  writeContent: async (topic: string, tone: string = 'professional', type: string = 'blog'): Promise<string> => {
    const response = await api.post<{ content: string }>('/ai/write/', { topic, tone, type });
    return response.data.content;
  },

  // Analyze Message (Smart Inbox)
  analyzeMessage: async (message: string, sender: string = ''): Promise<AIAnalysisResult> => {
    const response = await api.post<AIAnalysisResult>('/ai/analyze-message/', { message, sender });
    return response.data;
  },

  // Global Copilot (Chat)
  chat: async (query: string, context: string = ''): Promise<string> => {
    const response = await api.post<{ response: string }>('/ai/chat/', { query, context });
    return response.data.response;
  },

  // SEO Optimizer
  optimizeSEO: async (content: string, keyword: string = ''): Promise<SEOAnalysisResult> => {
    const response = await api.post<SEOAnalysisResult>('/ai/seo/', { content, keyword });
    return response.data;
  }
};
