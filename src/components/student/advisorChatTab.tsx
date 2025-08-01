import React, { useState } from 'react';
import { Avatar} from 'antd';


interface AdvisorChatTabProps {
  chat?: any; 
  onChatBoxOpen?: (advisor: Advisor) => void;
  drawerOpen?: boolean;
}

interface Advisor {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  role: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  messageType: string;
  senderName?: string;
}

const mockAdvisors: Advisor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    avatar: 'https://i.pravatar.cc/150?img=1',
    isOnline: true,
    lastMessage: 'How can I help you with your course selection?',
    lastMessageTime: '2 giờ',
    unreadCount: 2,
    role: 'Computer Science Advisor'
  },
  {
    id: '2',
    name: 'Prof. Michael Chen',
    avatar: 'https://i.pravatar.cc/150?img=2',
    isOnline: false,
    lastMessage: 'Your academic progress looks great!',
    lastMessageTime: '1 giờ',
    unreadCount: 0,
    role: 'Information Technology Advisor'
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    avatar: 'https://i.pravatar.cc/150?img=3',
    isOnline: true,
    lastMessage: 'Let\'s discuss your semester planning.',
    lastMessageTime: '30 phút',
    unreadCount: 1,
    role: 'Software Engineering Advisor'
  },
  {
    id: '4',
    name: 'Prof. David Kim',
    avatar: 'https://i.pravatar.cc/150?img=4',
    isOnline: false,
    lastMessage: 'I\'ve reviewed your transcript.',
    lastMessageTime: 'Hôm qua',
    unreadCount: 0,
    role: 'Data Science Advisor'
  },
  {
    id: '5',
    name: 'Dr. Lisa Thompson',
    avatar: 'https://i.pravatar.cc/150?img=5',
    isOnline: true,
    lastMessage: 'Great work on your assignments!',
    lastMessageTime: '15 phút',
    unreadCount: 3,
    role: 'Computer Science Advisor'
  },
  {
    id: '6',
    name: 'Prof. James Wilson',
    avatar: 'https://i.pravatar.cc/150?img=6',
    isOnline: false,
    lastMessage: 'Your research proposal is approved.',
    lastMessageTime: '2 ngày',
    unreadCount: 0,
    role: 'Research Advisor'
  },
  {
    id: '7',
    name: 'Dr. Maria Garcia',
    avatar: 'https://i.pravatar.cc/150?img=7',
    isOnline: true,
    lastMessage: 'Let\'s schedule a meeting next week.',
    lastMessageTime: '45 phút',
    unreadCount: 1,
    role: 'Academic Advisor'
  },
  {
    id: '8',
    name: 'Prof. Robert Lee',
    avatar: 'https://i.pravatar.cc/150?img=8',
    isOnline: false,
    lastMessage: 'Your internship application is ready.',
    lastMessageTime: '3 giờ',
    unreadCount: 0,
    role: 'Career Advisor'
  }
];

const mockMessages: ChatMessage[] = [
  {
    id: '1',
    senderId: '1',
    receiverId: 'student',
    content: 'Hello! How can I help you today?',
    timestamp: '2:30 PM',
    isRead: true,
    messageType: 'text',
    senderName: 'Dr. Sarah Johnson'
  },
  {
    id: '2',
    senderId: 'student',
    receiverId: '1',
    content: 'Hi Dr. Sarah! I need help with my course selection for next semester.',
    timestamp: '2:31 PM',
    isRead: true,
    messageType: 'text'
  },
  {
    id: '3',
    senderId: '1',
    receiverId: 'student',
    content: 'Of course! I\'d be happy to help. What are you thinking of taking?',
    timestamp: '2:32 PM',
    isRead: true,
    messageType: 'text',
    senderName: 'Dr. Sarah Johnson'
  },
  {
    id: '4',
    senderId: 'student',
    receiverId: '1',
    content: 'I\'m considering Computer Science courses. Any recommendations?',
    timestamp: '2:33 PM',
    isRead: false,
    messageType: 'text'
  },
  {
    id: '5',
    senderId: '2',
    receiverId: 'student',
    content: 'Your academic progress looks great!',
    timestamp: '1:45 PM',
    isRead: true,
    messageType: 'text',
    senderName: 'Prof. Michael Chen'
  },
  {
    id: '6',
    senderId: '3',
    receiverId: 'student',
    content: 'Let\'s discuss your semester planning.',
    timestamp: '12:20 PM',
    isRead: true,
    messageType: 'text',
    senderName: 'Dr. Emily Rodriguez'
  },
  {
    id: '7',
    senderId: '4',
    receiverId: 'student',
    content: 'I\'ve reviewed your transcript.',
    timestamp: 'Yesterday',
    isRead: true,
    messageType: 'text',
    senderName: 'Prof. David Kim'
  },
  {
    id: '8',
    senderId: '5',
    receiverId: 'student',
    content: 'Great work on your assignments!',
    timestamp: '15 minutes ago',
    isRead: false,
    messageType: 'text',
    senderName: 'Dr. Lisa Thompson'
  },
  {
    id: '9',
    senderId: '6',
    receiverId: 'student',
    content: 'Your research proposal is approved.',
    timestamp: '2 days ago',
    isRead: true,
    messageType: 'text',
    senderName: 'Prof. James Wilson'
  },
  {
    id: '10',
    senderId: '7',
    receiverId: 'student',
    content: 'Let\'s schedule a meeting next week.',
    timestamp: '45 minutes ago',
    isRead: false,
    messageType: 'text',
    senderName: 'Dr. Maria Garcia'
  },
  {
    id: '11',
    senderId: '8',
    receiverId: 'student',
    content: 'Your internship application is ready.',
    timestamp: '3 hours ago',
    isRead: true,
    messageType: 'text',
    senderName: 'Prof. Robert Lee'
  },
  {
    id: '12',
    senderId: 'student',
    receiverId: '5',
    content: 'Thank you for your guidance!',
    timestamp: '10 minutes ago',
    isRead: true,
    messageType: 'text'
  },
  {
    id: '13',
    senderId: '7',
    receiverId: 'student',
    content: 'Can you send me your updated schedule?',
    timestamp: '1 hour ago',
    isRead: false,
    messageType: 'text',
    senderName: 'Dr. Maria Garcia'
  },
  {
    id: '14',
    senderId: 'student',
    receiverId: '3',
    content: 'I have some questions about the curriculum.',
    timestamp: '30 minutes ago',
    isRead: true,
    messageType: 'text'
  },
  {
    id: '15',
    senderId: '3',
    receiverId: 'student',
    content: 'Sure, what would you like to know?',
    timestamp: '25 minutes ago',
    isRead: false,
    messageType: 'text',
    senderName: 'Dr. Emily Rodriguez'
  },
  {
    id: '16',
    senderId: 'student',
    receiverId: '1',
    content: 'Can you help me choose courses for next semester?',
    timestamp: '1 hour ago',
    isRead: true,
    messageType: 'text'
  },
  {
    id: '17',
    senderId: 'student',
    receiverId: '2',
    content: 'I need advice on my academic plan.',
    timestamp: '2 hours ago',
    isRead: true,
    messageType: 'text'
  },
  {
    id: '18',
    senderId: 'student',
    receiverId: '3',
    content: 'What courses should I take for software engineering?',
    timestamp: '30 minutes ago',
    isRead: true,
    messageType: 'text'
  },
  {
    id: '19',
    senderId: 'student',
    receiverId: '4',
    content: 'Can you review my transcript?',
    timestamp: '1 day ago',
    isRead: true,
    messageType: 'text'
  },
  {
    id: '20',
    senderId: 'student',
    receiverId: '5',
    content: 'I have questions about my assignments.',
    timestamp: '15 minutes ago',
    isRead: true,
    messageType: 'text'
  },
  {
    id: '21',
    senderId: 'student',
    receiverId: '6',
    content: 'I want to discuss my research project.',
    timestamp: '3 days ago',
    isRead: true,
    messageType: 'text'
  },
  {
    id: '22',
    senderId: 'student',
    receiverId: '7',
    content: 'Can we schedule a meeting?',
    timestamp: '45 minutes ago',
    isRead: true,
    messageType: 'text'
  },
  {
    id: '23',
    senderId: 'student',
    receiverId: '8',
    content: 'I need help with my internship application.',
    timestamp: '4 hours ago',
    isRead: true,
    messageType: 'text'
  }
];

const AdvisorChatTab: React.FC<AdvisorChatTabProps> = ({ onChatBoxOpen, drawerOpen }) => {
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null);
  const [chatBoxOpen, setChatBoxOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async (msg: string) => {
    if (!msg.trim() || !selectedAdvisor) return;
    
    setLoading(true);
    setError(null);
    try {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        senderId: 'student',
        receiverId: selectedAdvisor.id,
        content: msg,
        timestamp: new Date().toLocaleTimeString(),
        isRead: false,
        messageType: 'text'
      };
      setMessages(prev => [...prev, newMessage]);
      await new Promise(resolve => setTimeout(resolve, 500)); // Mock delay
    } catch (err) {
      setError('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleAdvisorClick = (advisor: Advisor) => {
    setSelectedAdvisor(advisor);
    setChatBoxOpen(true);
    onChatBoxOpen?.(advisor);
  };

  const handleChatClick = (advisor: Advisor) => {
    setSelectedAdvisor(advisor);
    setChatBoxOpen(true);
    onChatBoxOpen?.(advisor);
  };

  const handleCloseChatBox = () => {
    setChatBoxOpen(false);
    setSelectedAdvisor(null);
  };

  // Get messages for a specific advisor
  const getMessagesForAdvisor = (advisorId: string) => {
    return messages.filter(msg => 
      (msg.senderId === advisorId && msg.receiverId === 'student') ||
      (msg.senderId === 'student' && msg.receiverId === advisorId)
    );
  };

  // Get last message for an advisor (only student messages)
  const getLastMessageForAdvisor = (advisorId: string) => {
    const studentMessages = messages.filter(msg => 
      msg.senderId === 'student' && msg.receiverId === advisorId
    );
    return studentMessages[studentMessages.length - 1];
  };

  return (
    <div className="flex flex-col h-[600px] bg-white">
      {/* Advisors List - Top Section (Horizontal) */}
      <div className="border-b border-gray-200 p-4">
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-800 mb-1">Advisors</h3>
          <p className="text-xs text-gray-600">Select an advisor to start chatting</p>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {mockAdvisors.map((advisor) => (
            <div
              key={advisor.id}
              className={`flex flex-col items-center gap-2 cursor-pointer p-3 rounded-xl transition-all duration-300 min-w-[80px] ${
                selectedAdvisor?.id === advisor.id 
                  ? 'bg-blue-50 border-2 border-blue-300' 
                  : 'bg-white hover:bg-gray-50 border-2 border-transparent'
              }`}
              onClick={() => handleAdvisorClick(advisor)}
            >
              <div className="relative">
                <Avatar 
                  src={advisor.avatar} 
                  size={40} 
                  className="ring-2 ring-white shadow-sm"
                />
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-800 text-xs truncate max-w-[70px]">
                  {advisor.name.split(' ')[0]}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Messages Area - Bottom Section */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="space-y-0">
          {mockAdvisors.map((advisor) => {
            const lastMessage = getLastMessageForAdvisor(advisor.id);
            return (
              <div
                key={advisor.id}
                className={`cursor-pointer transition-all duration-300 hover:bg-gray-50 border-b border-gray-100 ${
                  selectedAdvisor?.id === advisor.id 
                    ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                    : 'hover:border-gray-200'
                }`}
                onClick={() => handleChatClick(advisor)}
              >
                <div className="flex items-center gap-4 p-4">
                  <div className="relative">
                    <Avatar 
                      src={advisor.avatar} 
                      size={48} 
                      className="ring-3 ring-gray-100 shadow-md"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-semibold text-gray-800 text-base">{advisor.name}</div>
                    </div>
                    {lastMessage && (
                      <div className="text-sm text-gray-500 truncate leading-relaxed">
                        {lastMessage.content} · {advisor.lastMessageTime}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdvisorChatTab; 