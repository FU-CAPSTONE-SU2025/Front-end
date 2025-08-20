import { useState, useEffect, useCallback, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuths } from './useAuthState';
import { NOTI_HUB_METHODS, NotificationItem } from '../interfaces/INotification';
import { SIGNALR_CONFIG, ConnectionState, signalRManager } from '../config/signalRConfig';

export function useNotificationHub() {
  const accessToken = useAuths((state) => state.accessToken);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected);
  const [error, setError] = useState<string | null>(null);
  
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const fetchedRef = useRef(false);
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  const isUnmountedRef = useRef(false);

  // Helper: tránh duplicate notification với performance optimization
  const addNotification = useCallback((notification: NotificationItem) => {
    setNotifications((prev) => {
      const exists = prev.some((n) => n.id === notification.id);
      if (exists) {
        return prev;
      }
      return [notification, ...prev];
    });
  }, []);

  // Fetch notifications với retry logic
  const fetchNotifications = useCallback(async () => {
    const connection = connectionRef.current;
    if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
      return;
    }

    // Prevent duplicate fetch calls
    if (loading) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Call GetNotifications method on backend hub
      await connection.invoke('GetNotifications', { pageNumber: 1, pageSize: 100 });
      retryCountRef.current = 0; 
      console.log('🔔 GetNotifications called successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notifications';
      console.error('🔔 Failed to fetch notifications:', err);
      setError(errorMessage);
      
      // Retry logic
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        setTimeout(() => {
          if (!isUnmountedRef.current) {
            fetchNotifications();
          }
        }, 1000 * retryCountRef.current); 
      }
    } finally {
      setLoading(false);
    }
  }, [loading]);

  // Mark as read với backend API call
  const markAsRead = useCallback(async (notificationId: number) => {
    const connection = connectionRef.current;
    if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
      const errorMsg = 'Connection not available';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    console.log(`🔄 Marking notification ${notificationId} as read...`);

    // Optimistic update
    const originalNotifications = [...notifications];
    setNotifications((prev) => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );

    try {
      await connection.invoke('MarkAsRead', notificationId);
      console.log(`✅ Successfully marked notification ${notificationId} as read`);
      setError(null);
    } catch (err) {
      console.error(`❌ Failed to mark notification ${notificationId} as read:`, err);
      // Rollback optimistic update
      setNotifications(originalNotifications);
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark as read';
      setError(errorMessage);
      throw err;
    }
  }, [notifications]);

  // Mark all as read bằng cách gọi MarkAsRead cho từng notification
  const markAllAsRead = useCallback(async () => {
    const connection = connectionRef.current;
    if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
      setError('Connection not available');
      throw new Error('Connection not available');
    }

    // Get unread notifications before update
    const unreadNotifications = notifications.filter(n => !n.isRead);
    if (unreadNotifications.length === 0) {
      console.log('ℹ️ No unread notifications to mark');
      return; // Nothing to mark
    }

    console.log(`🔄 Marking all ${unreadNotifications.length} notifications as read using MarkAsRead...`);
    console.log('Unread notification IDs:', unreadNotifications.map(n => n.id));

    // Optimistic update
    const originalNotifications = [...notifications];
    setNotifications((prev) => 
      prev.map(n => ({ ...n, isRead: true }))
    );

    try {
      // Mark each notification as read using MarkAsRead method
      const batchSize = 5; // Process in small batches to avoid overwhelming server
      for (let i = 0; i < unreadNotifications.length; i += batchSize) {
        const batch = unreadNotifications.slice(i, i + batchSize);
        
        // Process batch concurrently
        const promises = batch.map(async (notification) => {
          try {
            await connection.invoke('MarkAsRead', notification.id);
            console.log(`✅ Marked notification ${notification.id} as read`);
          } catch (err) {
            console.error(`❌ Failed to mark notification ${notification.id} as read:`, err);
            throw err;
          }
        });

        await Promise.all(promises);
        
        // Small delay between batches
        if (i + batchSize < unreadNotifications.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      console.log(`✅ Successfully marked all ${unreadNotifications.length} notifications as read`);
      setError(null);
    } catch (err) {
      console.error('❌ Failed to mark all notifications as read:', err);
      // Rollback optimistic update
      setNotifications(originalNotifications);
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark all as read';
      setError(errorMessage);
      throw err;
    }
  }, [notifications]);

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
        fetchedRef.current = false; // Refetch after reconnection
        
        // Re-setup event listeners after reconnection
        setTimeout(() => {
          if (!isUnmountedRef.current && connectionRef.current) {
            setupEventListeners(connectionRef.current);
          }
        }, 1000);
        
        fetchNotifications();
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

    // SINGLE CONSOLIDATED EVENT LISTENER for notifications
    const handleNotificationEvent = (eventName: string, data: any) => {
      
      if (!isUnmountedRef.current && data && typeof data === 'object') {
        // Handle PagedResult<NotificationItemResponse> from backend
        if ('items' in data && Array.isArray(data.items)) {
          console.log('📥 Received notifications from backend:', data.items.length);
          console.log('First few notifications isRead status:', data.items.slice(0, 3).map(item => ({ id: item.id, isRead: item.isRead, title: item.title?.substring(0, 30) })));
          
          const mappedNotifications = data.items.map((item: any) => ({
            id: item.id,
            title: item.title,
            content: item.content,
            link: item.link,
            isRead: item.isRead !== undefined ? item.isRead : false, // Use backend value if available
            createdAt: item.createdAt,
            type: item.type,
            userId: item.userId,
            notificationType: item.notificationType
          }));
          
          const unreadCount = mappedNotifications.filter(n => !n.isRead).length;
          console.log(`📊 Total notifications: ${mappedNotifications.length}, Unread: ${unreadCount}`);
          
          setNotifications(mappedNotifications);
        } 
        // Handle single notification
        else if ('id' in data) {
          const mappedNotification: NotificationItem = {
            id: data.id,
            title: data.title,
            content: data.content,
            link: data.link,
            isRead: false, // New notifications are unread
            createdAt: data.createdAt,
            type: data.type,
            userId: data.userId,
            notificationType: data.notificationType
          };
          addNotification(mappedNotification);
        }
      }
    };

    // Handle notification read status
    const handleNotificationRead = (notificationId: number) => {
      if (!isUnmountedRef.current) {
        setNotifications((prev) => {
          const updated = prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n);
          return updated;
        });
      }
    };

    // PRIMARY EVENT LISTENERS - using exact backend method names from NotificationSettings
    connection.on('NotificationReceivedMethod', (data) => {
      console.log('📨 NotificationReceivedMethod event received:', data);
      handleNotificationEvent('NotificationReceivedMethod', data);
    });

    connection.on('NotificationCreatedMethod', (data) => {
      console.log('📨 NotificationCreatedMethod event received:', data);
      handleNotificationEvent('NotificationCreatedMethod', data);
    });

    connection.on('NotificationReadMethod', (notificationId: number) => {
      console.log('📨 NotificationReadMethod event received for ID:', notificationId);
      handleNotificationRead(notificationId);
    });
  }, [addNotification, fetchNotifications]);

  // Get user ID from token for group subscription
  const getUserIdFromToken = useCallback(() => {
    if (!accessToken) return null;
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const userId = payload.userId || payload.user_id || payload.UserId || payload.USERID ||
                    payload.sub || payload.Sub || payload.SUB ||
                    payload.id || payload.Id || payload.ID;
      return userId ? parseInt(userId) : null;
    } catch (error) {
      console.error('🔔 Error parsing token:', error);
      return null;
    }
  }, [accessToken]);

  // Backend automatically handles group subscription in OnConnectedAsync
  // No need for manual group subscription

  // Add periodic connection health check
  useEffect(() => {
    if (!connectionRef.current || connectionState !== ConnectionState.Connected) return;

    const healthCheckInterval = setInterval(() => {
      if (connectionRef.current && connectionRef.current.state === signalR.HubConnectionState.Connected) {
      } else {
        // Trigger reconnection
        if (connectionRef.current) {
          connectionRef.current.stop().then(() => {
            if (!isUnmountedRef.current) {
              // Restart connection
              const startConnection = async () => {
                try {
                  const connection = await signalRManager.getConnection(SIGNALR_CONFIG.NOTIFICATION_HUB_URL, accessToken);
                  connectionRef.current = connection;
                  setupEventListeners(connection);
                } catch (error) {
                  console.error('🔔 Failed to reconnect:', error);
                }
              };
              startConnection();
            }
          });
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(healthCheckInterval);
  }, [connectionState, accessToken, setupEventListeners]);

  // SINGLE CONSOLIDATED AUTO-REFRESH MECHANISM
  useEffect(() => {
    if (!connectionRef.current || connectionState !== ConnectionState.Connected) return;

    // Auto-refresh notifications every 30 seconds
    const autoRefreshInterval = setInterval(() => {
      fetchNotifications();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(autoRefreshInterval);
  }, [connectionState, fetchNotifications]);

  // Main effect với improved dependency management
  useEffect(() => {
    if (!accessToken) {
      setConnectionState(ConnectionState.Disconnected);
      setNotifications([]);
      setError(null);
      return;
    }

    isUnmountedRef.current = false;

    const startConnection = async () => {
      if (isUnmountedRef.current) return;

      try {
        // Use global SignalR manager to get connection
        const connection = await signalRManager.getConnection(SIGNALR_CONFIG.NOTIFICATION_HUB_URL, accessToken);
        connectionRef.current = connection;
        setConnectionState(ConnectionState.Connected);
        setError(null);
        
        // Setup event listeners on the existing connection
        setupEventListeners(connection);
        
        // Backend automatically handles group subscription in OnConnectedAsync
        // No need for manual group subscription
        
        // Fetch notifications after successful connection
        if (!fetchedRef.current) {
          await fetchNotifications();
          fetchedRef.current = true;
        }
        
      } catch (error) {
        console.error('🔔 Connection failed:', error);
        setConnectionState(ConnectionState.Disconnected);
        setError(error instanceof Error ? error.message : 'Connection failed');
        
        // Retry after delay
        if (retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          setTimeout(() => {
            if (!isUnmountedRef.current) {
              startConnection();
            }
          }, 2000 * retryCountRef.current);
        }
      }
    };

    startConnection();

    return () => {
      isUnmountedRef.current = true;
      connectionRef.current = null;
    };
  }, [accessToken, setupEventListeners, fetchNotifications]);

  // Test connection and events - REMOVED FOR PRODUCTION
  // const testConnection = useCallback(async () => {
  //   const connection = connectionRef.current;
  //   if (!connection) {
  //     return;
  //   }
  //   
  //   try {
  //     await connection.invoke(SIGNALR_CONFIG.HUB_METHODS.GET_NOTIFICATIONS, { pageNumber: 1, pageSize: 5 });
  //   } catch (error) {
  //     console.error('🔔 Fetch notifications test failed:', error);
  //   }
  // }, []);

  // Force refresh notifications - REMOVED FOR PRODUCTION
  // const forceRefreshNotifications = useCallback(async () => {
  //   fetchedRef.current = false;
  //   setNotifications([]); // Clear current notifications
  //   await fetchNotifications();
  // }, [fetchNotifications]);

  // Monitor notifications for changes - REMOVED FOR PRODUCTION
  // useEffect(() => {
  // }, [notifications]);

  // Refresh notifications manually
  const refreshNotifications = useCallback(async () => {
    fetchedRef.current = false;
    await fetchNotifications();
  }, [fetchNotifications]);

  // Computed values
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const isConnected = connectionState === ConnectionState.Connected;

  return {
    notifications,
    loading,
    error,
    connectionState,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
    retry: fetchNotifications,
  };
}