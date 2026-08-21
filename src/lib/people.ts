import type { WorkspaceUser } from "./api";
import { apiUrl } from "./api";

export type Department = {
  id: number;
  name: string;
  description: string | null;
  companyId: number;
  managerId: number | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

type DepartmentPayload = {
  name: string;
  description: string;
  companyId: number;
  managerId: number | null;
  active: boolean;
};

type ReportingLinePayload = {
  departmentId: number;
  managerId: number;
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

  return response.json() as Promise<T>;
}

export function getDepartments() {
  return request<Department[]>("/api/v1/departments");
}

export function createDepartment(payload: DepartmentPayload) {
  return request<Department>("/api/v1/departments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateReportingLine(
  userId: number,
  payload: ReportingLinePayload,
) {
  return request<WorkspaceUser>(
    `/api/v1/users/${userId}/reporting-line`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}
