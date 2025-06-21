import { axiosCreate, axiosRead } from "../AxiosCRUD";
import { baseUrl, GetHeader } from "../template";

const aiUrl = baseUrl + "/ChatBot";

interface ApiResponse {
  message: string;
  chatSessionId: number;
}

// Gửi câu hỏi tới AI và nhận câu trả lời
export const sendAiMessage = async (message: string): Promise<ApiResponse> => {
  const props = {
    data: { message },
    url: aiUrl,
    headers: GetHeader(),
  };
  const result = await axiosCreate(props);
  if (result.success) {
    return result.data as ApiResponse;
  } else {
    console.log(result.error);
    throw new Error(result.error || 'Failed to send message to AI');
  }
};

