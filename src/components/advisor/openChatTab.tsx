import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Avatar, Button, Badge, message, Spin } from 'antd';
import { SendOutlined, PlusOutlined, MessageOutlined, PhoneOutlined, VideoCameraOutlined, MoreOutlined, CloseOutlined, ReloadOutlined, UserAddOutlined } from '@ant-design/icons';
import { useAdvisorChatWithStudent } from '../../hooks/useAdvisorChatWithStudent';
import { StudentSession, ChatMessage } from '../../interfaces/IChat';
import { motion } from 'framer-motion';
import { SIGNALR_CONFIG, ConnectionState, getConnectionStatusColor, formatTimestamp } from '../../config/signalRConfig';
import LastMessageDisplay from '../student/lastMessageDisplay';

interface OpenChatTabProps {
  onChatBoxOpen?: (session: StudentSession) => void;
  drawerOpen?: boolean;
  onCloseDrawer?: () => void;
}

const OpenChatTab: React.FC<OpenChatTabProps> = ({ onChatBoxOpen, drawerOpen, onCloseDrawer }) => {
  const [sendingMessage, setSendingMessage] = useState(false);


  const {
    connectionState,
    sessions,
    unassignedSessions,
    currentSession,
    messages,
    error,
    loading,
    dataFetched,
    joinSession,
    sendMessage,
    loadInitialMessages,
    setCurrentSession,
    setError,
    setMessages,
    assignAdvisorToSession,
    fetchSessions,
  } = useAdvisorChatWithStudent();

  // Show unassigned sessions from LIST_OPENED_SESSIONS (no filtering needed)
  const openChatSessions = unassignedSessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  // Debug logs
  console.log('OpenChatTab Debug:', {
    connectionState,
    sessions: sessions.length,
    unassignedSessions: unassignedSessions.length,
    openChatSessions: openChatSessions.length,
    dataFetched,
    loading,
    error,
    unassignedData: unassignedSessions.map(s => ({ id: s.id, staffId: s.staffId, title: s.title }))
  });

  // Pre-load data when component mounts
  useEffect(() => {
    // Only fetch unassigned sessions for Open Chat when connection is ready
    if (connectionState === ConnectionState.Connected) {
      fetchSessions();
    }
  }, [connectionState, fetchSessions]);

  // Re-fetch data when connection becomes available
  useEffect(() => {
    if (connectionState === ConnectionState.Connected && !dataFetched) {
      // Only fetch if data hasn't been fetched yet
      fetchSessions();
    }
  }, [connectionState, fetchSessions, dataFetched]);

  // Retry mechanism when connection becomes ready
  useEffect(() => {
    if (connectionState === ConnectionState.Connected) {
      // Add a small delay to ensure connection is fully ready
      const timer = setTimeout(() => {
        if (connectionState === ConnectionState.Connected) {
          fetchSessions();
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [connectionState, fetchSessions]);


  // Handle session selection
  const handleSessionClick = async (session: StudentSession) => {
    // Close the drawer when opening chat
    if (drawerOpen && onCloseDrawer) {
      onCloseDrawer();
    }
    
    // Trigger GlobalChatBox to open
    const studentData = {
      id: session.id.toString(),
      name: session.studentName || session.title,
      avatar: session.studentAvatar || 'https://i.pravatar.cc/150?img=1',
      isOnline: session.isOnline || false,
      role: 'Student'
    };
    
    window.dispatchEvent(new CustomEvent('openAdvisorChatBox', { detail: studentData }));
    
    try {
      await joinSession(session.id);
    } catch (err) {
      if (err instanceof Error && !err.message.includes('negotiation') && !err.message.includes('No connection')) {
        message.error('Failed to join session');
      }
    }
  };

  // Handle assign advisor to session
  const handleAssignToSession = async (session: StudentSession) => {
    try {
      await assignAdvisorToSession(session.id);
      message.success('Successfully assigned to session');
    } catch (err) {
      message.error('Failed to assign to session');
    }
  };

  // Get last message for a session
  const getLastMessage = (session: StudentSession) => {
    if (session.lastMessage) {
      return {
        content: session.lastMessage,
        time: session.lastMessageTime || session.updatedAt,
      };
    }
    return null;
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

  return (
    <div className="flex flex-col h-[600px] bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Open Chat</h3>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto bg-white">
                {loading && openChatSessions.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <div className="text-gray-500 text-sm">Loading sessions...</div>
            </div>
          </div>
        ) : openChatSessions.length === 0 ? (
          <div className="flex items-center justify-center h-32">
                          <div className="text-center text-gray-500">
                <MessageOutlined className="text-3xl mb-2" />
                <div className="text-sm">No sessions</div>
              </div>
          </div>
        ) : (
          <>
            <div className="space-y-0">
              {openChatSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border-b border-gray-100 last:border-b-0"
                >
                  <div
                    className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleSessionClick(session)}
                  >
                    <div className="relative">
                      <Avatar 
                        src={session.studentAvatar || 'https://i.pravatar.cc/150?img=1'} 
                        size={48}
                        className="ring-2 ring-white shadow-md"
                      />
                      {session.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-800 truncate">
                          {session.studentName || `Student ${session.studentId}`}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {formatTime(session.updatedAt)}
                          </span>
                          {session.unreadCount && session.unreadCount > 0 && (
                            <Badge count={session.unreadCount} size="small" />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                                                 <div className="flex-1 min-w-0">
                           <LastMessageDisplay 
                             lastMessage={session.lastMessage}
                             lastMessageTime={session.lastMessageTime}
                             className="text-sm text-gray-500"
                           />
                         </div>
                        
                        <Button
                          type="primary"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAssignToSession(session);
                          }}
                          className="ml-2 bg-blue-600 hover:bg-blue-700"
                        >
                          Join
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            

          </>
        )}
      </div>

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

export default OpenChatTab; 