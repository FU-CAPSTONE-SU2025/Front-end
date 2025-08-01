import React, { useState } from 'react';
import { Avatar, Badge, Input, Button } from 'antd';
import { SendOutlined, MoreOutlined, PhoneOutlined, VideoCameraOutlined, CloseOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

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

interface MainChatBoxProps {
  advisor: Advisor;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

const MainChatBox: React.FC<MainChatBoxProps> = ({
  advisor,
  messages,
  onSendMessage,
  onClose,
  isOpen
}) => {
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (msg: string) => {
    if (!msg.trim()) return;
    
    setLoading(true);
    try {
      await onSendMessage(msg);
      setMessageInput('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(messageInput);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 100, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 100, scale: 0.9 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed bottom-6 right-6 w-80 h-96 bg-white rounded-2xl shadow-2xl z-50 border border-gray-200"
    >
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar src={advisor.avatar} size={36} className="ring-2 ring-white shadow-md" />
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
              advisor.isOnline ? 'bg-green-400' : 'bg-gray-400'
            }`} />
          </div>
          <div>
            <div className="font-semibold text-gray-800 text-sm">{advisor.name}</div>
            <div className="text-xs text-gray-500">{advisor.role}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            type="text" 
            icon={<PhoneOutlined />} 
            size="small" 
            className="text-gray-600 hover:text-blue-600" 
          />
          <Button 
            type="text" 
            icon={<VideoCameraOutlined />} 
            size="small" 
            className="text-gray-600 hover:text-blue-600" 
          />
          <Button 
            type="text" 
            icon={<MoreOutlined />} 
            size="small" 
            className="text-gray-600 hover:text-blue-600" 
          />
          <Button 
            type="text" 
            icon={<CloseOutlined />} 
            size="small" 
            className="text-gray-600 hover:text-red-600" 
            onClick={onClose}
          />
        </div>
      </div>

      {/* Messages */}
      <div className="h-64 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <div className="text-3xl mb-2">💬</div>
              <div className="text-xs font-medium">Start a conversation with {advisor.name}</div>
              <div className="text-xs text-gray-400 mt-1">Send a message to begin chatting</div>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === 'student' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs ${
                  message.senderId === 'student'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                }`}
              >
                <div className="leading-relaxed">{message.content}</div>
                <div className={`text-xs mt-1 ${
                  message.senderId === 'student' ? 'text-blue-200' : 'text-gray-500'
                }`}>
                  {message.timestamp}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
        <div className="flex items-center gap-2">
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            size="small"
            className="flex-1 rounded-xl"
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={() => handleSendMessage(messageInput)}
            disabled={!messageInput.trim() || loading}
            size="small"
            loading={loading}
            className="bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default MainChatBox; 