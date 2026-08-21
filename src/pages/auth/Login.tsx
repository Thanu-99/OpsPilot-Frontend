import { useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowRight,
  Command,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { login, saveToken } from "../../lib/api";
import { getWorkspacePath, saveCurrentUser } from "../../lib/session";
import ThemeToggle from "../../components/ui/ThemeToggle";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await login(email, password);

      if (
        !response.token ||
        !response.role ||
        !response.userId ||
        !response.firstName ||
        !response.lastName ||
        !response.companyId
      ) {
        throw new Error(
          "The server did not return your workspace details. Restart Spring Boot and try again.",
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
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-[#09090b] px-5 py-10 text-zinc-100">
      <ThemeToggle className="absolute right-5 top-5 z-20" />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.18),transparent_32%),linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:auto,72px_72px,72px_72px]"
      />

      <div className="relative w-full max-w-md">
        <Link to="/" className="mb-10 flex items-center justify-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-lg bg-violet-500 text-white shadow-lg shadow-violet-950/40">
            <Command size={18} strokeWidth={2.5} />
          </span>
          <span className="text-[17px] font-semibold tracking-[-0.03em] text-white">
            OpsPilot
          </span>
        </Link>

        <div className="rounded-2xl border border-white/[0.09] bg-[#111113]/90 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">
              Welcome back
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
              Sign in to OpsPilot.
            </h1>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Access your operations workspace and AI intelligence.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-zinc-300">
                Email address
              </span>
              <span className="flex items-center gap-3 rounded-lg border border-white/[0.09] bg-black/20 px-3.5 py-3 transition focus-within:border-violet-400/50">
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
              <span className="flex items-center gap-3 rounded-lg border border-white/[0.09] bg-black/20 px-3.5 py-3 transition focus-within:border-violet-400/50">
                <LockKeyhole size={17} className="text-zinc-500" />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
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
              {isSubmitting ? "Signing in…" : "Sign in"}
              <ArrowRight size={16} />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-400">
            New to OpsPilot?{" "}
            <Link
              to="/register"
              className="font-semibold text-violet-300 transition hover:text-violet-200"
            >
              Create an account
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-600">
          Secure operations intelligence for modern teams.
        </p>
      </div>
    </div>
  );
}

export default Login;
