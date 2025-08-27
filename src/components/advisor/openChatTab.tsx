import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Avatar, message, Spin } from 'antd';
import { SendOutlined, PlusOutlined, MessageOutlined, PhoneOutlined, VideoCameraOutlined, MoreOutlined, CloseOutlined, ReloadOutlined, UserAddOutlined } from '@ant-design/icons';
import { useAdvisorChatWithStudent } from '../../hooks/useAdvisorChatWithStudent';
import { StudentSession, ChatMessage } from '../../interfaces/IChat';
import { motion } from 'framer-motion';
import { SIGNALR_CONFIG, ConnectionState, getConnectionStatusColor, formatTimestamp } from '../../config/signalRConfig';

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
    fetchSessions,
    fetchOpenSessions,
  } = useAdvisorChatWithStudent();

  // Show unassigned sessions from LIST_OPENED_SESSIONS (no filtering needed)
  const openChatSessions = useMemo(() => {
    return [...unassignedSessions].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [unassignedSessions]);

  // Facebook-like UX - no refetch on tab switch, data persists
  useEffect(() => {
    // Only fetch once when connection is ready and we have no data
    if (connectionState === ConnectionState.Connected && unassignedSessions.length === 0 && !dataFetched) {
      fetchOpenSessions();
    }
  }, [connectionState, unassignedSessions.length, dataFetched, fetchOpenSessions]);

  // Handle session selection
  const handleSessionClick = async (session: StudentSession) => {
    // Close the drawer when opening chat
    if (drawerOpen && onCloseDrawer) {
      onCloseDrawer();
    }
    
    // Trigger GlobalChatBox to open
    const studentData = {
      id: session.id.toString(),
      name: `Student ${session.studentId}`,
      avatar: session.studentAvatar || 'https://cdn3d.iconscout.com/3d/premium/thumb/graduate-student-avatar-3d-icon-png-download-8179543.png',
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
      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto bg-white">
        {openChatSessions.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center text-gray-500">
              <UserAddOutlined className="text-3xl mb-2" />
              <div className="text-sm">No open sessions</div>
            </div>
          </div>
        ) : (
          <div className="space-y-0">
            {openChatSessions.map((session, index) => {
              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="cursor-pointer transition-all duration-300 hover:bg-gray-50 border-b border-gray-100 hover:border-gray-200"
                  onClick={() => handleSessionClick(session)}
                >
                  <div className="flex items-center gap-4 p-4">
                    <div className="relative">
                      <Avatar 
                        src={session.studentAvatar || 'https://cdn3d.iconscout.com/3d/premium/thumb/graduate-student-avatar-3d-icon-png-download-8179543.png'} 
                        size={48} 
                        className="ring-3 ring-orange-100 shadow-md"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-semibold text-gray-800 text-base">
                          {session.studentName || `Student ${session.studentId}`}
                        </div>
                      </div>
                     
      
                    </div>
                  </div>
                </motion.div>
              );
            })}
            

          </div>
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