import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Avatar, Button, Input, message } from 'antd';
import { SendOutlined, CloseOutlined, ReloadOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useAdvisorChatWithStudent } from '../../hooks/useAdvisorChatWithStudent';
import { SIGNALR_CONFIG, ConnectionState, getConnectionStatusColor, formatTime, validateMessage } from '../../config/signalRConfig';
import { StudentSession, ChatMessage } from '../../interfaces/IChat';

interface Student {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  role: string;
}

const GlobalChatBox: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [chatBoxOpen, setChatBoxOpen] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingMoreMessages, setIsLoadingMoreMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isUnmountedRef = useRef(false);
  const isSendingRef = useRef(false);
  const lastSentMessageRef = useRef<string>('');

  const {
    connectionState,
    currentSession,
    messages,
    error,
    advisorId,
    joinSession,
    sendMessage,
    loadInitialMessages,
    loadMoreMessages,
    setMessages,
    setError,
  } = useAdvisorChatWithStudent();

  // Component lifecycle tracking
  useEffect(() => {
    isUnmountedRef.current = false;
    return () => {
      isUnmountedRef.current = true;
      isSendingRef.current = false;
    };
  }, []);

  // Memoized event handler to prevent recreation
  const handleOpenChatBox = useCallback((event: CustomEvent) => {
    if (isUnmountedRef.current) return;
    
    const student = event.detail;
    const sessionId = parseInt(student.id);
    
    setSelectedStudent(student);
    setChatBoxOpen(true);
    
    // Only join if it's a different session
    if (student.id && sessionId !== currentSessionId) {
      setCurrentSessionId(sessionId);
      joinSession(sessionId);
    } else if (student.id && sessionId === currentSessionId) {
      // Make sure currentSession is set
      if (!currentSession) {
        joinSession(sessionId);
      }
    }
  }, [joinSession, currentSessionId, currentSession]);

  // Setup event listener only once
  useEffect(() => {
    window.addEventListener('openAdvisorChatBox', handleOpenChatBox as EventListener);

    return () => {
      window.removeEventListener('openAdvisorChatBox', handleOpenChatBox as EventListener);
    };
  }, [handleOpenChatBox]);

  // Memoized scroll function
  const scrollToBottom = useCallback(() => {
    if (!isUnmountedRef.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Load more messages when scrolling to top
  const handleMessagesScroll = useCallback(() => {
    if (!messagesContainerRef.current || isLoadingMoreMessages || !currentSession || isUnmountedRef.current) return;

    const { scrollTop } = messagesContainerRef.current;
    
    // Load more messages when scrolled to top (for older messages)
    if (scrollTop < 100) {
      setIsLoadingMoreMessages(true);
      loadMoreMessages(currentSession.id, 1)
        .finally(() => {
          setIsLoadingMoreMessages(false);
        });
    }
  }, [isLoadingMoreMessages, currentSession, loadMoreMessages]);

  // Add scroll event listener
  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (messagesContainer) {
      let timeoutId: NodeJS.Timeout;
      
      const debouncedHandleScroll = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(handleMessagesScroll, 100);
      };
      
      messagesContainer.addEventListener('scroll', debouncedHandleScroll);
      return () => {
        messagesContainer.removeEventListener('scroll', debouncedHandleScroll);
        clearTimeout(timeoutId);
      };
    }
  }, [handleMessagesScroll]);

  // Scroll to bottom only when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length, scrollToBottom]);

  // Handle connection state changes
  useEffect(() => {
    if (connectionState === ConnectionState.Connected && error) {
      setError(null);
    }
  }, [connectionState, error, setError]);

  const handleCloseChatBox = useCallback(() => {
    setChatBoxOpen(false);
    setSelectedStudent(null);
    setMessageInput('');
    // Don't clear messages or session ID - keep them for when reopening
  }, []);

  const handleSendMessage = useCallback(async (msg?: string) => {
    const messageToSend = msg || messageInput.trim();
    if (!messageToSend || isSendingRef.current) return;
    
    isSendingRef.current = true;
    setSendingMessage(true);
    
    try {
      await sendMessage(messageToSend);
      setMessageInput('');
    } catch (error) {
      message.error('Failed to send message');
    } finally {
      setSendingMessage(false);
      isSendingRef.current = false;
    }
  }, [messageInput, sendMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      if (!sendingMessage && messageInput.trim()) {
        handleSendMessage();
      }
    }
  }, [sendingMessage, messageInput, handleSendMessage]);

  const handleRetryConnection = useCallback(() => {
    if (selectedStudent && currentSessionId) {
      joinSession(currentSessionId);
    }
  }, [selectedStudent, currentSessionId, joinSession]);

  return (
    <>
      {chatBoxOpen && selectedStudent && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: SIGNALR_CONFIG.UI.MESSAGE_ANIMATION_DURATION / 1000, ease: "easeOut" }}
          className="fixed bottom-6 right-6 w-80 h-96 bg-white rounded-2xl shadow-2xl z-[9999] border border-gray-200"
        >
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar 
                  src={selectedStudent.avatar} 
                  size={36} 
                  className="ring-2 ring-white shadow-md" 
                />
                {selectedStudent.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                )}
              </div>
              <div>
                <div className="font-semibold text-gray-800 text-sm">
                  {selectedStudent.name}
                </div>
                
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

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-b border-red-200 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-red-500">⚠️</span>
                  <span className="text-red-700 text-xs">{error}</span>
                </div>
                <Button 
                  type="text" 
                  icon={<ReloadOutlined />} 
                  size="small" 
                  onClick={handleRetryConnection}
                  className="text-red-500 hover:text-red-700"
                />
              </div>
            </div>
          )}

          {/* Messages */}
          <div 
            ref={messagesContainerRef}
            className="h-64 overflow-y-auto p-4 space-y-3 bg-gray-50 relative scroll-smooth"
          >
            {/* Loading more messages indicator */}
            {isLoadingMoreMessages && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center py-2"
              >
                <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1 shadow-sm">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span className="text-xs text-gray-500">Loading more messages...</span>
                </div>
              </motion.div>
            )}
            
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <div className="text-3xl mb-2">💬</div>
                  <div className="text-xs font-medium">Start a conversation</div>
                </div>
              </div>
            ) : (
              <>
                {messages
                  .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                  .map((msg, index) => {
                    // Check if this is a student message (senderId = 13)
                    const isStudentMessage = msg.senderId === 13; // Student message (senderId = 13)
                    return (
                      <motion.div
                        key={`${msg.id}-${index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`flex ${isStudentMessage ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs transition-all duration-200 hover:shadow-md ${
                            isStudentMessage
                              ? 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                              : 'bg-green-600 text-white shadow-md'
                          }`}
                        >
                          <div className="leading-relaxed">{msg.content}</div>
                          <div className={`text-xs mt-1 ${
                            isStudentMessage ? 'text-gray-500' : 'text-green-200'
                          }`}>
                            {formatTime(msg.createdAt)}
                          </div>
                        </div>
                      </motion.div>
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
                placeholder="Message..."
                size="small"
                className="flex-1 rounded-xl"
                disabled={sendingMessage}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={() => {
                  if (!sendingMessage && messageInput.trim()) {
                    handleSendMessage();
                  }
                }}
                disabled={!validateMessage(messageInput) || sendingMessage}
                size="small"
                loading={sendingMessage}
                className="bg-green-600 hover:bg-green-700 rounded-xl shadow-md"
              />
            </div>

          </div>
        </motion.div>
      )}
    </>
  );
};

export default GlobalChatBox; 