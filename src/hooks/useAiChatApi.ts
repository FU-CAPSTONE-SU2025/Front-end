import { useMutation } from '@tanstack/react-query';
import { sendChatMessage } from '../api/student/AiChatBox';
import { useApiErrorHandler } from './useApiErrorHandler';

/**
 * AI Chat-related API hooks
 * Wraps AI chat APIs behind React Query so UI components don't call APIs directly.
 */
export const useAiChatApi = () => {
  const { handleError } = useApiErrorHandler();

  const sendChatMessageMutation = useMutation({
    mutationFn: sendChatMessage,
    onError: (err) => handleError(err, 'Failed to send chat message'),
  });

  return {
    sendChatMessage: sendChatMessageMutation.mutateAsync,
  };
};
