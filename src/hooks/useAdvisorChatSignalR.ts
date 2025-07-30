import { useEffect, useRef, useState, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuths } from './useAuths';
import { debugLog } from '../utils/performanceOptimization';

export interface ChatMessage {
  id: number;
  content: string;
  senderId: number;
  senderName: string;
  timestamp: string;
  sessionId: number;
}

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

export function useAdvisorChatSignalR() {
  const accessToken = useAuths((state) => state.accessToken);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const currentSessionIdRef = useRef<number | null>(null);

  // Setup connection
  useEffect(() => {
    if (!accessToken) return;
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_API_AISEA_API_HUBURL}/advisoryChat1to1Hub`, {
        accessTokenFactory: () => accessToken,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Debug)
      .build();
    connectionRef.current = newConnection;
    setConnection(newConnection);
    newConnection.start()
      .then(() => debugLog('[SignalR] Connected to advisoryChat1to1Hub'))
      .catch((err) => {
        setError(err.message);
        debugLog('[SignalR] Connection error:', err);
      });
    return () => {
      newConnection.stop().catch(() => {});
      connectionRef.current = null;
    };
  }, [accessToken]);

  // Event handlers
  useEffect(() => {
    const conn = connectionRef.current;
    if (!conn) return;
    // Nhận danh sách session
    conn.on('GetSessionsHUBMethod', (sessionData: any) => {
      debugLog('[SignalR] GetSessionsHUBMethod:', sessionData);
      let sessionList: ChatSession[] = [];
      if (Array.isArray(sessionData)) sessionList = sessionData;
      else if (sessionData && sessionData.items) sessionList = sessionData.items;
      else if (sessionData && sessionData.data) sessionList = sessionData.data;
      else if (sessionData) sessionList = [sessionData];
      setSessions(sessionList);
    });
    // Nhận lịch sử tin nhắn khi join session
    conn.on('JoinGrAdvSS', (messageData: any) => {
      debugLog('[SignalR] JoinGrAdvSS (history):', messageData);
      let msgList: any[] = [];
      if (Array.isArray(messageData)) msgList = messageData;
      else if (messageData && messageData.items) msgList = messageData.items;
      else if (messageData && messageData.data) msgList = messageData.data;
      else if (messageData) msgList = [messageData];
      const mapped = msgList
        .filter(m => m.advisorySession1to1Id == currentSessionIdRef.current)
        .map(m => ({
          id: m.messageId?.toString() ?? m.id?.toString() ?? Math.random().toString(),
          senderId: m.senderId?.toString() ?? '',
          senderName: m.senderName ?? '',
          receiverId: m.receiverId?.toString() ?? '',
          content: m.content,
          timestamp: m.createdAt ? new Date(m.createdAt).toLocaleString() : '',
          isRead: m.isRead ?? true,
          messageType: m.messageType ?? 'text',
          sessionId: m.advisorySession1to1Id
        }));
      setMessages(mapped);
    });
    // Nhận thêm tin nhắn khi load more
    conn.on('LoadMoreMessagesMethod', (messageData: any) => {
      debugLog('[SignalR] LoadMoreMessagesMethod:', messageData);
      let msgList: any[] = [];
      if (Array.isArray(messageData)) msgList = messageData;
      else if (messageData && messageData.items) msgList = messageData.items;
      else if (messageData && messageData.data) msgList = messageData.data;
      else if (messageData) msgList = [messageData];
      const mapped = msgList
        .filter(m => m.advisorySession1to1Id == currentSessionIdRef.current)
        .map(m => ({
          id: m.messageId?.toString() ?? m.id?.toString() ?? Math.random().toString(),
          senderId: m.senderId?.toString() ?? '',
          senderName: m.senderName ?? '',
          receiverId: m.receiverId?.toString() ?? '',
          content: m.content,
          timestamp: m.createdAt ? new Date(m.createdAt).toLocaleString() : '',
          isRead: m.isRead ?? true,
          messageType: m.messageType ?? 'text',
          sessionId: m.advisorySession1to1Id
        }));
      setMessages((prev) => [...mapped, ...prev]);
    });
    // Nhận tin nhắn mới realtime
    conn.on('SendADVSSMethod', (message: any) => {
      debugLog('[SignalR] SendADVSSMethod (new message):', message);
      // Map về format UI nếu cần
      const mapped = {
        id: message.messageId?.toString() ?? message.id?.toString() ?? Math.random().toString(),
        senderId: message.senderId?.toString() ?? '',
        senderName: message.senderName ?? '',
        receiverId: message.receiverId?.toString() ?? '',
        content: message.content,
        timestamp: message.createdAt ? new Date(message.createdAt).toLocaleString() : '',
        isRead: message.isRead ?? true,
        messageType: message.messageType ?? 'text',
        sessionId: message.advisorySession1to1Id
      };
      if (mapped.sessionId === currentSessionIdRef.current) {
        setMessages((prev) => {
          if (!prev.find(m => m.id === mapped.id)) {
            return [...prev, mapped];
          }
          return prev;
        });
      }
      // Update last message in session list
      setSessions((prev) =>
        prev.map(session =>
          session.id === mapped.sessionId
            ? { ...session, lastMessage: mapped.content, lastMessageTime: mapped.timestamp }
            : session
        )
      );
    });
    // Nhận event tạo session mới
    conn.on('SessionCreated', (sessionData: any) => {
      debugLog('[SignalR] SessionCreated:', sessionData);
      // Có thể cần map lại nếu format khác
      setSessions((prev) => {
        // Nếu session đã có thì không thêm
        if (prev.find(s => s.id === sessionData.id)) return prev;
        return [...prev, sessionData];
      });
    });
    // Nhận event xóa session
    conn.on('SessionDeletedMethod', (sessionId: number) => {
      debugLog('[SignalR] SessionDeletedMethod:', sessionId);
      setSessions((prev) => prev.filter(s => s.id !== sessionId));
      // Nếu đang chat session này thì clear messages
      if (currentSessionIdRef.current === sessionId) {
        setMessages([]);
        setCurrentSessionId(null);
      }
    });
    return () => {
      conn.off('GetSessionsHUBMethod');
      conn.off('JoinGrAdvSS');
      conn.off('LoadMoreMessagesMethod');
      conn.off('SendADVSSMethod');
      conn.off('SessionCreated');
      conn.off('SessionDeletedMethod');
    };
  }, [connection]);

  // Lấy danh sách session
  const listSessions = useCallback(async () => {
    const conn = connectionRef.current;
    if (!conn) return;
    setLoading(true);
    setError(null);
    try {
      debugLog('[SignalR] Invoking ListAllSessionByStudent');
      await conn.invoke('ListAllSessionByStudent');
    } catch (err: any) {
      setError(err.message || 'Failed to list sessions');
      debugLog('[SignalR] ListAllSessionByStudent error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Join session và lấy lịch sử tin nhắn
  const joinSession = useCallback(async (sessionId: number) => {
    const conn = connectionRef.current;
    if (!conn) return;
    setLoading(true);
    setError(null);
    try {
      setCurrentSessionId(sessionId);
      currentSessionIdRef.current = sessionId;
      setMessages([]);
      debugLog('[SignalR] Invoking JoinSession:', sessionId);
      await conn.invoke('JoinSession', sessionId);
    } catch (err: any) {
      setError(err.message || 'Failed to join session');
      debugLog('[SignalR] JoinSession error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Gửi tin nhắn qua SignalR
  const sendMessage = useCallback(async (sessionId: number, message: string) => {
    const conn = connectionRef.current;
    if (!conn) return;
    setLoading(true);
    setError(null);
    try {
      debugLog('[SignalR] Invoking SendMessage:', { sessionId, message });
      await conn.invoke('SendMessage', sessionId, message);
      debugLog('[SignalR] SendMessage invoked successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      debugLog('[SignalR] SendMessage error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load thêm tin nhắn (phân trang)
  const loadMoreMessages = useCallback(async (sessionId: number, pageNumber: number = 1, pageSize: number = 10) => {
    const conn = connectionRef.current;
    if (!conn) return;
    setLoading(true);
    setError(null);
    try {
      await conn.invoke('LoadMoreMessages', sessionId, { pageNumber, pageSize });
    } catch (err: any) {
      setError(err.message || 'Failed to load more messages');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    sessions,
    messages,
    currentSessionId,
    loading,
    error,
    listSessions,
    joinSession,
    sendMessage,
    loadMoreMessages,
    setMessages,
  };
} 