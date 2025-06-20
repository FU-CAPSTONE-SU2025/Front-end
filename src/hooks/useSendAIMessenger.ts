import { useMutation } from '@tanstack/react-query';

import { AxiosError } from 'axios';
import { sendAiMessage } from '../api/student/AiChatBox';

// Định nghĩa interface cho phản hồi từ API (tùy thuộc vào cấu trúc dữ liệu thực tế)
interface AiResponse {
  success: boolean;
  data: any; // Thay bằng type cụ thể nếu biết cấu trúc dữ liệu
  error?: string;
}

// Định nghĩa interface cho lỗi
interface ErrorResponse {
  message: string;
}

// Custom hook để gửi tin nhắn tới AI
export const useSendAiMessage = () => {
  return useMutation<AiResponse, AxiosError<ErrorResponse>, string>({
    mutationFn: sendAiMessage,
    onSuccess: (data) => {
      // Xử lý khi gửi tin nhắn thành công
      if (data.success) {
        console.log('AI response:', data.data);
      } else {
        console.error('Failed to get AI response:', data.error);
      }
    },
    onError: (error) => {
      // Xử lý lỗi
      console.error('Error sending AI message:', error.response?.data?.message || error.message);
    },
    retry: 2, // Thử lại 2 lần nếu thất bại
  });
};