import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getMessages, 
  markMessageAsRead, 
  deleteMessage, 
  getSubscribers, 
  deleteSubscriber 
} from '../../services/message.service';

export const useMessages = () => {
  const queryClient = useQueryClient();

  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages'],
    queryFn: getMessages,
  });

  const markReadMutation = useMutation({
    mutationFn: markMessageAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  return { 
    messages, 
    isLoading, 
    markMessageAsRead: markReadMutation.mutateAsync, 
    deleteMessage: deleteMutation.mutateAsync 
  };
};

export const useSubscribers = () => {
  const queryClient = useQueryClient();

  const { data: subscribers, isLoading } = useQuery({
    queryKey: ['subscribers'],
    queryFn: getSubscribers,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSubscriber,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
    },
  });

  return { 
    subscribers, 
    isLoading, 
    deleteSubscriber: deleteMutation.mutateAsync 
  };
};
