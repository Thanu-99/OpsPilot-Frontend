import type { WorkTask } from "./api";
import { apiUrl } from "./api";

export type ManagerTaskPayload = {
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assignedToUserId: number;
  dueDate: string;
};

const TOKEN_KEY = "opspilot_token";

export async function createManagerTask(
  payload: ManagerTaskPayload,
): Promise<WorkTask> {
  const token = localStorage.getItem(TOKEN_KEY);

  const response = await fetch(apiUrl("/api/v1/work-tasks/manager"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}.`);
  }

  return response.json() as Promise<WorkTask>;
}
