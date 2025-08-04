// SignalR Hub Configuration
export const SIGNALR_CONFIG = {
  // Hub URLs
  ADVISORY_CHAT_HUB_URL: 'http://178.128.31.58:5000/advisoryChat1to1Hub',
  NOTIFICATION_HUB_URL: `${import.meta.env.VITE_API_AISEA_API_HUBURL}/notificationHub`,
  
  // Hub method names from backend configuration
  HUB_METHODS: {
    // Advisory Chat Methods
    SEND_MESSAGE: 'SendMessage',
    JOIN_SESSION: 'JoinSession',
    LIST_SESSIONS_BY_STAFF: 'ListAllSessionByStaff',
    LIST_OPENED_SESSIONS: 'ListOpenedSession',
    LOAD_MORE_MESSAGES: 'LoadMoreMessages',
    LOAD_MORE_SESSIONS: 'LoadMoreSessions',
    GET_SESSIONS_METHOD: 'GetSessionsHUBMethod',
    SEND_ADVSS_METHOD: 'SendADVSSMethod',
    JOIN_SS_METHOD: 'JoinSSMethod',
    SESSION_CREATED: 'SessionCreated',
    SESSION_DELETED: 'SessionDeletedMethod',
    ADD_SESSION_AS_ASSIGNED: 'AddSessionAsAssigned',
    REMOVE_SESSION_FROM_UNASSIGNED: 'RemoveSessionFromUnassigned',
    LOAD_MORE_MESSAGES_METHOD: 'LoadMoreMessagesMethod',
    ASSIGN_ADVISOR_TO_SESSION: 'AssignAdvisorToSession',
    LIST_ALL_ASSIGNED_SESSIONS: 'ListAllAssignedSessions',
    
    // Notification Methods
    GET_NOTIFICATIONS: 'GetNotifications',
    MARK_AS_READ: 'MarkAsRead',
    NOTIFICATION_RECEIVED: 'Received',
    NOTIFICATION_CREATED: 'Created',
    NOTIFICATION_READ: 'Read',
  },
  
  // Connection settings
  CONNECTION: {
    RETRY_INTERVALS: [0, 2000, 10000, 30000],
    LOG_LEVEL: 'Warning',
    TRANSPORT_TYPE: 'WebSockets', // Changed from LongPolling to WebSockets
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
  },
  
  // Session settings
  SESSION: {
    CACHE_PREFIX: 'SenderAdviSession:',
    CACHE_EXPIRY_DAYS: 1,
    SESSION_EXPIRY_DAYS: 7,
    INTERVAL_MILLIS: 1800000,
  },
  
  // Group prefixes
  GROUPS: {
    CHAT_PREFIX: 'GroupChatADVssPrefix',
    STAFF_PREFIX: 'MulDataSessionsPrefixStaff',
    STUDENT_PREFIX: 'MulDataSessionsPrefixStudent',
  },
  
  // Message settings
  MESSAGES: {
    DEFAULT_PAGE_SIZE: 50,
    MAX_MESSAGE_LENGTH: 1000,
    TYPING_TIMEOUT: 3000,
  },
  
  // UI settings
  UI: {
    CHAT_BOX_WIDTH: 320,
    CHAT_BOX_HEIGHT: 384,
    MESSAGE_ANIMATION_DURATION: 300,
    TYPING_INDICATOR_DELAY: 500,
  },
  
  // Error messages
  ERRORS: {
    CONNECTION_FAILED: 'Failed to connect to chat server',
    SEND_MESSAGE_FAILED: 'Failed to send message',
    JOIN_SESSION_FAILED: 'Failed to join session',
    LOAD_MESSAGES_FAILED: 'Failed to load messages',
    ASSIGN_ADVISOR_FAILED: 'Failed to assign advisor to session',
    PERMISSION_DENIED: 'You do not have permission to access this session',
    SESSION_NOT_FOUND: 'Session not found',
  },
  
  // Status messages
  STATUS: {
    CONNECTING: 'Connecting...',
    CONNECTED: 'Connected',
    DISCONNECTED: 'Disconnected',
    RECONNECTING: 'Reconnecting...',
    LOADING: 'Loading...',
    SENDING: 'Sending...',
  },
};

// Connection state enum
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
  return content.trim().length > 0 && content.length <= SIGNALR_CONFIG.MESSAGES.MAX_MESSAGE_LENGTH;
};

export const truncateMessage = (content: string, maxLength: number = 50): string => {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '...';
}; 