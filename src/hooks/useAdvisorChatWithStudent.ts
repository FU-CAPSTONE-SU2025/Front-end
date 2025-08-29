import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuths } from './useAuthState';
import { SIGNALR_CONFIG, ConnectionState, signalRManager } from '../config/signalRConfig';
import { StudentSession, ChatMessage, PagedResult } from '../interfaces/IChat';
import { addMessageWithDeduplication, mapBackendMessage } from '../utils/messageUtils';

// Completely separate global state for each tab to prevent conflicts
let globalOpenChatData: StudentSession[] = [];
let globalMyChatData: StudentSession[] = [];

// Separate listeners for each tab
let openChatListeners: Set<(sessions: StudentSession[]) => void> = new Set();
let myChatListeners: Set<(sessions: StudentSession[]) => void> = new Set();

// Separate update timeouts
let openChatTimeout: NodeJS.Timeout | null = null;
let myChatTimeout: NodeJS.Timeout | null = null;

// Helper function to merge sessions without duplicates
const mergeSessionsWithoutDuplicates = (existingSessions: StudentSession[], newSessions: StudentSession[]): StudentSession[] => {
  const sessionMap = new Map<number, StudentSession>();
  
  // Add existing sessions to map
  existingSessions.forEach(session => {
    if (session && session.id) {
      sessionMap.set(session.id, session);
    }
  });
  
  // Add or update new sessions
  newSessions.forEach(session => {
    if (session && session.id) {
      // If session exists, update it (preserve existing data but update with new data)
      const existing = sessionMap.get(session.id);
      if (existing) {
        sessionMap.set(session.id, { ...existing, ...session });
      } else {
        sessionMap.set(session.id, session);
      }
    }
  });
  
  // Convert back to array and sort by updatedAt (newest first)
  return Array.from(sessionMap.values()).sort((a, b) => 
    new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime()
  );
};

// Update function for Open Chat only - with smooth merging
const updateOpenChatData = (sessions: StudentSession[]) => {
  // Merge new sessions with existing ones
  globalOpenChatData = mergeSessionsWithoutDuplicates(globalOpenChatData, sessions);
  
  if (openChatTimeout) {
    clearTimeout(openChatTimeout);
  }

  openChatTimeout = setTimeout(() => {
    openChatListeners.forEach(listener => {
      try {
        listener(globalOpenChatData);
      } catch (error) {
        console.error('Error in open chat listener:', error);
      }
    });
  }, 50);
};

// Update function for My Chat only - with smooth merging
const updateMyChatData = (sessions: StudentSession[]) => {
  // Merge new sessions with existing ones
  globalMyChatData = mergeSessionsWithoutDuplicates(globalMyChatData, sessions);
  
  if (myChatTimeout) {
    clearTimeout(myChatTimeout);
  }

  myChatTimeout = setTimeout(() => {
    myChatListeners.forEach(listener => {
      try {
        listener(globalMyChatData);
      } catch (error) {
        console.error('Error in my chat listener:', error);
      }
    });
  }, 50);
};

// Subscribe functions for each tab
const subscribeToOpenChat = (listener: (sessions: StudentSession[]) => void) => {
  openChatListeners.add(listener);
  listener(globalOpenChatData);
  return () => openChatListeners.delete(listener);
};

const subscribeToMyChat = (listener: (sessions: StudentSession[]) => void) => {
  myChatListeners.add(listener);
  listener(globalMyChatData);
  return () => myChatListeners.delete(listener);
};

export function useAdvisorChatWithStudent() {
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected);
  const [sessions, setSessions] = useState<StudentSession[]>([]);
  const [unassignedSessions, setUnassignedSessions] = useState<StudentSession[]>([]);
  const [allAssignedSessions, setAllAssignedSessions] = useState<StudentSession[]>([]);
  const [currentSession, setCurrentSession] = useState<StudentSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [advisorId, setAdvisorId] = useState<number | null>(null);
  
  const [dataFetched, setDataFetched] = useState(false);
  
  // Pagination state
  const [assignedPageNumber, setAssignedPageNumber] = useState(1);
  const [hasMoreAssigned, setHasMoreAssigned] = useState(true);

  // Refs for optimization
  const currentSessionRef = useRef<StudentSession | null>(null);
  const sessionsRef = useRef<StudentSession[]>([]);
  const unassignedSessionsRef = useRef<StudentSession[]>([]);
  const allAssignedSessionsRef = useRef<StudentSession[]>([]);
  const isConnectingRef = useRef(false);
  const isFetchingSessionsRef = useRef(false);
  
  // Added: separate guard and cooldown refs for smoother UX
  const isFetchingStaffRef = useRef(false);
  const lastOpenFetchAtRef = useRef(0);
  const lastStaffFetchAtRef = useRef(0);
  
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const retryCountRef = useRef(0);
  const isUnmountedRef = useRef(false);
  
  const accessToken = useAuths((state) => state.accessToken);

  // Function to get profile ID from token (moved above setupEventListeners)
  const getProfileIdFromToken = useCallback(() => {
    if (!accessToken) return null;
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const profileId = payload.profileId || payload.profile_id || payload.ProfileId || payload.PROFILEID || 
                       payload.staffId || payload.staff_id || payload.StaffId || payload.STAFFID ||
                       payload.id || payload.Id || payload.ID ||
                       payload.userId || payload.UserId || payload.USERID ||
                       payload.sub || payload.Sub || payload.SUB;
      return profileId;
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  }, [accessToken]);

  // Setup event listeners on existing connection (moved above ensureConnection)
  const setupEventListeners = useCallback((connection: signalR.HubConnection) => {
    if (!connection) return;

    connection.onreconnecting(() => {
      if (!isUnmountedRef.current) {
        setConnectionState(ConnectionState.Reconnecting);
        setError(null);
      }
    });

    connection.onreconnected(() => {
      if (!isUnmountedRef.current) {
        setConnectionState(ConnectionState.Connected);
        setError(null);
      }
    });

    connection.onclose((error) => {
      if (!isUnmountedRef.current) {
        setConnectionState(ConnectionState.Disconnected);
        if (error) {
          setError(error.message);
        }
      }
    });

    // Event listeners - keep only those defined in config/back-end
    connection.on(SIGNALR_CONFIG.HUB_METHODS.GET_SESSIONS_METHOD, (data: PagedResult<StudentSession>) => {
      if (!isUnmountedRef.current && data && data.items && Array.isArray(data.items)) {
        // Separate data for each tab
        const allAssigned = data.items;
        const unassigned = data.items.filter(session => session && session.staffId === 4);
        
        // Update each tab separately with smooth merging
        updateMyChatData(allAssigned);
        updateOpenChatData(unassigned);
        setDataFetched(true);
      }
    });

    const handleSessionEvent = (eventName: string, data: PagedResult<StudentSession>) => {
      if (!isUnmountedRef.current && data && data.items && Array.isArray(data.items)) {
        const currentAdvisorId = getProfileIdFromToken();
        
        switch (eventName) {
          case 'ListAllSessionByStaff': {
            // This is for My Chat tab only
            updateMyChatData(data.items);
            break;
          }
          case 'ListOpenedSession': {
            // This is for Open Chat tab only
            updateOpenChatData(data.items);
            break;
          }
          case 'ListAllSessionByStudent': {
            // This is for My Chat tab only
            updateMyChatData(data.items);
            break;
          }
          case 'ListAllAssignedSessions': {
            // This is for My Chat tab only
            updateMyChatData(data.items);
            break;
          }
          default: {
            break;
          }
        }
        setDataFetched(true);
      }
    };

    // Primary listeners only
    connection.on('GetSessionsHUBMethod', (data: PagedResult<StudentSession>) => {
      handleSessionEvent('GetSessionsHUBMethod', data);
    });

    connection.on('ListAllSessionByStaff', (data: PagedResult<StudentSession>) => {
      handleSessionEvent('ListAllSessionByStaff', data);
    });

    connection.on('ListOpenedSession', (data: PagedResult<StudentSession>) => {
      handleSessionEvent('ListOpenedSession', data);
    });

    connection.on('ListAllAssignedSessions', (data: PagedResult<StudentSession>) => {
      handleSessionEvent('ListAllAssignedSessions', data);
    });

    connection.on('ListAllSessionByStudent', (data: PagedResult<StudentSession>) => {
      handleSessionEvent('ListAllSessionByStudent', data);
    });

    // Message and session lifecycle listeners
    connection.on(SIGNALR_CONFIG.HUB_METHODS.SEND_ADVSS_METHOD, (message: any) => {
      if (message && message.content) {
        const mappedMessage = mapBackendMessage(message);
        const currentSessionId = currentSessionRef.current?.id;
        if (currentSessionId && message.advisorySession1to1Id === currentSessionId) {
          setMessages(prev => addMessageWithDeduplication(mappedMessage, prev));
        }
      }
    });

    connection.on(SIGNALR_CONFIG.HUB_METHODS.JOIN_SS_METHOD, (sessionMessages: PagedResult<any>) => {
      if (sessionMessages && sessionMessages.items && Array.isArray(sessionMessages.items)) {
        const mappedMessages: ChatMessage[] = sessionMessages.items.map((message: any) => ({
          id: message.messageId || message.id || Date.now(),
          content: message.content,
          senderId: message.senderId,
          advisorySession1to1Id: message.advisorySession1to1Id,
          createdAt: message.createdAt || new Date().toISOString(),
          senderName: message.senderName || 'Unknown'
        }));
        setMessages(mappedMessages);
      }
    });

    connection.on(SIGNALR_CONFIG.HUB_METHODS.LOAD_MORE_MESSAGES_METHOD, (data: PagedResult<any>) => {
      if (!isUnmountedRef.current && data && data.items && Array.isArray(data.items)) {
        if (currentSessionRef.current) {
          const mappedMessages: ChatMessage[] = data.items.map((message: any) => ({
            id: message.messageId || message.id,
            content: message.content,
            senderId: message.senderId,
            advisorySession1to1Id: message.advisorySession1to1Id,
            createdAt: message.createdAt,
            senderName: message.senderName
          }));
          setMessages(prev => {
            const existingIds = new Set(prev.map(m => m.id));
            const newMessages = mappedMessages.filter(m => !existingIds.has(m.id));
            return [...newMessages, ...prev];
          });
        }
      }
    });

    connection.on(SIGNALR_CONFIG.HUB_METHODS.ADD_SESSION_AS_ASSIGNED, (session: StudentSession) => {
      if (!isUnmountedRef.current) {
        const currentAdvisorId = getProfileIdFromToken();
        if (session.staffId === currentAdvisorId) {
          // Add to My Chat and remove from Open Chat with smooth transitions
          updateMyChatData([session]);
          // Remove from Open Chat by filtering out the session
          const newOpenChatData = globalOpenChatData.filter(s => s.id !== session.id);
          globalOpenChatData = newOpenChatData;
          // Trigger UI update for Open Chat
          openChatListeners.forEach(listener => {
            try {
              listener(newOpenChatData);
            } catch (error) {
              console.error('Error in open chat listener:', error);
            }
          });
        }
      }
    });

    connection.on(SIGNALR_CONFIG.HUB_METHODS.REMOVE_SESSION_FROM_UNASSIGNED, (session: StudentSession) => {
      if (!isUnmountedRef.current) {
        // Remove from Open Chat
        const newOpenChatData = globalOpenChatData.filter(s => s.id !== session.id);
        updateOpenChatData(newOpenChatData);
      }
    });

    connection.on(SIGNALR_CONFIG.HUB_METHODS.SESSION_CREATED, (session: StudentSession) => {
      if (!isUnmountedRef.current) {
        const currentAdvisorId = getProfileIdFromToken();
        if (session.staffId === 4) {
          // Add to Open Chat (unassigned) with smooth animation
          updateOpenChatData([session]);
        } else if (session.staffId === currentAdvisorId) {
          // Add to My Chat (assigned) with smooth animation
          updateMyChatData([session]);
        }
      }
    });

    connection.on(SIGNALR_CONFIG.HUB_METHODS.SESSION_DELETED, (sessionId: number) => {
      if (!isUnmountedRef.current) {
        // Remove from both tabs
        const newOpenChatData = globalOpenChatData.filter(s => s.id !== sessionId);
        const newMyChatData = globalMyChatData.filter(s => s.id !== sessionId);
        updateOpenChatData(newOpenChatData);
        updateMyChatData(newMyChatData);
      }
    });
  }, [getProfileIdFromToken]);

  // Ensure there is an active SignalR connection before invoking hub methods
  const ensureConnection = useCallback(async (): Promise<signalR.HubConnection> => {
    // If we already have a connected instance, reuse it
    if (connectionRef.current && connectionRef.current.state === signalR.HubConnectionState.Connected) {
      return connectionRef.current;
    }

    // Create or reuse a managed connection (handles token refresh internally)
    const connection = await signalRManager.getConnection(SIGNALR_CONFIG.ADVISORY_CHAT_HUB_URL, accessToken || '');

    // Save ref, set state, and wire listeners if not already
    connectionRef.current = connection;
    setConnectionState(ConnectionState.Connected);
    setError(null);
    setupEventListeners(connection);

    return connection;
  }, [accessToken, setupEventListeners]);

  // Subscribe to Open Chat data - Facebook-like persistent data
  useEffect(() => {
    const unsubscribe = subscribeToOpenChat((openChatSessions) => {
      if (!isUnmountedRef.current && openChatSessions.length > 0) {
        setUnassignedSessions(openChatSessions);
        unassignedSessionsRef.current = openChatSessions;
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  // Subscribe to My Chat data - Facebook-like persistent data
  useEffect(() => {
    const unsubscribe = subscribeToMyChat((myChatSessions) => {
      if (!isUnmountedRef.current && myChatSessions.length > 0) {
        setSessions(myChatSessions);
        setAllAssignedSessions(myChatSessions);
        sessionsRef.current = myChatSessions;
        allAssignedSessionsRef.current = myChatSessions;
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  // Memoized session data to prevent unnecessary re-renders
  const memoizedSessions = useMemo(() => sessions, [sessions]);
  const memoizedUnassignedSessions = useMemo(() => unassignedSessions, [unassignedSessions]);
  const memoizedAllAssignedSessions = useMemo(() => allAssignedSessions, [allAssignedSessions]);

  // Update currentSession ref when currentSession changes
  useEffect(() => {
    currentSessionRef.current = currentSession;
  }, [currentSession]);

  // Set advisorId from profileId when hook initializes
  useEffect(() => {
    const profileId = getProfileIdFromToken();
    if (profileId && advisorId !== profileId) {
      setAdvisorId(profileId);
    }
  }, [accessToken, advisorId, getProfileIdFromToken]);

  // Add retry mechanism for session fetching (Open Chat)
  const fetchSessionsWithRetry = useCallback(async (retryCount = 0) => {
    const now = Date.now();
    if (now - lastOpenFetchAtRef.current < 800) {
      return;
    }
    lastOpenFetchAtRef.current = now;

    if (!connectionRef.current || isFetchingSessionsRef.current) {
      if (retryCount < 5) {
        setTimeout(() => fetchSessionsWithRetry(retryCount + 1), 1000);
      }
      return;
    }
    
    if (connectionRef.current.state !== signalR.HubConnectionState.Connected) {
      if (retryCount < 5) {
        setTimeout(() => fetchSessionsWithRetry(retryCount + 1), 1000);
      }
      return;
    }
    
    isFetchingSessionsRef.current = true;
    
    try {
      await connectionRef.current.invoke(SIGNALR_CONFIG.HUB_METHODS.LIST_OPENED_SESSIONS, { pageNumber: 1, pageSize: 20 });
    } catch (err) {
      console.error('Failed to fetch open sessions:', err);
      if (retryCount < 5) {
        setTimeout(() => fetchSessionsWithRetry(retryCount + 1), 2000);
      } else {
        setError(`Failed to fetch sessions: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    } finally {
      isFetchingSessionsRef.current = false;
    }
  }, []);

  // Fetch sessions from server (Open Chat sessions)
  const fetchSessions = useCallback(async () => {
    await fetchSessionsWithRetry();
  }, [fetchSessionsWithRetry]);

  // Fetch staff sessions for StudentChatTab (LIST_SESSIONS_BY_STAFF)
  const fetchAssignedSessions = useCallback(async () => {
    const now = Date.now();
    if (now - lastStaffFetchAtRef.current < 800) {
      return;
    }
    lastStaffFetchAtRef.current = now;

    if (!connectionRef.current || isFetchingStaffRef.current) {
      return;
    }

    try {
      isFetchingStaffRef.current = true;
      await connectionRef.current.invoke(SIGNALR_CONFIG.HUB_METHODS.LIST_SESSIONS_BY_STAFF, { pageNumber: 1, pageSize: 20 });
    } catch (err) {
      console.error('Failed to fetch advisor/staff sessions:', err);
      setError(`Failed to fetch staff sessions: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      isFetchingStaffRef.current = false;
    }
  }, []);

  // Fetch open sessions for OpenChatTab (LIST_OPENED_SESSIONS)
  const fetchOpenSessions = useCallback(async () => {
    const now = Date.now();
    if (now - lastOpenFetchAtRef.current < 800) {
      return;
    }
    lastOpenFetchAtRef.current = now;

    if (!connectionRef.current || isFetchingSessionsRef.current) {
      return;
    }

    try {
      isFetchingSessionsRef.current = true;
      await connectionRef.current.invoke(SIGNALR_CONFIG.HUB_METHODS.LIST_OPENED_SESSIONS, { pageNumber: 1, pageSize: 20 });
    } catch (err) {
      console.error('Failed to fetch open sessions:', err);
      setError(`Failed to fetch open sessions: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      isFetchingSessionsRef.current = false;
    }
  }, []);

  // Load more messages for infinite scroll
  const loadMoreMessages = useCallback(async (sessionId: number, pageNumber: number = 1) => {
    if (!connectionRef.current || !currentSessionRef.current) return;
    try {
      await connectionRef.current.invoke(SIGNALR_CONFIG.HUB_METHODS.LOAD_MORE_MESSAGES, sessionId, { 
        pageNumber, 
        pageSize: SIGNALR_CONFIG.MESSAGES.DEFAULT_PAGE_SIZE 
      });
    } catch (err) {
      setError(`Failed to load more messages: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, []);

  // Load initial messages for a session
  const loadInitialMessages = useCallback(async (sessionId: number) => {
    if (!connectionRef.current) {
      return;
    }
    try {
      await connectionRef.current.invoke(SIGNALR_CONFIG.HUB_METHODS.LOAD_MORE_MESSAGES, sessionId, { 
        pageNumber: 1, 
        pageSize: SIGNALR_CONFIG.MESSAGES.DEFAULT_PAGE_SIZE 
      });
    } catch (err) {
      setError(`Failed to load initial messages: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, []);

  // Join session
  const joinSession = useCallback(async (sessionId: number) => {
    // Ensure connection is established before attempting to join
    const connection = await ensureConnection();

    try {
      // Find and set current session first
      const session = [...globalMyChatData, ...globalOpenChatData].find(s => s.id === sessionId);
      if (session) {
        setCurrentSession(session);
      }

      await connection.invoke(SIGNALR_CONFIG.HUB_METHODS.JOIN_SESSION, sessionId);
      
      // Load initial messages after joining
      await loadInitialMessages(sessionId);
    } catch (err) {
      // Retry once after ensuring connection again (covers transient negotiation errors)
      try {
        const retryConn = await ensureConnection();
        await retryConn.invoke(SIGNALR_CONFIG.HUB_METHODS.JOIN_SESSION, sessionId);
        await loadInitialMessages(sessionId);
      } catch (finalErr) {
        throw new Error(`Failed to join session: ${finalErr instanceof Error ? finalErr.message : 'Unknown error'}`);
      }
    }
  }, [ensureConnection, loadInitialMessages]);

  // Send message - improved like student
  const sendMessage = useCallback(async (content: string) => {
    // Ensure connection is established; session must also be active
    await ensureConnection();
    if (!currentSessionRef.current) {
      throw new Error('No active session');
    }

    try {
      // Validate message before sending
      if (!content || content.trim().length === 0) {
        throw new Error('Message cannot be empty');
      }

      await connectionRef.current!.invoke(SIGNALR_CONFIG.HUB_METHODS.SEND_MESSAGE, currentSessionRef.current.id, content.trim());
    } catch (err) {
      throw new Error(`Failed to send message: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [ensureConnection]);

  // Main effect for connection management - SINGLE CONNECTION ONLY
  useEffect(() => {
    if (!accessToken) {
      setConnectionState(ConnectionState.Disconnected);
      setSessions([]);
      setUnassignedSessions([]);
      setAllAssignedSessions([]);
      setError(null);
      return;
    }

    isUnmountedRef.current = false;

    const startConnection = async () => {
      if (isUnmountedRef.current || isConnectingRef.current) return;

      isConnectingRef.current = true;

      try {
        const connection = await signalRManager.getConnection(SIGNALR_CONFIG.ADVISORY_CHAT_HUB_URL, accessToken);
        connectionRef.current = connection;
        setConnectionState(ConnectionState.Connected);
        setError(null);
        setupEventListeners(connection);
        if (!dataFetched) {
          await fetchSessions();
        }
      } catch (error) {
        console.error('Connection failed:', error);
        setConnectionState(ConnectionState.Disconnected);
        setError(error instanceof Error ? error.message : 'Connection failed');
      } finally {
        isConnectingRef.current = false;
      }
    };

    startConnection();

    return () => {
      isUnmountedRef.current = true;
      connectionRef.current = null;
    };
  }, [accessToken, fetchSessions, dataFetched, setupEventListeners]);

  // Force refresh all data - production ready
  const refreshAllData = useCallback(() => {
    // Fetch both types of data immediately
    fetchOpenSessions(); // Open Chat - LIST_OPENED_SESSIONS
    fetchAssignedSessions(); // My Chat - LIST_SESSIONS_BY_STAFF
  }, [fetchOpenSessions, fetchAssignedSessions]);

  // Facebook-like data loading - load once and persist
  useEffect(() => {
    if (connectionState === ConnectionState.Connected && !dataFetched) {
      // Load both types of data once
      fetchOpenSessions();
      setTimeout(() => {
        fetchAssignedSessions();
      }, 200);
    }
  }, [connectionState, dataFetched, fetchOpenSessions, fetchAssignedSessions]);

  return {
    connectionState,
    sessions: memoizedSessions,
    unassignedSessions: memoizedUnassignedSessions,
    allAssignedSessions: memoizedAllAssignedSessions,
    currentSession,
    messages,
    error,
    loading,
    dataFetched,
    advisorId,
    joinSession,
    sendMessage,
    loadMoreMessages,
    loadInitialMessages,
    setCurrentSession,
    setError,
    setMessages,
    fetchSessions,
    fetchAssignedSessions,
    fetchOpenSessions,
    refreshAllData,
    hasMoreAssigned,
  };
} 