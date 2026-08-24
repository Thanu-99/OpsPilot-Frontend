import { useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowRight,
  Building2,
  Command,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import GoogleSignInButton from "../../components/auth/GoogleSignInButton";
import {
  googleRegister,
  register,
  saveToken,
  type AuthResponse,
} from "../../lib/api";
import { getWorkspacePath, saveCurrentUser } from "../../lib/session";

function Register() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyId, setCompanyId] = useState("1");
  const [role, setRole] = useState<"ADMIN" | "MANAGER" | "EMPLOYEE">("ADMIN");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function completeAuthentication(response: AuthResponse) {
    if (
      !response.token ||
      !response.role ||
      !response.userId ||
      !response.firstName ||
      !response.lastName ||
      !response.companyId
    ) {
      throw new Error(
        "The server did not return your workspace details. Please try again.",
      );
    }

    saveToken(response.token);

    saveCurrentUser({
      userId: response.userId,
      firstName: response.firstName,
      lastName: response.lastName,
      role: response.role,
      companyId: response.companyId,
    });

    navigate(getWorkspacePath(response.role), { replace: true });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    const parsedCompanyId = Number(companyId);

    if (!Number.isInteger(parsedCompanyId) || parsedCompanyId < 1) {
      setErrorMessage("Enter a valid company ID.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await register({
        firstName,
        lastName,
        email,
        password,
        role,
        companyId: parsedCompanyId,
      });
      completeAuthentication(response);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to create your account. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleCredential(credential: string) {
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await googleRegister(credential);
      completeAuthentication(response);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to continue with Google. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-[#09090b] px-5 py-10 text-zinc-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.18),transparent_32%),linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:auto,72px_72px,72px_72px]"
      />

      <div className="relative w-full max-w-lg">
        <Link to="/" className="mb-10 flex items-center justify-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-lg bg-violet-500 text-white shadow-lg shadow-violet-950/40">
            <Command size={18} strokeWidth={2.5} />
          </span>
          <span className="text-[17px] font-semibold tracking-[-0.03em] text-white">
            OpsPilot
          </span>
        </Link>

        <div className="rounded-2xl border border-white/[0.09] bg-[#111113]/90 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">
            Create workspace access
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
            Start with OpsPilot.
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Create your account, then enter your operations workspace.
          </p>

          <div className="mt-8">
            <GoogleSignInButton
              text="signup_with"
              disabled={isSubmitting}
              onCredential={(credential) =>
                void handleGoogleCredential(credential)
              }
              onError={setErrorMessage}
            />
            <p className="mt-3 text-center text-xs leading-5 text-zinc-500">
              Google signup creates your own private OpsPilot workspace.
            </p>
          </div>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-white/[0.08]" />
            <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-600">
              or register with email
            </span>
            <span className="h-px flex-1 bg-white/[0.08]" />
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-zinc-300">
                  First name
                </span>
                <span className="flex items-center gap-3 rounded-lg border border-white/[0.09] bg-black/20 px-3.5 py-3 focus-within:border-violet-400/50">
                  <UserRound size={17} className="text-zinc-500" />
                  <input
                    required
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    placeholder="Thanu"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
                  />
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-zinc-300">
                  Last name
                </span>
                <span className="flex items-center gap-3 rounded-lg border border-white/[0.09] bg-black/20 px-3.5 py-3 focus-within:border-violet-400/50">
                  <UserRound size={17} className="text-zinc-500" />
                  <input
                    required
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    placeholder="K"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
                  />
                </span>
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-zinc-300">
                Email address
              </span>
              <span className="flex items-center gap-3 rounded-lg border border-white/[0.09] bg-black/20 px-3.5 py-3 focus-within:border-violet-400/50">
                <Mail size={17} className="text-zinc-500" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-zinc-300">
                Password
              </span>
              <span className="flex items-center gap-3 rounded-lg border border-white/[0.09] bg-black/20 px-3.5 py-3 focus-within:border-violet-400/50">
                <LockKeyhole size={17} className="text-zinc-500" />
                <input
                  required
                  minLength={6}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="text-zinc-500 transition hover:text-zinc-200"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>

            <div className="grid gap-5 sm:grid-cols-[1fr_1.25fr]">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-zinc-300">
                  Company ID
                </span>
                <span className="flex items-center gap-3 rounded-lg border border-white/[0.09] bg-black/20 px-3.5 py-3 focus-within:border-violet-400/50">
                  <Building2 size={17} className="text-zinc-500" />
                  <input
                    required
                    min="1"
                    type="number"
                    value={companyId}
                    onChange={(event) => setCompanyId(event.target.value)}
                    className="w-full bg-transparent text-sm text-white outline-none"
                  />
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-zinc-300">
                  Your role
                </span>
                <select
                  value={role}
                  onChange={(event) =>
                    setRole(
                      event.target.value as "ADMIN" | "MANAGER" | "EMPLOYEE",
                    )
                  }
                  className="w-full rounded-lg border border-white/[0.09] bg-black/20 px-3.5 py-3 text-sm text-white outline-none transition focus:border-violet-400/50"
                >
                  <option value="ADMIN">Administrator</option>
                  <option value="MANAGER">Manager</option>
                  <option value="EMPLOYEE">Employee</option>
                </select>
              </label>
            </div>

            <p className="text-xs leading-5 text-zinc-500">
              Use the ID of an existing company in your backend database.
            </p>

            {errorMessage ? (
              <p className="rounded-lg border border-rose-400/20 bg-rose-400/[0.08] px-3.5 py-3 text-sm text-rose-200">
                {errorMessage}
              </p>
            ) : null}

            <button
              disabled={isSubmitting}
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Creating account…" : "Create account"}
              <ArrowRight size={16} />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-violet-300 transition hover:text-violet-200"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
