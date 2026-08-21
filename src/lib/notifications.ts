import { apiUrl } from "./api";

export type AppNotification = {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string | null;
  read: boolean;
  createdAt: string;
};

const TOKEN_KEY = "opspilot_token";

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);

  const response = await fetch(apiUrl(path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}.`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function getMyNotifications() {
  return request<AppNotification[]>("/api/v1/notifications/my");
}

export function getMyUnreadNotificationCount() {
  return request<number>("/api/v1/notifications/my/unread/count");
}

export function markNotificationAsRead(id: number) {
  return request<AppNotification>(`/api/v1/notifications/${id}/read`, {
    method: "PUT",
  });
}

export function markAllNotificationsAsRead() {
  return request<void>("/api/v1/notifications/my/read-all", {
    method: "PUT",
  });
}
