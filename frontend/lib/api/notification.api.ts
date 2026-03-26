// ─── Notification API Layer ─────────────────────────────────
// Raw API calls only — no Zustand, no UI.
import type { Notification } from "@/lib/types/notification.types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api";

function authHeaders(token?: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetchNotifications(
  token?: string
): Promise<Notification[]> {
  const res = await fetch(`${BASE}/notifications`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}

export async function apiMarkAsRead(
  id: string,
  token?: string
): Promise<void> {
  const res = await fetch(`${BASE}/notifications/${id}/read`, {
    method: "PATCH",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to mark notification as read");
}

export async function apiMarkAllRead(token?: string): Promise<void> {
  const res = await fetch(`${BASE}/notifications/read-all`, {
    method: "PATCH",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to mark all notifications as read");
}
