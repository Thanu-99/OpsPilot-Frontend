import { Navigate, Route, Routes } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import PublicLayout from "../layouts/PublicLayout";
import { isAuthenticated } from "../lib/api";
import {
  getCurrentUser,
  getWorkspacePath,
  type CurrentUser,
} from "../lib/session";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import AiCopilot from "../pages/dashboard/AiCopilot";
import EmployeeWorkspace from "../pages/dashboard/EmployeeWorkspace";
import Incidents from "../pages/dashboard/Incidents";
import ManagerWorkspace from "../pages/dashboard/ManagerWorkspace";
import Overview from "../pages/dashboard/Overview";
import PeopleTeams from "../pages/dashboard/PeopleTeams";
import Products from "../pages/dashboard/Products";
import LandingPage from "../pages/landing/Landingpage";

type RoleRouteProps = {
  allowedRoles: CurrentUser["role"][];
  children: React.ReactNode;
};

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = getCurrentUser();

  if (!isAuthenticated() || !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function RoleRoute({ allowedRoles, children }: RoleRouteProps) {
  const user = getCurrentUser();

  if (!isAuthenticated() || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getWorkspacePath(user.role)} replace />;
  }

  return children;
}

function FallbackRoute() {
  const user = getCurrentUser();

  if (isAuthenticated() && user) {
    return <Navigate to={getWorkspacePath(user.role)} replace />;
  }

  return <Navigate to="/" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/dashboard"
          element={
            <RoleRoute allowedRoles={["ADMIN"]}>
              <Overview />
            </RoleRoute>
          }
        />

        <Route
          path="/people"
          element={
            <RoleRoute allowedRoles={["ADMIN"]}>
              <PeopleTeams />
            </RoleRoute>
          }
        />

        <Route
          path="/incidents"
          element={
            <RoleRoute allowedRoles={["ADMIN"]}>
              <Incidents />
            </RoleRoute>
          }
        />

        <Route
          path="/manager"
          element={
            <RoleRoute allowedRoles={["MANAGER"]}>
              <ManagerWorkspace />
            </RoleRoute>
          }
        />

        <Route
          path="/employee"
          element={
            <RoleRoute allowedRoles={["EMPLOYEE"]}>
              <EmployeeWorkspace />
            </RoleRoute>
          }
        />

        <Route
          path="/products"
          element={
            <RoleRoute allowedRoles={["ADMIN", "MANAGER"]}>
              <Products />
            </RoleRoute>
          }
        />

        <Route
          path="/ai-copilot"
          element={
            <RoleRoute allowedRoles={["ADMIN", "MANAGER", "EMPLOYEE"]}>
              <AiCopilot />
            </RoleRoute>
          }
        />
      </Route>

      <Route path="*" element={<FallbackRoute />} />
    </Routes>
  );
}

export default AppRoutes;