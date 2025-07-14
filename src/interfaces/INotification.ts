export interface NotificationItem {
    id: number;
    title: string;
    content: string;
    link?: string;
    isRead: boolean;
    createdAt?: string;
  }
  export const NOTI_HUB_METHODS = {
    RECEIVED: 'NotificationReceivedMethod',
    CREATED: 'NotificationCreatedMethod',
    READ: 'NotificationReadMethod',
    GROUP_PREFIX: 'IndividualUserGroup',
  } as const;  