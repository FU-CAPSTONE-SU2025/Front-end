import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Avatar, Button, Input, Spin, ConfigProvider, message } from 'antd';
import { SendOutlined, UserOutlined, RobotOutlined} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';
import { useChatSessions, useChatSessionMessages, useInitChatSession, useSendChatMessage, useDeleteChatSession, usePrefetchChatSessions, usePrefetchChatMessages } from '../../hooks/useChatApi';
import type { IChatMessage, IChatSession } from '../../interfaces/IChatAI';

import SidebarChat from '../../components/student/sidebarChat';
import HistoryModal from '../../components/student/historyModal';
import { useQueryClient } from '@tanstack/react-query';
import { debugLog } from '../../utils/performanceOptimization';

const AI_BOT = {
  name: 'AISEA BOT',
  avatar: 'https://img.freepik.com/free-vector/chatbot-chat-message-vectorart_78370-4104.jpg?semt=ais_hybrid&w=740',
  description: 'Your intelligent academic assistant'
};



// Typing indicator component - Enhanced
const TypingIndicator: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex w-full justify-start mb-4"
  >
    <div className="flex items-end gap-3 max-w-[80%]">
      {/* Avatar */}
      <div className="flex-shrink-0 mr-3">
        <Avatar
          src={AI_BOT.avatar}
          size={36}
          style={{ objectFit: 'cover' }}
          className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-blue-100 shadow-md"
        />
      </div>

      <div className="flex flex-col items-start">
        <div className="text-xs font-medium mb-1 text-gray-600">
          {AI_BOT.name}
        </div>
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 text-gray-800 border border-gray-200 rounded-2xl px-4 py-3 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="flex space-x-1">
              <motion.div
                className="w-2 h-2 bg-blue-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
              />
              <motion.div
                className="w-2 h-2 bg-blue-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
              />
              <motion.div
                className="w-2 h-2 bg-blue-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
              />
            </div>
            <span className="text-sm font-medium text-gray-600">AI is thinking...</span>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

// Message bubble component - Redesigned for optimal UX
const MessageBubble: React.FC<{ message: IChatMessage; isUser: boolean; formatTime: (date: string | null) => string }> = ({ 
  message, 
  isUser, 
  formatTime 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -20, scale: 0.95 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
  >
    <div className={`flex items-end gap-3 max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
        <Avatar
          src={!isUser ? AI_BOT.avatar : undefined}
          icon={isUser ? <UserOutlined /> : <RobotOutlined />}
          size={36}
          style={!isUser ? { objectFit: 'cover' } : undefined}
          className={`border-2 transition-all duration-200 ${
            isUser 
              ? 'border-blue-200 bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg' 
              : 'border-blue-100 bg-gradient-to-br from-blue-50 to-blue-100 shadow-md'
          }`}
        />
      </div>

      {/* Message Content */}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Sender Name */}
        <div className={`text-xs font-medium mb-1 ${isUser ? 'text-blue-600' : 'text-gray-600'}`}>
          {isUser ? 'You' : AI_BOT.name}
        </div>
        
        {/* Message Bubble */}
        <div className={`relative group ${
          isUser 
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
            : 'bg-gradient-to-r from-gray-50 to-blue-50 text-gray-800 border border-gray-200'
        } rounded-2xl px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-200 max-w-full`}>
          
          {/* Message Text */}
          <div className="whitespace-pre-wrap break-words leading-relaxed text-sm">
            {message.content}
          </div>
          
          {/* Time */}
          <div className={`text-xs mt-2 opacity-70 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
            {formatTime(message.createdAt)}
          </div>
          
          {/* Message Status (for user messages) */}
          {isUser && (
            <div className="absolute -bottom-1 -right-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  </motion.div>
);

// Scroll to bottom button - Enhanced


const ChatAI: React.FC = () => {
  const queryClient = useQueryClient();
  
  // Prefetching hooks
  const prefetchSessions = usePrefetchChatSessions();
  const prefetchMessages = usePrefetchChatMessages();
  
  // API hooks
  const { data: sessions = [], isLoading: loadingSessions, refetch: refetchSessions, error: sessionsError } = useChatSessions();
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const { 
    data: messagesData, 
    isLoading: loadingMessages, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage,
    error: messagesError
  } = useChatSessionMessages(selectedSessionId || undefined, 20);
  
  // Flatten and sort messages from all pages (oldest to newest)
  // Only render messages that have been fetched
  const messages = (messagesData?.pages || [])
    .flatMap(page => page.items)
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateA - dateB;
    });
  
  // Mutations
  const initChatMutation = useInitChatSession();
  const sendMessageMutation = useSendChatMessage();
  const deleteSessionMutation = useDeleteChatSession();
  
  // Local state
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<any>(null);
  const navigate = useNavigate();
  const [showHistoryModal, setShowHistoryModal] = useState(false);



  // Before fetching next page, record current scroll height
  const handleFetchNextPage = useCallback(async () => {
    if (!messagesContainerRef.current) return;
    await fetchNextPage();
  }, [fetchNextPage]);



  // Scroll detection for infinite loading and scroll button
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    
    // Show scroll button if not at bottom
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 100;
    setShowScrollButton(!isAtBottom);
    
    // Load more when user scrolls to top (within 100px)
    if (scrollTop < 100 && hasNextPage && !isFetchingNextPage) {
      debugLog('Loading more messages...');
      handleFetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, handleFetchNextPage]);



  // Focus input when session changes
  useEffect(() => {
    inputRef.current?.focus();
  }, [selectedSessionId]);

  // Select first session if available
  useEffect(() => {
    if (sessions.length > 0 && !selectedSessionId) {
      setSelectedSessionId(sessions[0].id);
    }
  }, [sessions, selectedSessionId]);



  // Debug: Log messages and session info - replaced with debugLog
  useEffect(() => {
    debugLog('=== DEBUG INFO ===');
    debugLog('Selected Session:', sessions.find(s => s.id === selectedSessionId));
    debugLog('Messages count:', messages.length);
    debugLog('Messages:', messages.map(m => ({
      id: m.messageId,
      senderId: m.senderId,
      content: m.content.substring(0, 30) + '...',
      createdAt: m.createdAt
    })));
    debugLog('==================');
  }, [messages, selectedSessionId, sessions]);

  // Prefetch sessions khi component mount
  useEffect(() => {
    prefetchSessions();
  }, [prefetchSessions]);

  // Prefetch messages cho session được chọn
  useEffect(() => {
    if (selectedSessionId) {
      prefetchMessages(selectedSessionId, 20);
    }
  }, [selectedSessionId, prefetchMessages]);

  const selectedSession = sessions.find(s => s.id === selectedSessionId);

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleSend = () => {
    if (!input.trim() || !selectedSessionId || sendMessageMutation.isPending) return;

    const userInput = input;
    setInput('');
    setIsTyping(true);

    // Create optimistic user message with correct senderId
    // Use studentId from selected session to ensure it's recognized as user message
    const optimisticUserMessage: IChatMessage = {
      messageId: Date.now(),
      advisorySession1to1Id: selectedSessionId,
      senderId: selectedSession?.studentId || 1, // Use actual studentId to ensure it's recognized as user
      content: userInput,
      createdAt: new Date().toISOString(),
    };

    debugLog('Creating optimistic user message with senderId:', optimisticUserMessage.senderId);

    // Optimistically update the cache with user message
    queryClient.setQueryData(['chatMessages', selectedSessionId], (oldData: any) => {
      if (!oldData) return { pages: [{ items: [optimisticUserMessage], nextPage: null, hasMore: false }] };
      
      const newPages = [...oldData.pages];
      if (newPages.length > 0) {
        newPages[newPages.length - 1] = {
          ...newPages[newPages.length - 1],
          items: [...newPages[newPages.length - 1].items, optimisticUserMessage]
        };
      }
      
      return { ...oldData, pages: newPages };
    });

    // Simulate typing delay for better UX
    setTimeout(() => {
      sendMessageMutation.mutate(
        { message: userInput, chatSessionId: selectedSessionId },
        {
          onSuccess: (data) => {
            setIsTyping(false);
            if (data && data.message) {
              // Add AI response to cache with correct senderId
              const aiMessage: IChatMessage = {
                messageId: Date.now() + 1,
                advisorySession1to1Id: selectedSessionId,
                senderId: 0, // AI sender ID - this will make it appear on the left
                content: data.message,
                createdAt: new Date().toISOString(),
              };

              debugLog('Creating AI response message with senderId:', aiMessage.senderId);

              queryClient.setQueryData(['chatMessages', selectedSessionId], (oldData: any) => {
                if (!oldData) return { pages: [{ items: [optimisticUserMessage, aiMessage], nextPage: null, hasMore: false }] };
                
                const newPages = [...oldData.pages];
                if (newPages.length > 0) {
                  newPages[newPages.length - 1] = {
                    ...newPages[newPages.length - 1],
                    items: [...newPages[newPages.length - 1].items, aiMessage]
                  };
                }
                
                return { ...oldData, pages: newPages };
              });
            } else {
              message.error('AI did not respond properly. Please try again.');
              // Remove optimistic message on error
              queryClient.setQueryData(['chatMessages', selectedSessionId], (oldData: any) => {
                if (!oldData) return { pages: [{ items: [], nextPage: null, hasMore: false }] };
                
                const newPages = oldData.pages.map((page: any) => ({
                  ...page,
                  items: page.items.filter((msg: IChatMessage) => msg.messageId !== optimisticUserMessage.messageId)
                }));
                
                return { ...oldData, pages: newPages };
              });
            }
          },
          onError: (error) => {
            setIsTyping(false);
            message.error('AI is currently unavailable. Please try again later.');
            debugLog('Send message error:', error);
            // Remove optimistic message on error
            queryClient.setQueryData(['chatMessages', selectedSessionId], (oldData: any) => {
              if (!oldData) return { pages: [{ items: [], nextPage: null, hasMore: false }] };
              
              const newPages = oldData.pages.map((page: any) => ({
                ...page,
                items: page.items.filter((msg: IChatMessage) => msg.messageId !== optimisticUserMessage.messageId)
              }));
              
              return { ...oldData, pages: newPages };
            });
          },
        }
      );
    }, 500); // 500ms typing delay
  };

  const handleNewChat = () => {
    const initMessage = "Hello, I'd like to start a new conversation.";
    initChatMutation.mutate(
      { message: initMessage },
      {
        onSuccess: (data) => {
          debugLog('New chat session created:', data);
          setSelectedSessionId(data.chatSessionId);
          setInput('');
          message.success('New chat session created!');
        },
        onError: (error) => {
          debugLog('Failed to create new chat session:', error);
          message.error('Failed to create new chat session. Please try again.');
        },
      }
    );
  };

  const handleSelectSession = (sessionId: number) => {
    debugLog('Selecting session:', sessionId);
    setSelectedSessionId(sessionId);
    setInput('');
  };

  const handleDeleteSession = (sessionId: number) => {
    deleteSessionMutation.mutate(
      { chatSessionId: sessionId },
      {
        onSuccess: (data) => {
          // Use response message if available, otherwise use default message
          const successMessage = data.message || 'Session deleted successfully';
          message.success(successMessage);
          
          // Select another session if current one was deleted
          if (selectedSessionId === sessionId) {
            const remainingSessions = sessions.filter(s => s.id !== sessionId);
            if (remainingSessions.length > 0) {
              setSelectedSessionId(remainingSessions[0].id);
            } else {
              setSelectedSessionId(null);
            }
          }
        },
        onError: (error) => {
          debugLog('Failed to delete session:', error);
          // Show more specific error message if available
          const errorMessage = error.message || 'Failed to delete session. Please try again.';
          message.error(errorMessage);
        },
      }
    );
  };



  // Check if current user is the sender (for message display)
  const isCurrentUser = (message: IChatMessage) => {
    // AI message: senderId === 14
    // User message: senderId !== 14
    return message.senderId !== 14;
  };

  // Handle errors
  if (sessionsError) {
    return (
      <div className="min-h-screen mt-15 bg-gradient-to-br from-blue-50 via-white to-purple-100 flex justify-center items-center px-2 md:px-8">
        <div className="text-center">
          <div className="text-red-500 text-2xl font-bold mb-4">Error Loading Chat Sessions</div>
          <div className="text-gray-600 mb-4">{sessionsError.message}</div>
          <Button type="primary" onClick={() => refetchSessions()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ConfigProvider
      theme={{
        components: {
          Input: {
            colorBgContainer: '#fff',
            colorBorder: '#e5e7eb',
            colorText: '#374151',
            colorTextPlaceholder: '#9ca3af',
            colorPrimary: '#2563eb',
            colorPrimaryHover: '#1d4ed8',
            borderRadius: 20,
          },
          Button: {
            colorPrimary: '#2563eb',
            colorPrimaryHover: '#1d4ed8',
            colorText: '#fff',
            borderRadius: 20,
          },
        },
      }}
    >
      <div className="min-h-screen mt-15 bg-gradient-to-br from-blue-50 via-white to-purple-100 flex justify-center items-start px-2 md:px-8">
        {/* Sidebar */}
        <SidebarChat
          sessions={sessions}
          selectedSessionId={selectedSessionId}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          onShowHistoryModal={() => setShowHistoryModal(true)}
          AI_BOT={AI_BOT}
          handleDeleteSession={handleDeleteSession}
          loading={loadingSessions}
        />
        
        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col h-[calc(100vh-6rem)] mt-6 mb-6 rounded-3xl shadow-2xl bg-white border border-gray-200 max-w-5xl mx-auto relative overflow-hidden">
       
          <div className="flex-1 flex flex-col relative min-h-0">
                         <div 
               ref={messagesContainerRef}
               className="flex-1 overflow-y-auto px-6 py-6"
               style={{ 
                 height: '100%'
               }}
             >
              {/* Loading indicator for infinite scroll */}
              {isFetchingNextPage && (
                <div className="flex justify-center py-4 mb-4">
                  <div className="flex items-center gap-2 text-gray-500 bg-gray-50 px-4 py-2 rounded-full">
                    <Spin size="small" />
                    <span className="text-sm">Loading older messages...</span>
                  </div>
                </div>
              )}

              {loadingMessages && (
                <div className="flex justify-center py-12">
                  <div className="text-center">
                    <Spin size="large" />
                    <div className="mt-4 text-gray-500">Loading messages...</div>
                  </div>
                </div>
              )}
              
              {!loadingMessages && messages.length === 0 && selectedSession && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-1 flex-col items-center justify-center min-h-[400px] text-center"
                >
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-3xl border border-blue-100 shadow-lg">
                    <Avatar 
                      src={AI_BOT.avatar} 
                      size={80}
                      style={{ objectFit: 'cover' }}
                      className="border-4 border-blue-200 mb-6 shadow-lg"
                    />
                    <h2 className="text-3xl font-bold text-gray-800 mb-3">
                      Welcome to AISEA BOT
                    </h2>
                    <p className="text-gray-600 max-w-lg mb-8 text-lg">
                      Your intelligent academic assistant. Ask anything about your studies, courses, or academic journey!
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
                      {[
                        "Help me understand this course material",
                        "What are the key concepts in this subject?",
                        "How can I improve my study habits?",
                        "Explain this academic concept"
                      ].map((suggestion, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          onClick={() => setInput(suggestion)}
                          className="p-4 bg-white hover:bg-blue-50 rounded-2xl border border-blue-200 text-blue-700 text-left transition-all duration-300 hover:shadow-lg text-base font-medium hover:scale-105"
                        >
                          {suggestion}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              
              {!selectedSession && !loadingSessions && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-1 flex-col items-center justify-center min-h-[400px] text-center"
                >
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-3xl border border-blue-100 shadow-lg">
                    <Avatar 
                      src={AI_BOT.avatar} 
                      size={80}
                      style={{ objectFit: 'cover' }}
                      className="border-4 border-blue-200 mb-6 shadow-lg"
                    />
                    <h2 className="text-3xl font-bold text-gray-800 mb-3">
                      Start Your First Chat
                    </h2>
                    <p className="text-gray-600 max-w-lg mb-8 text-lg">
                      Create your first chat session to begin your conversation with AISEA BOT!
                    </p>
                    <Button
                      type="primary"
                      size="large"
                      onClick={handleNewChat}
                      className="px-8 py-4 text-lg h-auto rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      Start New Chat
                    </Button>
                  </div>
                </motion.div>
              )}
              
              {/* Messages Container */}
              <div className="space-y-2">
                <AnimatePresence>
                  {messages.map((msg, index) => {
                    const isUser = isCurrentUser(msg);
                    
                    return (
                      <MessageBubble
                        key={msg.messageId}
                        message={msg}
                        isUser={isUser}
                        formatTime={formatTime}
                      />
                    );
                  })}
                </AnimatePresence>
                
                {isTyping && <TypingIndicator />}
              </div>
              
              
            </div>
            
            {/* Input Area */}
            <div className="p-6 border-t border-gray-100 bg-gradient-to-r from-white to-blue-50 flex-shrink-0">
              <div className="flex gap-3 items-end w-full max-w-4xl mx-auto">
                <div className="flex-1 relative">
                  <Input.TextArea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onPressEnter={(e) => {
                      if (!e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
                    className="text-base rounded-2xl border-blue-200 focus:border-blue-500 focus:shadow-lg transition-all resize-none pr-12"
                    disabled={sendMessageMutation.isPending || !selectedSessionId}
                    maxLength={2000}
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    style={{ minHeight: 70, maxHeight: 120 }}
                  />
                  <div className="absolute right-3 bottom-2 text-xs text-gray-400">
                    {input.length}/2000
                  </div>
                </div>
                <Button
                  type="primary"
                  icon={<SendOutlined style={{ fontSize: 18 }} />}
                  onClick={handleSend}
                  disabled={!input.trim() || sendMessageMutation.isPending || !selectedSessionId}
                  loading={sendMessageMutation.isPending}
                  size="large"
                  className="rounded-xl h-14 w-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-blue-500 to-blue-600 border-0"
                  
                />
              </div>
              <div className="mt-3 text-xs text-gray-400 text-center">
                💡 Tip: You can use Shift+Enter for new lines and Enter to send messages
              </div>
            </div>
          </div>
        </main>
        
        {/* Scroll to Bottom Button */}
       
        
        {/* History Modal */}
        <HistoryModal
          open={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          sessions={sessions}
          selectedSessionId={selectedSessionId}
          onSelectSession={handleSelectSession}
          AI_BOT={AI_BOT}
          handleDeleteSession={handleDeleteSession}
        />
      </div>
    </ConfigProvider>
  );
};

export default ChatAI; 