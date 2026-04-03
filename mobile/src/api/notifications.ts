import { api } from "./client";

type RegisterDevicePayload = {
  device_id: string;
  platform: string;
  token: string;
};

export type InAppNotification = {
  id: string;
  category: string;
  title: string;
  body: string;
  resource_type?: string | null;
  resource_id?: string | null;
  action_path?: string | null;
  actor_user_id?: string | null;
  metadata: Record<string, any>;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
};

export async function registerDeviceToken(payload: RegisterDevicePayload) {
  await api.post("/api/notifications/device", payload);
}

export async function revokeDeviceToken(deviceId: string) {
  await api.delete(`/api/notifications/device/${deviceId}`);
}

export async function fetchNotifications(limit = 20, offset = 0) {
  const response = await api.get<{ items: InAppNotification[]; unread_count: number }>(
    `/api/notifications/feed?limit=${limit}&offset=${offset}`,
  );
  return response.data;
}

export async function fetchUnreadNotificationCount() {
  const response = await api.get<{ unread_count: number }>(
    "/api/notifications/unread-count",
  );
  return response.data;
}

export async function markNotificationRead(notificationId: string) {
  await api.post(`/api/notifications/${notificationId}/read`);
}

export async function markAllNotificationsRead() {
  await api.post("/api/notifications/read-all");
}
