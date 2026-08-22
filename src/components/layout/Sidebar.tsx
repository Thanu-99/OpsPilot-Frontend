import {
  Bot,
  Building2,
  ChevronRight,
  ClipboardCheck,
  Command,
  LayoutDashboard,
  LogIn,
  LogOut,
  Package,
  ShieldAlert,
  UserPlus,
  UsersRound,
  X,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

import { clearToken } from "../../lib/api";
import {
  clearCurrentUser,
  getCurrentUser,
  type CurrentUser,
} from "../../lib/session";

type SidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

type NavigationItem = {
  title: string;
  icon: typeof LayoutDashboard;
  path: string;
};

const navigationByRole: Record<CurrentUser["role"], NavigationItem[]> = {
  ADMIN: [
    { title: "Command Center", icon: LayoutDashboard, path: "/dashboard" },
    { title: "People & Teams", icon: Building2, path: "/people" },
    { title: "Incidents", icon: ShieldAlert, path: "/incidents" },
    { title: "Products", icon: Package, path: "/products" },
    { title: "AI Copilot", icon: Bot, path: "/ai-copilot" },
  ],
  MANAGER: [
    { title: "Team Workspace", icon: UsersRound, path: "/manager" },
    { title: "Products", icon: Package, path: "/products" },
    { title: "AI Copilot", icon: Bot, path: "/ai-copilot" },
  ],
  EMPLOYEE: [
    { title: "My Workspace", icon: ClipboardCheck, path: "/employee" },
    { title: "AI Copilot", icon: Bot, path: "/ai-copilot" },
  ],
};

function roleLabel(role: CurrentUser["role"]) {
  if (role === "MANAGER") return "Manager";
  if (role === "EMPLOYEE") return "Employee";

  return "Administrator";
}

function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const navigation = currentUser
    ? navigationByRole[currentUser.role]
    : [];
  const initials = currentUser
    ? `${currentUser.firstName[0] ?? ""}${currentUser.lastName[0] ?? ""}`
    : "";

  function closeSidebar() {
    onClose?.();
  }

  function handleSignOut() {
    clearToken();
    clearCurrentUser();
    closeSidebar();
    navigate("/login", { replace: true });
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-[70] flex h-screen w-[280px] flex-col border-r border-white/[0.08] bg-[#101012] px-3 py-4 shadow-2xl shadow-black/50 transition-transform duration-300 ease-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex h-12 items-center justify-between px-2">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-lg bg-violet-500 text-white shadow-lg shadow-violet-950/40">
            <Command size={18} strokeWidth={2.5} />
          </span>

          <div>
            <h1 className="text-[17px] font-semibold tracking-[-0.03em] text-white">
              OpsPilot
            </h1>
            <p className="mt-0.5 text-[10px] font-medium tracking-[0.12em] text-zinc-400">
              AI OPERATIONS
            </p>
          </div>
        </div>

        <button
          onClick={closeSidebar}
          aria-label="Close sidebar"
          className="grid size-8 place-items-center rounded-lg text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mt-9">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
          Workspace
        </p>

        {currentUser ? (
          <nav className="space-y-1">
            {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-medium transition ${
                    isActive
                      ? "bg-white/[0.1] text-white"
                      : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={18}
                      strokeWidth={isActive ? 2.4 : 2}
                      className={isActive ? "text-violet-300" : "text-zinc-400"}
                    />
                    <span className="flex-1">{item.title}</span>
                  </>
                )}
              </NavLink>
            );
            })}
          </nav>
        ) : (
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.035] p-4">
            <p className="text-sm font-medium text-white">
              Your workspace awaits
            </p>
            <p className="mt-1.5 text-xs leading-5 text-zinc-400">
              Sign in to access your role-based dashboard, work, and AI
              Copilot.
            </p>
          </div>
        )}
      </div>

      <div className="mt-auto">
        {currentUser ? (
          <div className="mb-5 rounded-xl border border-white/[0.08] bg-white/[0.035] p-3.5">
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md bg-violet-500/15 text-violet-300">
              <Bot size={15} />
            </span>

            <div>
              <p className="text-sm font-medium text-white">Ask OpsPilot AI</p>
              <p className="mt-1 text-xs leading-5 text-zinc-400">
                Get answers from your operational data.
              </p>
            </div>
          </div>

          <NavLink
            to="/ai-copilot"
            onClick={closeSidebar}
            className="mt-3 flex items-center justify-between rounded-md bg-white/[0.07] px-3 py-2.5 text-xs font-medium text-zinc-200 transition hover:bg-white/[0.12] hover:text-white"
          >
            Open Copilot
            <ChevronRight size={14} />
          </NavLink>
          </div>
        ) : null}

        <div className="my-3 border-t border-white/[0.08]" />

        {currentUser ? (
          <>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-medium text-zinc-300 transition hover:bg-rose-500/[0.08] hover:text-rose-300"
            >
              <LogOut size={18} className="text-zinc-400" />
              Sign out
            </button>

            <div className="mt-2 flex items-center gap-2.5 rounded-lg px-3 py-2.5">
              <span className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-violet-400 to-indigo-600 text-xs font-semibold text-white">
                {initials.toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {currentUser.firstName} {currentUser.lastName}
                </p>
                <p className="text-[11px] text-zinc-400">
                  {roleLabel(currentUser.role)}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <NavLink
              to="/login"
              onClick={closeSidebar}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
            >
              <LogIn size={17} />
              Sign in
            </NavLink>
            <NavLink
              to="/register"
              onClick={closeSidebar}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.08] hover:text-white"
            >
              <UserPlus size={17} />
              Create account
            </NavLink>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
