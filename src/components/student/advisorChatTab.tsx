import React, { useState, useEffect, useRef } from 'react';
import { Avatar, Button, Input, Modal, message, Badge, Spin } from 'antd';
import { SendOutlined, PlusOutlined, MessageOutlined } from '@ant-design/icons';
import { useAdvisorChat, AdvisorSession } from '../../hooks/useAdvisorChat';
import { motion } from 'framer-motion';
import StaffNameDisplay from './staffNameDisplay';
import LastMessageDisplay from './lastMessageDisplay';

interface AdvisorChatTabProps {
  onChatBoxOpen?: (session: AdvisorSession) => void;
  drawerOpen?: boolean;
  onCloseDrawer?: () => void;
}

const AdvisorChatTab: React.FC<AdvisorChatTabProps> = ({ onChatBoxOpen, drawerOpen, onCloseDrawer }) => {
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  const {
    connectionState,
    sessions,
    currentSession,
    messages,
    error,
    loading,
    dataFetched,
    initChatSession,
    joinSession,
    sendMessage,
    loadMoreSessions,
    setCurrentSession,
    setError,
    setMessages,
    fetchSessions,
  } = useAdvisorChat();

  // Show all sessions instead of filtering
  const allSessions = sessions;

  // Ensure sessions are fetched when component mounts or connection changes
  useEffect(() => {
    if (connectionState === 'Connected' && !dataFetched && !loading) {
      fetchSessions();
    }
  }, [connectionState, dataFetched, loading, fetchSessions]);

  // Component lifecycle tracking
  useEffect(() => {
    return () => {
      // Cleanup on unmount
    };
  }, []);

  // Force re-render when sessions change
  useEffect(() => {
    setForceUpdate(prev => prev + 1);
  }, [sessions]);

  // Handle refresh sessions
  const handleRefreshSessions = async () => {
    try {
      await fetchSessions();
    } catch (err) {
      message.error('Failed to refresh sessions');
    }
  };

  // Handle load more sessions
  const handleLoadMoreSessions = async () => {
    if (!loading) {
      const currentPage = Math.floor(sessions.length / 20) + 1;
      await loadMoreSessions(currentPage);
    }
  };

  // Handle session selection
  const handleSessionClick = async (session: AdvisorSession) => {
    // Close the drawer when opening chat
    if (drawerOpen && onCloseDrawer) {
      onCloseDrawer();
    }
    
    // Trigger GlobalChatBox to open
    const advisorData = {
      id: session.id.toString(),
      name: session.staffName || session.title, // Will be updated by StaffNameDisplay
      avatar: session.staffAvatar || 'https://i.pravatar.cc/150?img=1',
      isOnline: session.isOnline || false,
      role: 'Advisor'
    };
    
    window.dispatchEvent(new CustomEvent('openMainChatBox', { detail: advisorData }));
    
    try {
      await joinSession(session.id);
    } catch (err) {
      // Only show error for real connection issues, not for normal SignalR negotiation
      const errorMessage = err instanceof Error ? err.message : '';
      const isConnectionError = errorMessage.includes('negotiation') || 
                               errorMessage.includes('No connection') ||
                               errorMessage.includes('Connection not available') ||
                               errorMessage.includes('Failed to join session');
      
      if (!isConnectionError) {
        console.warn('Join session warning:', errorMessage);
      }
    }
  };

  // Handle new chat creation
  const handleCreateNewChat = async () => {
    if (!newChatMessage.trim()) {
      message.warning('Please enter a message');
      return;
    }

    setSendingMessage(true);
    try {
      const result = await initChatSession(newChatMessage);
      if (result && (result.success || result.message)) {
        message.success(result.message || 'Chat session created successfully');
        setShowNewChatModal(false);
        setNewChatMessage('');
        // The session will be added to the list via SignalR
      } else {
        message.success('Chat session created successfully');
        setShowNewChatModal(false);
        setNewChatMessage('');
      }
    } catch (err) {
      // Only show error if it's a real network/connection error
      if (err instanceof Error && !err.message.includes('negotiation') && !err.message.includes('No connection')) {
        message.error('Failed to create chat session');
      }
    } finally {
      setSendingMessage(false);
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get last message for a session
  const getLastMessage = (session: AdvisorSession) => {
    if (session.lastMessage) {
      return {
        content: session.lastMessage,
        time: session.lastMessageTime || session.updatedAt,
      };
    }
    return null;
  };

  // Render individual chat item
  const renderChatItem = (session: AdvisorSession) => {
    // Determine if session is assigned or unassigned (staffId = 4 means unassigned)
    const isUnassigned = !session.staffId || session.staffId === 4;
    
    return (
      <motion.div
        key={session.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="cursor-pointer transition-all duration-300 hover:bg-gray-50 border-b border-gray-100 hover:border-gray-200"
        onClick={() => handleSessionClick(session)}
      >
        <div className="flex items-center gap-4 p-4">
          <div className="relative">
            <Avatar 
              src={isUnassigned ? 'https://i.pravatar.cc/150?img=2' : (session.staffAvatar || 'https://i.pravatar.cc/150?img=1')} 
              size={48} 
              className={`ring-3 shadow-md ${
                isUnassigned ? 'ring-orange-100' : 'ring-gray-100'
              }`}
            />
            {session.isOnline && !isUnassigned && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
            )}
            {isUnassigned && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-orange-400 rounded-full border-2 border-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-1">
              <div className="font-semibold text-gray-800 text-base">
                <StaffNameDisplay 
                  staffId={session.staffId}
                  fallbackName={isUnassigned ? 'Unassigned Advisor' : (session.staffName || session.title)}
                />
              </div>
              {session.unreadCount && session.unreadCount > 0 && (
                <Badge 
                  count={session.unreadCount} 
                  size="small"
                  className={isUnassigned ? 'bg-orange-500' : 'bg-red-500'}
                />
              )}
            </div>
            <LastMessageDisplay 
              lastMessage={session.lastMessage}
              lastMessageTime={session.lastMessageTime}
              className="text-sm text-gray-500"
              senderId={session.lastMessageSenderId}
            />
            {isUnassigned && (
              <div className="text-xs text-orange-600 mt-1">
                Waiting for assignment
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  // Render connection status
  const renderConnectionStatus = () => {
    const getStatusColor = () => {
      switch (connectionState) {
        case 'Connected':
          return 'text-green-500';
        case 'Connecting':
        case 'Reconnecting':
          return 'text-yellow-500';
        case 'Disconnected':
          return 'text-red-500';
        default:
          return 'text-gray-500';
      }
    };

    return (
      <div className={`text-xs ${getStatusColor()} flex items-center gap-1`}>
        <div className={`w-2 h-2 rounded-full ${
          connectionState === 'Connected' ? 'bg-green-500' :
          connectionState === 'Connecting' || connectionState === 'Reconnecting' ? 'bg-yellow-500' :
          'bg-red-500'
        }`} />
        {connectionState}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[600px] bg-white">
      {/* Header with New Chat Button */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Advisor Chats</h3>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="small"
            onClick={() => setShowNewChatModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            New Chat
          </Button>
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto bg-white">
        {loading && sessions.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <Spin size="large" />
            <div className="text-gray-500 ml-3">Loading sessions...</div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center text-gray-500">
              <MessageOutlined className="text-3xl mb-2" />
              <div className="text-sm">No sessions</div>
              {connectionState === 'Disconnected' && (
                <div className="text-xs text-red-500 mt-2">
                  Connection lost. Please refresh.
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-0" key={`sessions-${sessions.length}-${forceUpdate}`}>
              {sessions.map(renderChatItem)}
            </div>
            
            {/* Load More Sessions Button */}
            {sessions.length >= 20 && (
              <div className="p-4 text-center border-t border-gray-100">
                <Button
                  onClick={handleLoadMoreSessions}
                  loading={loading}
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {loading ? 'Loading...' : 'Load More Sessions'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* New Chat Modal */}
      <Modal
        title="Start New Chat"
        open={showNewChatModal}
        onOk={handleCreateNewChat}
        onCancel={() => {
          setShowNewChatModal(false);
          setNewChatMessage('');
        }}
        confirmLoading={sendingMessage}
        okText="Start Chat"
        cancelText="Cancel"
      >
        <div className="mb-4">
          <p className="text-gray-600 mb-3">
            Send your first message to start a conversation with an available advisor.
          </p>
          <Input.TextArea
            value={newChatMessage}
            onChange={(e) => setNewChatMessage(e.target.value)}
            placeholder="Type your message here..."
            rows={4}
            maxLength={500}
            showCount
          />
        </div>
      </Modal>

      {/* Error Display */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <div className="flex items-center">
            <span className="mr-2">⚠️</span>
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-4 text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvisorChatTab; 