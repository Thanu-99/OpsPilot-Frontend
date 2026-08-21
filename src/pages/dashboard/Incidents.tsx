import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  Package,
  RefreshCw,
  ShoppingCart,
  Sparkles,
  TrendingDown,
  Zap,
} from "lucide-react";

import {
  getDashboardSummary,
  getInventory,
  getInventoryAnalytics,
  getOrders,
} from "../../lib/api";

import type {
  DashboardSummary,
  InventoryAnalytics,
  InventoryItem,
  Order,
} from "../../lib/api";

type SignalSeverity =
  | "critical"
  | "warning"
  | "info";

type Signal = {
  id: string;
  severity: SignalSeverity;
  icon: LucideIcon;
  title: string;
  description: string;
  meta: string;
  action: string;
  target: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function statusStyles(status: Order["status"]) {
  switch (status) {
    case "DELIVERED":
      return "border-emerald-400/15 bg-emerald-400/[0.07] text-emerald-300";

    case "CANCELLED":
      return "border-rose-400/15 bg-rose-400/[0.07] text-rose-300";

    case "SHIPPED":
      return "border-blue-400/15 bg-blue-400/[0.07] text-blue-300";

    case "PROCESSING":
    case "CONFIRMED":
      return "border-violet-400/15 bg-violet-400/[0.07] text-violet-300";

    default:
      return "border-amber-400/15 bg-amber-400/[0.07] text-amber-300";
  }
}

function severityStyles(
  severity: SignalSeverity,
) {
  switch (severity) {
    case "critical":
      return {
        badge:
          "border-rose-400/15 bg-rose-400/[0.08] text-rose-300",
        icon:
          "border-rose-400/15 bg-rose-400/[0.08] text-rose-300",
        dot: "bg-rose-400",
      };

    case "warning":
      return {
        badge:
          "border-amber-400/15 bg-amber-400/[0.08] text-amber-300",
        icon:
          "border-amber-400/15 bg-amber-400/[0.08] text-amber-300",
        dot: "bg-amber-400",
      };

    default:
      return {
        badge:
          "border-blue-400/15 bg-blue-400/[0.08] text-blue-300",
        icon:
          "border-blue-400/15 bg-blue-400/[0.08] text-blue-300",
        dot: "bg-blue-400",
      };
  }
}

function Incidents() {
  const navigate = useNavigate();

  const [summary, setSummary] =
    useState<DashboardSummary | null>(null);

  const [
    inventoryAnalytics,
    setInventoryAnalytics,
  ] = useState<InventoryAnalytics | null>(
    null,
  );

  const [inventory, setInventory] = useState<
    InventoryItem[]
  >([]);

  const [orders, setOrders] = useState<Order[]>(
    [],
  );

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  const loadData = useCallback(
    async (showRefreshState = false) => {
      setError("");

      if (showRefreshState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const [
          summaryData,
          inventoryAnalyticsData,
          inventoryData,
          orderData,
        ] = await Promise.all([
          getDashboardSummary(),
          getInventoryAnalytics(),
          getInventory(),
          getOrders(),
        ]);

        setSummary(summaryData);
        setInventoryAnalytics(
          inventoryAnalyticsData,
        );
        setInventory(inventoryData);
        setOrders(orderData);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load operational data.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const signals = useMemo<Signal[]>(() => {
    const generatedSignals: Signal[] = [];

    const outOfStock = inventory.filter(
      (item) => item.quantity <= 0,
    );

    const lowStock = inventory.filter(
      (item) =>
        item.quantity > 0 &&
        item.quantity <= item.reorderLevel,
    );

    outOfStock.slice(0, 4).forEach((item) => {
      generatedSignals.push({
        id: `out-of-stock-${item.id}`,
        severity: "critical",
        icon: Package,
        title: `${item.productName} is out of stock`,
        description:
          "No units are currently available. Incoming demand may be blocked until inventory is restored.",
        meta: "Immediate inventory risk",
        action: "Open products",
        target: "/products",
      });
    });

    lowStock.slice(0, 5).forEach((item) => {
      generatedSignals.push({
        id: `low-stock-${item.id}`,
        severity: "warning",
        icon: TrendingDown,
        title: `${item.productName} is running low`,
        description: `${item.quantity} units remain against a reorder level of ${item.reorderLevel}.`,
        meta: "Restock recommended",
        action: "Review stock",
        target: "/products",
      });
    });

    const pendingOrders = orders.filter(
      (order) => order.status === "PENDING",
    );

    if (pendingOrders.length > 0) {
      generatedSignals.push({
        id: "pending-orders",
        severity: "info",
        icon: ShoppingCart,
        title: `${pendingOrders.length} pending order${
          pendingOrders.length === 1 ? "" : "s"
        } require attention`,
        description:
          "These orders are waiting for confirmation or the next operational workflow step.",
        meta: "Order workflow",
        action: "Ask Copilot",
        target: "/ai-copilot",
      });
    }

    return generatedSignals.slice(0, 8);
  }, [inventory, orders]);

  const processedOrders = orders.filter(
    (order) =>
      order.status !== "PENDING" &&
      order.status !== "CANCELLED",
  ).length;

  const criticalSignals = signals.filter(
    (signal) =>
      signal.severity === "critical",
  ).length;

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-76px)] bg-[#09090b] px-6 py-10 text-zinc-100 lg:px-10">
        <div className="mx-auto max-w-7xl animate-pulse space-y-8">
          <div>
            <div className="h-3 w-28 rounded bg-white/[0.07]" />
            <div className="mt-4 h-10 w-80 max-w-full rounded bg-white/[0.07]" />
            <div className="mt-3 h-4 w-[28rem] max-w-full rounded bg-white/[0.07]" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-32 rounded-2xl border border-white/[0.07] bg-white/[0.025]"
              />
            ))}
          </div>

          <div className="h-96 rounded-2xl border border-white/[0.07] bg-white/[0.025]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-76px)] bg-[#09090b] text-zinc-100">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-6 border-b border-white/[0.07] pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">
              <Zap size={14} />
              Operations intelligence
            </div>

            <h1 className="text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">
              Incidents and signals.
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              Monitor inventory exposure and order
              workflow signals that may require
              immediate company action.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              void loadData(true)
            }
            disabled={refreshing}
            className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-lg border border-white/[0.09] bg-white/[0.035] px-4 text-sm font-medium text-zinc-200 transition hover:border-white/[0.16] hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50 lg:self-auto"
          >
            <RefreshCw
              size={15}
              className={
                refreshing ? "animate-spin" : ""
              }
            />
            Refresh signals
          </button>
        </header>

        {error ? (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-rose-400/15 bg-rose-400/[0.06] p-4 text-sm text-rose-200">
            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-medium">
                Couldn’t load operational data
              </p>

              <p className="mt-1 text-rose-200/70">
                {error}
              </p>
            </div>
          </div>
        ) : null}

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-rose-400/[0.13] bg-rose-400/[0.035] p-5">
            <div className="flex items-center justify-between">
              <span className="grid size-9 place-items-center rounded-lg border border-rose-400/15 bg-rose-400/[0.07] text-rose-300">
                <AlertTriangle size={17} />
              </span>

              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-rose-200/40">
                Live
              </span>
            </div>

            <p className="mt-5 text-sm text-zinc-500">
              Active signals
            </p>

            <div className="mt-2 flex items-end gap-3">
              <span className="text-3xl font-semibold tracking-[-0.04em] text-white">
                {signals.length}
              </span>

              <span className="pb-1 text-xs text-zinc-600">
                {criticalSignals} critical
              </span>
            </div>
          </article>

          <article className="rounded-2xl border border-amber-400/[0.13] bg-amber-400/[0.035] p-5">
            <span className="grid size-9 place-items-center rounded-lg border border-amber-400/15 bg-amber-400/[0.07] text-amber-300">
              <Package size={17} />
            </span>

            <p className="mt-5 text-sm text-zinc-500">
              Inventory risk
            </p>

            <div className="mt-2 flex items-end gap-3">
              <span className="text-3xl font-semibold tracking-[-0.04em] text-white">
                {inventoryAnalytics?.lowStockItems ??
                  0}
              </span>

              <span className="pb-1 text-xs text-zinc-600">
                {inventoryAnalytics?.outOfStockItems ??
                  0}{" "}
                out of stock
              </span>
            </div>
          </article>

          <article className="rounded-2xl border border-emerald-400/[0.13] bg-emerald-400/[0.035] p-5">
            <span className="grid size-9 place-items-center rounded-lg border border-emerald-400/15 bg-emerald-400/[0.07] text-emerald-300">
              <CheckCircle2 size={17} />
            </span>

            <p className="mt-5 text-sm text-zinc-500">
              Orders processed
            </p>

            <div className="mt-2 flex items-end gap-3">
              <span className="text-3xl font-semibold tracking-[-0.04em] text-white">
                {processedOrders}
              </span>

              <span className="pb-1 text-xs text-zinc-600">
                {summary?.pendingOrders ?? 0} pending
              </span>
            </div>
          </article>
        </section>

        <section className="relative mt-6 overflow-hidden rounded-2xl border border-violet-400/15 bg-violet-500/[0.045]">
          <div className="absolute inset-y-0 left-0 w-1 bg-violet-400/70" />
          <div className="absolute -right-16 -top-16 size-52 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-start gap-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-violet-400/15 bg-violet-400/[0.08] text-violet-300">
                <Sparkles size={18} />
              </span>

              <div>
                <p className="text-sm font-semibold text-white">
                  OpsPilot signal briefing
                </p>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
                  {signals.length
                    ? `${signals.length} operational signal${
                        signals.length === 1
                          ? " requires"
                          : "s require"
                      } review. ${
                        inventoryAnalytics?.outOfStockItems ??
                        0
                      } product${
                        inventoryAnalytics?.outOfStockItems ===
                        1
                          ? " is"
                          : "s are"
                      } currently out of stock.`
                    : "No immediate inventory or order risks are visible from the available company data."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/ai-copilot")
              }
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-violet-200"
            >
              Analyze with AI
              <ArrowRight size={15} />
            </button>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600">
                Attention required
              </p>

              <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-white">
                Operational signals
              </h2>
            </div>

            <span className="text-xs text-zinc-600">
              {signals.length} detected
            </span>
          </div>

          {signals.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] px-6 py-14 text-center">
              <span className="mx-auto grid size-11 place-items-center rounded-full border border-emerald-400/15 bg-emerald-400/[0.07] text-emerald-300">
                <CheckCircle2 size={20} />
              </span>

              <h3 className="mt-4 text-sm font-semibold text-white">
                Everything looks healthy
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
                No inventory or pending-order
                signals currently require attention.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02]">
              {signals.map((signal, index) => {
                const Icon = signal.icon;
                const styles = severityStyles(
                  signal.severity,
                );

                return (
                  <article
                    key={signal.id}
                    className={`group flex flex-col gap-5 px-5 py-5 transition hover:bg-white/[0.025] sm:flex-row sm:items-center sm:px-6 ${
                      index !==
                      signals.length - 1
                        ? "border-b border-white/[0.06]"
                        : ""
                    }`}
                  >
                    <span
                      className={`grid size-10 shrink-0 place-items-center rounded-xl border ${styles.icon}`}
                    >
                      <Icon size={18} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-white">
                          {signal.title}
                        </h3>

                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${styles.badge}`}
                        >
                          {signal.severity}
                        </span>
                      </div>

                      <p className="mt-1.5 max-w-2xl text-sm leading-6 text-zinc-500">
                        {signal.description}
                      </p>

                      <div className="mt-2 flex items-center gap-2 text-[11px] text-zinc-600">
                        <span
                          className={`size-1.5 rounded-full ${styles.dot}`}
                        />
                        {signal.meta}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(signal.target)
                      }
                      className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-zinc-400 transition group-hover:text-white"
                    >
                      {signal.action}
                      <ChevronRight size={15} />
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-10">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600">
              Activity
            </p>

            <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-white">
              Recent orders
            </h2>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02]">
            {orders.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-zinc-500">
                No orders are available yet.
              </div>
            ) : (
              orders
                .slice(0, 7)
                .map((order, index) => (
                  <article
                    key={order.id}
                    className={`flex flex-col gap-4 px-5 py-4 transition hover:bg-white/[0.025] sm:flex-row sm:items-center sm:justify-between sm:px-6 ${
                      index !==
                      Math.min(
                        orders.length,
                        7,
                      ) -
                        1
                        ? "border-b border-white/[0.06]"
                        : ""
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/[0.07] bg-white/[0.035] text-zinc-400">
                        <ShoppingCart size={15} />
                      </span>

                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white">
                          Order #{order.id}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-zinc-600">
                          {order.items?.length ?? 0}{" "}
                          item
                          {(order.items?.length ??
                            0) === 1
                            ? ""
                            : "s"}{" "}
                          ·{" "}
                          {formatTime(
                            order.createdAt,
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-5 sm:justify-end">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusStyles(
                          order.status,
                        )}`}
                      >
                        {order.status}
                      </span>

                      <span className="min-w-[100px] text-right text-sm font-semibold text-zinc-200">
                        {formatCurrency(
                          Number(
                            order.totalAmount,
                          ),
                        )}
                      </span>
                    </div>
                  </article>
                ))
            )}
          </div>
        </section>

        <section className="mt-10 border-t border-white/[0.07] py-10">
          <div className="flex flex-col gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-center gap-4">
              <span className="grid size-10 place-items-center rounded-xl border border-violet-400/15 bg-violet-400/[0.08] text-violet-300">
                <Bot size={18} />
              </span>

              <div>
                <p className="text-sm font-semibold text-white">
                  Need a deeper explanation?
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  Ask Copilot to connect signals
                  with company tasks and operations.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/ai-copilot")
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/[0.09] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-violet-400/20 hover:bg-violet-400/[0.06] hover:text-white"
            >
              Open AI Copilot
              <ArrowRight size={15} />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Incidents;
