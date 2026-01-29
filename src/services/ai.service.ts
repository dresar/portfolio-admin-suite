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

export interface AIKey {
  id: number;
  provider: 'gemini' | 'groq';
  masked_key: string;
  is_active: boolean;
  created_at: string;
  last_used?: string;
  error_count: number;
}

// AI Key Management Functions
export const getAIKeys = async () => {
  const response = await api.get<AIKey[]>('/ai/keys/');
  return response.data;
};

export const createAIKey = async (data: { provider: string; key: string }) => {
  const response = await api.post('/ai/keys/add/', data);
  return response.data;
};

export const deleteAIKey = async (id: number) => {
  const response = await api.delete(`/ai/keys/${id}/`);
  return response.data;
};

export const updateAIKey = async (id: number, data: any) => {
  // Using the ViewSet endpoint for updates since manual views don't cover it
  const response = await api.patch(`/ai-keys/${id}/`, data);
  return response.data;
};

export const testAIKey = async (id: number) => {
  const response = await api.post(`/ai/keys/${id}/test/`);
  return response.data;
};

export const uploadAIKeys = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/ai/upload-keys/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

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
