import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  CircleDotDashed,
  ClipboardList,
  LoaderCircle,
  Plus,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { getManagerTeam, getMyWorkTasks } from "../../lib/api";
import type { WorkTask, WorkspaceUser } from "../../lib/api";
import { createManagerTask } from "../../lib/managerTasks";

const statusLabel: Record<WorkTask["status"], string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  IN_REVIEW: "In review",
  COMPLETED: "Completed",
  BLOCKED: "Blocked",
};

const statusStyle: Record<WorkTask["status"], string> = {
  TODO: "bg-zinc-400/10 text-zinc-300 ring-zinc-400/15",
  IN_PROGRESS: "bg-sky-400/10 text-sky-300 ring-sky-400/15",
  IN_REVIEW: "bg-violet-400/10 text-violet-300 ring-violet-400/15",
  COMPLETED: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/15",
  BLOCKED: "bg-rose-400/10 text-rose-300 ring-rose-400/15",
};

const priorityStyle: Record<WorkTask["priority"], string> = {
  LOW: "text-zinc-400",
  MEDIUM: "text-sky-300",
  HIGH: "text-amber-300",
  URGENT: "text-rose-300",
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

function MemberAvatar({ member }: { member: WorkspaceUser }) {
  const initials = `${member.firstName[0] ?? ""}${member.lastName[0] ?? ""}`;

  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-400 to-indigo-600 text-xs font-semibold text-white">
      {initials.toUpperCase()}
    </span>
  );
}

function ManagerWorkspace() {
  const [team, setTeam] = useState<WorkspaceUser[]>([]);
  const [tasks, setTasks] = useState<WorkTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [composerOpen, setComposerOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [assignedEmployeeId, setAssignedEmployeeId] = useState("");
  const [priority, setPriority] =
    useState<WorkTask["priority"]>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [creatingTask, setCreatingTask] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadWorkspace() {
      try {
        setLoading(true);
        setError("");

        const [teamData, taskData] = await Promise.all([
          getManagerTeam(),
          getMyWorkTasks(),
        ]);

        if (!active) return;

        setTeam(teamData);
        setTasks(taskData);
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your manager workspace.",
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadWorkspace();

    return () => {
      active = false;
    };
  }, []);

  const overview = useMemo(() => {
    const activeTasks = tasks.filter((task) => task.status !== "COMPLETED");
    const completedTasks = tasks.filter(
      (task) => task.status === "COMPLETED",
    );
    const blockedTasks = tasks.filter((task) => task.status === "BLOCKED");
    const overdueTasks = tasks.filter(isOverdue);

    return {
      activeTasks,
      completedTasks,
      blockedTasks,
      overdueTasks,
      completionRate: tasks.length
        ? Math.round((completedTasks.length / tasks.length) * 100)
        : 0,
    };
  }, [tasks]);

  const teamRows = useMemo(
    () =>
      team.map((member) => {
        const memberTasks = tasks.filter(
          (task) => task.assignedToUserId === member.id,
        );

        return {
          member,
          total: memberTasks.length,
          active: memberTasks.filter((task) => task.status !== "COMPLETED")
            .length,
          blocked: memberTasks.filter((task) => task.status === "BLOCKED")
            .length,
          completed: memberTasks.filter(
            (task) => task.status === "COMPLETED",
          ).length,
        };
      }),
    [team, tasks],
  );

  const focusTasks = useMemo(
    () =>
      [...overview.activeTasks]
        .sort((a, b) => {
          if (isOverdue(a) !== isOverdue(b)) {
            return isOverdue(a) ? -1 : 1;
          }

          return (
            new Date(a.dueDate ?? "9999-12-31").getTime() -
            new Date(b.dueDate ?? "9999-12-31").getTime()
          );
        })
        .slice(0, 6),
    [overview.activeTasks],
  );

  function closeComposer() {
    setComposerOpen(false);
    setCreateError("");
  }

  async function handleCreateTask() {
    if (!taskTitle.trim() || !assignedEmployeeId) {
      setCreateError("Enter a task title and choose a team member.");
      return;
    }

    try {
      setCreatingTask(true);
      setCreateError("");

      const createdTask = await createManagerTask({
        title: taskTitle.trim(),
        description: taskDescription.trim(),
        priority,
        assignedToUserId: Number(assignedEmployeeId),
        dueDate,
      });

      setTasks((current) => [...current, createdTask]);
      setTaskTitle("");
      setTaskDescription("");
      setAssignedEmployeeId("");
      setPriority("MEDIUM");
      setDueDate("");
      setComposerOpen(false);
    } catch (err) {
      setCreateError(
        err instanceof Error
          ? err.message
          : "Unable to assign this task.",
      );
    } finally {
      setCreatingTask(false);
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-[calc(100vh-81px)] place-items-center bg-[#09090b] px-6">
        <div className="flex items-center gap-3 text-sm text-zinc-400">
          <LoaderCircle className="size-5 animate-spin text-violet-300" />
          Loading your team workspace…
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
            Manager workspace unavailable
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
        className="mx-auto max-w-[1480px]"
      >
        <div className="flex flex-col justify-between gap-5 border-b border-white/[0.08] pb-7 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
              Team command center
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">
              Keep the work moving.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">
              A live view of your team’s workload, priorities, and deadlines.
            </p>
          </div>

          <button
            type="button"
            disabled={!team.length}
            onClick={() => setComposerOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={17} />
            Assign work
          </button>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Team members",
              value: team.length,
              detail: "Direct reports",
              icon: UsersRound,
              color: "text-violet-300",
            },
            {
              label: "Active work",
              value: overview.activeTasks.length,
              detail: "Across your department",
              icon: CircleDotDashed,
              color: "text-sky-300",
            },
            {
              label: "Completion rate",
              value: `${overview.completionRate}%`,
              detail: `${overview.completedTasks.length} tasks completed`,
              icon: CheckCircle2,
              color: "text-emerald-300",
            },
            {
              label: "Needs attention",
              value: overview.overdueTasks.length + overview.blockedTasks.length,
              detail: "Overdue or blocked",
              icon: AlertTriangle,
              color: "text-amber-300",
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

        <div className="mt-7 grid gap-7 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.8fr)]">
          <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025]">
            <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Priority queue
                </h2>
                <p className="mt-1 text-xs text-zinc-500">
                  Work that needs your attention first.
                </p>
              </div>
              <ClipboardList size={18} className="text-zinc-500" />
            </div>

            {focusTasks.length ? (
              <div className="divide-y divide-white/[0.07]">
                {focusTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium text-zinc-100">
                          {task.title}
                        </p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${
                            statusStyle[task.status]
                          }`}
                        >
                          {statusLabel[task.status]}
                        </span>
                      </div>
                      <p className="mt-1.5 line-clamp-1 text-xs text-zinc-500">
                        {task.description || "No additional details provided."}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-5 text-xs">
                      <span
                        className={`font-medium ${
                          priorityStyle[task.priority]
                        }`}
                      >
                        {task.priority.toLowerCase()}
                      </span>
                      <span
                        className={
                          isOverdue(task)
                            ? "font-medium text-rose-300"
                            : "text-zinc-400"
                        }
                      >
                        {isOverdue(task)
                          ? `Overdue · ${shortDate(task.dueDate)}`
                          : shortDate(task.dueDate)}
                      </span>
                      <ArrowUpRight size={15} className="text-zinc-600" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-14 text-center">
                <CheckCircle2 className="mx-auto size-6 text-emerald-300" />
                <p className="mt-3 text-sm font-medium text-zinc-200">
                  Nothing urgent right now
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Assign work to a team member to begin.
                </p>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Deadline watch
                </h2>
                <p className="mt-1 text-xs text-zinc-500">
                  Upcoming and overdue work.
                </p>
              </div>
              <CalendarClock size={18} className="text-zinc-500" />
            </div>

            <div className="mt-6 space-y-3">
              {focusTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-black/10 p-3"
                >
                  <span
                    className={`size-2 rounded-full ${
                      isOverdue(task)
                        ? "bg-rose-400"
                        : task.priority === "URGENT"
                          ? "bg-amber-400"
                          : "bg-violet-400"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-zinc-200">
                      {task.title}
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-500">
                      {shortDate(task.dueDate)}
                    </p>
                  </div>
                  <span className="text-[10px] font-medium text-zinc-500">
                    {statusLabel[task.status]}
                  </span>
                </div>
              ))}

              {!focusTasks.length ? (
                <p className="py-7 text-center text-xs text-zinc-500">
                  No open deadlines yet.
                </p>
              ) : null}
            </div>
          </section>
        </div>

        <section className="mt-7 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025]">
          <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-white">Your team</h2>
              <p className="mt-1 text-xs text-zinc-500">
                Individual workload at a glance.
              </p>
            </div>
            <span className="rounded-md bg-white/[0.06] px-2 py-1 text-xs font-medium text-zinc-300">
              {team.length} people
            </span>
          </div>

          {teamRows.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left">
                <thead className="border-b border-white/[0.07] text-[10px] font-semibold uppercase tracking-[0.13em] text-zinc-500">
                  <tr>
                    <th className="px-5 py-3">Member</th>
                    <th className="px-5 py-3">Active work</th>
                    <th className="px-5 py-3">Completed</th>
                    <th className="px-5 py-3">Blocked</th>
                    <th className="px-5 py-3">Workload</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.07]">
                  {teamRows.map((row) => (
                    <tr key={row.member.id} className="text-sm">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <MemberAvatar member={row.member} />
                          <div>
                            <p className="font-medium text-zinc-100">
                              {row.member.firstName} {row.member.lastName}
                            </p>
                            <p className="mt-0.5 text-xs text-zinc-500">
                              {row.member.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-medium text-zinc-200">
                        {row.active}
                      </td>
                      <td className="px-5 py-4 text-emerald-300">
                        {row.completed}
                      </td>
                      <td className="px-5 py-4 text-rose-300">
                        {row.blocked || "—"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/[0.07]">
                            <div
                              className="h-full rounded-full bg-violet-400"
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(
                                    8,
                                    row.total
                                      ? (row.active / Math.max(row.total, 6)) *
                                          100
                                      : 0,
                                  ),
                                )}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-zinc-500">
                            {row.total} total
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-5 py-14 text-center">
              <UsersRound className="mx-auto size-6 text-zinc-600" />
              <p className="mt-3 text-sm font-medium text-zinc-200">
                Your team is not assigned yet
              </p>
              <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-zinc-500">
                Ask an Administrator to assign employees to your team in
                People & Teams.
              </p>
            </div>
          )}
        </section>
      </motion.section>

      {composerOpen ? (
        <div className="fixed inset-0 z-[90] flex items-end bg-black/65 p-4 backdrop-blur-sm sm:items-center sm:justify-center">
          <button
            aria-label="Close task composer"
            onClick={closeComposer}
            className="absolute inset-0"
          />

          <motion.section
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-xl rounded-2xl border border-white/[0.1] bg-[#121214] p-5 shadow-2xl shadow-black/60 sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">
                  New assignment
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.035em] text-white">
                  Give your team clarity.
                </h2>
              </div>
              <button
                type="button"
                onClick={closeComposer}
                className="grid size-9 place-items-center rounded-lg text-zinc-400 transition hover:bg-white/[0.07] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs font-medium text-zinc-400">
                  Task title
                </span>
                <input
                  autoFocus
                  value={taskTitle}
                  onChange={(event) => setTaskTitle(event.target.value)}
                  placeholder="What needs to be done?"
                  className="w-full rounded-xl border border-white/[0.09] bg-black/20 px-3.5 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-400/50"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-medium text-zinc-400">
                  Notes <span className="text-zinc-600">(optional)</span>
                </span>
                <textarea
                  value={taskDescription}
                  onChange={(event) => setTaskDescription(event.target.value)}
                  placeholder="Add useful context or expected outcome"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-white/[0.09] bg-black/20 px-3.5 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-400/50"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-medium text-zinc-400">
                    Assign to
                  </span>
                  <select
                    value={assignedEmployeeId}
                    onChange={(event) =>
                      setAssignedEmployeeId(event.target.value)
                    }
                    className="w-full rounded-xl border border-white/[0.09] bg-black/20 px-3.5 py-3 text-sm text-white outline-none focus:border-violet-400/50"
                  >
                    <option value="">Choose a team member</option>
                    {team.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.firstName} {member.lastName}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-medium text-zinc-400">
                    Deadline <span className="text-zinc-600">(optional)</span>
                  </span>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(event) => setDueDate(event.target.value)}
                    className="w-full rounded-xl border border-white/[0.09] bg-black/20 px-3.5 py-3 text-sm text-white outline-none focus:border-violet-400/50"
                  />
                </label>
              </div>

              <div>
                <span className="mb-2 block text-xs font-medium text-zinc-400">
                  Priority
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {(["LOW", "MEDIUM", "HIGH", "URGENT"] as const).map(
                    (item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setPriority(item)}
                        className={`rounded-lg border px-2 py-2.5 text-xs font-semibold transition ${
                          priority === item
                            ? "border-violet-400/50 bg-violet-400/15 text-violet-200"
                            : "border-white/[0.08] bg-white/[0.025] text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200"
                        }`}
                      >
                        {item.toLowerCase()}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {createError ? (
                <p className="rounded-xl border border-rose-400/15 bg-rose-400/[0.05] px-3.5 py-3 text-sm text-rose-200">
                  {createError}
                </p>
              ) : null}

              <button
                type="button"
                disabled={creatingTask}
                onClick={() => void handleCreateTask()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creatingTask ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                {creatingTask ? "Assigning…" : "Assign task"}
              </button>
            </div>
          </motion.section>
        </div>
      ) : null}
    </div>
  );
}

export default ManagerWorkspace;