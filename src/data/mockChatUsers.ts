import { ChatUser } from '../interfaces/IChat';

export const mockChatUsers: ChatUser[] = [
  // Supporters
  {
    id: "SP001",
    name: "Nguyen Thi A",
    email: "support.a@university.edu",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=SP001",
    role: "Supporter",
    isOnline: true,
    lastSeen: "Online"
  },
  {
    id: "SP002", 
    name: "Tran Van B",
    email: "support.b@university.edu",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=SP002",
    role: "Supporter",
    isOnline: true,
    lastSeen: "2 minutes ago"
  },
  {
    id: "SP003",
    name: "Le Thi C", 
    email: "support.c@university.edu",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=SP003",
    role: "Supporter",
    isOnline: false,
    lastSeen: "1 hour ago"
  }
]; 