import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Avatar, Button, message, Spin } from 'antd';
import { SendOutlined, PlusOutlined, MessageOutlined } from '@ant-design/icons';
import { useAdvisorChatWithStudent } from '../../hooks/useAdvisorChatWithStudent';
import { StudentSession, ChatMessage } from '../../interfaces/IChat';
import { motion } from 'framer-motion';
import { SIGNALR_CONFIG, ConnectionState, getConnectionStatusColor, formatTimestamp } from '../../config/signalRConfig';


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
    setError,
    fetchAssignedSessions,
    dataFetched,
  } = useAdvisorChatWithStudent();

  // Facebook-like UX - no refetch on tab switch, data persists
  useEffect(() => {
    // Only fetch once when connection is ready and we have no data
    if (connectionState === ConnectionState.Connected && sessions.length === 0 && allAssignedSessions.length === 0 && !dataFetched) {
      fetchAssignedSessions();
    }
  }, [connectionState, sessions.length, allAssignedSessions.length, dataFetched, fetchAssignedSessions]);

  // Filter only assigned sessions (exclude staffId = 4) and sort by updatedAt (newest first)
  const rawAssignedSessions = (sessions.length > 0 ? sessions : allAssignedSessions)
    .filter(session => session.staffId !== 4)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  // De-duplicate by id to avoid duplicate rows on refresh
  const assignedSessions = useMemo(() => {
    const seen = new Set<number>();
    const unique: StudentSession[] = [];
    for (const s of rawAssignedSessions) {
      if (!seen.has(s.id)) {
        seen.add(s.id);
        unique.push(s);
      }
    }
    return unique;
  }, [rawAssignedSessions]);

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

  // Generate display names for assigned sessions
  const sessionDisplayNames = useMemo(() => {
    return generateDisplayNames(assignedSessions);
  }, [assignedSessions, generateDisplayNames]);

  // Handle session selection
  const handleSessionClick = async (session: StudentSession) => {
    if (drawerOpen && onCloseDrawer) {
      onCloseDrawer();
    }
    // Open chat box first (original flow), then join session
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
      const errorMessage = err instanceof Error ? err.message : '';
      const isConnectionError = errorMessage.includes('negotiation') || 
                               errorMessage.includes('No connection') ||
                               errorMessage.includes('Connection not available') ||
                               errorMessage.includes('Failed to join session');
      if (!isConnectionError) {
        message.error(SIGNALR_CONFIG.ERRORS.JOIN_SESSION_FAILED);
      }
    }
  };



  return (
    <div className="flex flex-col h-[600px] bg-white">
      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto bg-white">
        {assignedSessions.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center text-gray-500">
              <MessageOutlined className="text-3xl mb-2" />
              <div className="text-sm">No sessions</div>
            </div>
          </div>
        ) : (
          <div className="space-y-0">
            {assignedSessions.map((session, index) => {
              const displayName = sessionDisplayNames.get(session.id) || `Student ${session.studentId}`;
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
                        className={`ring-3 shadow-md ${
                        session.staffId === 4 ? 'ring-orange-100' : 
                        session.staffId === advisorId ? 'ring-green-100' : 'ring-gray-100'
                      }`}
                    />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-semibold text-gray-800 text-base">
                          {displayName}
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