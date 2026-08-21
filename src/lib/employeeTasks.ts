import type { WorkTask } from "./api";
import { apiUrl } from "./api";

export type EmployeeTaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "IN_REVIEW"
  | "COMPLETED"
  | "BLOCKED";

const TOKEN_KEY = "opspilot_token";

export async function updateMyTaskStatus(
  taskId: number,
  status: EmployeeTaskStatus,
): Promise<WorkTask> {
  const token = localStorage.getItem(TOKEN_KEY);

  const response = await fetch(
    apiUrl(`/api/v1/work-tasks/${taskId}/my-status`),
    {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ status }),
    },
  );

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}.`);
  }

  return response.json() as Promise<WorkTask>;
}
