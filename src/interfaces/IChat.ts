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

export interface IStudentBooking {
  id: number;
  startDateTime: string;
  endDateTime: string;
  status: number;
  titleStudentIssue: string;
  createdAt: string;
  staffProfileId: number;
  staffFirstName: string;
  staffLastName: string;
  staffEmail: string;
  studentProfileId: number;
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
}

export interface IStudentBookingResponse {
  items: IStudentBooking[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

// Interface mới cho calendar data (chỉ cần thông tin cơ bản)
export interface IStudentBookingCalendar {
  id: number;
  startDateTime: string;
  endDateTime: string;
  status: number;
  titleStudentIssue: string;
  staffProfileId: number;
  staffFirstName: string;
  staffLastName: string;
}

export interface IStudentBookingCalendarResponse {
  items: IStudentBookingCalendar[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
} 