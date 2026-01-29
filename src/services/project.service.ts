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

  create: async (data: Partial<Project>): Promise<Project> => {
    const response = await api.post<Project>('/projects/', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Project>): Promise<Project> => {
    const response = await api.patch<Project>(`/projects/${id}/`, data);
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
  }
};
