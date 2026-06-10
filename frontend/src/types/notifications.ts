export type NotificationType =
  | 'application_received'
  | 'application_accepted'
  | 'application_rejected'
  | 'new_message'
  | 'startup_approved'
  | 'startup_rejected';

export interface Notification {
  id: string;
  recipientId: string;
  type: NotificationType;
  referenceId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface UnreadCountResponse {
  unreadCount: number;
}
