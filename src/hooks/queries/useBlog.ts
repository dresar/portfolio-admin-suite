import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getBlogPosts, 
  getBlogPost, 
  createBlogPost, 
  updateBlogPost, 
  deleteBlogPost,
  getBlogCategories,
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory
} from '../../services/blog.service';

export const useBlogPosts = () => {
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: getBlogPosts,
  });

  const createMutation = useMutation({
    mutationFn: createBlogPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateBlogPost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBlogPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    },
  });

  return { 
    posts, 
    isLoading, 
    createBlogPost: createMutation.mutateAsync, 
    updateBlogPost: updateMutation.mutateAsync, 
    deleteBlogPost: deleteMutation.mutateAsync 
  };
};

export const useBlogCategories = () => {
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: getBlogCategories,
  });

  const createMutation = useMutation({
    mutationFn: createBlogCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-categories'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateBlogCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-categories'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBlogCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-categories'] });
    },
  });

  return {
    categories,
    isLoading,
    createBlogCategory: createMutation.mutateAsync,
    updateBlogCategory: updateMutation.mutateAsync,
    deleteBlogCategory: deleteMutation.mutateAsync
  };
};
