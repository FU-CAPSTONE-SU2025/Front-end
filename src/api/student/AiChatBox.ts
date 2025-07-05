import { axiosCreate, axiosRead, axiosPatch, axiosDelete } from "../AxiosCRUD";
import { baseUrl, GetHeader } from "../template";
import type {
  IChatSessionListResponse,
  IChatMessageListResponse,
  IInitChatSessionRequest,
  IInitChatSessionResponse,
  ISendChatMessageRequest,
  ISendChatMessageResponse
} from "../../interfaces/IChatAI";

const aiUrl = baseUrl + "/ChatBot";
const sessionUrl = baseUrl + "/AdvisorySession1to1";
const messageUrl = baseUrl + "/Message";

// Khởi tạo session chat mới
export const initChatSession = async (request: IInitChatSessionRequest): Promise<IInitChatSessionResponse> => {
  const props = {
    data: request,
    url: aiUrl + "/init",
    headers: GetHeader(),
  };
  const result = await axiosCreate(props);
  if (result.success) {
    return result.data as IInitChatSessionResponse;
  } else {
    console.error('Failed to initialize chat session:', result.error);
    throw new Error(result.error || 'Failed to initialize chat session');
  }
};

// Gửi message tới AI và nhận câu trả lời
export const sendChatMessage = async (request: ISendChatMessageRequest): Promise<ISendChatMessageResponse> => {
  const props = {
    data: request,
    url: aiUrl + "/send",
    headers: GetHeader(),
  };
  const result = await axiosCreate(props);
  if (result.success) {
    return result.data as ISendChatMessageResponse;
  } else {
    console.error('Failed to send message to AI:', result.error);
    throw new Error(result.error || 'Failed to send message to AI');
  }
};

// Lấy danh sách tất cả chat sessions
export const getChatSessions = async (): Promise<IChatSessionListResponse> => {
  const props = {
    url: sessionUrl,
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  if (result.success) {
    return result.data as IChatSessionListResponse;
  } else {
    console.error('Failed to fetch chat sessions:', result.error);
    throw new Error(result.error || 'Failed to fetch chat sessions');
  }
};

// Lấy danh sách messages của một session - API: /api/Message/{sessionId}
export const getChatMessages = async (chatSessionId: number, page: number = 1, pageSize: number = 20): Promise<IChatMessageListResponse> => {
  const props = {
    url: `${messageUrl}/${chatSessionId}?pageNumber=${page}&pageSize=${pageSize}`,
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  if (result.success) {
    return result.data as IChatMessageListResponse;
  } else {
    console.error('Failed to fetch chat messages for session', chatSessionId, ':', result.error);
    throw new Error(result.error || 'Failed to fetch chat messages');
  }
};

// Xóa một chat session
export const deleteChatSession = async (chatSessionId: number): Promise<{ success: boolean }> => {
  const props = {
    url: `${sessionUrl}/${chatSessionId}`,
    headers: GetHeader(),
  };
  const result = await axiosDelete(props);
  if (result.success) {
    return { success: true };
  } else {
    console.error('Failed to delete chat session', chatSessionId, ':', result.error);
    throw new Error(result.error || 'Failed to delete chat session');
  }
};

// Đổi tên chat session
export const renameChatSession = async (chatSessionId: number, title: string): Promise<{ success: boolean }> => {
  const props = {
    data: { title },
    url: `${sessionUrl}/${chatSessionId}`,
    headers: GetHeader(),
  };
  const result = await axiosPatch(props);
  if (result.success) {
    return { success: true };
  } else {
    console.error('Failed to rename chat session', chatSessionId, ':', result.error);
    throw new Error(result.error || 'Failed to rename chat session');
  }
};

// Legacy function for backward compatibility
export const sendAiMessage = async (message: string): Promise<ISendChatMessageResponse> => {
  // This is a simplified version that assumes a default session
  // For new implementations, use sendChatMessage with proper sessionId
  const request: ISendChatMessageRequest = {
    message,
    chatSessionId: 1, // Default session ID - should be replaced with actual session
  };
  return sendChatMessage(request);
};

