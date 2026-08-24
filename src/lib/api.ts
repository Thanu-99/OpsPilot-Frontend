export type UserRole = "ADMIN" | "MANAGER" | "EMPLOYEE";

export type DashboardSummary = {
  totalProducts: number;
  lowStockProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  todayRevenue: number;
};

export type SalesAnalytics = {
  date: string;
  revenue: number;
  orderCount: number;
};

export type InventoryAnalytics = {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  inventoryValue: number;
};

export type InventoryItem = {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  reorderLevel: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type OrderItem = {
  id: number;
  productId: number;
  productName?: string;
  quantity: number;
  unitPrice: number;
  subtotal?: number;
};

export type Order = {
  id: number;
  totalAmount: number;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  quantity: number;
  category: string;
  sku: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductPayload = {
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  sku: string;
};

export type WorkspaceUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  companyId: number;
  departmentId: number | null;
  managerId: number | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type WorkTask = {
  id: number;
  title: string;
  description: string | null;
  status:
    | "TODO"
    | "IN_PROGRESS"
    | "IN_REVIEW"
    | "COMPLETED"
    | "BLOCKED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  companyId: number;
  departmentId: number | null;
  assignedToUserId: number;
  createdByUserId: number;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  token: string;
  message: string;
  userId: number;
  firstName: string;
  lastName: string;
  role: UserRole;
  companyId: number;
};

export type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  companyId: number;
};

export type AiChatResponse = {
  response: string;
};

type BackendErrorResponse = {
  message?: string;
  error?: string;
  timestamp?: string;
  status?: number;
};

const TOKEN_KEY = "opspilot_token";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? ""
).replace(/\/$/, "");

export function apiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}

async function readErrorMessage(response: Response) {
  const fallbackMessage =
    response.status === 400
      ? "The request was invalid. Please check the entered information."
      : response.status === 401
        ? "Your session has expired. Please sign in again."
        : response.status === 403
          ? "Your account does not have permission to perform this action."
          : response.status === 404
            ? "The requested information could not be found."
            : response.status === 500
              ? "The server could not complete the request."
              : response.status === 502
                ? "The backend service is currently unavailable."
                : `Request failed with status ${response.status}.`;

  try {
    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const errorBody =
        (await response.json()) as BackendErrorResponse;

      return (
        errorBody.message ??
        errorBody.error ??
        fallbackMessage
      );
    }

    const text = await response.text();

    return text.trim() || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const isAuthenticationRequest = path.startsWith(
    "/api/v1/auth/",
  );

  const response = await fetch(apiUrl(path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && !isAuthenticationRequest
        ? { Authorization: `Bearer ${token}` }
        : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorMessage = await readErrorMessage(response);

    if (response.status === 401) {
      clearToken();
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function login(
  email: string,
  password: string,
) {
  return request<AuthResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function register(payload: RegisterPayload) {
  return request<AuthResponse>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function googleLogin(credential: string) {
  return request<AuthResponse>("/api/v1/auth/google/login", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
}

export function googleRegister(credential: string) {
  return request<AuthResponse>("/api/v1/auth/google/register", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
}

export function getDashboardSummary() {
  return request<DashboardSummary>(
    "/api/v1/dashboard/summary",
  );
}

export function getInventoryAnalytics() {
  return request<InventoryAnalytics>(
    "/api/v1/dashboard/inventory",
  );
}

export function getSalesAnalytics(
  startDate: string,
  endDate: string,
) {
  const searchParams = new URLSearchParams({
    startDate,
    endDate,
  });

  return request<SalesAnalytics[]>(
    `/api/v1/dashboard/sales?${searchParams.toString()}`,
  );
}

export function getInventory() {
  return request<InventoryItem[]>(
    "/api/v1/inventory",
  );
}

export function getOrders() {
  return request<Order[]>("/api/v1/orders");
}

export function getProducts() {
  return request<Product[]>("/api/v1/products");
}

export function createProduct(
  payload: ProductPayload,
) {
  return request<Product>("/api/v1/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateProduct(
  id: number,
  payload: ProductPayload,
) {
  return request<Product>(`/api/v1/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteProduct(id: number) {
  return request<void>(`/api/v1/products/${id}`, {
    method: "DELETE",
  });
}

export function getUsers() {
  return request<WorkspaceUser[]>("/api/v1/users");
}

export function getManagerTeam() {
  return request<WorkspaceUser[]>(
    "/api/v1/manager/team",
  );
}

export function getMyWorkTasks() {
  return request<WorkTask[]>(
    "/api/v1/work-tasks/my",
  );
}

export function chatWithAi(message: string) {
  return request<AiChatResponse>("/api/v1/ai/chat", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}
