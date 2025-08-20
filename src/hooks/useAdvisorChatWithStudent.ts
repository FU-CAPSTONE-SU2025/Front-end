import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuths } from './useAuthState';
import { SIGNALR_CONFIG, ConnectionState, signalRManager } from '../config/signalRConfig';
import { StudentSession, ChatMessage, PagedResult } from '../interfaces/IChat';
import { addMessageWithDeduplication, mapBackendMessage } from '../utils/messageUtils';

// Global sessions state to share across all instances
let globalSessions: StudentSession[] = [];
let globalUnassignedSessions: StudentSession[] = [];
let globalAllAssignedSessions: StudentSession[] = [];
let globalSessionsListeners: Set<(sessions: StudentSession[], unassigned: StudentSession[], allAssigned: StudentSession[]) => void> = new Set();
let updateTimeout: NodeJS.Timeout | null = null;
let pendingUpdate: {
  sessions: StudentSession[];
  unassigned: StudentSession[];
  allAssigned: StudentSession[];
} | null = null;

// Function to update global sessions with debouncing
const updateGlobalSessions = (sessions: StudentSession[], unassigned: StudentSession[], allAssigned: StudentSession[]) => {
  // Store pending update
  pendingUpdate = { sessions, unassigned, allAssigned };
  
  // Clear existing timeout
  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }
  
  // Debounce updates to prevent UI flickering
  updateTimeout = setTimeout(() => {
    if (pendingUpdate) {
      globalSessions = pendingUpdate.sessions;
      globalUnassignedSessions = pendingUpdate.unassigned;
      globalAllAssignedSessions = pendingUpdate.allAssigned;
      
      // Batch update all listeners
      globalSessionsListeners.forEach(listener => {
        try {
          listener(pendingUpdate.sessions, pendingUpdate.unassigned, pendingUpdate.allAssigned);
        } catch (error) {
          console.error('Error in session listener:', error);
        }
      });
      
      pendingUpdate = null;
    }
  }, 100); // 100ms debounce
};

// Function to subscribe to global sessions
const subscribeToGlobalSessions = (listener: (sessions: StudentSession[], unassigned: StudentSession[], allAssigned: StudentSession[]) => void) => {
  globalSessionsListeners.add(listener);
  // Immediately call with current sessions
  listener(globalSessions, globalUnassignedSessions, globalAllAssignedSessions);
  
  // Return unsubscribe function
  return () => {
    globalSessionsListeners.delete(listener);
  };
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
  
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const retryCountRef = useRef(0);
  const isUnmountedRef = useRef(false);
  
  const accessToken = useAuths((state) => state.accessToken);

  // Subscribe to global sessions with deep comparison
  useEffect(() => {
    const unsubscribe = subscribeToGlobalSessions((globalSessions, globalUnassigned, globalAllAssigned) => {
      if (!isUnmountedRef.current) {
        // Deep comparison to prevent unnecessary updates
        const sessionsChanged = JSON.stringify(globalSessions) !== JSON.stringify(sessionsRef.current);
        const unassignedChanged = JSON.stringify(globalUnassigned) !== JSON.stringify(unassignedSessionsRef.current);
        const allAssignedChanged = JSON.stringify(globalAllAssigned) !== JSON.stringify(allAssignedSessionsRef.current);
        
        if (sessionsChanged) {
          setSessions(globalSessions);
          sessionsRef.current = globalSessions;
        }
        
        if (unassignedChanged) {
          setUnassignedSessions(globalUnassigned);
          unassignedSessionsRef.current = globalUnassigned;
        }
        
        if (allAssignedChanged) {
          setAllAssignedSessions(globalAllAssigned);
          allAssignedSessionsRef.current = globalAllAssigned;
        }
      }
    });
    
    return unsubscribe;
  }, []);

  // Memoized session data to prevent unnecessary re-renders
  const memoizedSessions = useMemo(() => sessions, [sessions]);
  const memoizedUnassignedSessions = useMemo(() => unassignedSessions, [unassignedSessions]);
  const memoizedAllAssignedSessions = useMemo(() => allAssignedSessions, [allAssignedSessions]);

  // Update currentSession ref when currentSession changes
  useEffect(() => {
    currentSessionRef.current = currentSession;
  }, [currentSession]);

  // Function to get profile ID from token
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

  // Set advisorId from profileId when hook initializes
  useEffect(() => {
    const profileId = getProfileIdFromToken();
    if (profileId && advisorId !== profileId) {
      setAdvisorId(profileId);
    }
  }, [accessToken, advisorId, getProfileIdFromToken]);

  // Monitor sessions state changes
  useEffect(() => {
    // Sessions state changed
  }, [sessions, unassignedSessions, allAssignedSessions]);

  // Add retry mechanism for session fetching
  const fetchSessionsWithRetry = useCallback(async (retryCount = 0) => {
    if (!connectionRef.current || isFetchingSessionsRef.current) {
      if (retryCount < 3) {
        setTimeout(() => fetchSessionsWithRetry(retryCount + 1), 1000);
      }
      return;
    }
    
    if (connectionRef.current.state !== signalR.HubConnectionState.Connected) {
      if (retryCount < 3) {
        setTimeout(() => fetchSessionsWithRetry(retryCount + 1), 1000);
      }
          return;
    }
    
    isFetchingSessionsRef.current = true;
    
    try {
      setLoading(true);
      
      // Call both methods together to get all sessions at once
      await Promise.all([
        connectionRef.current.invoke(SIGNALR_CONFIG.HUB_METHODS.LIST_OPENED_SESSIONS, { pageNumber: 1, pageSize: 20 }),
        connectionRef.current.invoke(SIGNALR_CONFIG.HUB_METHODS.LIST_SESSIONS_BY_STAFF, { pageNumber: 1, pageSize: 20 })
      ]);
      
        } catch (err) {
      console.error('Failed to call both methods:', err);
      // Try alternative methods
      try {
        await connectionRef.current.invoke(SIGNALR_CONFIG.HUB_METHODS.LIST_SESSIONS_BY_STAFF, { pageNumber: 1, pageSize: 20 });
      } catch (altErr) {
        // Try direct method
        try {
          await connectionRef.current.invoke('GetSessions', { pageNumber: 1, pageSize: 20 });
        } catch (directErr) {
          // Retry if we haven't exceeded retry count
          if (retryCount < 3) {
            setTimeout(() => fetchSessionsWithRetry(retryCount + 1), 2000);
          } else {
            setError(`Failed to fetch sessions: ${err instanceof Error ? err.message : 'Unknown error'}`);
          }
        }
      }
    } finally {
      setLoading(false);
      isFetchingSessionsRef.current = false;
    }
  }, []);

  // Fetch sessions from server
  const fetchSessions = useCallback(async () => {
    await fetchSessionsWithRetry();
  }, [fetchSessionsWithRetry]);

  // Fetch assigned sessions for My Chat
  const fetchAssignedSessions = useCallback(async () => {
    await fetchSessions();
  }, [fetchSessions]);

  // Setup event listeners on existing connection
  const setupEventListeners = useCallback((connection: signalR.HubConnection) => {
    if (!connection) return;

    // Connection state handlers
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

    // Event listeners - using exact backend method names
    connection.on(SIGNALR_CONFIG.HUB_METHODS.GET_SESSIONS_METHOD, (data: PagedResult<StudentSession>) => {
      if (!isUnmountedRef.current && data && data.items && Array.isArray(data.items)) {
        // GET_SESSIONS_METHOD returns all sessions, no filtering needed
        const currentAdvisorId = getProfileIdFromToken();
        const assignedSessions = data.items;
        const unassignedSessions = data.items;
        const allAssignedSessions = data.items;
        
        updateGlobalSessions(assignedSessions, unassignedSessions, allAssignedSessions);
        setDataFetched(true);
      }
    });

    // SINGLE CONSOLIDATED EVENT LISTENER for session data
    const handleSessionEvent = (eventName: string, data: PagedResult<StudentSession>) => {
      if (!isUnmountedRef.current && data && data.items && Array.isArray(data.items)) {
        const currentAdvisorId = getProfileIdFromToken();
        
        // Process based on event type
        let assignedSessions: StudentSession[] = [];
        let unassignedSessions: StudentSession[] = [];
        let allAssignedSessions: StudentSession[] = [];
        
        switch (eventName) {
          case 'ListAllSessionByStaff':
            // LIST_SESSIONS_BY_STAFF returns assigned sessions
            assignedSessions = data.items.filter(session => 
              session && session.staffId && session.staffId === currentAdvisorId
            );
            unassignedSessions = [];
            allAssignedSessions = data.items;
            break;
            
          case 'ListOpenedSession':
          case 'ListOpenedSessions':
          case 'GetOpenedSessions':
            // LIST_OPENED_SESSIONS returns unassigned sessions
            unassignedSessions = data.items;
            assignedSessions = [];
            allAssignedSessions = [];
            break;
            
          case 'ListAllAssignedSessions':
            // LIST_ALL_ASSIGNED_SESSIONS returns assigned sessions
            assignedSessions = data.items.filter(session => 
              session && session.staffId && session.staffId === currentAdvisorId
            );
            unassignedSessions = [];
            allAssignedSessions = data.items;
            break;
            
          default:
            // Default: treat as all sessions
            assignedSessions = data.items;
            unassignedSessions = data.items;
            allAssignedSessions = data.items;
            break;
        }
        
        updateGlobalSessions(assignedSessions, unassignedSessions, allAssignedSessions);
        setDataFetched(true);
      }
    };

    // PRIMARY EVENT LISTENERS - using exact backend method names
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

    // FALLBACK EVENT LISTENERS - only for compatibility
    connection.on('ListOpenedSessions', (data: PagedResult<StudentSession>) => {
      handleSessionEvent('ListOpenedSessions', data);
    });

    connection.on('GetOpenedSessions', (data: PagedResult<StudentSession>) => {
      handleSessionEvent('GetOpenedSessions', data);
    });

    connection.on('GetSessions', (data: PagedResult<StudentSession>) => {
      handleSessionEvent('GetSessions', data);
    });

    connection.on('GetAllSessions', (data: PagedResult<StudentSession>) => {
      handleSessionEvent('GetAllSessions', data);
    });

    // Main message listener for real-time messages - USING UTILITY FUNCTION
    connection.on(SIGNALR_CONFIG.HUB_METHODS.SEND_ADVSS_METHOD, (message: any) => {
      
      if (message && message.content) {
        const mappedMessage = mapBackendMessage(message);
        
        // Add message to current session if it matches
        const currentSessionId = currentSessionRef.current?.id;
        if (currentSessionId && message.advisorySession1to1Id === currentSessionId) {
          setMessages(prev => addMessageWithDeduplication(mappedMessage, prev));
        }
      }
    });

    // Join session method - loads message history - SIMPLIFIED like demo
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

    // Load more messages for infinite scroll
    connection.on(SIGNALR_CONFIG.HUB_METHODS.LOAD_MORE_MESSAGES_METHOD, (data: PagedResult<any>) => {
      if (!isUnmountedRef.current && data && data.items && Array.isArray(data.items)) {
        if (currentSessionRef.current) {
          // Map backend message structure to ChatMessage interface
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
            return [...newMessages, ...prev]; // Prepend older messages
          });
        }
      }
    });

    // Handle session assignment events
    connection.on(SIGNALR_CONFIG.HUB_METHODS.ADD_SESSION_AS_ASSIGNED, (session: StudentSession) => {
      if (!isUnmountedRef.current) {
        // Update global sessions
        const currentAdvisorId = getProfileIdFromToken();
        const assignedSessions = [...sessionsRef.current];
        const unassignedSessions = [...unassignedSessionsRef.current];
        const allAssignedSessions = [...allAssignedSessionsRef.current];
        
        if (session.staffId === currentAdvisorId) {
          assignedSessions.push(session);
        }
        allAssignedSessions.push(session);
        
        updateGlobalSessions(assignedSessions, unassignedSessions, allAssignedSessions);
      }
    });

    connection.on(SIGNALR_CONFIG.HUB_METHODS.REMOVE_SESSION_FROM_UNASSIGNED, (session: StudentSession) => {
      if (!isUnmountedRef.current) {
        // Update global sessions
        const unassignedSessions = unassignedSessionsRef.current.filter(s => s.id !== session.id);
        updateGlobalSessions(sessionsRef.current, unassignedSessions, allAssignedSessionsRef.current);
      }
    });

    connection.on(SIGNALR_CONFIG.HUB_METHODS.SESSION_CREATED, (session: StudentSession) => {
      if (!isUnmountedRef.current) {
        // Update global sessions
        const currentAdvisorId = getProfileIdFromToken();
        const assignedSessions = [...sessionsRef.current];
        const unassignedSessions = [...unassignedSessionsRef.current];
        const allAssignedSessions = [...allAssignedSessionsRef.current];
        
        if (session.staffId === 4) {
          unassignedSessions.push(session);
        } else if (session.staffId === currentAdvisorId) {
          assignedSessions.push(session);
        }
        allAssignedSessions.push(session);
        
        updateGlobalSessions(assignedSessions, unassignedSessions, allAssignedSessions);
      }
    });

    connection.on(SIGNALR_CONFIG.HUB_METHODS.SESSION_DELETED, (sessionId: number) => {
      if (!isUnmountedRef.current) {
        // Update global sessions
        const assignedSessions = sessionsRef.current.filter(s => s.id !== sessionId);
        const unassignedSessions = unassignedSessionsRef.current.filter(s => s.id !== sessionId);
        const allAssignedSessions = allAssignedSessionsRef.current.filter(s => s.id !== sessionId);
        
        updateGlobalSessions(assignedSessions, unassignedSessions, allAssignedSessions);
      }
    });
  }, [getProfileIdFromToken]);

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
    
    // Ensure connection is available
    if (!connectionRef.current) {
      try {
        const connection = await signalRManager.getConnection(SIGNALR_CONFIG.ADVISORY_CHAT_HUB_URL, accessToken);
        connectionRef.current = connection;
        setConnectionState(ConnectionState.Connected);
        
        // Setup event listeners if not already done
        setupEventListeners(connection);
      } catch (error) {
        console.error('Failed to get connection:', error);
        throw new Error('Connection not available');
      }
    }
    
    // Wait for connection to be ready
      let retryCount = 0;
    const maxRetries = 10;
      
      while (retryCount < maxRetries) {
      if (!connectionRef.current) {
        await new Promise(resolve => setTimeout(resolve, 500));
        retryCount++;
        continue;
      }
      
          if (connectionRef.current.state !== signalR.HubConnectionState.Connected) {
        await new Promise(resolve => setTimeout(resolve, 500));
            retryCount++;
            continue;
          }
          
      // Connection is ready, proceed
      break;
    }
    
    if (!connectionRef.current || connectionRef.current.state !== signalR.HubConnectionState.Connected) {
      throw new Error('Connection not available after retries');
    }
    
    try {
      
          await connectionRef.current.invoke(SIGNALR_CONFIG.HUB_METHODS.JOIN_SESSION, sessionId);
      
      // Find and set current session using ref
      const session = [...sessionsRef.current, ...unassignedSessionsRef.current].find(s => s.id === sessionId);
      if (session) {
        setCurrentSession(session);
      }
          
          // Load initial messages after joining
          await loadInitialMessages(sessionId);
        } catch (err) {
      console.error('Join session error:', err);
      throw new Error(`Failed to join session: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [loadInitialMessages, connectionState, accessToken, setupEventListeners]);

  // Send message
  const sendMessage = useCallback(async (content: string) => {
    
    // Ensure connection is available
    if (!connectionRef.current) {
      try {
        const connection = await signalRManager.getConnection(SIGNALR_CONFIG.ADVISORY_CHAT_HUB_URL, accessToken);
        connectionRef.current = connection;
        setConnectionState(ConnectionState.Connected);
        
        // Setup event listeners if not already done
        setupEventListeners(connection);
      } catch (error) {
        console.error('Failed to get connection:', error);
        throw new Error('Connection not available');
      }
    }
    
    // Wait for connection to be ready
    let retryCount = 0;
    const maxRetries = 5;
    
    while (retryCount < maxRetries) {
      if (!connectionRef.current) {
        await new Promise(resolve => setTimeout(resolve, 500));
        retryCount++;
        continue;
      }
      
      if (connectionRef.current.state !== signalR.HubConnectionState.Connected) {
        await new Promise(resolve => setTimeout(resolve, 500));
        retryCount++;
        continue;
      }
      
      if (!currentSessionRef.current) {
        await new Promise(resolve => setTimeout(resolve, 500));
        retryCount++;
        continue;
      }
      
      // Connection and session are ready, proceed
      break;
    }
    
    if (!connectionRef.current || connectionRef.current.state !== signalR.HubConnectionState.Connected) {
      throw new Error('Connection not available after retries');
    }
    
    if (!currentSessionRef.current) {
      throw new Error('No active session');
    }
    
    try {
      await connectionRef.current.invoke(SIGNALR_CONFIG.HUB_METHODS.SEND_MESSAGE, currentSessionRef.current.id, content);
    } catch (err) {
      console.error('Send message error:', err);
      throw new Error(`Failed to send message: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [advisorId, connectionState, accessToken, setupEventListeners]);

  // Load more sessions
  const loadMoreSessions = useCallback(async (pageNumber: number = 1, pageSize: number = SIGNALR_CONFIG.MESSAGES.DEFAULT_PAGE_SIZE) => {
    if (!connectionRef.current) return;
    
    if (connectionRef.current.state !== signalR.HubConnectionState.Connected) {
      return;
    }
    
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        if (connectionRef.current.state !== signalR.HubConnectionState.Connected) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          retryCount++;
          continue;
        }
        
        await connectionRef.current.invoke(SIGNALR_CONFIG.HUB_METHODS.LOAD_MORE_SESSIONS, { pageNumber, pageSize });
        return;
    } catch (err) {
        retryCount++;
        
        if (retryCount >= maxRetries) {
          setError(`Failed to load more sessions: ${err instanceof Error ? err.message : 'Unknown error'}`);
          return;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
  }, []);

  // Load more assigned sessions
  const loadMoreAssignedSessions = useCallback(async () => {
    if (!hasMoreAssigned || loading) return;
    
    if (!connectionRef.current) return;
    
    try {
      setLoading(true);
      const nextPageNumber = assignedPageNumber + 1;
   
      
      await connectionRef.current.invoke(SIGNALR_CONFIG.HUB_METHODS.LOAD_MORE_SESSIONS, { 
        pageNumber: nextPageNumber, 
        pageSize: 10 
      });
      
      setAssignedPageNumber(nextPageNumber);
    } catch (err) {
      setError(`Failed to load more assigned sessions: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [hasMoreAssigned, loading, assignedPageNumber]);

  // Assign advisor to session
  const assignAdvisorToSession = useCallback(async (sessionId: number) => {
    if (!connectionRef.current) return;
    
    try {
      await joinSession(sessionId);
    } catch (err) {
      setError('Failed to assign advisor to session');
      throw err;
    }
  }, [joinSession]);

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
        // Use global SignalR manager to get connection
        const connection = await signalRManager.getConnection(SIGNALR_CONFIG.ADVISORY_CHAT_HUB_URL, accessToken);
      connectionRef.current = connection;
        setConnectionState(ConnectionState.Connected);
        setError(null);
        
        // Setup event listeners on the existing connection
        setupEventListeners(connection);
        
        // Fetch sessions after successful connection
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

  // Force refresh all data
  const refreshAllData = useCallback(() => {
    setDataFetched(false);
    // Only fetch what's needed based on current tab
    fetchSessions(); // Changed from fetchUnassignedSessions
    // fetchAllAssignedSessions(); // For My Chat - This was removed from the new_code, so it's removed here.
  }, [fetchSessions]);

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
    loadMoreSessions,
    assignAdvisorToSession,
    setCurrentSession,
    setError,
    setMessages,
    fetchSessions,
    fetchAssignedSessions,
    refreshAllData,
    hasMoreAssigned,
  };
} 