import React, { useState, useEffect, useRef } from 'react';
import { Avatar, Button, Input, Modal, message, Badge, Spin, Tooltip } from 'antd';
import { SendOutlined, PlusOutlined, MessageOutlined } from '@ant-design/icons';
import { useAdvisorChat, AdvisorSession } from '../../hooks/useAdvisorChat';
import { motion } from 'framer-motion';
import StaffNameDisplay from './staffNameDisplay';

// Extracted Chat Item Component
interface AdvisorChatItemProps {
  session: AdvisorSession;
  onSessionClick: (session: AdvisorSession) => void;
  staffIdCounts: Map<number, number>;
  sessionPositions: Map<number, number>;
}

const AdvisorChatItem: React.FC<AdvisorChatItemProps> = ({ 
  session, 
  onSessionClick, 
  staffIdCounts, 
  sessionPositions 
}) => {
  const isUnassigned = !session.staffId || session.staffId === 4;
  const staffKey = session.staffId || 0;
  const total = staffIdCounts.get(staffKey) || 1;
  const position = sessionPositions.get(session.id) || 1;

  const getAdvisorBaseName = (session: AdvisorSession) => {
    const isUnassigned = !session.staffId || session.staffId === 4;
    return isUnassigned
      ? 'Unassigned Advisor'
      : (session.staffName || session.title || `Advisor ${session.staffId}`);
  };

  return (
    <motion.div
      key={session.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="cursor-pointer transition-all duration-300 hover:bg-gray-50 border-b border-gray-100 hover:border-gray-200"
      onClick={() => onSessionClick(session)}
    >
      <div className="flex items-center gap-4 p-4">
        <div className="relative">
          <Avatar 
            src={isUnassigned ? 'https://i.pinimg.com/736x/2f/82/48/2f824875daa60e09c6cbd2edbca0a377.jpg' : (session.staffAvatar || 'https://i.pinimg.com/736x/2f/82/48/2f824875daa60e09c6cbd2edbca0a377.jpg')} 
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
              {/* Render resolved staff name; append numbering suffix if duplicate */}
              <span className="align-middle">
                <StaffNameDisplay 
                  staffId={session.staffId}
                  fallbackName={getAdvisorBaseName(session)}
                />
              </span>
              {total > 1 && (
                <span className="align-middle"> ({position})</span>
              )}
            </div>
            {session.unreadCount && session.unreadCount > 0 && (
              <Badge 
                count={session.unreadCount} 
                size="small"
                className={isUnassigned ? 'bg-orange-500' : 'bg-red-500'}
              />
            )}
          </div>
       
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

  // Smooth auto-refresh: when any session's updatedAt changes, refetch (throttled)
  const prevUpdatedMapRef = useRef<Map<number, string | undefined>>(new Map());
  const lastAutoFetchAtRef = useRef<number>(0);
  useEffect(() => {
    if (!sessions || sessions.length === 0) {
      prevUpdatedMapRef.current = new Map();
      return;
    }

    let hasUpdateChange = false;
    const nextMap = new Map<number, string | undefined>();
    for (const s of sessions) {
      const prev = prevUpdatedMapRef.current.get(s.id);
      nextMap.set(s.id, s.updatedAt);
      if (prev && s.updatedAt && prev !== s.updatedAt) {
        hasUpdateChange = true;
      }
    }

    prevUpdatedMapRef.current = nextMap;

    const now = Date.now();
    const cooldownPassed = now - lastAutoFetchAtRef.current > 800;
    if (hasUpdateChange && cooldownPassed) {
      lastAutoFetchAtRef.current = now;
      fetchSessions().catch(() => {});
    }
  }, [sessions, fetchSessions]);

  // Build numbering for duplicate advisors (same staffId)
  const staffIdCountRef = useRef<Map<number, number>>(new Map());
  const sessionPositionRef = useRef<Map<number, number>>(new Map());
  useEffect(() => {
    const counts = new Map<number, number>();
    const positions = new Map<number, number>();

    // Count by staffId
    for (const s of sessions) {
      const key = s.staffId || 0;
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    // Assign position order within each staffId
    const orderTracker = new Map<number, number>();
    for (const s of sessions) {
      const key = s.staffId || 0;
      const nextPos = (orderTracker.get(key) || 0) + 1;
      orderTracker.set(key, nextPos);
      positions.set(s.id, nextPos);
    }

    staffIdCountRef.current = counts;
    sessionPositionRef.current = positions;
  }, [sessions]);

  // Compute base name and numbered display name
  const getAdvisorBaseName = (session: AdvisorSession) => {
    const isUnassigned = !session.staffId || session.staffId === 4;
    return isUnassigned
      ? 'Unassigned Advisor'
      : (session.staffName || session.title || `Advisor ${session.staffId}`);
  };

  const getAdvisorDisplayName = (session: AdvisorSession) => {
    const baseName = getAdvisorBaseName(session);
    const staffKey = session.staffId || 0;
    const total = staffIdCountRef.current.get(staffKey) || 1;
    if (total <= 1) return baseName;
    const position = sessionPositionRef.current.get(session.id) || 1;
    return `${baseName} (${position})`;
  };

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
      name: getAdvisorDisplayName(session),
      avatar: session.staffAvatar || 'https://i.pravatar.cc/150?img=1',
      isOnline: session.isOnline || false,
      role: 'Advisor'
    };
    
    window.dispatchEvent(new CustomEvent('openMainChatBox', { detail: advisorData }));
    
    try {
      await joinSession(session.id);
      // Immediately refresh local list for smooth UX
      await fetchSessions().catch(() => {});
      // Broadcast to other tabs/components to refresh
      window.dispatchEvent(new CustomEvent('advisorSessionJoined', { detail: { sessionId: session.id } }));
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
      if (result) {
        message.success('Chat session created successfully');
        setShowNewChatModal(false);
        setNewChatMessage('');
        
        // Automatically refresh sessions to show the new chat session
        await fetchSessions();
        
        // Force UI update to ensure new session is displayed
        setTimeout(() => {
          setForceUpdate(prev => prev + 1);
        }, 500);
        
        // The session will also be added to the list via SignalR
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

  return (
    <div className="flex flex-col h-[600px] bg-white relative">
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
              {sessions.map((session) => (
                <AdvisorChatItem
                  key={session.id}
                  session={session}
                  onSessionClick={handleSessionClick}
                  staffIdCounts={staffIdCountRef.current}
                  sessionPositions={sessionPositionRef.current}
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

      {/* Floating New Chat Action (fixed within tab) */}
      <div className="absolute top-4 right-4 z-10">
        <Tooltip title="New Chat" placement="left">
          <Button
            type="primary"
            shape="circle"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => setShowNewChatModal(true)}
            className="!flex !items-center !justify-center w-12 h-12 bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          />
        </Tooltip>
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

export default AdvisorChatTab; 