import { useEffect, useRef, useState, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuths } from './useAuths';
import { initHumanChatSession, InitHumanChatSessionRequest } from '../api/student/AdvisorChatAPI';

const CHAT_HUB_URL = `${import.meta.env.VITE_API_AISEA_API_BASEURL}/advisoryChat1to1Hub`;

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
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
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
        
        // Setup event handlers after successful connection (like in demo)
        newConnection.on('SendADVSSMethod', (message: ChatMessage) => {
          console.log('Received message:', message);
          setMessages((prev) => [...prev, message]);
        });

        newConnection.on('JoinSSMethod', (messageData: PagedResult<ChatMessage> | ChatMessage[]) => {
          console.log('Joined session, received messages:', messageData);
          const messages = Array.isArray(messageData) ? messageData : messageData.items || [];
          setMessages(messages);
        });

        newConnection.on('GetSessionsHUBMethod', (sessionData: PagedResult<ChatSession> | ChatSession[]) => {
          console.log('Received sessions:', sessionData);
          if (Array.isArray(sessionData)) {
            setSessions(sessionData);
          } else {
            setSessions(sessionData.items || []);
          }
        });

        newConnection.on('LoadMoreMessagesMethod', (messageData: PagedResult<ChatMessage> | ChatMessage[]) => {
          console.log('Loaded more messages:', messageData);
          const newMessages = Array.isArray(messageData) ? messageData : messageData.items || [];
          setMessages((prev) => [...prev, ...newMessages]);
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
        conn.off('GetAvailableAdvisorsMethod');
        conn.off('GetAdvisorsMethod');
        conn.off('ListAvailableAdvisorsMethod');
        
        conn.stop().catch(() => {});
        connectionRef.current = null;
      }
    };
  }, [accessToken, setupConnection]);



  // Join session
  const joinSession = useCallback(async (sessionId: number) => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) {
      setError('Connection not available');
      return false;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Joining session:', sessionId);
      await conn.invoke('JoinSession', sessionId);
      setCurrentSessionId(sessionId);
      setMessages([]); // Clear previous messages
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

  // Send message
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
      await conn.invoke('LoadMoreMessages', currentSessionId, { pageNumber, pageSize });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load more messages';
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
    
    // Methods
    joinSession,
    sendMessage,
    listSessions,
    leaveSession,
    loadMoreMessages,
    loadMoreSessions,
    createHumanSession,
    getAvailableAdvisors,
    
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