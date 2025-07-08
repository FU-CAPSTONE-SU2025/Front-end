import { useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuths } from './useAuths';

// Lấy URL từ biến môi trường
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
  const [connectionStatus, setConnectionStatus] = useState<'Disconnected' | 'Connecting' | 'Connected'>('Disconnected');
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    setConnectionStatus('Connecting');
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(NOTI_HUB_URL, {
        accessTokenFactory: () => accessToken,
      })
      .withAutomaticReconnect()
      .build();
    connectionRef.current = connection;

    // Lắng nghe sự kiện NotificationCreatedMethod
    connection.on('NotificationCreatedMethod', (notification: NotificationItem) => {
      setNotifications((prev) => [notification, ...prev]);
    });
    // Lắng nghe sự kiện NotificationReceivedMethod (nếu cần)
    connection.on('NotificationReceivedMethod', (notification: NotificationItem) => {
      setNotifications((prev) => [notification, ...prev]);
    });
    // Lắng nghe sự kiện NotificationReadMethod (nếu cần cập nhật trạng thái đã đọc)
    connection.on('NotificationReadMethod', (notificationId: number) => {
      setNotifications((prev) => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
    });

    connection.start()
      .then(() => setConnectionStatus('Connected'))
      .catch(() => setConnectionStatus('Disconnected'));

    return () => {
      connection.stop();
      connection.off('NotificationCreatedMethod');
      connection.off('NotificationReceivedMethod');
      connection.off('NotificationReadMethod');
    };
  }, [accessToken]);

  return { notifications, connectionStatus };
} 