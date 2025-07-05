import React from 'react';
import { Avatar } from 'antd';
import { UserOutlined, RobotOutlined } from '@ant-design/icons';
import type { IChatMessage, IChatSession } from '../../interfaces/IChatAI';

interface ChatMessageProps {
  message: IChatMessage;
  session: IChatSession;
  isUser?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, session, isUser }) => {
  // Use provided isUser prop or calculate based on senderId
  const isUserMessage = isUser !== undefined ? isUser : message.senderId === session.studentId;
  
  const formatTime = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className={`flex items-end ${isUserMessage ? 'justify-end' : 'justify-start'} w-full group`}>
      <div className={`flex items-end gap-3 ${isUserMessage ? 'flex-row-reverse' : ''} w-full max-w-4xl`}>
        <Avatar
          icon={isUserMessage ? <UserOutlined /> : <RobotOutlined />}
          size={36}
          className={`border-2 transition-all duration-200 ${
            isUserMessage 
              ? 'border-blue-200 bg-gradient-to-br from-blue-500 to-blue-600' 
              : 'border-blue-100 bg-gradient-to-br from-blue-50 to-blue-100'
          }`}
        />
        <div className={`max-w-[70vw] md:max-w-2xl ${isUserMessage ? 'text-right' : 'text-left'}`}>
          <div className={`inline-block px-5 py-3 rounded-2xl text-base font-medium shadow-md transition-all duration-200 hover:shadow-lg ${
            isUserMessage
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
              : 'bg-gradient-to-r from-gray-50 to-blue-50 text-gray-800 border border-gray-200'
          }`}>
            <div className="whitespace-pre-wrap break-words leading-relaxed">
              {message.content}
            </div>
            <div className={`text-xs mt-2 opacity-70 ${isUserMessage ? 'text-blue-100' : 'text-gray-500'}`}>
              {formatTime(message.createdAt)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage; 