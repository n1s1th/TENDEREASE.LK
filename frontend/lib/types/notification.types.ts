// ─── Notification Types ─────────────────────────────────────
export type NotificationType =
  | "tender_published"
  | "bid_received"
  | "deadline_reminder"
  | "status_update"
  | "kyc_update"
  | "evaluation_complete";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;

  // Actions
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
  addNotification: (notification: Notification) => void;
}
