import { api } from '@/lib/api';
import { Project, ProjectCategory } from '@/types';

export const projectService = {
  getAll: async (): Promise<Project[]> => {
    const response = await api.get<Project[]>('/projects/');
    return response.data;
  },

  getOne: async (id: number): Promise<Project> => {
    const response = await api.get<Project>(`/projects/${id}/`);
    return response.data;
  },

  create: async (data: FormData | Partial<Project>): Promise<Project> => {
    const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined;
    const response = await api.post<Project>('/projects/', data, { headers });
    return response.data;
  },

  update: async (id: number, data: FormData | Partial<Project>): Promise<Project> => {
    const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined;
    const response = await api.patch<Project>(`/projects/${id}/`, data, { headers });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/projects/${id}/`);
  },

  reorder: async (orderedIds: number[]): Promise<void> => {
    await api.post('/projects/reorder/', { order: orderedIds });
  },

  getCategories: async (): Promise<ProjectCategory[]> => {
    const response = await api.get<ProjectCategory[]>('/project-categories/');
    return response.data;
  },

  // Gallery Images
  addImage: async (projectId: number, image: File, caption?: string): Promise<any> => {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('project', projectId.toString());
    if (caption) formData.append('caption', caption);
    
    const response = await api.post('/project-images/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  deleteImage: async (imageId: number): Promise<void> => {
    await api.delete(`/project-images/${imageId}/`);
  },
  
  reorderImages: async (orderedIds: number[]): Promise<void> => {
      await api.post('/project-images/reorder/', { order: orderedIds });
  }
};
