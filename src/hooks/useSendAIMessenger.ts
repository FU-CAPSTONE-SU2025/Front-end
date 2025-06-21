import { useMutation } from '@tanstack/react-query';

import { AxiosError } from 'axios';
import { sendAiMessage } from '../api/student/AiChatBox';

// Định nghĩa interface cho phản hồi từ API
interface ApiResponse {
  message: string;
  chatSessionId: number;
}

// Định nghĩa interface cho lỗi
interface ErrorResponse {
  message: string;
}

// Custom hook để gửi tin nhắn tới AI
export const useSendAiMessage = () => {
  return useMutation<ApiResponse, AxiosError<ErrorResponse>, string>({
    mutationFn: sendAiMessage,
    onSuccess: (data) => {
      // Xử lý khi gửi tin nhắn thành công
      if (data && data.message) {
        console.log('AI response:', data.message, 'Session ID:', data.chatSessionId);
      } else {
        console.error('Failed to get AI response:', data);
      }
    },
    onError: (error) => {
      // Xử lý lỗi
      console.error('Error sending AI message:', error.response?.data?.message || error.message);
    },
    retry: 2, // Thử lại 2 lần nếu thất bại
  });
};