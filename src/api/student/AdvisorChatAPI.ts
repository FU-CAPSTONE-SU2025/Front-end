import { axiosCreate, axiosRead, extractErrorMessage, throwApiError } from "../AxiosCRUD";
import { baseUrl, GetHeader } from "../template";

const advisorChatUrl = baseUrl + "/AdvisorySession1to1";

// Interface for creating a new human chat session
export interface InitHumanChatSessionRequest {
  message: string;
}

// Interface for the response when creating a new session
export interface InitHumanChatSessionResponse {
  hubResponse: {
    id: number;
    title: string;
    staffId: number;
    staffName: string;
    studentId: number;
    studentName: string;
    type: 'HUMAN';
    createdAt: string;
    updatedAt: string;
  };
  studentProfileId: number;
}

// Initialize a new human chat session
export const initHumanChatSession = async (request: InitHumanChatSessionRequest): Promise<InitHumanChatSessionResponse> => {
  const props = {
    data: request,
    url: advisorChatUrl + "/init-human",
    headers: GetHeader(),
  };
  
  const result = await axiosCreate(props);
  if (result.success) {
    return result.data as InitHumanChatSessionResponse;
  } else {
    throwApiError(result);
    return null as never;
  }
};

// Get human sessions for student
export const getHumanSessionsByStudent = async (pageNumber: number = 1, pageSize: number = 10) => {
  const props = {
    data: { pageNumber, pageSize },
    url: advisorChatUrl + "/human-sessions/student",
    headers: GetHeader(),
  };
  
  const result = await axiosRead(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
    return null as never;
  }
};

// Get messages for a specific session
export const getSessionMessages = async (sessionId: number, pageNumber: number = 1, pageSize: number = 10) => {
  const props = {
    data: { pageNumber, pageSize },
    url: advisorChatUrl + `/${sessionId}/messages`,
    headers: GetHeader(),
  };
  
  const result = await axiosRead(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
    return null as never;
  }
}; 