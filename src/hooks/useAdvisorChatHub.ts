import { useEffect, useRef, useState, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuths } from './useAuths';
import { initHumanChatSession, InitHumanChatSessionRequest, getSessionMessages } from '../api/student/AdvisorChatAPI';

const CHAT_HUB_URL = `${import.meta.env.VITE_API_AISEA_API_HUBURL}/advisoryChat1to1Hub`;
const CHAT_WITH_ADVISOR_URL = `${import.meta.env.VITE_API_AISEA_API_URL}/AdvisorySession1to1/human`;

// Chat message interface
export interface ChatMessage {
  id: number;
  content: string;
  senderId: number;
  senderName: string;
  timestamp: string;
  sessionId: number;
}

// Chat session interface
export interface ChatSession {
  id: number;
  title: string;
  staffId: number;
  staffName: string;
  studentId: number;
  studentName: string;
  lastMessage?: string;
  lastMessageTime?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  type?: 'BOT' | 'HUMAN';
  studentJoinAt?: string;
  staffJoinAt?: string;
}

// Paged result interface to match backend
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

// Pagination request interface
export interface PaginationRequest {
  pageNumber: number;
  pageSize: number;
}

// Connection states
enum ConnectionState {
  Disconnected = 'Disconnected',
  Connecting = 'Connecting',
  Connected = 'Connected',
  Reconnecting = 'Reconnecting',
}

export function useAdvisorChatHub() {
  const accessToken = useAuths((state) => state.accessToken);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected);
  const [error, setError] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [availableAdvisors, setAvailableAdvisors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [messagesLoadedViaAPI, setMessagesLoadedViaAPI] = useState(false);
  
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // Setup connection
  const setupConnection = useCallback(() => {
    if (!accessToken) {
      return null;
    }

    const newConnection = new signalR.HubConnectionBuilder()
    .withUrl(CHAT_HUB_URL, {
      accessTokenFactory: () => accessToken,
      transport: signalR.HttpTransportType.WebSockets 
    })
    .withAutomaticReconnect([0, 2000, 10000, 30000])
    .configureLogging(signalR.LogLevel.Debug)
    .build();

    return newConnection;
  }, [accessToken]);

  // Initialize connection
  useEffect(() => {
    if (!accessToken) {
      setConnectionState(ConnectionState.Disconnected);
      setMessages([]);
      setSessions([]);
      setError(null);
      return;
    }

    let isUnmounted = false;
    let cleanupPromise: Promise<void> | null = null;
    const prevConnection = connectionRef.current;

    // Cleanup previous connection
    if (prevConnection) {
      cleanupPromise = prevConnection.stop().catch((err) => {
        console.error('Error stopping previous SignalR connection:', err);
      });
    }

    const startConnection = async () => {
      if (cleanupPromise) await cleanupPromise;
      if (isUnmounted) return;
      
      const newConnection = setupConnection();
      if (!newConnection) return;
      
      connectionRef.current = newConnection;
      setConnection(newConnection);
      setConnectionState(ConnectionState.Connecting);
      
      try {
        await newConnection.start();
        
        if (isUnmounted) {
          await newConnection.stop().catch(() => {});
          return;
        }
        
        setConnectionState(ConnectionState.Connected);
        setError(null);
        retryCountRef.current = 0;
        
        // Setup event handlers after successful connection
        newConnection.on('SendADVSSMethod', (message: ChatMessage) => {
          console.log('Received message:', message);
          setMessages((prev) => {
            // Only add message if it belongs to the current session and doesn't already exist
            if (message.sessionId === currentSessionId && !prev.find(m => m.id === message.id)) {
              return [...prev, message];
            }
            return prev;
          });
          
          // Update session's last message
          setSessions((prev) => 
            prev.map(session => 
              session.id === message.sessionId 
                ? { ...session, lastMessage: message.content, lastMessageTime: message.timestamp }
                : session
            )
          );
        });

        newConnection.on('JoinSSMethod', (messageData: PagedResult<ChatMessage> | ChatMessage[]) => {
          console.log('Joined session, received messages:', messageData);
          const messages = Array.isArray(messageData) ? messageData : messageData.items || [];
          setMessages(messages);
        });

        newConnection.on('LoadMoreMessagesMethod', (messageData: PagedResult<ChatMessage> | ChatMessage[]) => {
          console.log('Loaded more messages:', messageData);
          const newMessages = Array.isArray(messageData) ? messageData : messageData.items || [];
          setMessages((prev) => [
            ...newMessages.filter(m => m.sessionId === currentSessionId),
            ...prev
          ]);
        });

        // Session list events
        newConnection.on('GetSessionsHUBMethod', (sessionData: PagedResult<ChatSession> | ChatSession[]) => {
          console.log('Received sessions:', sessionData);
          const sessions = Array.isArray(sessionData) ? sessionData : sessionData.items || [];
          setSessions(sessions);
        });

        newConnection.on('SessionCreatedMethod', (newSession: ChatSession) => {
          console.log('New session created:', newSession);
          setSessions((prev) => [newSession, ...prev]);
        });

        newConnection.on('SessionUpdatedMethod', (updatedSession: ChatSession) => {
          console.log('Session updated:', updatedSession);
          setSessions((prev) => 
            prev.map(session => 
              session.id === updatedSession.id ? updatedSession : session
            )
          );
        });

        // Advisor list events
        newConnection.on('GetAvailableAdvisorsMethod', (advisorsList: any[]) => {
          console.log('Received available advisors:', advisorsList);
          setAvailableAdvisors(advisorsList || []);
        });

        newConnection.on('GetAdvisorsMethod', (advisorsList: any[]) => {
          console.log('Received advisors:', advisorsList);
          setAvailableAdvisors(advisorsList || []);
        });

        newConnection.on('ListAvailableAdvisorsMethod', (advisorsList: any[]) => {
          console.log('Received available advisors list:', advisorsList);
          setAvailableAdvisors(advisorsList || []);
        });
        
      } catch (err) {
        setConnectionState(ConnectionState.Disconnected);
        const errorMessage = err instanceof Error ? err.message : 'Connection failed';
        setError(errorMessage);
        
        // Retry logic
        if (!isUnmounted && retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          setTimeout(() => {
            if (!isUnmounted) startConnection();
          }, 2000 * retryCountRef.current);
        }
      }
    };

    startConnection();

    return () => {
      isUnmounted = true;
      const conn = connectionRef.current;
      if (conn) {
        // Remove event handlers before stopping
        conn.off('SendADVSSMethod');
        conn.off('JoinSSMethod');
        conn.off('GetSessionsHUBMethod');
        conn.off('LoadMoreMessagesMethod');
        conn.off('SessionCreatedMethod');
        conn.off('SessionUpdatedMethod');
        conn.off('GetAvailableAdvisorsMethod');
        conn.off('GetAdvisorsMethod');
        conn.off('ListAvailableAdvisorsMethod');
        
        conn.stop().catch(() => {});
        connectionRef.current = null;
      }
    };
  }, [accessToken, setupConnection, currentSessionId]);

  // Join session with API message loading
  const joinSession = useCallback(async (sessionId: number) => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) {
      setError('Connection not available');
      return false;
    }

    setLoading(true);
    setError(null);
    setMessagesLoadedViaAPI(false);
    try {
      console.log('Joining session:', sessionId);
      setCurrentSessionId(sessionId);
      setMessages([]); // Clear previous messages before joining new session
      
      // First, load message history via API
      try {
        console.log('Loading message history via API for session:', sessionId);
        const messageHistory = await getSessionMessages(sessionId, 1, 50); // Load last 50 messages
        if (messageHistory && messageHistory.items) {
          console.log('Loaded message history via API:', messageHistory.items);
          setMessages(messageHistory.items);
          setMessagesLoadedViaAPI(true);
        }
      } catch (apiError) {
        console.warn('Failed to load message history via API, falling back to SignalR:', apiError);
        // If API fails, fall back to SignalR
        await conn.invoke('JoinSession', sessionId);
      }
      
      // Then join SignalR session for real-time updates
      await conn.invoke('JoinSession', sessionId);
      return true;
    } catch (err) {
      console.error('Failed to join session:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to join session';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Send message via SignalR (for real-time communication)
  const sendMessage = useCallback(async (content: string) => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) {
      setError('Connection not available');
      return false;
    }

    if (!currentSessionId) {
      setError('No active session');
      return false;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Sending message to session:', currentSessionId, 'Content:', content);
      await conn.invoke('SendMessage', currentSessionId, content);
      return true;
    } catch (err) {
      console.error('Failed to send message:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentSessionId]);

  // List all sessions
  const listSessions = useCallback(async () => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) {
      setError('Connection not available');
      return false;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Invoking ListAllSessionByStudent...');
      await conn.invoke('ListAllSessionByStudent');
      return true;
    } catch (err) {
      console.error('Failed to list sessions:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to list sessions';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Leave current session
  const leaveSession = useCallback(() => {
    setCurrentSessionId(null);
    setMessages([]);
  }, []);

  // Load more messages for pagination
  const loadMoreMessages = useCallback(async (pageNumber: number = 1, pageSize: number = 10) => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) {
      setError('Connection not available');
      return false;
    }

    if (!currentSessionId) {
      setError('No active session');
      return false;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Try API first for better performance
      try {
        console.log('Loading more messages via API for session:', currentSessionId);
        const messageHistory = await getSessionMessages(currentSessionId, pageNumber, pageSize);
        if (messageHistory && messageHistory.items) {
          console.log('Loaded more messages via API:', messageHistory.items);
          setMessages((prev) => [
            ...messageHistory.items,
            ...prev
          ]);
          return true;
        }
      } catch (apiError) {
        console.warn('Failed to load more messages via API, falling back to SignalR:', apiError);
        // If API fails, fall back to SignalR
        await conn.invoke('LoadMoreMessages', currentSessionId, { pageNumber, pageSize });
      }
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load more messages';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentSessionId]);

  // Load more messages via API only (for manual refresh)
  const refreshMessages = useCallback(async () => {
    if (!currentSessionId) {
      setError('No active session');
      return false;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Refreshing messages via API for session:', currentSessionId);
      const messageHistory = await getSessionMessages(currentSessionId, 1, 100); // Load last 100 messages
      if (messageHistory && messageHistory.items) {
        console.log('Refreshed messages via API:', messageHistory.items);
        setMessages(messageHistory.items);
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh messages';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentSessionId]);

  // Load more sessions for pagination
  const loadMoreSessions = useCallback(async (pageNumber: number = 1, pageSize: number = 10) => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) {
      setError('Connection not available');
      return false;
    }

    setLoading(true);
    setError(null);
    
    try {
      await conn.invoke('LoadMoreSessions', { pageNumber, pageSize });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load more sessions';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get available advisors list
  const getAvailableAdvisors = useCallback(async () => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) {
      setError('Connection not available');
      return false;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Try different possible method names
      try {
        await conn.invoke('GetAvailableAdvisors');
      } catch (err) {
        // If first method fails, try alternative names
        try {
          await conn.invoke('GetAdvisors');
        } catch (err2) {
          try {
            await conn.invoke('ListAvailableAdvisors');
          } catch (err3) {
            // If all methods fail, set empty array and don't show error
            setAvailableAdvisors([]);
            return true;
          }
        }
      }
      return true;
    } catch (err) {
      // Don't show error for advisor list, just set empty array
      setAvailableAdvisors([]);
      return true;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new human chat session
  const createHumanSession = useCallback(async (message: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const request: InitHumanChatSessionRequest = { message };
      const response = await initHumanChatSession(request);
      
      // Add the new session to the list
      const newSession: ChatSession = {
        ...response.hubResponse,
        isActive: true,
        lastMessage: message,
        lastMessageTime: new Date().toISOString()
      };
      setSessions(prev => [newSession, ...prev]);
      
      // Join the new session automatically
      if (response.hubResponse.id) {
        await joinSession(response.hubResponse.id);
      }
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create session';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [joinSession]);

  return {
    // State
    connection,
    connectionState,
    error,
    currentSessionId,
    messages,
    sessions,
    availableAdvisors,
    loading,
    isConnected: connectionState === ConnectionState.Connected,
    setMessages, // Export setMessages for optimistic updates if needed
    messagesLoadedViaAPI, // Export this flag
    
    // Methods
    joinSession,
    sendMessage,
    listSessions,
    leaveSession,
    loadMoreMessages,
    loadMoreSessions,
    createHumanSession,
    getAvailableAdvisors,
    refreshMessages, // Add refresh function
    
    // Utility
    retry: () => {
      const conn = connectionRef.current;
      if (conn) {
        conn.stop().then(() => {
          setTimeout(() => {
            conn.start().catch(console.error);
          }, 1000);
        });
      }
    },
  };
}