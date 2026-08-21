import { motion } from "framer-motion";
import {
  AlertTriangle,
  Ban,
  CalendarDays,
  CheckCircle2,
  CircleDotDashed,
  Clock3,
  LoaderCircle,
  ListTodo,
  Play,
  Send,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { getMyWorkTasks } from "../../lib/api";
import type { WorkTask } from "../../lib/api";
import {
  updateMyTaskStatus,
  type EmployeeTaskStatus,
} from "../../lib/employeeTasks";

const statusLabel: Record<WorkTask["status"], string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  IN_REVIEW: "In review",
  COMPLETED: "Completed",
  BLOCKED: "Blocked",
};

const statusStyle: Record<WorkTask["status"], string> = {
  TODO: "bg-zinc-400/10 text-zinc-300",
  IN_PROGRESS: "bg-sky-400/10 text-sky-300",
  IN_REVIEW: "bg-violet-400/10 text-violet-300",
  COMPLETED: "bg-emerald-400/10 text-emerald-300",
  BLOCKED: "bg-rose-400/10 text-rose-300",
};

function shortDate(value: string | null) {
  if (!value) return "No deadline";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function isOverdue(task: WorkTask) {
  if (!task.dueDate || task.status === "COMPLETED") return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return new Date(`${task.dueDate}T00:00:00`) < today;
}

function getPrimaryAction(task: WorkTask): {
  label: string;
  status: EmployeeTaskStatus;
  icon: typeof Play;
} | null {
  if (task.status === "TODO") {
    return {
      label: "Start work",
      status: "IN_PROGRESS",
      icon: Play,
    };
  }

  if (task.status === "IN_PROGRESS") {
    return {
      label: "Send for review",
      status: "IN_REVIEW",
      icon: Send,
    };
  }

  if (task.status === "IN_REVIEW") {
    return {
      label: "Mark complete",
      status: "COMPLETED",
      icon: CheckCircle2,
    };
  }

  if (task.status === "BLOCKED") {
    return {
      label: "Resume work",
      status: "IN_PROGRESS",
      icon: Play,
    };
  }

  return null;
}

function EmployeeWorkspace() {
  const [tasks, setTasks] = useState<WorkTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    async function loadTasks() {
      try {
        setLoading(true);
        setError("");

        const data = await getMyWorkTasks();

        if (active) setTasks(data);
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your work.",
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadTasks();

    return () => {
      active = false;
    };
  }, []);

  const overview = useMemo(() => {
    const activeTasks = tasks.filter((task) => task.status !== "COMPLETED");
    const completedTasks = tasks.filter(
      (task) => task.status === "COMPLETED",
    );
    const overdueTasks = activeTasks.filter(isOverdue);
    const inProgressTasks = tasks.filter(
      (task) => task.status === "IN_PROGRESS",
    );

    return {
      activeTasks,
      completedTasks,
      overdueTasks,
      inProgressTasks,
      completionRate: tasks.length
        ? Math.round((completedTasks.length / tasks.length) * 100)
        : 0,
    };
  }, [tasks]);

  const orderedTasks = useMemo(
    () =>
      [...overview.activeTasks].sort((a, b) => {
        if (isOverdue(a) !== isOverdue(b)) {
          return isOverdue(a) ? -1 : 1;
        }

        return (
          new Date(a.dueDate ?? "9999-12-31").getTime() -
          new Date(b.dueDate ?? "9999-12-31").getTime()
        );
      }),
    [overview.activeTasks],
  );

  async function handleStatusUpdate(
    task: WorkTask,
    status: EmployeeTaskStatus,
  ) {
    try {
      setUpdatingTaskId(task.id);
      setActionError("");

      const updatedTask = await updateMyTaskStatus(task.id, status);

      setTasks((current) =>
        current.map((item) =>
          item.id === updatedTask.id ? updatedTask : item,
        ),
      );
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Unable to update the task.",
      );
    } finally {
      setUpdatingTaskId(null);
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-[calc(100vh-81px)] place-items-center bg-[#09090b] px-6">
        <div className="flex items-center gap-3 text-sm text-zinc-400">
          <LoaderCircle className="size-5 animate-spin text-violet-300" />
          Loading your workspace…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-81px)] bg-[#09090b] px-5 py-8 sm:px-8">
        <div className="mx-auto max-w-2xl rounded-2xl border border-rose-400/15 bg-rose-400/[0.04] p-6">
          <AlertTriangle className="size-5 text-rose-300" />
          <h1 className="mt-4 text-lg font-semibold text-white">
            Your workspace could not load
          </h1>
          <p className="mt-2 text-sm leading-6 text-zinc-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-81px)] bg-[#09090b] px-5 py-7 sm:px-8 lg:px-10">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mx-auto max-w-[1280px]"
      >
        <div className="border-b border-white/[0.08] pb-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
            Personal workspace
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">
            Focus on what matters today.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">
            Your tasks, deadlines, and progress in one calm place.
          </p>
        </div>

        {actionError ? (
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-rose-400/15 bg-rose-400/[0.05] px-4 py-3 text-sm text-rose-200">
            <AlertTriangle size={16} />
            {actionError}
          </div>
        ) : null}

        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Open tasks",
              value: overview.activeTasks.length,
              detail: "Still in your queue",
              icon: ListTodo,
              color: "text-violet-300",
            },
            {
              label: "In progress",
              value: overview.inProgressTasks.length,
              detail: "Currently underway",
              icon: CircleDotDashed,
              color: "text-sky-300",
            },
            {
              label: "Due attention",
              value: overview.overdueTasks.length,
              detail: "Past their deadline",
              icon: AlertTriangle,
              color: "text-rose-300",
            },
            {
              label: "Completed",
              value: `${overview.completionRate}%`,
              detail: `${overview.completedTasks.length} tasks finished`,
              icon: CheckCircle2,
              color: "text-emerald-300",
            },
          ].map((card, index) => {
            const Icon = card.icon;

            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + index * 0.06, duration: 0.4 }}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"
              >
                <div className="flex items-start justify-between">
                  <p className="text-sm font-medium text-zinc-400">
                    {card.label}
                  </p>
                  <span
                    className={`grid size-9 place-items-center rounded-lg bg-white/[0.05] ${card.color}`}
                  >
                    <Icon size={17} />
                  </span>
                </div>
                <p className="mt-6 text-3xl font-semibold tracking-[-0.045em] text-white">
                  {card.value}
                </p>
                <p className="mt-1.5 text-xs text-zinc-500">{card.detail}</p>
              </motion.div>
            );
          })}
        </div>

        <section className="mt-7 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025]">
          <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-white">
                Your work queue
              </h2>
              <p className="mt-1 text-xs text-zinc-500">
                Ordered by what needs attention first.
              </p>
            </div>
            <CalendarDays size={18} className="text-zinc-500" />
          </div>

          {orderedTasks.length ? (
            <div className="divide-y divide-white/[0.07]">
              {orderedTasks.map((task) => {
                const action = getPrimaryAction(task);
                const ActionIcon = action?.icon;
                const updating = updatingTaskId === task.id;

                return (
                  <div key={task.id} className="px-5 py-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-medium text-zinc-100">
                            {task.title}
                          </p>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              statusStyle[task.status]
                            }`}
                          >
                            {statusLabel[task.status]}
                          </span>
                          <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-600">
                            {task.priority}
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs leading-5 text-zinc-500">
                          {task.description ||
                            "No additional details provided."}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <div className="mr-1 flex items-center gap-2 rounded-lg border border-white/[0.07] bg-black/10 px-3 py-2">
                          <Clock3
                            size={14}
                            className={
                              isOverdue(task)
                                ? "text-rose-300"
                                : "text-zinc-500"
                            }
                          />
                          <span
                            className={
                              isOverdue(task)
                                ? "text-xs font-medium text-rose-300"
                                : "text-xs text-zinc-400"
                            }
                          >
                            {isOverdue(task)
                              ? `Overdue · ${shortDate(task.dueDate)}`
                              : shortDate(task.dueDate)}
                          </span>
                        </div>

                        {task.status !== "BLOCKED" ? (
                          <button
                            type="button"
                            disabled={updating}
                            onClick={() =>
                              void handleStatusUpdate(task, "BLOCKED")
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-400/15 bg-rose-400/[0.05] px-3 py-2 text-xs font-medium text-rose-300 transition hover:bg-rose-400/10 disabled:opacity-50"
                          >
                            <Ban size={13} />
                            Blocked
                          </button>
                        ) : null}

                        {action && ActionIcon ? (
                          <button
                            type="button"
                            disabled={updating}
                            onClick={() =>
                              void handleStatusUpdate(task, action.status)
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {updating ? (
                              <LoaderCircle
                                size={13}
                                className="animate-spin"
                              />
                            ) : (
                              <ActionIcon size={13} />
                            )}
                            {action.label}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-5 py-16 text-center">
              <CheckCircle2 className="mx-auto size-7 text-emerald-300" />
              <p className="mt-3 text-sm font-medium text-zinc-200">
                Your queue is clear
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                New work assigned by your Manager will appear here.
              </p>
            </div>
          )}
        </section>

        {overview.completedTasks.length ? (
          <section className="mt-7 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-lg bg-emerald-400/10 text-emerald-300">
                <CheckCircle2 size={17} />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-white">
                  Recently completed
                </h2>
                <p className="mt-0.5 text-xs text-zinc-500">
                  Finished work remains visible for progress tracking.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {overview.completedTasks.slice(0, 6).map((task) => (
                <div
                  key={task.id}
                  className="rounded-xl border border-white/[0.07] bg-black/10 px-4 py-3"
                >
                  <p className="truncate text-sm font-medium text-zinc-200">
                    {task.title}
                  </p>
                  <p className="mt-1 text-xs text-emerald-300">
                    Completed
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </motion.section>
    </div>
  );
}

export default EmployeeWorkspace;