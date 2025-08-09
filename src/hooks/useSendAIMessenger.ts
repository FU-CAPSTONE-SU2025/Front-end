import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { sendAiMessage } from '../api/student/AiChatBox';
import { useApiErrorHandler } from './useApiErrorHandler';
import { debugLog } from '../utils/performanceOptimization';

interface ApiResponse {
  message: string;
  chatSessionId: number;
}
interface ErrorResponse {
  message: string;
}
export const useSendAIMessenger = () => {
  const { handleError } = useApiErrorHandler();
  return useMutation<ApiResponse, AxiosError<ErrorResponse>, string>({
    mutationFn: sendAiMessage,
    onSuccess: (data) => {
      if (data && data.message) {
        debugLog('AI response:', { message: data.message, sessionId: data.chatSessionId });
      } else {
        debugLog('Failed to get AI response:', data);
      }
    },
    onError: (error) => {
      handleError(error, 'Failed to send message');
    },
    retry: 2, 
  });
};
