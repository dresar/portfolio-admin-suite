import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getSiteSettings, 
  updateSiteSettings, 
  getProfile, 
  updateProfile,
  getSocialLinks,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink
} from '../../services/settings.service';

export const useSiteSettings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: getSiteSettings,
  });

  const mutation = useMutation({
    mutationFn: updateSiteSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
    },
  });

  return { settings, isLoading, updateSettings: mutation.mutateAsync };
};

export const useProfile = () => {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  return { profile, isLoading, updateProfile: mutation.mutateAsync };
};

export const useSocialLinks = () => {
  const queryClient = useQueryClient();

  const { data: socialLinks, isLoading } = useQuery({
    queryKey: ['social-links'],
    queryFn: getSocialLinks,
  });

  const createMutation = useMutation({
    mutationFn: createSocialLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-links'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateSocialLink(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-links'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSocialLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-links'] });
    },
  });

  return { 
    socialLinks, 
    isLoading, 
    addSocialLink: createMutation.mutateAsync, 
    updateSocialLink: updateMutation.mutateAsync, 
    deleteSocialLink: deleteMutation.mutateAsync 
  };
};
