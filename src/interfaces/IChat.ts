export interface ChatUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: "Student" | "Supporter";
  isOnline: boolean;
  lastSeen?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  messageType: "text" | "file" | "image";
}

export interface ChatConversation {
  id: string;
  participants: ChatUser[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatSession {
  conversationId: string;
  messages: ChatMessage[];
  participants: ChatUser[];
} 