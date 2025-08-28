import { useState, useEffect, useCallback, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuths } from './useAuthState';
import { ChatMessage, PagedResult } from '../interfaces/IChat';
import { SIGNALR_CONFIG, ConnectionState, signalRManager } from '../config/signalRConfig';
import { useChatSession } from './useChatSession';
import { addMessageWithDeduplication, mapBackendMessage } from '../utils/messageUtils';

export interface AdvisorSession {
  id: number;
  title: string;
  staffId: number;
  studentId: number;
  type: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
  lastMessageTime?: string;
  lastMessageSenderId?: number;
  unreadCount?: number;
  staffName?: string;
  staffAvatar?: string;
  isOnline?: boolean;
}

// Global sessions state to share across all instances
let globalSessions: AdvisorSession[] = [];
let globalSessionsListeners: Set<(sessions: AdvisorSession[]) => void> = new Set();

// Function to update global sessions
const updateGlobalSessions = (sessions: AdvisorSession[]) => {
  globalSessions = sessions;
  globalSessionsListeners.forEach(listener => listener(sessions));
};

// Function to subscribe to global sessions
const subscribeToGlobalSessions = (listener: (sessions: AdvisorSession[]) => void) => {
  globalSessionsListeners.add(listener);
  // Immediately call with current sessions
  listener(globalSessions);
  
  // Return unsubscribe function
  return () => {
    globalSessionsListeners.delete(listener);
  };
};

export function useAdvisorChat() {
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected);
  const [sessions, setSessions] = useState<AdvisorSession[]>([]);
  const [currentSession, setCurrentSession] = useState<AdvisorSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [studentId, setStudentId] = useState<number | null>(null);
  
  const sessionsRef = useRef<AdvisorSession[]>([]);
  const currentSessionRef = useRef<AdvisorSession | null>(null);
  
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const isUnmountedRef = useRef(false);
  const isConnectingRef = useRef(false);
  const isFetchingSessionsRef = useRef(false);
  
  const accessToken = useAuths((state) => state.accessToken);

  // Subscribe to global sessions
  useEffect(() => {
    const unsubscribe = subscribeToGlobalSessions((globalSessions) => {
      if (!isUnmountedRef.current) {
        setSessions(globalSessions);
        sessionsRef.current = globalSessions;
      }
    });
    
    return unsubscribe;
  }, []);

  // Update currentSession ref when currentSession changes
  useEffect(() => {
    currentSessionRef.current = currentSession;
  }, [currentSession]);

  // Get profileId from JWT token
  const getProfileIdFromToken = useCallback(() => {
    if (!accessToken) return null;
    
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const profileId = payload.profileId || payload.profile_id || payload.ProfileId || payload.PROFILEID ||
                       payload.userId || payload.user_id || payload.UserId || payload.USERID;
      return profileId ? parseInt(profileId) : null;
    } catch (err) {
      return null;
    }
  }, [accessToken]);

  // Set studentId from profileId when hook initializes
  useEffect(() => {
    const profileId = getProfileIdFromToken();
    if (profileId && studentId !== profileId) {
      setStudentId(profileId);
    }
  }, [accessToken, studentId, getProfileIdFromToken]);

  // Monitor sessions state changes
  useEffect(() => {
    // Sessions state changed
  }, [sessions]);

  // Fetch sessions with simple retry mechanism
  const fetchSessionsWithRetry = useCallback(async (retryCount = 0) => {
    if (!connectionRef.current || isFetchingSessionsRef.current) {
      return;
    }
    
    if (connectionRef.current.state !== signalR.HubConnectionState.Connected) {
      if (retryCount < 2) {
        setTimeout(() => fetchSessionsWithRetry(retryCount + 1), 1000);
      }
      return;
    }
    
    isFetchingSessionsRef.current = true;
    
    try {
      setLoading(true);
      setError(null);
      await connectionRef.current.invoke(SIGNALR_CONFIG.HUB_METHODS.LIST_ALL_SESSIONS_BY_STUDENT, { pageNumber: 1, pageSize: 20 });
    } catch (err) {
      // Try alternative method
      try {
        await connectionRef.current.invoke('GetSessionsHUBMethod', { pageNumber: 1, pageSize: 20 });
      } catch (altErr) {
        // Try direct method
        try {
          await connectionRef.current.invoke('GetSessions', { pageNumber: 1, pageSize: 20 });
        } catch (directErr) {
          if (retryCount < 2) {
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

  // Fetch sessions from server using ListAllSessionByStudent for students
  const fetchSessions = useCallback(async () => {
    await fetchSessionsWithRetry();
  }, [fetchSessionsWithRetry]);

  // Load more messages for infinite scroll
  const loadMoreMessages = useCallback(async (sessionId: number, pageNumber: number = 1) => {
    if (!connectionRef.current) {
      setError('Connection not available');
      return;
    }
    
    try {
      await connectionRef.current.invoke(SIGNALR_CONFIG.HUB_METHODS.LOAD_MORE_MESSAGES, sessionId, { pageNumber, pageSize: 20 });
    } catch (err) {
      setError(`Failed to load more messages: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, []);

  // Load more sessions for infinite scroll
  const loadMoreSessions = useCallback(async (pageNumber: number = 1) => {
    if (!connectionRef.current) {
      setError('Connection not available');
      return;
    }
    
    try {
      await connectionRef.current.invoke(SIGNALR_CONFIG.HUB_METHODS.LOAD_MORE_SESSIONS, { pageNumber, pageSize: 20 });
    } catch (err) {
      setError(`Failed to load more sessions: ${err instanceof Error ? err.message : 'Unknown error'}`);
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

  // Initialize chat session
  // Use the new chat session hook
  const { initializeSession, isLoading: isInitializingSession, error: sessionError, sessionData } = useChatSession();

  const initChatSession = useCallback(async (message: string) => {
    return await initializeSession(message);
  }, [initializeSession]);

  // Join session
  const joinSession = useCallback(async (sessionId: number) => {
    if (!connectionRef.current) {
      throw new Error('Connection not available');
    }

    try {
      await connectionRef.current.invoke(SIGNALR_CONFIG.HUB_METHODS.JOIN_SESSION, sessionId);
      
      // Find and set current session using ref
      const session = sessionsRef.current.find(s => s.id === sessionId);
      if (session) {
        setCurrentSession(session);
      }

      // Load initial messages after joining
      await loadInitialMessages(sessionId);
    } catch (err) {
      throw new Error(`Failed to join session: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [loadInitialMessages]);

  // Send message
  const sendMessage = useCallback(async (content: string) => {
    if (!connectionRef.current || !currentSessionRef.current) {
      throw new Error('No active session');
    }

    try {
      await connectionRef.current.invoke(SIGNALR_CONFIG.HUB_METHODS.SEND_MESSAGE, currentSessionRef.current.id, content);
    } catch (err) {
      throw new Error(`Failed to send message: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, []);

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

    // Event listeners - using exact backend method names from ChatSessionSettings
    
    // SINGLE CONSOLIDATED EVENT LISTENER for session data
    const handleSessionEvent = (eventName: string, data: PagedResult<AdvisorSession>) => {
      if (!isUnmountedRef.current && data && data.items && Array.isArray(data.items)) {
        updateGlobalSessions(data.items);
        setDataFetched(true);
      }
    };

    // PRIMARY EVENT LISTENERS - using exact backend method names
    connection.on(SIGNALR_CONFIG.HUB_METHODS.GET_SESSIONS_METHOD, (data: PagedResult<AdvisorSession>) => {
      handleSessionEvent('GET_SESSIONS_METHOD', data);
    });

    // FALLBACK EVENT LISTENERS - only for compatibility
    connection.on('GetSessionsHUBMethod', (data: PagedResult<AdvisorSession>) => {
      handleSessionEvent('GetSessionsHUBMethod', data);
    });

    connection.on('GetSessions', (data: PagedResult<AdvisorSession>) => {
      handleSessionEvent('GetSessions', data);
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
    connection.on(SIGNALR_CONFIG.HUB_METHODS.ADD_SESSION_AS_ASSIGNED, (session: AdvisorSession) => {
      if (!isUnmountedRef.current) {
        setSessions(prev => {
          const exists = prev.some(s => s.id === session.id);
          if (!exists) {
            return [...prev, session];
          }
          return prev.map(s => s.id === session.id ? session : s);
        });
      }
    });

    connection.on(SIGNALR_CONFIG.HUB_METHODS.REMOVE_SESSION_FROM_UNASSIGNED, (session: AdvisorSession) => {
      if (!isUnmountedRef.current) {
        setSessions(prev => prev.filter(s => s.id !== session.id));
      }
    });
  }, []);

  // Main effect for connection management
  useEffect(() => {
    if (!accessToken) {
      setConnectionState(ConnectionState.Disconnected);
      setSessions([]);
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
  }, [accessToken, setupEventListeners, fetchSessions, dataFetched]);

  return {
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
    loadMoreMessages,
    loadMoreSessions,
    loadInitialMessages,
    setCurrentSession,
    setError,
    setMessages,
    fetchSessions,
    // Chat session states from useChatSession hook
    isInitializingSession,
    sessionError,
    sessionData,
  };
} 