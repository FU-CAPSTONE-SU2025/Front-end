import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Avatar, Button, Input, Spin, ConfigProvider, message } from 'antd';
import { SendOutlined, UserOutlined, RobotOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';
import { useQueryClient, useMutation } from '@tanstack/react-query';


// API and Hooks
import { useChatSessions, useChatSessionMessages, useInitChatSession, useDeleteChatSession, usePrefetchChatSessions, usePrefetchChatMessages } from '../../hooks/useChatApi';
import { useAiChatApi } from '../../hooks/useAiChatApi';
import type { IChatMessage, IChatSession, ISendChatMessageRequest, ISendChatMessageResponse } from '../../interfaces/IChatAI';

// Components
import SidebarChat from '../../components/student/sidebarChat';
import HistoryModal from '../../components/student/historyModal';
import ErrorBoundary from '../../components/common/ErrorBoundary';

// Utils
import { debugLog } from '../../utils/performanceOptimization';

// Custom Markdown renderer component
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const renderMarkdown = (text: string) => {
    // Handle code blocks (```code```)
    text = text.replace(/```([\s\S]*?)```/g, (match, code) => {
      return `<pre style="background-color: #f3f4f6; padding: 0.75rem; border-radius: 0.5rem; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; font-size: 0.875rem; overflow-x: auto; margin: 0.5rem 0;"><code>${code}</code></pre>`;
    });

    // Handle inline code (`code`)
    text = text.replace(/`([^`]+)`/g, '<code style="background-color: #f3f4f6; padding: 0.125rem 0.25rem; border-radius: 0.25rem; font-family: \'Monaco\', \'Menlo\', \'Ubuntu Mono\', monospace; font-size: 0.875rem;">$1</code>');

    // Handle bold (**text** or __text__)
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600;">$1</strong>');
    text = text.replace(/__(.*?)__/g, '<strong style="font-weight: 600;">$1</strong>');

    // Handle italic (*text* or _text_)
    text = text.replace(/\*(.*?)\*/g, '<em style="font-style: italic;">$1</em>');
    text = text.replace(/_(.*?)_/g, '<em style="font-style: italic;">$1</em>');

    // Handle lists
    text = text.replace(/^\s*[-*+]\s+(.+)$/gm, '<li style="margin: 0.25rem 0;">$1</li>');
    text = text.replace(/^\s*\d+\.\s+(.+)$/gm, '<li style="margin: 0.25rem 0;">$1</li>');

    // Wrap lists in ul/ol
    text = text.replace(/(<li.*?<\/li>)/gs, '<ul style="margin: 0.5rem 0; padding-left: 1rem; list-style-type: disc;">$1</ul>');

    // Handle line breaks
    text = text.replace(/\n/g, '<br />');

    return text;
  };

  return (
    <div 
      style={{ lineHeight: 1.6 }}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
};

// Constants
const AI_BOT = {
  name: 'AISEA BOT',
  avatar: 'https://img.freepik.com/free-vector/chatbot-chat-message-vectorart_78370-4104.jpg?semt=ais_hybrid&w=740',
  description: 'Your intelligent academic assistant'
};

const AI_SENDER_ID = 14; // AI sender ID constant
const TYPING_DELAY = 500; // ms
const MAX_MESSAGE_LENGTH = 2000;

// Typing indicator component
const TypingIndicator: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex w-full justify-start mb-4"
  >
    <div className="flex items-end gap-3 max-w-[80%]">
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

// Message bubble component
const MessageBubble: React.FC<{ 
  message: IChatMessage; 
  isUser: boolean; 
  formatTime: (date: string | null) => string 
}> = ({ message, isUser, formatTime }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -20, scale: 0.95 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
  >
    <div className={`flex items-end gap-3 max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
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

      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`text-xs font-medium mb-1 ${isUser ? 'text-blue-600' : 'text-gray-600'}`}>
          {isUser ? 'You' : AI_BOT.name}
        </div>
        
        <div className={`relative group ${
          isUser 
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
            : 'bg-gradient-to-r from-gray-50 to-blue-50 text-gray-800 border border-gray-200'
        } rounded-2xl px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-200 max-w-full`}>
          
          {/* Message Text */}
          <div className="whitespace-pre-wrap break-words leading-relaxed text-sm">
            {isUser ? (
              message.content
            ) : (
              <MarkdownRenderer content={message.content} />
            )}
          </div>
          
          <div className={`text-xs mt-2 opacity-70 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
            {formatTime(message.createdAt)}
          </div>
          
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

// Welcome message component
const WelcomeMessage: React.FC<{ 
  title: string; 
  description: string; 
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}> = ({ title, description, suggestions, onSuggestionClick }) => (
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
        {title}
      </h2>
      <p className="text-gray-600 max-w-lg mb-8 text-lg">
        {description}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            onClick={() => onSuggestionClick(suggestion)}
            className="p-4 bg-white hover:bg-blue-50 rounded-2xl border border-blue-200 text-blue-700 text-left transition-all duration-300 hover:shadow-lg text-base font-medium hover:scale-105"
          >
            {suggestion}
          </motion.button>
        ))}
      </div>
    </div>
  </motion.div>
);

// Main ChatAI component
const ChatAI: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // Refs
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<any>(null);
  
  // State
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [tempSessionId, setTempSessionId] = useState<number | null>(null);

  // Prefetching hooks
  const prefetchSessions = usePrefetchChatSessions();
  const prefetchMessages = usePrefetchChatMessages();
  
  // API hooks
  const { 
    data: sessions = [], 
    isLoading: loadingSessions, 
    refetch: refetchSessions, 
    error: sessionsError 
  } = useChatSessions();
  
  const { 
    data: messagesData, 
    isLoading: loadingMessages, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage,
    error: messagesError
  } = useChatSessionMessages(
    // Only fetch messages if we have a real session (not temporary)
    selectedSessionId && tempSessionId !== selectedSessionId ? selectedSessionId : undefined, 
    20
  );
  
  // Mutations
  const initChatMutation = useInitChatSession();
  const deleteSessionMutation = useDeleteChatSession();
  
  const { sendChatMessage: sendChatMessageApi } = useAiChatApi();
  
  // Custom send message mutation
  const sendMessageMutation = useMutation<ISendChatMessageResponse, Error, ISendChatMessageRequest>({
    mutationFn: async (request) => {
      debugLog('Sending message to session', { 
        chatSessionId: request.chatSessionId, 
        message: request.message 
      });
      const response = await sendChatMessageApi(request);
      debugLog('Send message response:', response);
      return response;
    },
    onSuccess: (_data, variables) => {
      debugLog('Message sent successfully to session', variables.chatSessionId);
      
      // Update session list to update last message time
      queryClient.setQueryData(['chatSessions'], (oldData: IChatSession[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(session => 
          session.id === variables.chatSessionId 
            ? { ...session, updatedAt: new Date().toISOString() }
            : session
        );
      });
    },
    onError: (error, variables) => {
      debugLog('Failed to send message to session', { 
        chatSessionId: variables.chatSessionId, 
        error 
      });
    }
  });

  // Process messages
  const messages = (messagesData?.pages || [])
    .flatMap(page => page.items)
    .filter(msg => msg.content !== "New chat session")
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateA - dateB;
    });

  // Utility functions
  const formatTime = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const isCurrentUser = (message: IChatMessage) => {
    const isUser = message.senderId !== AI_SENDER_ID;
    debugLog(`Message senderId: ${message.senderId}, isUser: ${isUser}, content: ${message.content.substring(0, 30)}...`);
    return isUser;
  };

  // Message handling for subsequent messages (not first message)
  const sendMessageToSession = useCallback((sessionId: number, userInput: string) => {
    const selectedSession = sessions.find(s => s.id === sessionId);
    const optimisticUserMessage: IChatMessage = {
      messageId: Date.now(),
      advisorySession1to1Id: sessionId,
      senderId: selectedSession?.studentId || 1,
      content: userInput,
      createdAt: new Date().toISOString(),
    };

    debugLog('Creating optimistic user message for subsequent message with senderId:', optimisticUserMessage.senderId);

    // Optimistically update cache with user message
    queryClient.setQueryData(['chatMessages', sessionId], (oldData: any) => {
      if (!oldData) return { 
        pages: [{ items: [optimisticUserMessage], nextPage: null, hasMore: false }] 
      };
      
      const newPages = [...oldData.pages];
      if (newPages.length > 0) {
        newPages[newPages.length - 1] = {
          ...newPages[newPages.length - 1],
          items: [...newPages[newPages.length - 1].items, optimisticUserMessage]
        };
      }
      
      return { ...oldData, pages: newPages };
    });

    // Send message with typing delay
    setTimeout(() => {
      sendMessageMutation.mutate(
        { message: userInput, chatSessionId: sessionId },
        {
          onSuccess: (data) => {
            setIsTyping(false);
            if (data && data.message) {
              const aiMessage: IChatMessage = {
                messageId: Date.now() + 1,
                advisorySession1to1Id: sessionId,
                senderId: AI_SENDER_ID,
                content: data.message,
                createdAt: new Date().toISOString(),
              };

              debugLog('Creating AI response message for subsequent message with senderId:', aiMessage.senderId);

              // Add AI response to cache
              queryClient.setQueryData(['chatMessages', sessionId], (oldData: any) => {
                if (!oldData) return { 
                  pages: [{ items: [optimisticUserMessage, aiMessage], nextPage: null, hasMore: false }] 
                };
                
                const newPages = oldData.pages.map((page: any) => ({
                  ...page,
                  items: [...page.items, aiMessage]
                }));
                
                return { ...oldData, pages: newPages };
              });
            } else {
              message.error('AI did not respond properly. Please try again.');
              removeOptimisticMessage(sessionId, optimisticUserMessage.messageId);
            }
          },
          onError: (error) => {
            setIsTyping(false);
            message.error('AI is currently unavailable. Please try again later.');
            debugLog('Send message error:', error);
            removeOptimisticMessage(sessionId, optimisticUserMessage.messageId);
          },
        }
      );
    }, TYPING_DELAY);
  }, [sessions, sendMessageMutation, queryClient]);

  const removeOptimisticMessage = useCallback((sessionId: number, messageId: number) => {
    queryClient.setQueryData(['chatMessages', sessionId], (oldData: any) => {
      if (!oldData) return { pages: [{ items: [], nextPage: null, hasMore: false }] };
      
      const newPages = oldData.pages.map((page: any) => ({
        ...page,
        items: page.items.filter((msg: IChatMessage) => msg.messageId !== messageId)
      }));
      
      return { ...oldData, pages: newPages };
    });
  }, [queryClient]);

  // Event handlers
  const handleSend = useCallback(() => {
    if (!input.trim() || sendMessageMutation.isPending || initChatMutation.isPending) return;

    const userInput = input;
    setInput('');
    setIsTyping(true);

    // If no real session selected (including temporary session) or no sessions exist, create new session first using init API
    if (!selectedSessionId || tempSessionId === selectedSessionId || sessions.length === 0) {
      debugLog('No real session selected or no sessions exist, using init API to create session and send first message');
      initChatMutation.mutate(
        { message: userInput },
        {
          onSuccess: (data) => {
            debugLog('Session created and first message sent via init API:', data);
            
            // Create new session object for the session list
            const newSession: IChatSession = {
              id: data.chatSessionId,
              studentId: 1,
              staffId: 1,
              type: 1,
              title: userInput.substring(0, 50) + (userInput.length > 50 ? '...' : ''),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            
            // Update sessions list
            queryClient.setQueryData(['chatSessions'], (oldData: IChatSession[] | undefined) => {
              if (!oldData) return [newSession];
              return [newSession, ...oldData];
            });
            
            // Replace temporary session with real session
            setSelectedSessionId(data.chatSessionId);
            setTempSessionId(null);
            
            // Invalidate and refetch messages to ensure proper data structure
            queryClient.invalidateQueries({
              queryKey: ['chatMessages', data.chatSessionId]
            });
            
            setIsTyping(false);
          },
          onError: (error) => {
            setIsTyping(false);
            debugLog('Failed to create session and send first message:', error);
            message.error('Failed to send message. Please try again.');
          },
        }
      );
      return;
    }

    // If real session exists, use send API for subsequent messages
    debugLog('Real session exists, using send API for subsequent message');
    sendMessageToSession(selectedSessionId, userInput);
  }, [input, sendMessageMutation.isPending, initChatMutation.isPending, selectedSessionId, tempSessionId, sessions.length, initChatMutation, sendMessageToSession, queryClient]);

  const handleNewChat = useCallback(() => {
    // Create a temporary session ID for immediate use
    const tempId = Date.now(); // Use timestamp as temporary ID
    setTempSessionId(tempId);
    setSelectedSessionId(tempId);
    setInput('');
    message.success('New chat ready!');
  }, []);

  const handleSelectSession = useCallback((sessionId: number) => {
    debugLog('Selecting session:', sessionId);
    setSelectedSessionId(sessionId);
    setInput('');
  }, []);

  const handleDeleteSession = useCallback((sessionId: number) => {
    deleteSessionMutation.mutate(
      { chatSessionId: sessionId },
      {
        onSuccess: (data) => {
          const successMessage = data.message || 'Session deleted successfully';
          message.success(successMessage);
          
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
          const errorMessage = error.message || 'Failed to delete session. Please try again.';
          message.error(errorMessage);
        },
      }
    );
  }, [deleteSessionMutation, selectedSessionId, sessions]);

  const handleFetchNextPage = useCallback(async () => {
    if (!messagesContainerRef.current) return;
    await fetchNextPage();
  }, [fetchNextPage]);

  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 100;
    setShowScrollButton(!isAtBottom);
    
    if (scrollTop < 100 && hasNextPage && !isFetchingNextPage) {
      debugLog('Loading more messages...');
      handleFetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, handleFetchNextPage]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInput(suggestion);
  }, []);

  // Effects
  useEffect(() => {
    inputRef.current?.focus();
  }, [selectedSessionId]);

  useEffect(() => {
    if (sessions.length > 0 && !selectedSessionId) {
      setSelectedSessionId(sessions[0].id);
    }
  }, [sessions, selectedSessionId]);

  useEffect(() => {
    prefetchSessions();
  }, [prefetchSessions]);

  useEffect(() => {
    if (selectedSessionId) {
      prefetchMessages(selectedSessionId, 20);
    }
  }, [selectedSessionId, prefetchMessages]);

  // Debug logging
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

  // Error handling
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

  const selectedSession = sessions.find(s => s.id === selectedSessionId);

  // Welcome message configurations
  const welcomeConfig = {
    withSession: {
      title: 'Welcome to AISEA BOT',
      description: 'Your intelligent academic assistant. Ask anything about your studies, courses, or academic journey!',
      suggestions: [
        "Help me understand this course material",
        "What are the key concepts in this subject?",
        "How can I improve my study habits?",
        "Explain this academic concept"
      ]
    },
    withoutSession: {
      title: 'Start Chatting with AISEA BOT',
      description: 'Just type your message below and start chatting! Your first message will automatically create a new chat session.',
      suggestions: [
        "Hello, I need help with my studies",
        "Can you explain this concept to me?",
        "What are the best study techniques?",
        "Help me understand this topic"
      ]
    }
  };

  return (
    <ErrorBoundary>
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
                style={{ height: '100%' }}
                onScroll={handleScroll}
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

                 {loadingMessages && tempSessionId !== selectedSessionId && (
                   <div className="flex justify-center py-12">
                     <div className="text-center">
                       <Spin size="large" />
                       <div className="mt-4 text-gray-500">Loading messages...</div>
                     </div>
                   </div>
                 )}

                 {/* Loading state when creating new session */}
                 {initChatMutation.isPending && !selectedSession && (
                   <div className="flex justify-center py-12">
                     <div className="text-center">
                       <Spin size="large" />
                       <div className="mt-4 text-gray-500">Creating your chat session...</div>
                     </div>
                   </div>
                 )}

                 {/* Welcome messages */}
                 {(!selectedSession || sessions.length === 0) && !loadingSessions && !initChatMutation.isPending && (
                   <WelcomeMessage
                     {...welcomeConfig.withoutSession}
                     onSuggestionClick={handleSuggestionClick}
                   />
                 )}
                 
                 {selectedSession && tempSessionId === selectedSessionId && !initChatMutation.isPending && (
                   <WelcomeMessage
                     {...welcomeConfig.withSession}
                     onSuggestionClick={handleSuggestionClick}
                   />
                 )}
                 
                 {selectedSession && tempSessionId !== selectedSessionId && !loadingMessages && messages.length === 0 && !initChatMutation.isPending && (
                   <WelcomeMessage
                     {...welcomeConfig.withSession}
                     onSuggestionClick={handleSuggestionClick}
                   />
                 )}
                
                {/* Messages Container */}
                <div className="space-y-2">
                  <AnimatePresence>
                    {messages.map((msg) => {
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
                      disabled={sendMessageMutation.isPending || initChatMutation.isPending}
                      maxLength={MAX_MESSAGE_LENGTH}
                      autoSize={{ minRows: 1, maxRows: 4 }}
                      style={{ minHeight: 70, maxHeight: 120 }}
                    />
                    <div className="absolute right-3 bottom-2 text-xs text-gray-400">
                      {input.length}/{MAX_MESSAGE_LENGTH}
                    </div>
                  </div>
                  <Button
                    type="primary"
                    icon={<SendOutlined style={{ fontSize: 18 }} />}
                    onClick={handleSend}
                    disabled={!input.trim() || sendMessageMutation.isPending || initChatMutation.isPending}
                    loading={sendMessageMutation.isPending || initChatMutation.isPending}
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
    </ErrorBoundary>
  );
};

export default ChatAI; 