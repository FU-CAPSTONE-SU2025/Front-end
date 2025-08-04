import React, { useState, useEffect, useRef } from 'react';
import { Avatar, Button, Input, Modal, message } from 'antd';
import { SendOutlined, PlusOutlined, MessageOutlined, PhoneOutlined, VideoCameraOutlined, MoreOutlined, CloseOutlined } from '@ant-design/icons';
import { useAdvisorChat, AdvisorSession } from '../../hooks/useAdvisorChat';
import { ChatMessage } from '../../interfaces/IChat';
import { motion } from 'framer-motion';
import MainChatBox from './mainChatBox';
import StaffNameDisplay from './staffNameDisplay';
import LastMessageDisplay from './lastMessageDisplay';
import ChatListItem from './chatListItem';

interface AdvisorChatTabProps {
  onChatBoxOpen?: (session: AdvisorSession) => void;
  drawerOpen?: boolean;
  onCloseDrawer?: () => void;
}

const AdvisorChatTab: React.FC<AdvisorChatTabProps> = ({ onChatBoxOpen, drawerOpen, onCloseDrawer }) => {
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

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
  } = useAdvisorChat();

  // Show all sessions instead of filtering
  const allSessions = sessions;

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
      // Only show error if it's a real network/connection error
      if (err instanceof Error && !err.message.includes('negotiation') && !err.message.includes('No connection')) {
        message.error('Failed to join session');
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

  return (
    <div className="flex flex-col h-[600px] bg-white">
      {/* Header with New Chat Button */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex justify-between items-center mb-3">
                      <div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Advisor Chats</h3>
              {sessions.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {sessions.length} sessions available
                </p>
              )}
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
              <div className="text-gray-500">Loading...</div>
            </div>
        ) : allSessions.length === 0 ? (
          <div className="flex items-center justify-center h-32">
                          <div className="text-center text-gray-500">
                <MessageOutlined className="text-3xl mb-2" />
                <div className="text-sm">No sessions</div>
              </div>
          </div>
        ) : (
          <>
            <div className="space-y-0">
              {allSessions.map((session) => (
                <ChatListItem
                  key={session.id}
                  session={session}
                  onClick={handleSessionClick}
                />
              ))}
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