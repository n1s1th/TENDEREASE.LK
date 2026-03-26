// ─── Notification Store ─────────────────────────────────────
// persist → unread count survives page refresh
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {
  NotificationState,
  Notification,
} from "@/lib/types/notification.types";
import {
  apiFetchNotifications,
  apiMarkAsRead,
  apiMarkAllRead,
} from "@/lib/api/notification.api";

export const useNotificationStore = create<NotificationState>()(
  devtools(
    persist(
      (set) => ({
        // ── State ──────────────────────────────────
        notifications: [],
        unreadCount: 0,
        isLoading: false,

        // ── Actions ────────────────────────────────
        fetchNotifications: async () => {
          set({ isLoading: true }, false, "notification/fetch/pending");
          try {
            const notifications = await apiFetchNotifications();
            const unreadCount = notifications.filter((n) => !n.isRead).length;
            set(
              { notifications, unreadCount, isLoading: false },
              false,
              "notification/fetch/fulfilled"
            );
          } catch {
            set({ isLoading: false }, false, "notification/fetch/rejected");
          }
        },

        markAsRead: async (id: string) => {
          await apiMarkAsRead(id);
          set(
            (state) => {
              const updated = state.notifications.map((n) =>
                n.id === id ? { ...n, isRead: true } : n
              );
              return {
                notifications: updated,
                unreadCount: updated.filter((n) => !n.isRead).length,
              };
            },
            false,
            "notification/markAsRead"
          );
        },

        markAllRead: async () => {
          await apiMarkAllRead();
          set(
            (state) => ({
              notifications: state.notifications.map((n) => ({
                ...n,
                isRead: true,
              })),
              unreadCount: 0,
            }),
            false,
            "notification/markAllRead"
          );
        },

        addNotification: (notification: Notification) =>
          set(
            (state) => ({
              notifications: [notification, ...state.notifications],
              unreadCount: state.unreadCount + (notification.isRead ? 0 : 1),
            }),
            false,
            "notification/add"
          ),
      }),
      {
        name: "notification-storage",
        partialize: (state) => ({ unreadCount: state.unreadCount }),
      }
    ),
    { name: "NotificationStore" }
  )
);

// ── Selectors ──────────────────────────────────────────────
export const selectNotifications = (s: NotificationState) => s.notifications;
export const selectUnreadCount = (s: NotificationState) => s.unreadCount;
export const selectUnread = (s: NotificationState) =>
  s.notifications.filter((n) => !n.isRead);
export const selectNotificationLoading = (s: NotificationState) => s.isLoading;
