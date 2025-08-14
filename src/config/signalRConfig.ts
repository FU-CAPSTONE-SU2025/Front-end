import * as signalR from '@microsoft/signalr';

let ADVISORY_CHAT_HUB_URL:string
let NOTIFICATION_HUB_URL:string
if(import.meta.env.DEV){
    ADVISORY_CHAT_HUB_URL = `${import.meta.env.VITE_API_AISEA_API_HUBURL}/advisoryChat1to1Hub`
  NOTIFICATION_HUB_URL = `${import.meta.env.VITE_API_AISEA_API_HUBURL}/notificationHub`
}
else{
  ADVISORY_CHAT_HUB_URL = `${import.meta.env.VITE_API_AISEA_API_BASEURL}/advisoryChat1to1Hub`
  NOTIFICATION_HUB_URL = `${import.meta.env.VITE_API_AISEA_API_BASEURL}/notificationHub`
}
// SignalR Configuration for Advisory Chat
export const SIGNALR_CONFIG = {
  // Hub URLs - use environment variables for consistency
  ADVISORY_CHAT_HUB_URL: ADVISORY_CHAT_HUB_URL,
  NOTIFICATION_HUB_URL: NOTIFICATION_HUB_URL,
  
  // Hub method names from backend configuration - matching ChatSessionSettings
  HUB_METHODS: {
    // Advisory Chat Methods - exact names from backend
    SEND_MESSAGE: 'SendMessage',
    JOIN_SESSION: 'JoinSession',
    LIST_SESSIONS_BY_STAFF: 'ListAllSessionByStaff',
    LIST_OPENED_SESSIONS: 'ListOpenedSession',
    LIST_ALL_ASSIGNED_SESSIONS: 'ListAllAssignedSessions',
    LIST_ALL_SESSIONS_BY_STUDENT: 'ListAllSessionByStudent', 
    LOAD_MORE_MESSAGES: 'LoadMoreMessages',
    LOAD_MORE_SESSIONS: 'LoadMoreSessions',
    GET_SESSIONS_METHOD: 'GetSessionsHUBMethod',
    SEND_ADVSS_METHOD: 'SendADVSSMethod',
    JOIN_SS_METHOD: 'JoinGrAdvSS', // Updated to match backend
    SESSION_CREATED: 'SessionCreated', // Updated to match backend
    SESSION_DELETED: 'SessionDeletedMethod',
    ADD_SESSION_AS_ASSIGNED: 'AddSessionAsAssigned',
    REMOVE_SESSION_FROM_UNASSIGNED: 'RemoveSessionFromUnassigned',
    LOAD_MORE_MESSAGES_METHOD: 'LoadMoreMessagesMethod',
    ASSIGN_ADVISOR_TO_SESSION: 'AssignAdvisorToSession',
    
    
    GET_NOTIFICATIONS: 'GetNotifications',
    MARK_AS_READ: 'MarkAsRead',
    MARK_ALL_AS_READ: 'MarkAllAsRead',
    NOTIFICATION_RECEIVED: 'NotificationReceivedMethod',
    NOTIFICATION_CREATED: 'NotificationCreatedMethod',
    NOTIFICATION_READ: 'NotificationReadMethod',
  },
  

  CONNECTION: {
    RETRY_INTERVALS: [0, 2000, 5000, 10000, 30000], // Exponential backoff
    MAX_RETRIES: 5,
    RETRY_DELAY: 2000,
    NEGOTIATION_TIMEOUT: 30000, // 30 seconds
    CONNECTION_TIMEOUT: 60000, // 60 seconds
    KEEP_ALIVE_INTERVAL: 15000, // 15 seconds
    SERVER_TIMEOUT: 30000, // 30 seconds
  },
  

  SESSION: {
    CACHE_PREFIX: 'SenderAdviSession:',
    CACHE_EXPIRY_DAYS: 1,
    SESSION_EXPIRY_DAYS: 7,
    INTERVAL_MILLIS: 1800000,
  },
  

  NOTIFICATION: {
    INDIVIDUAL_USER_GROUP_PREFIX: 'IndividualUserGroup',
    EXPIRED_DAYS: 10,
    INTERVAL_MILLIS: 1800000,
  },
  

  GROUPS: {
    CHAT_PREFIX: 'GroupChatADVssPrefix',
    STAFF_PREFIX: 'MulDataSessionsPrefixStaff',
    STUDENT_PREFIX: 'MulDataSessionsPrefixStudent',
  },
  

  MESSAGES: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_LENGTH: 1000,
    TYPING_TIMEOUT: 3000,
  },
  

  UI: {
    CHAT_BOX_WIDTH: 320,
    CHAT_BOX_HEIGHT: 384,
    MESSAGE_ANIMATION_DURATION: 300,
    TYPING_INDICATOR_DELAY: 1000,
  },
  
 
  ERRORS: {
    CONNECTION_FAILED: 'Failed to connect to chat server',
    SEND_MESSAGE_FAILED: 'Failed to send message',
    JOIN_SESSION_FAILED: 'Failed to join session',
    LOAD_MESSAGES_FAILED: 'Failed to load messages',
    ASSIGN_ADVISOR_FAILED: 'Failed to assign advisor to session',
    PERMISSION_DENIED: 'You do not have permission to access this session',
    SESSION_NOT_FOUND: 'Session not found',
  },
  
  STATUS: {
    CONNECTING: 'Connecting...',
    CONNECTED: 'Connected',
    DISCONNECTED: 'Disconnected',
    RECONNECTING: 'Reconnecting...',
    LOADING: 'Loading...',
    SENDING: 'Sending...',
  },
};

export enum ConnectionState {
  Disconnected = 'Disconnected',
  Connecting = 'Connecting',
  Connected = 'Connected',
  Reconnecting = 'Reconnecting',
}

// Message types
export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system',
}

// Session types
export enum SessionType {
  HUMAN = 'HUMAN',
  BOT = 'BOT',
}

// User roles
export enum UserRole {
  STUDENT = 'STUDENT',
  ADVISOR = 'ADVISOR',
  STAFF = 'STAFF',
  ADMIN = 'ADMIN',
}

// Helper functions
export const getConnectionStatusColor = (state: ConnectionState): string => {
  switch (state) {
    case ConnectionState.Connected:
      return 'text-green-500';
    case ConnectionState.Connecting:
    case ConnectionState.Reconnecting:
      return 'text-yellow-500';
    case ConnectionState.Disconnected:
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
};

export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    return `${Math.floor(diffInHours * 60)}m ago`;
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`;
  } else {
    return date.toLocaleDateString();
  }
};

export const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const validateMessage = (content: string): boolean => {
  return content.trim().length > 0 && content.length <= SIGNALR_CONFIG.MESSAGES.MAX_LENGTH;
};

export const truncateMessage = (content: string, maxLength: number = 50): string => {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '...';
}; 

// Global SignalR Connection Manager for Production-like behavior
class SignalRConnectionManager {
  private static instance: SignalRConnectionManager;
  private connections: Map<string, signalR.HubConnection> = new Map();
  private connectionPromises: Map<string, Promise<void>> = new Map();
  private listeners: Map<string, Set<() => void>> = new Map();
  private isConnecting: Map<string, boolean> = new Map();

  private constructor() {}

  static getInstance(): SignalRConnectionManager {
    if (!SignalRConnectionManager.instance) {
      SignalRConnectionManager.instance = new SignalRConnectionManager();
    }
    return SignalRConnectionManager.instance;
  }

  async getConnection(hubUrl: string, accessToken: string): Promise<signalR.HubConnection> {
    const connectionKey = `${hubUrl}_${accessToken}`;
    
    // Return existing connection if available and connected
    const existingConnection = this.connections.get(connectionKey);
    if (existingConnection && existingConnection.state === signalR.HubConnectionState.Connected) {
      console.log('Using existing connection:', connectionKey);
      return existingConnection;
    }

    // Wait for existing connection promise
    const existingPromise = this.connectionPromises.get(connectionKey);
    if (existingPromise) {
      console.log('Waiting for existing connection promise:', connectionKey);
      await existingPromise;
      const connection = this.connections.get(connectionKey);
      if (connection && connection.state === signalR.HubConnectionState.Connected) {
        return connection;
      }
    }

    // Prevent multiple simultaneous connections
    if (this.isConnecting.get(connectionKey)) {
      console.log('Connection already in progress:', connectionKey);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return this.getConnection(hubUrl, accessToken);
    }

    this.isConnecting.set(connectionKey, true);
    console.log('Creating new connection:', connectionKey);

    try {
      const connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, { 
          accessTokenFactory: () => accessToken,
          transport: signalR.HttpTransportType.WebSockets
        })
        .withAutomaticReconnect(SIGNALR_CONFIG.CONNECTION.RETRY_INTERVALS)
        .configureLogging(signalR.LogLevel.Warning) // Reduce logging in production
        .build();

      // Setup connection event handlers
      connection.onreconnecting(() => {
        console.log('Connection reconnecting:', connectionKey);
        this.notifyListeners(connectionKey, 'reconnecting');
      });

      connection.onreconnected(() => {
        console.log('Connection reconnected:', connectionKey);
        this.notifyListeners(connectionKey, 'reconnected');
      });

      connection.onclose((error) => {
        console.log('Connection closed:', connectionKey, error);
        this.connections.delete(connectionKey);
        this.connectionPromises.delete(connectionKey);
        this.isConnecting.set(connectionKey, false);
        this.notifyListeners(connectionKey, 'closed');
      });

      // Create connection promise
      const connectionPromise = connection.start().then(() => {
        console.log('Connection started successfully:', connectionKey);
        this.connections.set(connectionKey, connection);
        this.notifyListeners(connectionKey, 'connected');
      }).catch((error) => {
        console.error('Connection failed:', connectionKey, error);
        this.connections.delete(connectionKey);
        this.connectionPromises.delete(connectionKey);
        this.isConnecting.set(connectionKey, false);
        this.notifyListeners(connectionKey, 'failed');
        throw error;
      }).finally(() => {
        this.connectionPromises.delete(connectionKey);
        this.isConnecting.set(connectionKey, false);
      });

      this.connectionPromises.set(connectionKey, connectionPromise);
      await connectionPromise;

      return connection;
    } catch (error) {
      this.isConnecting.set(connectionKey, false);
      throw error;
    }
  }

  private notifyListeners(connectionKey: string, event: string) {
    const listeners = this.listeners.get(connectionKey);
    if (listeners) {
      listeners.forEach(listener => listener());
    }
  }

  addConnectionListener(connectionKey: string, listener: () => void) {
    if (!this.listeners.has(connectionKey)) {
      this.listeners.set(connectionKey, new Set());
    }
    this.listeners.get(connectionKey)!.add(listener);
  }

  removeConnectionListener(connectionKey: string, listener: () => void) {
    const listeners = this.listeners.get(connectionKey);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  disconnectConnection(connectionKey: string) {
    const connection = this.connections.get(connectionKey);
    if (connection) {
      connection.stop();
      this.connections.delete(connectionKey);
      this.connectionPromises.delete(connectionKey);
      this.isConnecting.set(connectionKey, false);
    }
  }

  isConnected(connectionKey: string): boolean {
    const connection = this.connections.get(connectionKey);
    return connection?.state === signalR.HubConnectionState.Connected;
  }

  getConnectionState(connectionKey: string): signalR.HubConnectionState | null {
    const connection = this.connections.get(connectionKey);
    return connection?.state || null;
  }
}

// Export the global manager
export const signalRManager = SignalRConnectionManager.getInstance(); 