import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowUpRight,
  Bot,
  BriefcaseBusiness,
  CircleAlert,
  Crown,
  Package,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  UserRound,
  UsersRound,
  Warehouse,
} from "lucide-react";

import {
  getDashboardSummary,
  getInventoryAnalytics,
  getSalesAnalytics,
  getUsers,
} from "../../lib/api";

import type {
  DashboardSummary,
  InventoryAnalytics,
  SalesAnalytics,
  WorkspaceUser,
} from "../../lib/api";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function toDateValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function Overview() {
  const navigate = useNavigate();

  const [summary, setSummary] =
    useState<DashboardSummary | null>(null);

  const [inventory, setInventory] =
    useState<InventoryAnalytics | null>(null);

  const [sales, setSales] =
    useState<SalesAnalytics[]>([]);

  const [users, setUsers] =
    useState<WorkspaceUser[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const loadData = useCallback(
    async (manualRefresh = false) => {
      if (manualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setErrorMessage("");

      const endDate = new Date();
      const startDate = new Date();

      startDate.setDate(endDate.getDate() - 11);

      try {
        const [
          summaryData,
          inventoryData,
          salesData,
          usersData,
        ] = await Promise.all([
          getDashboardSummary(),
          getInventoryAnalytics(),
          getSalesAnalytics(
            toDateValue(startDate),
            toDateValue(endDate),
          ),
          getUsers(),
        ]);

        setSummary(summaryData);
        setInventory(inventoryData);
        setSales(salesData);
        setUsers(usersData);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load the administrator workspace.",
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const managers = useMemo(
    () =>
      users.filter(
        (user) => user.role === "MANAGER",
      ),
    [users],
  );

  const employees = useMemo(
    () =>
      users.filter(
        (user) => user.role === "EMPLOYEE",
      ),
    [users],
  );

  const administrators = useMemo(
    () =>
      users.filter(
        (user) => user.role === "ADMIN",
      ),
    [users],
  );

  const activeUsers = useMemo(
    () => users.filter((user) => user.active),
    [users],
  );

  const maxRevenue = useMemo(
    () =>
      Math.max(
        ...sales.map((item) =>
          Number(item.revenue),
        ),
        1,
      ),
    [sales],
  );

  const periodRevenue = useMemo(
    () =>
      sales.reduce(
        (total, item) =>
          total + Number(item.revenue),
        0,
      ),
    [sales],
  );

  if (isLoading) {
    return (
      <div className="grid min-h-[calc(100vh-76px)] place-items-center bg-[#09090b] text-zinc-400">
        <div className="flex items-center gap-3 text-sm">
          <RefreshCw
            size={17}
            className="animate-spin text-violet-300"
          />
          Loading your command center…
        </div>
      </div>
    );
  }

  if (!summary || !inventory) {
    return (
      <div className="grid min-h-[calc(100vh-76px)] place-items-center bg-[#09090b] px-5 text-zinc-100">
        <div className="max-w-md rounded-2xl border border-rose-400/20 bg-rose-400/[0.07] p-7 text-center">
          <CircleAlert
            className="mx-auto text-rose-300"
            size={26}
          />

          <h1 className="mt-4 text-lg font-semibold text-white">
            Admin workspace unavailable
          </h1>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {errorMessage ||
              "The backend did not return the required company data."}
          </p>

          <button
            type="button"
            onClick={() => void loadData()}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
          >
            <RefreshCw size={15} />
            Try again
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Company revenue",
      value: formatCurrency(
        Number(summary.totalRevenue),
      ),
      detail: `${formatCurrency(
        Number(summary.todayRevenue),
      )} today`,
      Icon: TrendingUp,
      tone: "emerald",
    },
    {
      label: "Active workforce",
      value: activeUsers.length.toLocaleString(),
      detail: `${managers.length} managers · ${employees.length} employees`,
      Icon: UsersRound,
      tone: "blue",
    },
    {
      label: "Total orders",
      value: summary.totalOrders.toLocaleString(),
      detail: `${summary.pendingOrders.toLocaleString()} pending`,
      Icon: ShoppingCart,
      tone: "violet",
    },
    {
      label: "Inventory attention",
      value:
        inventory.lowStockItems.toLocaleString(),
      detail: `${inventory.outOfStockItems.toLocaleString()} out of stock`,
      Icon: Package,
      tone: "amber",
    },
  ] as const;

  return (
    <div className="min-h-[calc(100vh-76px)] bg-[#09090b] px-5 py-7 text-zinc-100 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7 flex flex-col gap-5 border-b border-white/[0.07] pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">
              <Crown size={14} />
              Administrator workspace
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
              Company command center.
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Monitor revenue, people, inventory,
              orders, and company-wide operational
              risk from one workspace.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadData(true)}
            disabled={isRefreshing}
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/[0.1] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={
                isRefreshing ? "animate-spin" : ""
              }
            />
            Refresh data
          </button>
        </header>

        {errorMessage ? (
          <div className="mb-5 rounded-xl border border-amber-400/20 bg-amber-400/[0.07] px-4 py-3 text-sm text-amber-200">
            {errorMessage}
          </div>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map(
            ({
              label,
              value,
              detail,
              Icon,
              tone,
            }) => (
              <article
                key={label}
                className={`group relative overflow-hidden rounded-2xl border p-5 transition duration-300 hover:-translate-y-0.5 ${
                  tone === "amber"
                    ? "border-amber-400/[0.16] bg-amber-400/[0.045]"
                    : "border-white/[0.08] bg-white/[0.025] hover:border-white/[0.13]"
                }`}
              >
                <div className="flex items-start justify-between">
                  <p className="text-sm text-zinc-500">
                    {label}
                  </p>

                  <span
                    className={`grid size-9 place-items-center rounded-xl ${
                      tone === "emerald"
                        ? "bg-emerald-400/10 text-emerald-300"
                        : tone === "blue"
                          ? "bg-blue-400/10 text-blue-300"
                          : tone === "amber"
                            ? "bg-amber-400/10 text-amber-300"
                            : "bg-violet-400/10 text-violet-300"
                    }`}
                  >
                    <Icon size={17} />
                  </span>
                </div>

                <p className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-white">
                  {value}
                </p>

                <p
                  className={`mt-2 text-xs ${
                    tone === "amber"
                      ? "text-amber-100/50"
                      : "text-zinc-600"
                  }`}
                >
                  {detail}
                </p>
              </article>
            ),
          )}
        </section>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Activity
                    size={17}
                    className="text-violet-300"
                  />
                  <p className="text-base font-semibold text-white">
                    Revenue pulse
                  </p>
                </div>

                <p className="mt-1 text-sm text-zinc-500">
                  Non-cancelled sales over the latest
                  12 days
                </p>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-600">
                  Period revenue
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {formatCurrency(periodRevenue)}
                </p>
              </div>
            </div>

            {sales.length ? (
              <>
                <div className="mt-9 flex h-52 items-end gap-2">
                  {sales.map((item) => {
                    const revenue = Number(
                      item.revenue,
                    );

                    const height =
                      (revenue / maxRevenue) * 100;

                    return (
                      <div
                        key={item.date}
                        className="group flex h-full min-w-0 flex-1 items-end"
                      >
                        <div
                          title={`${formatDate(
                            item.date,
                          )}: ${formatCurrency(
                            revenue,
                          )} · ${
                            item.orderCount
                          } orders`}
                          className={`w-full rounded-t-md transition duration-200 ${
                            revenue > 0
                              ? "bg-gradient-to-t from-violet-700 to-violet-400/90 opacity-60 group-hover:opacity-100"
                              : "bg-white/[0.06]"
                          }`}
                          style={{
                            height: `${Math.max(
                              height,
                              3,
                            )}%`,
                          }}
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 flex justify-between border-t border-white/[0.06] pt-4 text-[11px] font-medium text-zinc-600">
                  <span>
                    {formatDate(sales[0].date)}
                  </span>
                  <span>
                    {formatDate(
                      sales[sales.length - 1].date,
                    )}
                  </span>
                </div>
              </>
            ) : (
              <div className="mt-8 grid h-52 place-items-center rounded-xl border border-dashed border-white/[0.08] text-sm text-zinc-600">
                No sales data is available yet.
              </div>
            )}
          </section>

          <section className="relative overflow-hidden rounded-2xl border border-violet-400/[0.16] bg-violet-500/[0.06] p-5 sm:p-6">
            <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-violet-500/10 blur-3xl" />

            <div className="relative">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-violet-500 text-white shadow-lg shadow-violet-950/30">
                  <Bot size={19} />
                </span>

                <div>
                  <p className="text-sm font-semibold text-white">
                    OpsPilot AI briefing
                  </p>
                  <p className="text-[11px] text-violet-200/60">
                    Authenticated company intelligence
                  </p>
                </div>
              </div>

              <h2 className="mt-7 text-xl font-semibold leading-7 tracking-[-0.035em] text-white">
                Your database is now connected to
                Copilot.
              </h2>

              <p className="mt-3 text-sm leading-6 text-zinc-300">
                Ask about revenue, employees,
                managers, tasks, departments,
                inventory, products, orders, and
                current business risks.
              </p>

              <div className="mt-6 rounded-xl border border-white/[0.09] bg-black/20 p-4">
                <p className="text-xs font-semibold text-violet-200">
                  Try asking
                </p>
                <p className="mt-1.5 text-xs leading-5 text-zinc-400">
                  “Give me a company health summary
                  and identify the most urgent risks.”
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate("/ai-copilot")
                }
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-200 transition hover:text-white"
              >
                Open AI Copilot
                <ArrowUpRight size={16} />
              </button>
            </div>
          </section>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-base font-semibold text-white">
                  Workforce structure
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  Active company members by role
                </p>
              </div>

              <UsersRound
                size={19}
                className="text-violet-300"
              />
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {[
                {
                  label: "Administrators",
                  value: administrators.length,
                  Icon: Crown,
                  classes:
                    "bg-violet-400/10 text-violet-300",
                },
                {
                  label: "Managers",
                  value: managers.length,
                  Icon: BriefcaseBusiness,
                  classes:
                    "bg-blue-400/10 text-blue-300",
                },
                {
                  label: "Employees",
                  value: employees.length,
                  Icon: UserRound,
                  classes:
                    "bg-emerald-400/10 text-emerald-300",
                },
              ].map(
                ({
                  label,
                  value,
                  Icon,
                  classes,
                }) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white/[0.07] bg-black/15 p-4"
                  >
                    <span
                      className={`grid size-8 place-items-center rounded-lg ${classes}`}
                    >
                      <Icon size={16} />
                    </span>

                    <p className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-white">
                      {value}
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      {label}
                    </p>
                  </div>
                ),
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-base font-semibold text-white">
                  Operational footprint
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  Company records currently tracked
                </p>
              </div>

              <Warehouse
                size={19}
                className="text-violet-300"
              />
            </div>

            <div className="mt-6 space-y-4">
              {[
                {
                  label: "Products",
                  value: summary.totalProducts,
                  detail:
                    "Products in the company catalogue",
                },
                {
                  label: "Inventory records",
                  value: inventory.totalItems,
                  detail:
                    "Products monitored for stock",
                },
                {
                  label: "Pending orders",
                  value: summary.pendingOrders,
                  detail:
                    "Orders requiring workflow action",
                },
              ].map(
                ({ label, value, detail }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-4 border-b border-white/[0.06] pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-zinc-200">
                        {label}
                      </p>
                      <p className="mt-1 text-xs text-zinc-600">
                        {detail}
                      </p>
                    </div>

                    <span className="text-lg font-semibold tracking-[-0.03em] text-white">
                      {Number(
                        value,
                      ).toLocaleString()}
                    </span>
                  </div>
                ),
              )}
            </div>
          </section>
        </div>

        <section className="mt-5 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025]">
          <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4 sm:px-6">
            <div>
              <p className="text-base font-semibold text-white">
                Team directory
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Recently visible company workspace
                members
              </p>
            </div>

            <span className="rounded-md bg-white/[0.06] px-2.5 py-1 text-xs font-medium text-zinc-400">
              {users.length} total
            </span>
          </div>

          {users.length ? (
            <div className="divide-y divide-white/[0.06]">
              {users.slice(0, 7).map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-white/[0.018] sm:px-6"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-400 to-indigo-600 text-xs font-semibold text-white">
                      {user.firstName.charAt(0)}
                      {user.lastName.charAt(0)}
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-200">
                        {user.firstName}{" "}
                        {user.lastName}
                      </p>

                      <p className="truncate text-xs text-zinc-600">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={`hidden rounded-md px-2 py-1 text-[11px] font-medium sm:block ${
                        user.role === "ADMIN"
                          ? "bg-violet-400/10 text-violet-300"
                          : user.role ===
                              "MANAGER"
                            ? "bg-blue-400/10 text-blue-300"
                            : "bg-emerald-400/10 text-emerald-300"
                      }`}
                    >
                      {user.role}
                    </span>

                    <span
                      title={
                        user.active
                          ? "Active"
                          : "Inactive"
                      }
                      className={`size-2 rounded-full ${
                        user.active
                          ? "bg-emerald-400"
                          : "bg-zinc-600"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-sm text-zinc-600">
              No users have been added yet.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Overview;