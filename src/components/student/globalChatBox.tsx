import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Avatar, Button, Input, message } from 'antd';
import { SendOutlined, CloseOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useAdvisorChat, AdvisorSession } from '../../hooks/useAdvisorChat';
import StaffNameDisplay from './staffNameDisplay';

interface Advisor {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  role: string;
}

const GlobalChatBox: React.FC = () => {
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null);
  const [chatBoxOpen, setChatBoxOpen] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [currentSession, setCurrentSession] = useState<AdvisorSession | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isUnmountedRef = useRef(false);
  const sessionsRef = useRef<AdvisorSession[]>([]);
  const isSendingRef = useRef(false);

  const {
    connectionState,
    sessions,
    messages,
    error,
    joinSession,
    sendMessage,
    loadMoreMessages,
    setMessages,
  } = useAdvisorChat();

  const sendMessageRef = useRef<typeof sendMessage>(sendMessage);

  // Update sessions ref when sessions change
  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);

  // Update sendMessage ref when sendMessage changes
  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  // Memoized event handler to prevent recreation
  const handleOpenChatBox = useCallback((event: CustomEvent) => {
    if (isUnmountedRef.current) return;
    
    const advisor = event.detail;
    const sessionId = parseInt(advisor.id);
    
    setSelectedAdvisor(advisor);
    setChatBoxOpen(true);
    
    // Find the current session to get staffId using ref
    const session = sessionsRef.current.find(s => s.id === sessionId);
    setCurrentSession(session || null);
    
    // Only join if it's a different session
    if (advisor.id && sessionId !== currentSessionId) {
      setCurrentSessionId(sessionId);
      joinSession(sessionId);
    } else if (advisor.id && sessionId === currentSessionId && !session) {
      // Make sure currentSession is set
      joinSession(sessionId);
    }
  }, [joinSession, currentSessionId]);

  // Setup event listener only once
  useEffect(() => {
    window.addEventListener('openMainChatBox', handleOpenChatBox as EventListener);

    return () => {
      window.removeEventListener('openMainChatBox', handleOpenChatBox as EventListener);
    };
  }, [handleOpenChatBox]);

  // Component lifecycle tracking
  useEffect(() => {
    isUnmountedRef.current = false;
    return () => {
      isUnmountedRef.current = true;
      isSendingRef.current = false;
    };
  }, []);

  // Memoized scroll function
  const scrollToBottom = useCallback(() => {
    if (!isUnmountedRef.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Scroll to bottom only when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length, scrollToBottom]);

  const handleCloseChatBox = useCallback(() => {
    setChatBoxOpen(false);
    setSelectedAdvisor(null);
    // Don't clear messages or session ID - keep them for when reopening
  }, []);

  const handleSendMessage = useCallback(async (msg?: string) => {
    const messageToSend = msg || messageInput.trim();
    if (!messageToSend || isSendingRef.current) return;
    if (!currentSessionId) {
      message.warning('No session selected');
      return;
    }
    
    isSendingRef.current = true;
    setSendingMessage(true);
    
    try {
      await sendMessageRef.current(messageToSend);
      setMessageInput('');
    } catch (error: any) {
      const errorMsg = typeof error?.message === 'string' ? error.message : '';
      // If session not ready yet, attempt quick join then retry once
      if (errorMsg.includes('No active session') || errorMsg.includes('Connection not available')) {
        try {
          await joinSession(currentSessionId);
          await sendMessageRef.current(messageToSend);
          setMessageInput('');
        } catch (retryErr) {
          message.error('Failed to send message');
        }
      } else {
        message.error('Failed to send message');
      }
    } finally {
      setSendingMessage(false);
      isSendingRef.current = false;
    }
  }, [messageInput, joinSession, currentSessionId]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      if (!sendingMessage && messageInput.trim()) {
        handleSendMessage();
      }
    }
  }, [sendingMessage, messageInput, handleSendMessage]);

  const handleSendClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!sendingMessage && messageInput.trim()) {
      handleSendMessage();
    }
  }, [sendingMessage, messageInput, handleSendMessage]);

  // Memoized format time function
  const formatTime = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  return (
    <>
      {chatBoxOpen && selectedAdvisor && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-6 right-6 w-80 h-96 bg-white rounded-2xl shadow-2xl z-[9999] border border-gray-200"
        >
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar 
                  src={selectedAdvisor.avatar} 
                  size={36} 
                  className="ring-2 ring-white shadow-md" 
                />
                {selectedAdvisor.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 text-sm">
                  {currentSession && currentSession.staffId ? (
                    <StaffNameDisplay 
                      staffId={currentSession.staffId}
                      fallbackName={selectedAdvisor.name}
                    />
                  ) : (
                    selectedAdvisor.name
                  )}
                </div>
                <div className="text-xs text-gray-500">{selectedAdvisor.role}</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                type="text" 
                icon={<CloseOutlined />} 
                size="small" 
                className="text-gray-600 hover:text-red-600" 
                onClick={handleCloseChatBox}
              />
            </div>
          </div>

          {/* Messages */}
          <div 
            className="h-64 overflow-y-auto p-4 space-y-3 bg-gray-50"
          >
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <div className="text-3xl mb-2">💬</div>
                  <div className="text-xs font-medium">Start a conversation with {selectedAdvisor.name}</div>
                  <div className="text-xs text-gray-400 mt-1">Send a message to begin chatting</div>
                </div>
              </div>
            ) : (
              <>
                {messages
                  .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                  .map((msg, index) => {
                    const isStudentMessage = msg.senderId === 18; // Current user (student)
                    return (
                      <div
                        key={`${msg.id}-${index}`}
                        className={`flex ${isStudentMessage ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs ${
                            isStudentMessage
                              ? 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                              : 'bg-blue-600 text-white shadow-md'
                          }`}
                        >
                          <div className="leading-relaxed">{msg.content}</div>
                          <div className={`text-xs mt-1 ${
                            isStudentMessage ? 'text-gray-500' : 'text-blue-200'
                          }`}>
                            {formatTime(msg.createdAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                <div ref={messagesEndRef} />
              </>
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
                disabled={sendingMessage}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendClick}
                disabled={!messageInput.trim() || sendingMessage}
                size="small"
                loading={sendingMessage}
                className="bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md"
              />
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default GlobalChatBox; 