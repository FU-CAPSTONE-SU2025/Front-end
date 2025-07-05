import React, { useState, useRef, useEffect } from 'react';
import { Avatar, Button, Input, Spin, Modal, message } from 'antd';
import { CloseOutlined, ExpandOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import type { IChatSession, IChatMessage as ChatMessageType } from '../../interfaces/IChatAI';
import { useChatSessionMessagesSimple, useSendChatMessage } from '../../hooks/useChatApi';

import ChatInput from './chatInput';
import ChatMessage from './chatMessage';

const AI_BOT = {
  name: 'AISEA BOT',
  avatar: '/img/Logo.svg',
};

interface ChatBoxProps {
  session: IChatSession | null;
}

const ChatBox: React.FC<ChatBoxProps> = ({ session }) => {
  const chatSessionId = session?.id;
  const { data: messages = [], isLoading, error, refetch } = useChatSessionMessagesSimple(chatSessionId);
  const sendMessageMutation = useSendChatMessage();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check if current user is the sender (for message display)
  const isCurrentUser = (message: ChatMessageType) => {
    // TODO: Replace with actual user ID from auth context
    return message.senderId === 1; // Assuming user ID is 1 for now
  };

  // Handle error state
  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <div className="text-red-500 text-2xl font-bold mb-4">Error Loading Messages</div>
        <div className="text-gray-600 mb-4">{error.message}</div>
        <Button type="primary" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 p-8">
        <Avatar 
          icon={<RobotOutlined />} 
          size={64} 
          className="mb-4 bg-blue-100 text-blue-600"
        />
        <div className="text-2xl font-bold mb-2">Select a chat session</div>
        <div className="text-base">Or create a new chat to start conversation with AISEA BOT.</div>
      </div>
    );
  }

  const handleSendMessage = (messageContent: string) => {
    if (!chatSessionId) {
      message.error('No active chat session');
      return;
    }

    sendMessageMutation.mutate(
      { message: messageContent, chatSessionId },
      {
        onSuccess: () => {
          console.log('Message sent successfully');
        },
        onError: (error) => {
          message.error('Failed to send message: ' + error.message);
        }
      }
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-white to-blue-50">
        <div className="flex items-center gap-3">
          <Avatar 
            src={AI_BOT.avatar} 
            icon={<RobotOutlined />}
            size={40}
            className="border-2 border-blue-200"
          />
          <div>
            <h3 className="font-semibold text-gray-800">{session.title}</h3>
            <p className="text-sm text-gray-500">Session ID: {session.id}</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Spin size="large" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <Avatar 
              icon={<RobotOutlined />} 
              size={48} 
              className="mb-4 bg-blue-100 text-blue-600"
            />
            <div className="text-lg font-medium mb-2">No messages yet</div>
            <div className="text-sm">Start the conversation with AISEA BOT!</div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={msg.messageId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ChatMessage 
                  message={msg} 
                  session={session} 
                  isUser={isCurrentUser(msg)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-blue-100 bg-gradient-to-r from-white to-blue-50 rounded-b-2xl p-4">
        <ChatInput 
          chatSessionId={chatSessionId} 
          disabled={!session || sendMessageMutation.isPending}
          onSendMessage={handleSendMessage}
          loading={sendMessageMutation.isPending}
        />
      </div>
    </div>
  );
};

export default ChatBox;
