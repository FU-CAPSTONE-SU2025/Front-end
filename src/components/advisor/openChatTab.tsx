import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Avatar, message, Spin } from 'antd';
import { SendOutlined, PlusOutlined, MessageOutlined, PhoneOutlined, VideoCameraOutlined, MoreOutlined, CloseOutlined, ReloadOutlined, UserAddOutlined } from '@ant-design/icons';
import { useAdvisorChatWithStudent } from '../../hooks/useAdvisorChatWithStudent';
import { StudentSession, ChatMessage } from '../../interfaces/IChat';
import { motion } from 'framer-motion';
import { SIGNALR_CONFIG, ConnectionState, getConnectionStatusColor, formatTimestamp } from '../../config/signalRConfig';
import { AnimatePresence } from 'framer-motion';

interface OpenChatTabProps {
  onChatBoxOpen?: (session: StudentSession) => void;
  drawerOpen?: boolean;
  onCloseDrawer?: () => void;
}

const OpenChatTab: React.FC<OpenChatTabProps> = ({ onChatBoxOpen, drawerOpen, onCloseDrawer }) => {
  const [sendingMessage, setSendingMessage] = useState(false);
  const [previousSessionIds, setPreviousSessionIds] = useState<Set<number>>(new Set());
  const [newSessionIds, setNewSessionIds] = useState<Set<number>>(new Set());

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

  // Track session IDs for smooth animations
  useEffect(() => {
    const currentSessionIds = new Set(unassignedSessions.map(session => session.id));
    
    // Find new sessions by comparing with previous state
    const newSessions = new Set<number>();
    currentSessionIds.forEach(id => {
      if (!previousSessionIds.has(id)) {
        newSessions.add(id);
      }
    });
    
    setNewSessionIds(newSessions);
    setPreviousSessionIds(currentSessionIds);
    
    // Clear new session indicators after 3 seconds
    if (newSessions.size > 0) {
      setTimeout(() => {
        setNewSessionIds(new Set());
      }, 3000);
    }
  }, [unassignedSessions, previousSessionIds]);

  // Show unassigned sessions from LIST_OPENED_SESSIONS with smooth merging
  const openChatSessions = useMemo(() => {
    return [...unassignedSessions].sort((a, b) => 
      new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime()
    );
  }, [unassignedSessions]);

  // Function to generate display names with numbering for duplicate student IDs
  const generateDisplayNames = useCallback((sessions: StudentSession[]) => {
    const studentIdCounts = new Map<number, number>();
    const displayNames = new Map<number, string>();

    // First pass: count occurrences of each student ID
    sessions.forEach(session => {
      const studentId = session.studentId;
      studentIdCounts.set(studentId, (studentIdCounts.get(studentId) || 0) + 1);
    });

    // Second pass: generate display names with numbering
    sessions.forEach(session => {
      const studentId = session.studentId;
      const count = studentIdCounts.get(studentId) || 1;
      
      if (count === 1) {
        // Single occurrence, no numbering needed
        displayNames.set(session.id, session.studentName || `Student ${studentId}`);
      } else {
        // Multiple occurrences, need to find the position
        const sameStudentSessions = sessions.filter(s => s.studentId === studentId);
        const position = sameStudentSessions.findIndex(s => s.id === session.id) + 1;
        displayNames.set(session.id, `${session.studentName || `Student ${studentId}`} (${position})`);
      }
    });

    return displayNames;
  }, []);

  // Generate display names for open chat sessions
  const sessionDisplayNames = useMemo(() => {
    return generateDisplayNames(openChatSessions);
  }, [openChatSessions, generateDisplayNames]);

  // Facebook-like UX - no refetch on tab switch, data persists
  useEffect(() => {
    // Only fetch once when connection is ready and we have no data
    if (connectionState === ConnectionState.Connected && unassignedSessions.length === 0 && !dataFetched) {
      fetchOpenSessions();
    }
  }, [connectionState, unassignedSessions.length, dataFetched, fetchOpenSessions]);

  // Listen for cross-tab join updates from student view and refresh
  useEffect(() => {
    const handler = (e: Event) => {
      // Debounce slight delay to avoid race with backend
      setTimeout(() => {
        fetchOpenSessions();
      }, 150);
    };
    window.addEventListener('advisorSessionJoined', handler as EventListener);
    return () => {
      window.removeEventListener('advisorSessionJoined', handler as EventListener);
    };
  }, [fetchOpenSessions]);

  // Handle session selection
  const handleSessionClick = async (session: StudentSession) => {
    // Close the drawer when opening chat
    if (drawerOpen && onCloseDrawer) {
      onCloseDrawer();
    }
    
    // Trigger GlobalChatBox to open
    const displayName = sessionDisplayNames.get(session.id) || `Student ${session.studentId}`;
    const studentData = {
      id: session.id.toString(),
      name: displayName,
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

  // Animation variants for smooth transitions
  const sessionVariants = {
    initial: { opacity: 0, y: -20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.95 },
    hover: { scale: 1.02, y: -2 }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white">
      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto bg-white">
        {openChatSessions.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center h-32"
          >
            <div className="text-center text-gray-500">
              <UserAddOutlined className="text-3xl mb-2" />
              <div className="text-sm">No open sessions</div>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-0">
              {openChatSessions.map((session, index) => {
                const isNewSession = newSessionIds.has(session.id);
                
                return (
                  <motion.div
                    key={session.id}
                    variants={sessionVariants}
                    initial={isNewSession ? "initial" : "animate"}
                    animate="animate"
                    exit="exit"
                    whileHover="hover"
                    transition={{ 
                      duration: 0.3, 
                      delay: isNewSession ? 0 : index * 0.05,
                      type: "spring",
                      stiffness: 300,
                      damping: 25
                    }}
                    className="cursor-pointer transition-all duration-300 hover:bg-gray-50 border-b border-gray-100 hover:border-gray-200"
                    onClick={() => handleSessionClick(session)}
                    layout
                  >
                    <div className="flex items-center gap-4 p-4">
                      <div className="relative">
                        <Avatar 
                          src={session.studentAvatar || 'https://cdn3d.iconscout.com/3d/premium/thumb/graduate-student-avatar-3d-icon-png-download-8179543.png'} 
                          size={48} 
                          className="ring-3 ring-orange-100 shadow-md"
                        />
                        {isNewSession && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
                          >
                            <span className="text-xs text-white">N</span>
                          </motion.div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <div className="font-semibold text-gray-800 text-base">
                            {sessionDisplayNames.get(session.id) || `Student ${session.studentId}`}
                          </div>
                          {session.updatedAt && (
                            <motion.span 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.2 }}
                              className="text-xs text-gray-500"
                            >
                              {formatTime(session.updatedAt)}
                            </motion.span>
                          )}
                        </div>
                        {session.lastMessage && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-sm text-gray-600 truncate"
                          >
                            {session.lastMessage}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50"
        >
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
        </motion.div>
      )}
    </div>
  );
};

export default OpenChatTab; 