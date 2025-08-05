import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Avatar, Button, Badge, message, Spin } from 'antd';
import { SendOutlined, PlusOutlined, MessageOutlined } from '@ant-design/icons';
import { useAdvisorChatWithStudent } from '../../hooks/useAdvisorChatWithStudent';
import { StudentSession, ChatMessage } from '../../interfaces/IChat';
import { motion } from 'framer-motion';
import { SIGNALR_CONFIG, ConnectionState, getConnectionStatusColor, formatTimestamp } from '../../config/signalRConfig';
import LastMessageDisplay from '../student/lastMessageDisplay';

interface StudentChatTabProps {
  onChatBoxOpen?: (session: StudentSession) => void;
  drawerOpen?: boolean;
  onCloseDrawer?: () => void;
}

const StudentChatTab: React.FC<StudentChatTabProps> = ({ onChatBoxOpen, drawerOpen, onCloseDrawer }) => {
 


  const {
    connectionState,
    sessions,
    allAssignedSessions,

    error,
    loading,
    advisorId,
    joinSession,
    sendMessage,
    loadInitialMessages,
    setCurrentSession,
    setError,
    setMessages,
    assignAdvisorToSession,
    fetchSessions,
    fetchAssignedSessions,
    dataFetched,
  } = useAdvisorChatWithStudent();

  // Pre-load data when component mounts
  useEffect(() => {
    console.log('StudentChatTab: Component mounted, connection state:', connectionState);
    // Only fetch assigned sessions for My Chat when connection is ready
    if (connectionState === ConnectionState.Connected) {
      console.log('StudentChatTab: Connection ready, calling fetchAssignedSessions');
      // Add delay to ensure connection is fully ready
      const timer = setTimeout(() => {
        console.log('StudentChatTab: Delayed fetchAssignedSessions');
        fetchAssignedSessions();
      }, 1000);
      
      // Also try fetchSessions as fallback
      const fallbackTimer = setTimeout(() => {
        console.log('StudentChatTab: Trying fetchSessions as fallback');
        fetchSessions();
      }, 3000);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(fallbackTimer);
      };
    } else {
      console.log('StudentChatTab: Connection not ready yet');
    }
  }, [connectionState, fetchAssignedSessions, fetchSessions]);

  // Re-fetch data when connection becomes available
  useEffect(() => {
    if (connectionState === ConnectionState.Connected && !dataFetched) {
      // Only fetch if data hasn't been fetched yet
      fetchAssignedSessions();
    }
  }, [connectionState, fetchAssignedSessions, dataFetched]);

  // Retry mechanism when connection becomes ready
  useEffect(() => {
    if (connectionState === ConnectionState.Connected) {
      // Add a small delay to ensure connection is fully ready
      const timer = setTimeout(() => {
        if (connectionState === ConnectionState.Connected) {
          fetchAssignedSessions();
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [connectionState, fetchAssignedSessions]);



  // Filter only assigned sessions (exclude staffId = 4) and sort by updatedAt (newest first)
  const assignedSessions = (sessions.length > 0 ? sessions : allAssignedSessions)
    .filter(session => session.staffId !== 4) // Exclude unassigned sessions
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  // Debug logs
  console.log('StudentChatTab Debug:', {
    connectionState,
    sessions: sessions.length,
    allAssignedSessions: allAssignedSessions.length,
    assignedSessions: assignedSessions.length,
    dataFetched,
    loading,
    error,
    advisorId
  });


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
      // Check if session is unassigned (staffId = 4)
      const isUnassigned = session.staffId === 4;
      
      if (isUnassigned) {
        try {
          await assignAdvisorToSession(session.id);
        } catch (assignErr) {
          // Fallback: try to join directly
          try {
            await joinSession(session.id);
          } catch (joinErr) {
            // Handle join error silently
          }
        }
      } else {
        // For already assigned sessions, just join
        await joinSession(session.id);
      }
    } catch (err) {
      message.error(SIGNALR_CONFIG.ERRORS.JOIN_SESSION_FAILED);
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

  return (
    <div className="flex flex-col h-[600px] bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              My Chat
            </h3>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto bg-white">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <div className="text-gray-500 text-sm">Loading sessions...</div>
            </div>
          </div>
        ) : assignedSessions.length === 0 ? (
          <div className="flex items-center justify-center h-32">
                          <div className="text-center text-gray-500">
                <MessageOutlined className="text-3xl mb-2" />
                <div className="text-sm">No sessions</div>
              </div>
          </div>
        ) : (
          <div className="space-y-0">
            {assignedSessions.map((session, index) => {
              const lastMessage = getLastMessage(session);
              const isUnassigned = session.staffId === 4;
              
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
                        src={session.studentAvatar || 'https://i.pravatar.cc/150?img=1'} 
                        size={48} 
                                              className={`ring-3 shadow-md ${
                        session.staffId === 4 ? 'ring-orange-100' : 
                        session.staffId === advisorId ? 'ring-green-100' : 'ring-gray-100'
                      }`}
                    />
                    {session.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                    )}
                    {session.staffId === 4 && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-orange-400 rounded-full border-2 border-white" />
                    )}
                    {session.staffId === advisorId && session.staffId !== 4 && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                    )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-semibold text-gray-800 text-base">
                          {session.studentName || session.title}
                        </div>
                        {session.unreadCount && session.unreadCount > 0 && (
                          <Badge count={session.unreadCount} size="small" />
                        )}
                      </div>
                      {lastMessage && (
                        <LastMessageDisplay 
                          lastMessage={lastMessage.content}
                          lastMessageTime={lastMessage.time}
                          className="text-sm text-gray-500"
                        />
                      )}
                      {session.staffId === 4 && (
                        <div className="text-xs text-orange-600 mt-1 font-medium">
                          Unassigned (Open Chat)
                        </div>
                      )}
                      {session.staffId === advisorId && session.staffId !== 4 && (
                        <div className="text-xs text-green-600 mt-1 font-medium">
                          Assigned to you
                        </div>
                      )}
                      {session.staffId !== advisorId && session.staffId !== 4 && (
                        <div className="text-xs text-gray-600 mt-1 font-medium">
                          Assigned to other advisor
                        </div>
                      )}
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
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50 max-w-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-red-500">⚠️</span>
              <span className="text-sm">{error}</span>
            </div>
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

export default StudentChatTab; 