import React, { useState, useEffect } from 'react';
import MainChatBox from './mainChatBox';

interface Advisor {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
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

const GlobalChatBox: React.FC = () => {
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null);
  const [chatBoxOpen, setChatBoxOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const handleOpenChatBox = (event: CustomEvent) => {
      const advisor = event.detail;
      setSelectedAdvisor(advisor);
      setChatBoxOpen(true);
    };

    window.addEventListener('openMainChatBox', handleOpenChatBox as EventListener);

    return () => {
      window.removeEventListener('openMainChatBox', handleOpenChatBox as EventListener);
    };
  }, []);

  const handleCloseChatBox = () => {
    setChatBoxOpen(false);
    setSelectedAdvisor(null);
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || !selectedAdvisor) return;
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'student',
      receiverId: selectedAdvisor.id,
      content: message,
      timestamp: new Date().toLocaleTimeString(),
      isRead: false,
      messageType: 'text'
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  return (
    <>
      {selectedAdvisor && (
        <MainChatBox
          advisor={selectedAdvisor}
          messages={messages}
          onSendMessage={handleSendMessage}
          onClose={handleCloseChatBox}
          isOpen={chatBoxOpen}
        />
      )}
    </>
  );
};

export default GlobalChatBox; 