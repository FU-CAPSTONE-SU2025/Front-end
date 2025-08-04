import React, { useState } from 'react';
import { Avatar, Badge, Input, Button } from 'antd';
import { SendOutlined, MoreOutlined, PhoneOutlined, VideoCameraOutlined, CloseOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { AdvisorSession } from '../../hooks/useAdvisorChat';
import { ChatMessage } from '../../interfaces/IChat';
import StaffNameDisplay from './staffNameDisplay';
import { useAdvisorChat } from '../../hooks/useAdvisorChat';

interface MainChatBoxProps {
  session: AdvisorSession;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onClose: () => void;
  isOpen: boolean;
  loading?: boolean;
}

const MainChatBox: React.FC<MainChatBoxProps> = ({
  session,
  messages,
  onSendMessage,
  onClose,
  isOpen,
  loading = false
}) => {
  // Don't render if no session is provided
  if (!session) return null;
  const [messageInput, setMessageInput] = useState('');

  const handleSendMessage = async (msg: string) => {
    if (!msg.trim()) return;
    
    try {
      await onSendMessage(msg);
      setMessageInput('');
    } catch (err) {
      console.error('Failed to send message:', err);
      // Only show error if it's a real network/connection error
      if (err instanceof Error && !err.message.includes('negotiation') && !err.message.includes('No connection')) {
        // Don't show error message for temporary connection issues
        console.warn('Connection issue, message may still be sent:', err);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(messageInput);
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
            <Avatar 
              src={session.staffAvatar || 'https://i.pravatar.cc/150?img=1'} 
              size={36} 
              className="ring-2 ring-white shadow-md" 
            />
            {session.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-800 text-sm">
              {session.staffId ? (
                <StaffNameDisplay 
                  staffId={session.staffId}
                  fallbackName={session.staffName || session.title}
                />
              ) : (
                session.staffName || session.title
              )}
            </div>
            <div className="text-xs text-gray-500">Advisor</div>
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
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <div className="text-sm">Loading messages...</div>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <div className="text-3xl mb-2">💬</div>
              <div className="text-xs font-medium">Start a conversation with {session.staffName || session.title}</div>
              <div className="text-xs text-gray-400 mt-1">Send a message to begin chatting</div>
            </div>
          </div>
        ) : (
                        messages.map((message) => {
                // Determine if this is a student message (senderId = 18)
                const isStudentMessage = message.senderId === 18; // Current user (student)
                return (
                  <div
                    key={message.id}
                    className={`flex ${isStudentMessage ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs ${
                        isStudentMessage
                          ? 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                          : 'bg-blue-600 text-white shadow-md'
                      }`}
                    >
                      <div className="leading-relaxed">{message.content}</div>
                      <div className={`text-xs mt-1 ${
                        isStudentMessage ? 'text-gray-500' : 'text-blue-200'
                      }`}>
                        {formatTime(message.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })
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
            disabled={loading}
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