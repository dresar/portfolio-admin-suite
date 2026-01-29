import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getHomeContent, 
  updateHomeContent, 
  getAboutContent, 
  updateAboutContent 
} from '../../services/settings.service';

export const useHomeContent = () => {
  const queryClient = useQueryClient();

  const { data: homeContent, isLoading } = useQuery({
    queryKey: ['home-content'],
    queryFn: getHomeContent,
  });

  const mutation = useMutation({
    mutationFn: updateHomeContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-content'] });
    },
  });

  return { homeContent, isLoading, updateHomeContent: mutation.mutateAsync };
};

export const useAboutContent = () => {
  const queryClient = useQueryClient();

  const { data: aboutContent, isLoading } = useQuery({
    queryKey: ['about-content'],
    queryFn: getAboutContent,
  });

  const mutation = useMutation({
    mutationFn: updateAboutContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['about-content'] });
    },
  });

  return { aboutContent, isLoading, updateAboutContent: mutation.mutateAsync };
};
