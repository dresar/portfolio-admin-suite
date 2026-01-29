import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getAIKeys, 
  createAIKey, 
  updateAIKey, 
  deleteAIKey 
} from '../../services/ai.service';

export const useAIKeys = () => {
  const queryClient = useQueryClient();

  const { data: keys, isLoading } = useQuery({
    queryKey: ['ai-keys'],
    queryFn: getAIKeys,
  });

  const createMutation = useMutation({
    mutationFn: createAIKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-keys'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateAIKey(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-keys'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAIKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-keys'] });
    },
  });

  return { 
    keys, 
    isLoading, 
    createAIKey: createMutation.mutateAsync, 
    updateAIKey: updateMutation.mutateAsync, 
    deleteAIKey: deleteMutation.mutateAsync 
  };
};
