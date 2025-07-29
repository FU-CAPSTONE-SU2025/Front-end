import { axiosCreate, axiosRead, axiosDelete, axiosUpdate, extractErrorMessage, throwApiError } from "../AxiosCRUD";
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
    throwApiError(result);
    return null as never;
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
    throwApiError(result);
    return null as never;
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
    throwApiError(result);
    return null as never;
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
    throwApiError(result);
    return null as never;
  }
};

// Xóa một chat session
export const deleteChatSession = async (chatSessionId: number): Promise<{ success: boolean; message?: string }> => {
  try {
    console.log(`Attempting to delete chat session with ID: ${chatSessionId}`);
    
    const props = {
      url: `${sessionUrl}/${chatSessionId}`,
      headers: GetHeader(),
    };
    
    const result = await axiosDelete(props);
    
    if (result.success) {
      console.log(`Successfully deleted chat session: ${chatSessionId}`);
      return { success: true, message: 'Chat session deleted successfully' };
    } else {
      throwApiError(result);
      return null as never;
    }
  } catch (error) {
    console.error(`Error deleting chat session ${chatSessionId}:`, error);
    if (error instanceof Error) {
      throw new Error(`Failed to delete chat session: ${error.message}`);
    }
    throw new Error('Failed to delete chat session');
  }
};

export const renameChatSession = async (chatSessionId: number, title: string): Promise<{ success: boolean }> => {
  const props = {
    data: { title },
    url: `${sessionUrl}/${chatSessionId}/rename`,
    headers: GetHeader(),
  };
  
  const result = await axiosUpdate(props);
  if (result.success) {
    return { success: true };
  } else {
    throwApiError(result);
    return null as never;
  }
};

export const sendAiMessage = async (message: string): Promise<ISendChatMessageResponse> => {
  const props = {
    data: { message },
    url: aiUrl + "/send",
    headers: GetHeader(),
  };
  const result = await axiosCreate(props);
  if (result.success) {
    return result.data as ISendChatMessageResponse;
  } else {
    throwApiError(result);
    return null as never;
  }
};

