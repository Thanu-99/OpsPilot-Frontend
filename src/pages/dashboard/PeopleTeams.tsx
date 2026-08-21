import { motion } from "framer-motion";
import {
  AlertTriangle,
  Building2,
  Check,
  ChevronDown,
  LoaderCircle,
  Plus,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { getUsers } from "../../lib/api";
import type { WorkspaceUser } from "../../lib/api";
import {
  createDepartment,
  getDepartments,
  updateReportingLine,
} from "../../lib/people";
import type { Department } from "../../lib/people";
import { getCurrentUser } from "../../lib/session";

function initials(user: WorkspaceUser) {
  return `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();
}

function roleLabel(role: WorkspaceUser["role"]) {
  if (role === "ADMIN") return "Administrator";
  if (role === "MANAGER") return "Manager";

  return "Employee";
}

function PeopleTeams() {
  const currentUser = getCurrentUser();

  const [users, setUsers] = useState<WorkspaceUser[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [departmentName, setDepartmentName] = useState("");
  const [departmentDescription, setDepartmentDescription] = useState("");
  const [departmentManagerId, setDepartmentManagerId] = useState("");

  const [employeeId, setEmployeeId] = useState("");
  const [assignmentDepartmentId, setAssignmentDepartmentId] = useState("");
  const [assignmentManagerId, setAssignmentManagerId] = useState("");

  const [creatingDepartment, setCreatingDepartment] = useState(false);
  const [assigningEmployee, setAssigningEmployee] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [allUsers, allDepartments] = await Promise.all([
        getUsers(),
        getDepartments(),
      ]);

      const companyId = currentUser?.companyId;

      setUsers(
        companyId
          ? allUsers.filter((user) => user.companyId === companyId)
          : allUsers,
      );

      setDepartments(
        companyId
          ? allDepartments.filter(
              (department) => department.companyId === companyId,
            )
          : allDepartments,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load people and departments.",
      );
    } finally {
      setLoading(false);
    }
  }, [currentUser?.companyId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const managers = useMemo(
    () => users.filter((user) => user.role === "MANAGER"),
    [users],
  );

  const employees = useMemo(
    () => users.filter((user) => user.role === "EMPLOYEE"),
    [users],
  );

  const unassignedEmployees = useMemo(
    () => employees.filter((user) => !user.managerId || !user.departmentId),
    [employees],
  );

  const managerById = useMemo(
    () => new Map(managers.map((manager) => [manager.id, manager])),
    [managers],
  );

  const departmentById = useMemo(
    () => new Map(departments.map((department) => [department.id, department])),
    [departments],
  );

  async function handleCreateDepartment() {
    const companyId = currentUser?.companyId;

    if (!departmentName.trim()) {
      setNotice("Enter a department name first.");
      return;
    }

    if (!companyId) {
      setNotice("Your company information is missing. Sign in again.");
      return;
    }

    try {
      setCreatingDepartment(true);
      setError("");
      setNotice("");

      await createDepartment({
        name: departmentName.trim(),
        description: departmentDescription.trim(),
        companyId,
        managerId: departmentManagerId ? Number(departmentManagerId) : null,
        active: true,
      });

      setDepartmentName("");
      setDepartmentDescription("");
      setDepartmentManagerId("");
      setNotice("Department created.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create the department.",
      );
    } finally {
      setCreatingDepartment(false);
    }
  }

  async function handleAssignEmployee() {
    if (!employeeId || !assignmentDepartmentId || !assignmentManagerId) {
      setNotice("Choose an employee, department, and manager.");
      return;
    }

    try {
      setAssigningEmployee(true);
      setError("");
      setNotice("");

      await updateReportingLine(Number(employeeId), {
        departmentId: Number(assignmentDepartmentId),
        managerId: Number(assignmentManagerId),
      });

      setEmployeeId("");
      setAssignmentDepartmentId("");
      setAssignmentManagerId("");
      setNotice("Employee assigned to the team.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to assign the employee.",
      );
    } finally {
      setAssigningEmployee(false);
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-[calc(100vh-81px)] place-items-center bg-[#09090b] px-6">
        <div className="flex items-center gap-3 text-sm text-zinc-400">
          <LoaderCircle className="size-5 animate-spin text-violet-300" />
          Loading people and teams…
        </div>
      </div>
    );
  }

  if (error && !users.length && !departments.length) {
    return (
      <div className="min-h-[calc(100vh-81px)] bg-[#09090b] px-5 py-8 sm:px-8">
        <div className="mx-auto max-w-2xl rounded-2xl border border-rose-400/15 bg-rose-400/[0.04] p-6">
          <AlertTriangle className="size-5 text-rose-300" />
          <h1 className="mt-4 text-lg font-semibold text-white">
            People & Teams is unavailable
          </h1>
          <p className="mt-2 text-sm leading-6 text-zinc-400">{error}</p>
          <p className="mt-4 text-xs leading-5 text-zinc-500">
            This page is available only to an Administrator account.
          </p>
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
              Organisation control
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">
              People & Teams
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">
              Structure your company, assign managers, and make every team’s
              workspace reflect real ownership.
            </p>
          </div>

          <div className="flex gap-3">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.13em] text-zinc-500">
                Team members
              </p>
              <p className="mt-1 text-lg font-semibold text-white">
                {employees.length}
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.13em] text-zinc-500">
                Managers
              </p>
              <p className="mt-1 text-lg font-semibold text-white">
                {managers.length}
              </p>
            </div>
          </div>
        </div>

        {error ? (
          <p className="mt-5 rounded-xl border border-rose-400/15 bg-rose-400/[0.05] px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        ) : null}

        {notice ? (
          <p className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.05] px-4 py-3 text-sm text-emerald-200">
            <Check size={16} />
            {notice}
          </p>
        ) : null}

        <div className="mt-7 grid gap-7 xl:grid-cols-2">
          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-violet-400/10 text-violet-300">
                <Building2 size={19} />
              </span>
              <div>
                <h2 className="text-base font-semibold text-white">
                  Create a department
                </h2>
                <p className="mt-1 text-xs text-zinc-500">
                  Give a manager a clear operational home.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              <label>
                <span className="mb-2 block text-xs font-medium text-zinc-400">
                  Department name
                </span>
                <input
                  value={departmentName}
                  onChange={(event) => setDepartmentName(event.target.value)}
                  placeholder="e.g. Sales Operations"
                  className="w-full rounded-xl border border-white/[0.09] bg-black/20 px-3.5 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-400/50"
                />
              </label>

              <label>
                <span className="mb-2 block text-xs font-medium text-zinc-400">
                  Description <span className="text-zinc-600">(optional)</span>
                </span>
                <input
                  value={departmentDescription}
                  onChange={(event) =>
                    setDepartmentDescription(event.target.value)
                  }
                  placeholder="What this department owns"
                  className="w-full rounded-xl border border-white/[0.09] bg-black/20 px-3.5 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-400/50"
                />
              </label>

              <label>
                <span className="mb-2 block text-xs font-medium text-zinc-400">
                  Department manager <span className="text-zinc-600">(optional)</span>
                </span>
                <div className="relative">
                  <select
                    value={departmentManagerId}
                    onChange={(event) =>
                      setDepartmentManagerId(event.target.value)
                    }
                    className="w-full appearance-none rounded-xl border border-white/[0.09] bg-black/20 px-3.5 py-3 text-sm text-white outline-none focus:border-violet-400/50"
                  >
                    <option value="">Assign later</option>
                    {managers.map((manager) => (
                      <option key={manager.id} value={manager.id}>
                        {manager.firstName} {manager.lastName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-3.5 size-4 text-zinc-500" />
                </div>
              </label>

              <button
                type="button"
                disabled={creatingDepartment}
                onClick={() => void handleCreateDepartment()}
                className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creatingDepartment ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                {creatingDepartment ? "Creating…" : "Create department"}
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-sky-400/10 text-sky-300">
                <UserRoundCheck size={19} />
              </span>
              <div>
                <h2 className="text-base font-semibold text-white">
                  Assign an employee
                </h2>
                <p className="mt-1 text-xs text-zinc-500">
                  Connect a person to their department and manager.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              <label>
                <span className="mb-2 block text-xs font-medium text-zinc-400">
                  Employee
                </span>
                <div className="relative">
                  <select
                    value={employeeId}
                    onChange={(event) => setEmployeeId(event.target.value)}
                    className="w-full appearance-none rounded-xl border border-white/[0.09] bg-black/20 px-3.5 py-3 text-sm text-white outline-none focus:border-violet-400/50"
                  >
                    <option value="">Choose an employee</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.lastName}
                        {employee.managerId ? " · already assigned" : ""}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-3.5 size-4 text-zinc-500" />
                </div>
              </label>

              <label>
                <span className="mb-2 block text-xs font-medium text-zinc-400">
                  Department
                </span>
                <div className="relative">
                  <select
                    value={assignmentDepartmentId}
                    onChange={(event) =>
                      setAssignmentDepartmentId(event.target.value)
                    }
                    className="w-full appearance-none rounded-xl border border-white/[0.09] bg-black/20 px-3.5 py-3 text-sm text-white outline-none focus:border-violet-400/50"
                  >
                    <option value="">Choose a department</option>
                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-3.5 size-4 text-zinc-500" />
                </div>
              </label>

              <label>
                <span className="mb-2 block text-xs font-medium text-zinc-400">
                  Reports to
                </span>
                <div className="relative">
                  <select
                    value={assignmentManagerId}
                    onChange={(event) =>
                      setAssignmentManagerId(event.target.value)
                    }
                    className="w-full appearance-none rounded-xl border border-white/[0.09] bg-black/20 px-3.5 py-3 text-sm text-white outline-none focus:border-violet-400/50"
                  >
                    <option value="">Choose a manager</option>
                    {managers.map((manager) => (
                      <option key={manager.id} value={manager.id}>
                        {manager.firstName} {manager.lastName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-3.5 size-4 text-zinc-500" />
                </div>
              </label>

              <button
                type="button"
                disabled={assigningEmployee}
                onClick={() => void handleAssignEmployee()}
                className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.07] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {assigningEmployee ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <UsersRound size={16} />
                )}
                {assigningEmployee ? "Assigning…" : "Assign to team"}
              </button>
            </div>
          </section>
        </div>

        <section className="mt-7 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025]">
          <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-white">
                Company directory
              </h2>
              <p className="mt-1 text-xs text-zinc-500">
                {unassignedEmployees.length
                  ? `${unassignedEmployees.length} employee${
                      unassignedEmployees.length === 1 ? "" : "s"
                    } still need a reporting line.`
                  : "Everyone is connected to a team."}
              </p>
            </div>
            <span className="rounded-md bg-white/[0.06] px-2 py-1 text-xs font-medium text-zinc-300">
              {users.length} people
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left">
              <thead className="border-b border-white/[0.07] text-[10px] font-semibold uppercase tracking-[0.13em] text-zinc-500">
                <tr>
                  <th className="px-5 py-3">Person</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3">Reports to</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.07]">
                {users.map((user) => {
                  const department = user.departmentId
                    ? departmentById.get(user.departmentId)
                    : null;
                  const manager = user.managerId
                    ? managerById.get(user.managerId)
                    : null;

                  return (
                    <tr key={user.id} className="text-sm">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-violet-400 to-indigo-600 text-xs font-semibold text-white">
                            {initials(user)}
                          </span>
                          <div>
                            <p className="font-medium text-zinc-100">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="mt-0.5 text-xs text-zinc-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-zinc-300">
                        {roleLabel(user.role)}
                      </td>
                      <td className="px-5 py-4 text-zinc-400">
                        {department?.name ?? "Not assigned"}
                      </td>
                      <td className="px-5 py-4 text-zinc-400">
                        {manager
                          ? `${manager.firstName} ${manager.lastName}`
                          : user.role === "ADMIN"
                            ? "—"
                            : "Not assigned"}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                            user.active
                              ? "bg-emerald-400/10 text-emerald-300"
                              : "bg-zinc-400/10 text-zinc-400"
                          }`}
                        >
                          {user.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {!users.length ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-14 text-center text-sm text-zinc-500"
                    >
                      No users found for this company yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </motion.section>
    </div>
  );
}

export default PeopleTeams;
