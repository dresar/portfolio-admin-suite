import { api } from '@/lib/api';

export const mediaService = {
  upload: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<{ url: string }>('/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  getList: async (): Promise<string[]> => {
      const response = await api.get<string[]>('/media/list/');
      return response.data;
  }
};
