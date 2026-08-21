export type CurrentUser = {
  userId: number;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "MANAGER" | "EMPLOYEE";
  companyId: number;
};

type AuthUserPayload = {
  userId: number;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "MANAGER" | "EMPLOYEE";
  companyId: number;
};

const USER_KEY = "opspilot_current_user";

export function saveCurrentUser(user: AuthUserPayload) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getCurrentUser(): CurrentUser | null {
  const value = localStorage.getItem(USER_KEY);

  if (!value) return null;

  try {
    return JSON.parse(value) as CurrentUser;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function clearCurrentUser() {
  localStorage.removeItem(USER_KEY);
}

export function getWorkspacePath(role: CurrentUser["role"]) {
  if (role === "MANAGER") return "/manager";
  if (role === "EMPLOYEE") return "/employee";

  return "/dashboard";
}