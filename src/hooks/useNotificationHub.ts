import { useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuths } from './useAuths';

const NOTI_HUB_URL = `${import.meta.env.VITE_API_AISEA_API_BASEURL}/notificationHub`;

export interface NotificationItem {
  id: number;
  title: string;
  content: string;
  link?: string;
  isRead: boolean;
  createdAt?: string;
}

export function useNotificationHub() {
  const accessToken = useAuths((state) => state.accessToken);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const fetchedRef = useRef(false);

  // Fetch tất cả thông báo (gọi từ hub)
  const fetchNotifications = async () => {
    if (!connectionRef.current || connectionRef.current.state !== signalR.HubConnectionState.Connected) return;
    setLoading(true);
    try {
      await connectionRef.current.invoke('GetNotifications', { pageNumber: 1, pageSize: 50 });
    } finally {
      setLoading(false);
    }
  };

  // Đánh dấu đã đọc
  const markAsRead = async (notificationId: number) => {
    if (!connectionRef.current || connectionRef.current.state !== signalR.HubConnectionState.Connected) return;
    try {
      await connectionRef.current.invoke('MarkAsRead', notificationId);
      setNotifications((prev) => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
    } catch {}
  };

  // Kết nối hub và lắng nghe sự kiện
  useEffect(() => {
    if (!accessToken) return;
    fetchedRef.current = false;
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(NOTI_HUB_URL, { accessTokenFactory: () => accessToken })
      .withAutomaticReconnect()
      .build();
    connectionRef.current = connection;

    // Nhận danh sách thông báo
    connection.on('NotificationReceivedMethod', (data) => {
      if (data && typeof data === 'object' && 'items' in data) {
        setNotifications(data.items || []);
      } else {
        setNotifications((prev) => [data, ...prev]);
      }
    });
    // Nhận thông báo mới
    connection.on('NotificationCreatedMethod', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });
    // Đánh dấu đã đọc
    connection.on('NotificationReadMethod', (notificationId) => {
      setNotifications((prev) => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
    });

    connection.start()
      .then(() => {
        if (!fetchedRef.current) {
          fetchNotifications();
          fetchedRef.current = true;
        }
      })
      .catch(() => {});

    return () => {
      connection.stop();
      connection.off('NotificationReceivedMethod');
      connection.off('NotificationCreatedMethod');
      connection.off('NotificationReadMethod');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  return {
    notifications,
    loading,
    markAsRead,
  };
} 