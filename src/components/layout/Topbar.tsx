import { Bell, CheckCheck, Menu, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import {
  getMyNotifications,
  getMyUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../lib/notifications";
import type { AppNotification } from "../../lib/notifications";
import { getCurrentUser } from "../../lib/session";
import ThemeToggle from "../ui/ThemeToggle";

type TopbarProps = {
  onMenuClick: () => void;
};

const pageDetails: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Command Center",
    subtitle: "Your company, at a glance.",
  },
  "/people": {
    title: "People & Teams",
    subtitle: "Structure your company and teams.",
  },
  "/manager": {
    title: "Team Workspace",
    subtitle: "Your team’s work and priorities.",
  },
  "/employee": {
    title: "My Workspace",
    subtitle: "Your work, deadlines, and progress.",
  },
  "/incidents": {
    title: "Incidents",
    subtitle: "Operational issues requiring attention.",
  },
  "/products": {
    title: "Products",
    subtitle: "Manage your product catalogue.",
  },
  "/ai-copilot": {
    title: "AI Copilot",
    subtitle: "Ask questions about your operations.",
  },
};

function roleLabel(role?: string) {
  if (role === "MANAGER") return "Manager";
  if (role === "EMPLOYEE") return "Employee";

  return "Administrator";
}

function notificationTime(value: string) {
  const createdAt = new Date(value);
  const difference = Date.now() - createdAt.getTime();
  const minutes = Math.max(1, Math.floor(difference / 60_000));

  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours}h ago`;

  return `${Math.floor(hours / 24)}d ago`;
}

function Topbar({ onMenuClick }: TopbarProps) {
  const location = useLocation();
  const currentUser = getCurrentUser();
  const details = pageDetails[location.pathname] ?? {
    title: "OpsPilot",
    subtitle: "Operations intelligence.",
  };

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const initials = `${currentUser?.firstName[0] ?? "O"}${
    currentUser?.lastName[0] ?? "P"
  }`;

  useEffect(() => {
    let active = true;

    async function loadNotifications() {
      try {
        const [items, count] = await Promise.all([
          getMyNotifications(),
          getMyUnreadNotificationCount(),
        ]);

        if (!active) return;

        setNotifications(items.slice(0, 8));
        setUnreadCount(count);
      } catch {
        if (!active) return;

        setNotifications([]);
        setUnreadCount(0);
      }
    }

    void loadNotifications();

    const interval = window.setInterval(() => {
      void loadNotifications();
    }, 30_000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  async function handleMarkAsRead(notification: AppNotification) {
    if (notification.read) return;

    try {
      const updated = await markNotificationAsRead(notification.id);

      setNotifications((current) =>
        current.map((item) =>
          item.id === updated.id ? updated : item,
        ),
      );

      setUnreadCount((current) => Math.max(0, current - 1));
    } catch {
      // A failed mark-as-read should not break the dropdown.
    }
  }

  async function handleMarkAllAsRead() {
    if (!unreadCount) return;

    try {
      await markAllNotificationsAsRead();

      setNotifications((current) =>
        current.map((item) => ({ ...item, read: true })),
      );

      setUnreadCount(0);
    } catch {
      // The notification list remains usable if this request fails.
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#09090b]/80 px-5 py-4 backdrop-blur-xl sm:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            aria-label="Open sidebar"
            className="grid size-10 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
          >
            <Menu size={19} />
          </button>

          <div>
            <p className="text-base font-semibold tracking-[-0.025em] text-white">
              {details.title}
            </p>
            <p className="mt-0.5 hidden text-xs text-zinc-500 sm:block">
              {details.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden w-64 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 sm:flex">
            <Search size={16} className="text-zinc-500" />
            <input
              placeholder="Search anything..."
              className="w-full bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-600"
            />
          </div>

          <ThemeToggle />

          <div className="relative">
            <button
              onClick={() => setNotificationsOpen((current) => !current)}
              aria-label="Open notifications"
              className="relative grid size-10 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
            >
              <Bell size={18} />
              {unreadCount ? (
                <span className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-violet-400 px-1 py-0.5 text-[9px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              ) : null}
            </button>

            {notificationsOpen ? (
              <div className="absolute right-0 top-12 z-50 w-[min(380px,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border border-white/[0.1] bg-[#151517] shadow-2xl shadow-black/60">
                <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3.5">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Notifications
                    </p>
                    <p className="mt-0.5 text-[11px] text-zinc-500">
                      {unreadCount
                        ? `${unreadCount} unread update${
                            unreadCount === 1 ? "" : "s"
                          }`
                        : "You’re all caught up"}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={!unreadCount}
                    onClick={() => void handleMarkAllAsRead()}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium text-violet-300 transition hover:bg-violet-400/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <CheckCheck size={14} />
                    Read all
                  </button>
                </div>

                <div className="max-h-[380px] overflow-y-auto">
                  {notifications.length ? (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => void handleMarkAsRead(notification)}
                        className={`flex w-full gap-3 border-b border-white/[0.06] px-4 py-3.5 text-left transition hover:bg-white/[0.04] ${
                          notification.read ? "opacity-60" : ""
                        }`}
                      >
                        <span
                          className={`mt-1.5 size-2 shrink-0 rounded-full ${
                            notification.read
                              ? "bg-zinc-700"
                              : "bg-violet-400"
                          }`}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-3">
                            <span className="truncate text-xs font-semibold text-zinc-100">
                              {notification.title}
                            </span>
                            <span className="shrink-0 text-[10px] text-zinc-600">
                              {notificationTime(notification.createdAt)}
                            </span>
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-zinc-400">
                            {notification.message}
                          </span>
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-5 py-12 text-center">
                      <Bell className="mx-auto size-5 text-zinc-600" />
                      <p className="mt-3 text-sm font-medium text-zinc-300">
                        No notifications yet
                      </p>
                      <p className="mt-1 text-xs text-zinc-600">
                        Work updates will appear here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <div className="hidden items-center gap-2.5 border-l border-white/[0.08] pl-3 sm:flex">
            <span className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-violet-400 to-indigo-600 text-xs font-semibold text-white">
              {initials.toUpperCase()}
            </span>
            <div className="hidden lg:block">
              <p className="text-xs font-medium text-zinc-200">
                {currentUser
                  ? `${currentUser.firstName} ${currentUser.lastName}`
                  : "OpsPilot User"}
              </p>
              <p className="text-[10px] text-zinc-500">
                {roleLabel(currentUser?.role)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
