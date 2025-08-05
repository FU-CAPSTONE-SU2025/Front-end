export interface NotificationItem {
    id: number;
    title: string;
    content: string;
    link?: string;
    isRead: boolean;
    createdAt?: string;
    type?: string;
    userId?: number;
    notificationType?: string;
}

// Backend response format
export interface NotificationItemResponse {
    id: number;
    title: string;
    content: string;
    link?: string;
    createdAt?: string;
}

export const NOTI_HUB_METHODS = {
    RECEIVED: 'NotificationReceivedMethod',
    CREATED: 'NotificationCreatedMethod',
    READ: 'NotificationReadMethod',
    MARK_ALL_AS_READ: 'MarkAllAsRead',
    GROUP_PREFIX: 'IndividualUserGroup',
} as const;  