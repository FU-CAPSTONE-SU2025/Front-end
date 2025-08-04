import { useState, useEffect, useCallback, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuths } from './useAuths';
import { ChatMessage, PagedResult } from '../interfaces/IChat';

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
  lastMessageSenderId?: number; // Add senderId for last message
  unreadCount?: number;
  staffName?: string;
  staffAvatar?: string;
  isOnline?: boolean;
}

enum ConnectionState {
  Disconnected = 'Disconnected',
  Connecting = 'Connecting',
  Connected = 'Connected',
  Reconnecting = 'Reconnecting',
}

const ADVISORY_CHAT_HUB_URL = 'http://178.128.31.58:5000/advisoryChat1to1Hub';
const INIT_SESSION_API_URL = 'http://178.128.31.58:5000/api/AdvisorySession1to1/human';

export function useAdvisorChat() {
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected);
  const [sessions, setSessions] = useState<AdvisorSession[]>([]);
  const [currentSession, setCurrentSession] = useState<AdvisorSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [studentId, setStudentId] = useState<number | null>(null);
  
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const isUnmountedRef = useRef(false);
  
  const accessToken = useAuths((state) => state.accessToken);

  // Get profileId from JWT token
  const getProfileIdFromToken = useCallback(() => {
    if (!accessToken) return null;
    
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const profileId = payload.profileId || payload.profile_id || payload.ProfileId || payload.PROFILEID ||
                       payload.userId || payload.user_id || payload.UserId || payload.USERID;
      return profileId ? parseInt(profileId) : null;
    } catch (err) {
      console.error('Failed to parse JWT token:', err);
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

  // Fetch sessions from server using ListAllSessionByStudent
  const fetchSessions = useCallback(async () => {
    if (!connectionRef.current) {
      setError('Connection not available');
      return;
    }
    
    try {
      setLoading(true);
      // Sửa tại đây: truyền PaginationRequest
      await connectionRef.current.invoke('ListAllSessionByStudent', { pageNumber: 1, pageSize: 20 });
    } catch (err) {
      setError(`Failed to fetch sessions: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load more messages for infinite scroll
  const loadMoreMessages = useCallback(async (sessionId: number, pageNumber: number = 1) => {
    if (!connectionRef.current) {
      setError('Connection not available');
      return;
    }
    
    try {
      await connectionRef.current.invoke('LoadMoreMessages', sessionId, { pageNumber, pageSize: 20 });
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
      await connectionRef.current.invoke('LoadMoreSessions', { pageNumber, pageSize: 20 });
    } catch (err) {
      setError(`Failed to load more sessions: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, []);

  // Initialize chat session
  const initChatSession = useCallback(async (message: string) => {
    if (!accessToken) {
      throw new Error('No access token available');
    }

    try {
      const response = await fetch(INIT_SESSION_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ message })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      throw new Error(`Failed to initialize chat session: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [accessToken]);

  // Join session
  const joinSession = useCallback(async (sessionId: number) => {
    if (!connectionRef.current) {
      throw new Error('Connection not available');
    }

    try {
      await connectionRef.current.invoke('JoinSession', sessionId);
      
      // Find and set current session
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        setCurrentSession(session);
      }
    } catch (err) {
      throw new Error(`Failed to join session: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [sessions]);

  // Send message
  const sendMessage = useCallback(async (content: string) => {
    if (!connectionRef.current || !currentSession) {
      throw new Error('No active session');
    }

    try {
      await connectionRef.current.invoke('SendMessage', currentSession.id, content);
    } catch (err) {
      throw new Error(`Failed to send message: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [currentSession]);



  // Setup connection
  const setupConnection = useCallback(() => {
    if (!accessToken) return null;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${ADVISORY_CHAT_HUB_URL}?access_token=${encodeURIComponent(accessToken)}`, { 
        transport: signalR.HttpTransportType.WebSockets,
        skipNegotiation: false
      })
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Debug) // Changed to Debug for more details
      .build();

    // Connection state handlers
    connection.onreconnecting(() => {
      setConnectionState(ConnectionState.Reconnecting);
      setError(null);
    });

    connection.onreconnected(() => {
      setConnectionState(ConnectionState.Connected);
      setError(null);
    });

    connection.onclose((error) => {
      setConnectionState(ConnectionState.Disconnected);
      if (error) {
        setError(error.message);
      }
    });

    // Event listeners
    
    connection.on('GetSessionsHUBMethod', (data: PagedResult<AdvisorSession>) => {
      if (!data || !data.items || !Array.isArray(data.items)) {
        setSessions([]);
        return;
      }

      setSessions(data.items);
      setDataFetched(true);
    });

    connection.on('JoinSSMethod', (sessionMessages: PagedResult<ChatMessage>) => {
      if (!sessionMessages || !sessionMessages.items || !Array.isArray(sessionMessages.items)) {
        setMessages([]);
        return;
      }
      setMessages(sessionMessages.items);
    });

    // Add handler for 'joingradvss' event that backend is sending
    connection.on('joingradvss', (sessionMessages: PagedResult<ChatMessage>) => {
      if (!sessionMessages || !sessionMessages.items || !Array.isArray(sessionMessages.items)) {
        setMessages([]);
        return;
      }
      setMessages(sessionMessages.items);
    });

    connection.on('SendADVSSMethod', (message: ChatMessage) => {
      
      if (!message || !message.content || !message.id) {
        return;
      }
      
      const currentSessionId = currentSession?.id;
      
      if (currentSessionId && message.advisorySession1to1Id === currentSessionId) {
        setMessages(prev => {
          const exists = prev.some(m => m.id === message.id);
          if (!exists) {
            return [...prev, message];
          }
          return prev;
        });
      }
    });

    // Add handler for 'sendadvss' event (lowercase) if backend sends it
    connection.on('sendadvss', (message: ChatMessage) => {
      
      if (!message || !message.content || !message.id) {
        return;
      }
      
      const currentSessionId = currentSession?.id;
      if (currentSessionId && message.advisorySession1to1Id === currentSessionId) {
        setMessages(prev => {
          const exists = prev.some(m => m.id === message.id);
          if (!exists) {
            return [...prev, message];
          }
          return prev;
        });
      }
    });

    // Add handler for 'newmessage' event if backend sends it
    connection.on('newmessage', (message: ChatMessage) => {
      
      if (!message || !message.content || !message.id) {
        return;
      }
      
      const currentSessionId = currentSession?.id;
      if (currentSessionId && message.advisorySession1to1Id === currentSessionId) {
        setMessages(prev => {
          const exists = prev.some(m => m.id === message.id);
          if (!exists) {
            return [...prev, message];
          }
          return prev;
        });
      }
    });

    connection.on('LoadMoreMessagesMethod', (data: PagedResult<ChatMessage>) => {
      if (!data || !data.items || !Array.isArray(data.items)) {
        return;
      }
      
      if (currentSession) {
        setMessages(prev => {
          const existingIds = new Set(prev.map(m => m.id));
          const newMessages = data.items.filter(m => !existingIds.has(m.id));
          return [...prev, ...newMessages];
        });
      }
    });

    // Handle session assignment events
    connection.on('AddSessionAsAssigned', (session: AdvisorSession) => {
      setSessions(prev => {
        const exists = prev.some(s => s.id === session.id);
        if (!exists) {
          return [...prev, session];
        }
        return prev.map(s => s.id === session.id ? session : s);
      });
    });

    connection.on('RemoveSessionFromUnassigned', (session: AdvisorSession) => {
      setSessions(prev => prev.filter(s => s.id !== session.id));
    });

    return connection;
  }, [accessToken, currentSession]);

  // Main effect for connection management
  useEffect(() => {
    if (!accessToken) {
      setConnectionState(ConnectionState.Disconnected);
      setSessions([]);
      setError(null);
      return;
    }

    const prevConnection = connectionRef.current;

    if (prevConnection) {
      prevConnection.stop().catch(() => {});
    }

    const startConnection = async () => {
      const connection = setupConnection();
      if (!connection) return;
      
      connectionRef.current = connection;
      setConnectionState(ConnectionState.Connecting);
      
      try {
        await connection.start();
        setConnectionState(ConnectionState.Connected);
        setError(null);
        
        // Fetch sessions after successful connection
        if (!dataFetched) {
          await fetchSessions();
        }
      } catch (err) {
        setConnectionState(ConnectionState.Disconnected);
        const errorMessage = err instanceof Error ? err.message : 'Connection failed';
        setError(errorMessage);
      }
    };

    startConnection();

    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop().catch(() => {});
      }
    };
  }, [accessToken, setupConnection, fetchSessions]);

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
    setCurrentSession,
    setError,
    setMessages,
  };
} 