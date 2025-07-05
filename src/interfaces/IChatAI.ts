// Chat AI interfaces

export interface IChatSession {
  id: number;
  title: string;
  type: number;
  createdAt: string | null;
  updatedAt: string | null;
  staffId: number;
  studentId: number;
}

export interface IChatMessage {
  messageId: number;
  advisorySession1to1Id: number;
  senderId: number;
  content: string;
  createdAt: string | null;
}

export interface IChatSessionListResponse {
  items: IChatSession[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface IChatMessageListResponse {
  items: IChatMessage[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface IInitChatSessionRequest {
  message: string;
}

export interface IInitChatSessionResponse {
  chatSessionId: number;
  message: string;
}

export interface ISendChatMessageRequest {
  message: string;
  chatSessionId: number;
}

export interface ISendChatMessageResponse {
  message: string;
  chatSessionId: number;
}

// Additional types for better type safety
export interface IChatSessionWithMessages extends IChatSession {
  messages?: IChatMessage[];
}

export interface IChatMessageGroup {
  senderId: number;
  messages: IChatMessage[];
  timestamp: string;
}

export interface IChatSessionStats {
  totalMessages: number;
  lastMessageTime: string | null;
  unreadCount: number;
} 