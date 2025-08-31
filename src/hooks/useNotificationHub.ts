import { useState, useEffect, useCallback, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuths } from './useAuthState';
import { NotificationItem } from '../interfaces/INotification';
import { SIGNALR_CONFIG, ConnectionState, signalRManager } from '../config/signalRConfig';
import { RefreshToken } from '../api/Account/AuthAPI';
import { getAuthState } from './useAuthState';

function coerceIsRead(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const v = value.toLowerCase().trim();
    return v === 'true' || v === '1' || v === 'yes';
  }
  return false;
}

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
  const pendingMarkAsReadRef = useRef<Set<number>>(new Set());

  // Production-ready auth-aware invoke with proper error handling
  const invokeWithAuthRetry = async (methodName: string, ...args: any[]) => {
      try {
        const conn = connectionRef.current;
        if (!conn) throw new Error('Connection not available');
        if (conn.state !== signalR.HubConnectionState.Connected) {
          throw new Error('Connection not in connected state');
        }
        return await conn.invoke(methodName, ...args);
      } catch (err: any) {
        const errorMsg = (err?.message || String(err)).toLowerCase();
        const isAuthError = errorMsg.includes('401') || 
                           errorMsg.includes('unauthorized') || 
                           errorMsg.includes('authentication') ||
                           errorMsg.includes('token');

        // If not an auth error or last attempt, throw immediately
        if (!isAuthError) {
          throw err;
        }
        try {
          const refreshed = await RefreshToken();
          if (!refreshed) {
            throw new Error('Token refresh failed');
          }
          // Get fresh connection with new token
          const latestToken = getAuthState().accessToken || '';
          const newConn = await signalRManager.getConnection(SIGNALR_CONFIG.NOTIFICATION_HUB_URL, latestToken);
          connectionRef.current = newConn;
          // Continue loop to retry with new connection
        } catch (refreshErr) {
          console.error('❌ Token refresh failed:', refreshErr);
          throw err; // Throw original error
        }
    }
  };
  // Add Notification
  const addNotification = useCallback((notification: NotificationItem) => {
    setNotifications((prev) => {
      const exists = prev.some((n) => n.id === notification.id);
      if (exists) {
        return prev;
      }
      return [notification, ...prev];
    });
  }, []);
  const fetchNotifications = useCallback(async () => {
    const connection = connectionRef.current;
    if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
      return;
    }
    setLoading(true);
    try {
      await invokeWithAuthRetry(SIGNALR_CONFIG.HUB_METHODS.GET_NOTIFICATIONS, { pageNumber: 1, pageSize: 100 });
      retryCountRef.current = 0; 
      return true; // in case to shut down the loop in the catch
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notifications';
      console.error('Failed to fetch notifications:', err);
      setError(errorMessage);
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
            fetchNotifications();
      }
    } finally {
      setLoading(false);
    }
  }, [loading, invokeWithAuthRetry]);

  //Mark ONE as read
  const markAsRead = async (notificationId: number) => {
    console.log("Reading 1 notification:",notificationId)
    if (!connectionRef.current) {
      throw new Error('Connection not available');
    }
    try {
      await invokeWithAuthRetry(SIGNALR_CONFIG.HUB_METHODS.MARK_AS_READ, notificationId)
      .catch((err) => {
        console.error(`Failed to mark notification ${notificationId} as read:`, err);
        setError(err);
        throw Error;
      });
    } catch (err) {
      console.error(`Failed to mark notification ${notificationId} as read:`, err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark as read';
      setError(errorMessage);
      throw err;
    }
  };
  // Mark aLL as read
  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.isRead);
    if (unreadNotifications.length === 0) {
      return;
    }
    unreadNotifications.forEach(n => pendingMarkAsReadRef.current.add(Number(n.id)));
    try {
      console.log("READING ALL NOTIFICATION")
      const batchSize = 5;
      for (let i = 0; i < unreadNotifications.length; i += batchSize) {
        const batch = unreadNotifications.slice(i, i + batchSize);
        await Promise.all(batch.map(async (notification) => {
          try {
            await invokeWithAuthRetry(SIGNALR_CONFIG.HUB_METHODS.MARK_AS_READ, notification.id);
          } catch (err) {
            console.error(`Failed to mark notification ${notification.id} as read:`, err);
            throw err;
          }
        }));
        if (i + batchSize < unreadNotifications.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      // Clear pending set after successful operation
      unreadNotifications.forEach(n => pendingMarkAsReadRef.current.delete(Number(n.id)));
      // Fetch fresh notifications from server to ensure UI reflects actual DB state
      // This is more reliable than waiting for server broadcasts
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      //setNotifications(originalNotifications);
      unreadNotifications.forEach(n => pendingMarkAsReadRef.current.delete(Number(n.id)));
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark all as read';
      setError(errorMessage);
      throw err;
    }
  };

  const setupEventListeners = useCallback((connection: signalR.HubConnection) => {
    if (!connection) return;

    connection.off(SIGNALR_CONFIG.HUB_METHODS.NOTIFICATION_RECEIVED);
    connection.off(SIGNALR_CONFIG.HUB_METHODS.NOTIFICATION_CREATED);
    connection.off(SIGNALR_CONFIG.HUB_METHODS.NOTIFICATION_READ);

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
        fetchedRef.current = false;
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

    const handleNotificationEvent = (eventName: string, data: any) => {
      if (!isUnmountedRef.current && data && typeof data === 'object') {
        if ('items' in data && Array.isArray(data.items)) {
          const mappedNotifications = data.items.map((item: any) => {
            const readFlag = item.isRead ?? item.IsRead ?? item.read ?? item.is_read;
            const serverIsRead = coerceIsRead(readFlag);
            const idNum = Number(item.id);
            const mergedIsRead = serverIsRead;
            return {
              id: idNum,
              title: item.title,
              content: item.content,
              link: item.link,
              isRead: mergedIsRead,
              createdAt: item.createdAt,
              type: item.type,
              userId: item.userId,
              notificationType: item.notificationType
            } as NotificationItem;
          });
        
          setNotifications(mappedNotifications);
        } else if ('id' in data) {
          const readFlag = data.isRead ?? data.IsRead ?? data.read ?? data.is_read;
          const serverIsRead = coerceIsRead(readFlag);
          const idNum = Number(data.id);
          const mergedIsRead = serverIsRead;
          const mappedNotification: NotificationItem = {
            id: idNum,
            title: data.title,
            content: data.content,
            link: data.link,
            isRead: mergedIsRead,
            createdAt: data.createdAt,
            type: data.type,
            userId: data.userId,
            notificationType: data.notificationType
          };
          addNotification(mappedNotification);
        }
      }
    };

    const handleNotificationRead = (notificationId: number) => {
      if (!isUnmountedRef.current) {
        // Remove from pending set
        pendingMarkAsReadRef.current.delete(notificationId);
        // Update state to reflect server confirmation. 
        //This is optimistic as best as we are using the Backend response to change the status, 
        // not the backend actual data
        console.log("This is notification before update to isRead", notifications)
          const newNotifications = notifications.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
         setNotifications(newNotifications)
        console.log("This is notification after update to isRead", notifications)
      }
    };
    connection.on(SIGNALR_CONFIG.HUB_METHODS.NOTIFICATION_RECEIVED, (data) => {
      handleNotificationEvent('NotificationReceived', data);
    });

    connection.on(SIGNALR_CONFIG.HUB_METHODS.NOTIFICATION_CREATED, (data) => {

      handleNotificationEvent('NotificationCreated', data);
    });

    connection.on(SIGNALR_CONFIG.HUB_METHODS.NOTIFICATION_READ, (notificationId: number) => {
      //console.log("SIGNALR_CONFIG.HUB_METHODS.NOTIFICATION_READ", notificationId)
      handleNotificationRead(notificationId);
    });
  }, [addNotification, fetchNotifications]);



  useEffect(() => {
    if (!connectionRef.current || connectionState !== ConnectionState.Connected) return;
    const healthCheckInterval = setInterval(() => {
      if (connectionRef.current && connectionRef.current.state === signalR.HubConnectionState.Connected) {
      } else {
        if (connectionRef.current) {
          connectionRef.current.stop().then(() => {
            if (!isUnmountedRef.current) {
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
    }, 30000);
    return () => clearInterval(healthCheckInterval);
  }, [connectionState, accessToken, setupEventListeners]);

  useEffect(() => {
    if (!connectionRef.current || connectionState !== ConnectionState.Connected) return;

    const autoRefreshInterval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(autoRefreshInterval);
  }, [connectionState, fetchNotifications]);

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
        const connection = await signalRManager.getConnection(SIGNALR_CONFIG.NOTIFICATION_HUB_URL, accessToken);
        connectionRef.current = connection;
        setConnectionState(ConnectionState.Connected);
        setError(null);
        setupEventListeners(connection);
        if (!fetchedRef.current) {
          await fetchNotifications();
          fetchedRef.current = true;
        }
      } catch (error) {
        console.error('🔔 Connection failed:', error);
        setConnectionState(ConnectionState.Disconnected);
        setError(error instanceof Error ? error.message : 'Connection failed');
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
        pendingMarkAsReadRef.current.clear();
      };
  }, [accessToken, setupEventListeners, fetchNotifications]);

  const refreshNotifications = async () => {
    fetchedRef.current = false;
    await fetchNotifications();
    // Keep locallyMarkedReadIdsRef to merge with any stale server payloads
  };

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