import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { sendAiMessage } from '../api/student/AiChatBox';

interface ApiResponse {
  message: string;
  chatSessionId: number;
}
interface ErrorResponse {
  message: string;
}
export const useSendAiMessage = () => {
  return useMutation<ApiResponse, AxiosError<ErrorResponse>, string>({
    mutationFn: sendAiMessage,
    onSuccess: (data) => {
      if (data && data.message) {
        console.log('AI response:', data.message, 'Session ID:', data.chatSessionId);
      } else {
        console.error('Failed to get AI response:', data);
      }
    },
    onError: (error) => {
      console.error('Error sending AI message:', error.response?.data?.message || error.message);
    },
    retry: 2, 
  });
};
