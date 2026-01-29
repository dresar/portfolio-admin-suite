import api from '../lib/api';
import { BlogPost, BlogCategory } from '../types';

// Categories
export const getBlogCategories = async () => {
  const response = await api.get<BlogCategory[]>('/blog-categories/');
  return response.data;
};

export const createBlogCategory = async (data: Omit<BlogCategory, 'id'>) => {
  const response = await api.post<BlogCategory>('/blog-categories/', data);
  return response.data;
};

export const updateBlogCategory = async (id: number, data: Partial<BlogCategory>) => {
  const response = await api.patch<BlogCategory>(`/blog-categories/${id}/`, data);
  return response.data;
};

export const deleteBlogCategory = async (id: number) => {
  await api.delete(`/blog-categories/${id}/`);
};

// Posts
export const getBlogPosts = async () => {
  const response = await api.get<BlogPost[]>('/blog-posts/');
  return response.data;
};

export const getBlogPost = async (id: number) => {
  const response = await api.get<BlogPost>(`/blog-posts/${id}/`);
  return response.data;
};

export const createBlogPost = async (data: any) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    const value = data[key];
    if (value !== undefined && value !== null) {
      if (key === 'tags' || key === 'seo_keywords') {
        formData.append(key, JSON.stringify(value));
      } else if (key === 'coverImageFile') {
        formData.append('coverImageFile', value);
      } else {
        formData.append(key, value);
      }
    }
  });

  const response = await api.post<BlogPost>('/blog-posts/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateBlogPost = async (id: number, data: any) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    const value = data[key];
    if (value !== undefined && value !== null) {
       if (key === 'tags' || key === 'seo_keywords') {
        formData.append(key, JSON.stringify(value));
      } else if (key === 'coverImageFile') {
        formData.append('coverImageFile', value);
      } else {
        formData.append(key, value);
      }
    }
  });

  const response = await api.patch<BlogPost>(`/blog-posts/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteBlogPost = async (id: number) => {
  await api.delete(`/blog-posts/${id}/`);
};
