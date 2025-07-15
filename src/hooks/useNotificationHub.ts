import { useEffect, useRef, useState, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuths } from './useAuths';
import { NOTI_HUB_METHODS, NotificationItem } from '../interfaces/INotification';

const NOTI_HUB_URL = `${import.meta.env.VITE_API_AISEA_API_HUBURL}/notificationHub`;


enum ConnectionState {
  Disconnected = 'Disconnected',
  Connecting = 'Connecting',
  Connected = 'Connected',
  Reconnecting = 'Reconnecting',
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

  // Helper: tránh duplicate notification với performance optimization
  const addNotification = useCallback((notification: NotificationItem) => {
    setNotifications((prev) => {
      const exists = prev.some((n) => n.id === notification.id);
      if (exists) return prev;
      return [notification, ...prev];
    });
  }, []);

  // Fetch notifications với retry logic
  const fetchNotifications = useCallback(async () => {
    const connection = connectionRef.current;
    if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await connection.invoke('GetNotifications', { pageNumber: 1, pageSize: 15 });
      retryCountRef.current = 0; 
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notifications';
      console.error('Failed to fetch notifications:', err);
      setError(errorMessage);
      
      // Retry logic
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        setTimeout(() => {
          fetchNotifications();
        }, 1000 * retryCountRef.current); 
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark as read với optimistic update
  const markAsRead = useCallback(async (notificationId: number) => {
    const connection = connectionRef.current;
    if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
      setError('Connection not available');
      return;
    }

    // Optimistic update
    const originalNotifications = notifications;
    setNotifications((prev) => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );

    try {
      await connection.invoke('MarkAsRead', notificationId);
      setError(null);
    } catch (err) {
      // Rollback optimistic update
      setNotifications(originalNotifications);
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark as read';
      console.error('Failed to mark as read:', err);
      setError(errorMessage);
    }
  }, [notifications]);

  // Setup connection với improved error handling
  const setupConnection = useCallback(() => {
    if (!accessToken) return null;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(NOTI_HUB_URL, { 
        accessTokenFactory: () => accessToken,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
      })
      .withAutomaticReconnect([0, 2000, 10000, 30000]) // Custom retry intervals
      .configureLogging(signalR.LogLevel.Warning) // Production logging
      .build();

    // Connection state handlers
    connection.onreconnecting(() => {
      setConnectionState(ConnectionState.Reconnecting);
      setError(null);
    });

    connection.onreconnected(() => {
      setConnectionState(ConnectionState.Connected);
      setError(null);
      fetchedRef.current = false; // Refetch after reconnection
      fetchNotifications();
    });

    connection.onclose((error) => {
      setConnectionState(ConnectionState.Disconnected);
      if (error) {
        setError(error.message);
        console.error('SignalR connection closed with error:', error);
      }
    });

    // Event listeners
    connection.on(NOTI_HUB_METHODS.RECEIVED, (data) => {
      if (data && typeof data === 'object') {
        if ('items' in data && Array.isArray(data.items)) {
          setNotifications(data.items);
        } else if ('id' in data) {
          addNotification(data as NotificationItem);
        }
      }
    });

    connection.on(NOTI_HUB_METHODS.CREATED, (notification) => {
      if (notification && typeof notification === 'object' && 'id' in notification) {
        addNotification(notification as NotificationItem);
      }
    });

    connection.on(NOTI_HUB_METHODS.READ, (notificationId: number) => {
      setNotifications((prev) => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
    });

    return connection;
  }, [accessToken, addNotification, fetchNotifications]);

  // Main effect với improved dependency management
  useEffect(() => {
    if (!accessToken) {
      setConnectionState(ConnectionState.Disconnected);
      setNotifications([]);
      setError(null);
      return;
    }

    let isUnmounted = false;
    let cleanupPromise: Promise<void> | null = null;
    const prevConnection = connectionRef.current;

    // Cleanup connection cũ nếu có
    if (prevConnection) {
      cleanupPromise = prevConnection.stop().catch((err) => {
        console.error('Error stopping previous SignalR connection:', err);
      });
    }

    const startConnection = async () => {
      if (cleanupPromise) await cleanupPromise;
      if (isUnmounted) return;
      const connection = setupConnection();
      if (!connection) return;
      connectionRef.current = connection;
      setConnectionState(ConnectionState.Connecting);
      fetchedRef.current = false;
      try {
        await connection.start();
        if (isUnmounted) {
          await connection.stop().catch(() => {});
          return;
        }
        setConnectionState(ConnectionState.Connected);
        setError(null);
        if (!fetchedRef.current) {
          fetchNotifications();
          fetchedRef.current = true;
        }
      } catch (err) {
        setConnectionState(ConnectionState.Disconnected);
        const errorMessage = err instanceof Error ? err.message : 'Connection failed';
        setError(errorMessage);
        console.error('SignalR connection failed:', err);
        // Retry sau 2s nếu negotiation fail
        if (!isUnmounted && errorMessage.includes('negotiation')) {
          setTimeout(() => {
            if (!isUnmounted) startConnection();
          }, 2000);
        }
      }
    };

    startConnection();

    return () => {
      isUnmounted = true;
      const conn = connectionRef.current;
      if (conn) {
        conn.stop().catch(() => {});
        connectionRef.current = null;
      }
    };
  }, [accessToken, setupConnection, fetchNotifications]);

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
    retry: fetchNotifications,
  };
}