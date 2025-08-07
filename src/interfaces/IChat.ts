export interface StudentSession {
  id: number;
  title: string;
  staffId: number;
  studentId: number;
  type: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  studentName?: string;
  studentAvatar?: string;
  isOnline?: boolean;
  studentJoinAt?: string;
  staffJoinAt?: string;
}

export interface ChatMessage {
  id: number;
  content: string;
  senderId: number;
  advisorySession1to1Id: number;
  createdAt: string;
  senderName?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface ChatSession {
  id: number;
  title: string;
  staffId: number;
  studentId: number;
  type: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  studentName?: string;
  studentAvatar?: string;
  isOnline?: boolean;
  studentJoinAt?: string;
  staffJoinAt?: string;
}

export interface ChatParticipant {
  id: number;
  name: string;
  avatar?: string;
  isOnline: boolean;
  role: string;
  lastSeen?: string;
}

export interface ChatSessionUpdate {
  sessionId: number;
  staffId: number;
  studentId: number;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  isOnline?: boolean;
}

export interface ChatConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  error?: string;
}

export interface ChatPaginationState {
  pageNumber: number;
  pageSize: number;
  hasMore: boolean;
  isLoading: boolean;
}

export interface ChatSessionFilters {
  staffId?: number;
  studentId?: number;
  isAssigned?: boolean;
  isUnassigned?: boolean;
  searchTerm?: string;
}

export interface ChatSessionStats {
  totalSessions: number;
  assignedSessions: number;
  unassignedSessions: number;
  unreadCount: number;
  onlineCount: number;
}

export interface ChatSessionResponse {
  id: number;
  title: string;
  staffId: number;
  studentId: number;
  type: string;
  createdAt: string;
  updatedAt: string;
  message?: string;
  status?: string;
}

export interface ChatSessionRequest {
  message: string;
}
