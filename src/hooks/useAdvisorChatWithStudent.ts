import { useState, useEffect, useCallback, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuths } from './useAuths';
import { SIGNALR_CONFIG, ConnectionState } from '../config/signalRConfig';
import { StudentSession, ChatMessage, PagedResult } from '../interfaces/IChat';

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
  
  const [lastFetchType, setLastFetchType] = useState<'assigned' | 'unassigned' | 'all_assigned' | null>(null);
  const [dataFetched, setDataFetched] = useState(false);
  
  // Pagination state
  const [assignedPageNumber, setAssignedPageNumber] = useState(1);
  const [unassignedPageNumber, setUnassignedPageNumber] = useState(1);
  const [allAssignedPageNumber, setAllAssignedPageNumber] = useState(1);
  const [hasMoreAssigned, setHasMoreAssigned] = useState(true);

  
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const retryCountRef = useRef(0);
  const isUnmountedRef = useRef(false);
  
  const accessToken = useAuths((state) => state.accessToken);

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

  // Fetch assigned sessions from server
  const fetchAssignedSessions = useCallback(async (pageNumber: number = 1, append: boolean = false) => {
    // Skip if data already fetched and not appending
    if (dataFetched && !append && pageNumber === 1) {
      return;
    }
    
    if (!connectionRef.current) {
      setError('Connection not available');
      return;
    }
    
    if (connectionRef.current.state !== signalR.HubConnectionState.Connected) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    try {
      setLoading(true);
      setLastFetchType('assigned');
      
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          if (connectionRef.current.state !== signalR.HubConnectionState.Connected) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            retryCount++;
            continue;
          }
          
          await connectionRef.current.invoke(SIGNALR_CONFIG.HUB_METHODS.LIST_SESSIONS_BY_STAFF, { 
            pageNumber: pageNumber, 
            pageSize: SIGNALR_CONFIG.MESSAGES.DEFAULT_PAGE_SIZE 
          });
          
          return;
        } catch (err) {
          retryCount++;
          
          if (retryCount >= maxRetries) {
            try {
              await connectionRef.current.invoke(SIGNALR_CONFIG.HUB_METHODS.LIST_OPENED_SESSIONS, { 
                pageNumber: pageNumber, 
                pageSize: SIGNALR_CONFIG.MESSAGES.DEFAULT_PAGE_SIZE 
              });
              return;
            } catch (fallbackErr) {
              throw new Error(`Backend error: ${err instanceof Error ? err.message : 'Unknown error'}. Fallback also failed: ${fallbackErr instanceof Error ? fallbackErr.message : 'Unknown error'}`);
            }
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
      
    } catch (err) {
      setError(`Failed to fetch assigned sessions: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch unassigned sessions from server
  const fetchUnassignedSessions = useCallback(async (pageNumber: number = 1, append: boolean = false) => {
    // Skip if data already fetched and not appending
    if (dataFetched && !append && pageNumber === 1) {
      return;
    }
    
    if (!connectionRef.current) {
      setError('Connection not available');
      return;
    }
    
    if (connectionRef.current.state !== signalR.HubConnectionState.Connected) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    try {
      setLoading(true);
      setLastFetchType('unassigned');
      
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          if (connectionRef.current.state !== signalR.HubConnectionState.Connected) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            retryCount++;
            continue;
          }
          
          await connectionRef.current.invoke(SIGNALR_CONFIG.HUB_METHODS.LIST_OPENED_SESSIONS, { 
            pageNumber: pageNumber, 
            pageSize: SIGNALR_CONFIG.MESSAGES.DEFAULT_PAGE_SIZE 
          });
          
          return;
        } catch (err) {
          retryCount++;
          
          if (retryCount >= maxRetries) {
            try {
              await connectionRef.current.invoke(SIGNALR_CONFIG.HUB_METHODS.LIST_SESSIONS_BY_STAFF, { 
                pageNumber: pageNumber, 
                pageSize: SIGNALR_CONFIG.MESSAGES.DEFAULT_PAGE_SIZE 
              });
              return;
            } catch (fallbackErr) {
              throw new Error(`Backend error: ${err instanceof Error ? err.message : 'Unknown error'}. Fallback also failed: ${fallbackErr instanceof Error ? fallbackErr.message : 'Unknown error'}`);
            }
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
      
    } catch (err) {
      setError(`Failed to fetch unassigned sessions: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [dataFetched]);

  // Fetch all assigned sessions from server
  const fetchAllAssignedSessions = useCallback(async (pageNumber: number = 1, append: boolean = false) => {
    // Skip if data already fetched and not appending
    if (dataFetched && !append && pageNumber === 1) {
      return;
    }
    
    if (!connectionRef.current) {
      setError('Connection not available');
      return;
    }
    
    if (connectionRef.current.state !== signalR.HubConnectionState.Connected) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    try {
      setLoading(true);
      setLastFetchType('all_assigned');
      
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          if (connectionRef.current.state !== signalR.HubConnectionState.Connected) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            retryCount++;
            continue;
          }
          
          await connectionRef.current.invoke(SIGNALR_CONFIG.HUB_METHODS.LIST_ALL_ASSIGNED_SESSIONS, { 
            pageNumber: pageNumber, 
            pageSize: SIGNALR_CONFIG.MESSAGES.DEFAULT_PAGE_SIZE 
          });
          
          return;
        } catch (err) {
          retryCount++;
          
          if (retryCount >= maxRetries) {
            try {
              await connectionRef.current.invoke(SIGNALR_CONFIG.HUB_METHODS.LIST_SESSIONS_BY_STAFF, { 
                pageNumber: pageNumber, 
                pageSize: SIGNALR_CONFIG.MESSAGES.DEFAULT_PAGE_SIZE 
              });
              return;
            } catch (fallbackErr) {
              throw new Error(`Backend error: ${err instanceof Error ? err.message : 'Unknown error'}. Fallback also failed: ${fallbackErr instanceof Error ? fallbackErr.message : 'Unknown error'}`);
            }
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
      
    } catch (err) {
      setError(`Failed to fetch all assigned sessions: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [dataFetched]);

  // Setup connection
  const setupConnection = useCallback(() => {
    if (!accessToken) return null;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(SIGNALR_CONFIG.ADVISORY_CHAT_HUB_URL, { 
        accessTokenFactory: () => accessToken,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect(SIGNALR_CONFIG.CONNECTION.RETRY_INTERVALS)
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    // Connection state handlers
    connection.onreconnecting(() => {
      setConnectionState(ConnectionState.Reconnecting);
      setError(null);
    });

    connection.onreconnected(() => {
      setConnectionState(ConnectionState.Connected);
      setError(null);
      retryCountRef.current = 0;
    });

    connection.onclose((error) => {
      setConnectionState(ConnectionState.Disconnected);
      if (error) {
        setError(error.message);
      }
    });

    // Event listeners for advisor chat - using exact backend method names
    connection.on(SIGNALR_CONFIG.HUB_METHODS.GET_SESSIONS_METHOD, (data: PagedResult<StudentSession>) => {
      if (!data || !data.items || !Array.isArray(data.items)) {
        setSessions([]);
        setUnassignedSessions([]);
        return;
      }
        
      // Handle data based on last fetch type
      if (lastFetchType === 'assigned') {
        setSessions(data.items);
        setDataFetched(true);
      } else if (lastFetchType === 'unassigned') {
        setUnassignedSessions(data.items);
        setDataFetched(true);
      } else if (lastFetchType === 'all_assigned') {
        setAllAssignedSessions(data.items);
        setDataFetched(true);
      } else {
        // If no lastFetchType, process all sessions
        const currentAdvisorId = getProfileIdFromToken();
        const assignedSessions = data.items.filter(session => 
          session && session.staffId && session.staffId === currentAdvisorId
        );
        const unassignedSessions = data.items.filter(session => 
          session && session.staffId === 4
        );
        
        setSessions(assignedSessions);
        setUnassignedSessions(unassignedSessions);
        setDataFetched(true);
      }
      
      // Handle LoadMoreSessions response (append to existing sessions)
      if (data.totalCount > 0 && data.items.length > 0) {
        if (data.pageNumber > 1) {
          if (lastFetchType === 'assigned') {
            setSessions(prev => {
              const existingIds = new Set(prev.map(s => s.id));
              const newSessions = data.items.filter(s => !existingIds.has(s.id));
              return [...prev, ...newSessions];
            });
            setHasMoreAssigned(data.items.length === 10);
          } else if (lastFetchType === 'unassigned') {
            setUnassignedSessions(prev => {
              const existingIds = new Set(prev.map(s => s.id));
              const newSessions = data.items.filter(s => !existingIds.has(s.id));
              return [...prev, ...newSessions];
            });
          } else if (lastFetchType === 'all_assigned') {
            setAllAssignedSessions(prev => {
              const existingIds = new Set(prev.map(s => s.id));
              const newSessions = data.items.filter(s => !existingIds.has(s.id));
              return [...prev, ...newSessions];
            });
          } else {
            // Fallback: try to filter based on staffId
            const currentAdvisorId = getProfileIdFromToken();
            const assignedSessions = data.items.filter(session => 
              session && session.staffId && session.staffId === currentAdvisorId
            );
            const unassignedSessions = data.items.filter(session => 
              session && session.staffId === 4
            );
            
            if (assignedSessions.length > 0) {
              setSessions(prev => {
                const existingIds = new Set(prev.map(s => s.id));
                const newSessions = assignedSessions.filter(s => !existingIds.has(s.id));
                return [...prev, ...newSessions];
              });
              setHasMoreAssigned(data.items.length === 10);
            }
            
            if (unassignedSessions.length > 0) {
              setUnassignedSessions(prev => {
                const existingIds = new Set(prev.map(s => s.id));
                const newSessions = unassignedSessions.filter(s => !existingIds.has(s.id));
                return [...prev, ...newSessions];
              });
            }
          }
        }
      }
    });

    // Real-time session update events - using exact backend method names
    connection.on(SIGNALR_CONFIG.HUB_METHODS.ADD_SESSION_AS_ASSIGNED, (session: StudentSession) => {
      setSessions(prev => {
        const existingSession = prev.find(s => s.id === session.id);
        if (existingSession) {
          return prev.map(s => s.id === session.id ? session : s);
        } else {
          return [...prev, session];
        }
      });
      setAllAssignedSessions(prev => {
        const existingSession = prev.find(s => s.id === session.id);
        if (existingSession) {
          return prev.map(s => s.id === session.id ? session : s);
        } else {
          return [...prev, session];
        }
      });
    });

    connection.on(SIGNALR_CONFIG.HUB_METHODS.REMOVE_SESSION_FROM_UNASSIGNED, (session: StudentSession) => {
      setUnassignedSessions(prev => prev.filter(s => s.id !== session.id));
    });

    connection.on(SIGNALR_CONFIG.HUB_METHODS.SESSION_CREATED, (session: StudentSession) => {
      if (session.staffId === 4) {
        setUnassignedSessions(prev => [...prev, session]);
      } else {
        setSessions(prev => [...prev, session]);
        setAllAssignedSessions(prev => [...prev, session]);
      }
    });

    connection.on(SIGNALR_CONFIG.HUB_METHODS.SESSION_DELETED, (sessionId: number) => {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      setUnassignedSessions(prev => prev.filter(s => s.id !== sessionId));
      setAllAssignedSessions(prev => prev.filter(s => s.id !== sessionId));
    });

    // Main message listener for real-time messages - using exact backend method name
    connection.on(SIGNALR_CONFIG.HUB_METHODS.SEND_ADVSS_METHOD, (message: ChatMessage) => {
      if (!message || !message.content || !message.id) {
        return;
      }
      
      // Set advisorId if not set - important for staff to identify themselves
      if (message.senderId !== 999 && advisorId === null) {
        const profileId = getProfileIdFromToken();
        if (profileId) {
          setAdvisorId(profileId);
        } else {
          setAdvisorId(message.senderId);
        }
      }
      
      // Add message to current session if it matches
      const currentSessionId = currentSession?.id;
      if (currentSessionId && message.advisorySession1to1Id === currentSessionId) {
        setMessages(prev => {
          const exists = prev.some(m => m.id === message.id);
          if (!exists) {
            // Filter out duplicate messages from AI (senderId 999)
            const filteredPrev = prev.filter(m => m.senderId !== 999 || m.content !== message.content);
            return [...filteredPrev, message];
          }
          return prev;
        });
      }
    });

    // Join session method - loads message history
    connection.on(SIGNALR_CONFIG.HUB_METHODS.JOIN_SS_METHOD, (sessionMessages: PagedResult<ChatMessage>) => {
      if (!sessionMessages || !sessionMessages.items || !Array.isArray(sessionMessages.items)) {
        setMessages([]);
        return;
      }
      
      // Clear messages first, then set new ones to avoid duplicates
      setMessages([]);
      setTimeout(() => {
        setMessages(sessionMessages.items);
      }, 100);
    });

    // Alternative method names that backend might send for join session
    connection.on('JoinSSMethod', (sessionMessages: PagedResult<ChatMessage>) => {
      if (!sessionMessages || !sessionMessages.items || !Array.isArray(sessionMessages.items)) {
        setMessages([]);
        return;
      }
      setMessages(sessionMessages.items);
    });

    connection.on('joingradvss', (sessionMessages: PagedResult<ChatMessage>) => {
      if (!sessionMessages || !sessionMessages.items || !Array.isArray(sessionMessages.items)) {
        setMessages([]);
        return;
      }
      setMessages(sessionMessages.items);
    });

    // Load more messages for infinite scroll
    connection.on(SIGNALR_CONFIG.HUB_METHODS.LOAD_MORE_MESSAGES_METHOD, (data: PagedResult<ChatMessage>) => {
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

    // Alternative method names for loading messages
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

    connection.on('loadmoremessages', (data: PagedResult<ChatMessage>) => {
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

    return connection;
  }, [accessToken, lastFetchType, currentSession, advisorId, getProfileIdFromToken]);

  // Load more messages
  const loadMoreMessages = useCallback(async (sessionId: number, pageNumber: number = 1) => {
    if (!connectionRef.current || !currentSession) return;
    
    try {
      await connectionRef.current.invoke(SIGNALR_CONFIG.HUB_METHODS.LOAD_MORE_MESSAGES, sessionId, { 
        pageNumber, 
        pageSize: SIGNALR_CONFIG.MESSAGES.DEFAULT_PAGE_SIZE 
      });
    } catch (err) {
      setError(`Failed to load more messages: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [currentSession]);

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
    if (!connectionRef.current) {
      throw new Error('Connection not available');
    }
    
    try {
      const session = [...sessions, ...unassignedSessions].find(s => s.id === sessionId);
      
      if (session) {
        setCurrentSession(session);
        
        if (session.staffId === 4) {
          // Session is unassigned, backend will handle assignment
        } else {
          // Create temporary session for assigned sessions
          const tempSession: StudentSession = {
            id: sessionId,
            title: 'Loading...',
            staffId: 0,
            studentId: 0,
            type: '0',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setCurrentSession(tempSession);
        }
      } else {
        // Create temporary session for assigned sessions
        const tempSession: StudentSession = {
          id: sessionId,
          title: `Session ${sessionId}`,
          staffId: 0,
          studentId: 0,
          type: '0',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setCurrentSession(tempSession);
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
          
          // Join the session first
          await connectionRef.current.invoke(SIGNALR_CONFIG.HUB_METHODS.JOIN_SESSION, sessionId);
          
          // Wait a bit for the join response
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Load initial messages after joining
          await loadInitialMessages(sessionId);
          return;
        } catch (err) {
          retryCount++;
          
          if (retryCount >= maxRetries) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            if (errorMessage.includes('Forbidden') || errorMessage.includes('insufficient role permission')) {
              // Handle permission error for unassigned session
            }
            setError(`Failed to join session: ${errorMessage}`);
            setCurrentSession(null);
            setMessages([]);
            return;
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
    } catch (err) {
      setError(`Failed to join session: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setCurrentSession(null);
      setMessages([]);
    }
  }, [sessions, unassignedSessions, loadInitialMessages]);

  // Send message
  const sendMessage = useCallback(async (content: string) => {
    if (!connectionRef.current || !currentSession) {
      throw new Error('No active session');
    }
    
    if (connectionRef.current.state !== signalR.HubConnectionState.Connected) {
      throw new Error('Connection not ready. Please wait and try again.');
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
        
        await connectionRef.current.invoke(SIGNALR_CONFIG.HUB_METHODS.SEND_MESSAGE, currentSession.id, content);
        return;
      } catch (err) {
        retryCount++;
        
        if (retryCount >= maxRetries) {
          throw new Error('Failed to send message after all retries');
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
  }, [currentSession]);

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
      setLastFetchType('assigned');
      
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

  // Main effect for connection management
  useEffect(() => {
    if (!accessToken) {
      setConnectionState(ConnectionState.Disconnected);
      setSessions([]);
      setUnassignedSessions([]);
      setError(null);
      return;
    }

    isUnmountedRef.current = false;
    const prevConnection = connectionRef.current;

    if (prevConnection) {
      prevConnection.stop().catch(() => {});
    }

    const startConnection = async () => {
      if (isUnmountedRef.current) return;
      
      const connection = setupConnection();
      if (!connection) return;
      
      connectionRef.current = connection;
      setConnectionState(ConnectionState.Connecting);
      retryCountRef.current = 0;
      
      try {
        await connection.start();
        
        if (isUnmountedRef.current) {
          await connection.stop().catch(() => {});
          return;
        }
        
        setConnectionState(ConnectionState.Connected);
        setError(null);
      } catch (err) {
        setConnectionState(ConnectionState.Disconnected);
        const errorMessage = err instanceof Error ? err.message : 'Connection failed';
        setError(errorMessage);
        
        setTimeout(() => {
          if (!isUnmountedRef.current && retryCountRef.current < SIGNALR_CONFIG.CONNECTION.MAX_RETRIES) {
            retryCountRef.current++;
            startConnection();
          }
        }, SIGNALR_CONFIG.CONNECTION.RETRY_DELAY * retryCountRef.current);
      }
    };

    startConnection();

    return () => {
      isUnmountedRef.current = true;
      if (connectionRef.current) {
        connectionRef.current.stop().catch(() => {});
      }
    };
  }, [accessToken, setupConnection]);

  // Force refresh all data
  const refreshAllData = useCallback(() => {
    setDataFetched(false);
    // Only fetch what's needed based on current tab
    fetchUnassignedSessions(); // For Open Chat
    fetchAllAssignedSessions(); // For My Chat
  }, [fetchUnassignedSessions, fetchAllAssignedSessions]);

  return {
    connectionState,
    sessions,
    unassignedSessions,
    allAssignedSessions,
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
    fetchAssignedSessions,
    fetchUnassignedSessions,
    fetchAllAssignedSessions,
    refreshAllData,
    hasMoreAssigned,
  };
} 