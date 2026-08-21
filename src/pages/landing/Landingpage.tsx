import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Check,
  CircleAlert,
  Command,
  Database,
  Menu,
  PackageSearch,
  Play,
  Sparkles,
  Workflow,
} from "lucide-react";
import { Link } from "react-router-dom";

import HeroVideo from "../../components/landing/HeroVideo";
import Sidebar from "../../components/layout/Sidebar";

const productFeatures = [
  {
    icon: CircleAlert,
    title: "Know what needs attention",
    text: "Surface the exceptions, risks, and opportunities buried in everyday operations.",
  },
  {
    icon: PackageSearch,
    title: "See the full picture",
    text: "Connect revenue, inventory, orders, and team activity in one operating view.",
  },
  {
    icon: Bot,
    title: "Ask, decide, act",
    text: "Turn natural-language questions into clear insights and practical next steps.",
  },
];

const workflowSteps = [
  {
    number: "01",
    icon: Database,
    title: "Connect your operation",
    text: "Bring your daily operational signals into one reliable, connected workspace.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Let AI find the signal",
    text: "OpsPilot continuously spots changes, risks, patterns, and opportunities worth acting on.",
  },
  {
    number: "03",
    icon: Workflow,
    title: "Move with confidence",
    text: "Get a clear recommendation, understand the reason behind it, and take the next step.",
  },
];

function LandingPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-hidden bg-[#09090b] text-zinc-100">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {sidebarOpen ? (
        <button
          aria-label="Close sidebar overlay"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-[60] cursor-default bg-black/55 backdrop-blur-[2px]"
        />
      ) : null}

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(124,58,237,0.14),transparent_28%),linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:auto,72px_72px,72px_72px]"
      />

      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              className="grid size-10 place-items-center rounded-lg border border-white/[0.08] bg-black/20 text-zinc-300 transition hover:border-white/[0.16] hover:bg-white/[0.08] hover:text-white"
            >
              <Menu size={19} />
            </button>

            <Link to="/" className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-lg bg-violet-500 text-white shadow-lg shadow-violet-950/40">
                <Command size={17} strokeWidth={2.5} />
              </span>
              <span className="hidden text-[15px] font-semibold tracking-[-0.03em] text-white sm:block">
                OpsPilot
              </span>
            </Link>
          </div>

          <div className="hidden items-center gap-7 text-sm text-zinc-300 md:flex">
            <a className="transition hover:text-white" href="#product">
              Product
            </a>
            <a className="transition hover:text-white" href="#intelligence">
              Intelligence
            </a>
            <a className="transition hover:text-white" href="#how-it-works">
              How it works
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden text-sm font-medium text-zinc-300 transition hover:text-white sm:block"
            >
              Sign in
            </Link>

            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
            >
              Get started
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="relative min-h-[760px] overflow-hidden lg:min-h-screen">
          <div className="absolute inset-y-0 right-0 w-full opacity-80 lg:w-[62%]">
            <HeroVideo />
          </div>

          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#09090b_0%,#09090b_37%,rgba(9,9,11,0.83)_48%,rgba(9,9,11,0.16)_72%,rgba(9,9,11,0.05)_100%)]" />

          <div className="relative z-10 mx-auto flex min-h-[760px] max-w-7xl items-center px-5 pb-16 pt-28 sm:px-8 lg:min-h-screen lg:pt-20">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="max-w-3xl"
            >
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/[0.08] px-3 py-1.5 text-xs font-medium text-violet-200">
                <Sparkles size={13} />
                The AI operations platform
              </div>

              <h1 className="max-w-3xl text-balance text-5xl font-semibold leading-[0.96] tracking-[-0.065em] text-white sm:text-6xl lg:text-7xl xl:text-8xl">
                Run your
                <br />
                business.
                <span className="mt-2 block text-zinc-500">
                  Let AI handle
                  <br />
                  the complexity.
                </span>
              </h1>

              <p className="mt-8 max-w-xl text-pretty text-base leading-7 text-zinc-300 sm:text-lg">
                OpsPilot turns operational noise into clear decisions, so your
                team knows what needs attention and what to do next.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
                >
                  Start building
                  <ArrowRight size={16} />
                </Link>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-zinc-100 transition hover:border-white/20 hover:bg-white/[0.08]"
                >
                  <Play size={15} fill="currentColor" />
                  See how it works
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        <section
          id="product"
          className="border-y border-white/[0.07] bg-white/[0.015]"
        >
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">
                One operating view
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl lg:text-5xl">
                Stop chasing updates. Start seeing what matters.
              </h2>
              <p className="mt-5 text-base leading-7 text-zinc-400">
                OpsPilot brings the moving pieces of your business into a
                calmer, clearer place to work.
              </p>
            </div>

            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {productFeatures.map((feature) => {
                const Icon = feature.icon;

                return (
                  <Link
                    key={feature.title}
                    to="/login"
                    className="group rounded-xl border border-white/[0.08] bg-white/[0.025] p-6 transition hover:border-violet-400/25 hover:bg-white/[0.045]"
                  >
                    <span className="grid size-10 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-violet-300 transition group-hover:bg-violet-500/10">
                      <Icon size={19} />
                    </span>

                    <h3 className="mt-8 text-lg font-semibold tracking-[-0.025em] text-white">
                      {feature.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-zinc-400">
                      {feature.text}
                    </p>

                    <span className="mt-7 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-300 transition group-hover:text-violet-300">
                      Explore feature
                      <ArrowUpRight size={15} />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section id="intelligence" className="relative overflow-hidden">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/[0.08] blur-[140px]" />

          <div className="relative mx-auto grid max-w-7xl gap-14 px-5 py-24 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:py-32">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">
                Intelligence that acts
              </p>

              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl lg:text-5xl">
                Ask your business anything.
              </h2>

              <p className="mt-6 max-w-xl text-base leading-7 text-zinc-400">
                OpsPilot does not just show data. It finds the connections
                between what changed, why it changed, and what your team should
                do next.
              </p>

              <ul className="mt-8 space-y-4">
                {[
                  "Identify risks before they become urgent.",
                  "Understand the reason behind a performance change.",
                  "Move from insight to action without leaving your workflow.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-zinc-300">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-violet-500/15 text-violet-300">
                      <Check size={13} strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <a
                href="#how-it-works"
                className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-violet-300 transition hover:text-violet-200"
              >
                See how OpsPilot thinks
                <ArrowRight size={16} />
              </a>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
              className="overflow-hidden rounded-2xl border border-white/[0.1] bg-[#111114] shadow-2xl shadow-black/40"
            >
              <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-8 place-items-center rounded-lg bg-violet-500 text-white">
                    <Bot size={16} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">OpsPilot AI</p>
                    <p className="text-[11px] text-zinc-500">
                      Your operations copilot
                    </p>
                  </div>
                </div>

                <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  Ready
                </span>
              </div>

              <div className="space-y-5 p-5 sm:p-7">
                <div className="ml-auto max-w-[88%] rounded-2xl rounded-tr-sm bg-violet-500 px-4 py-3 text-sm leading-6 text-white">
                  What needs my attention today?
                </div>

                <div className="max-w-[94%] rounded-2xl rounded-tl-sm border border-white/[0.08] bg-white/[0.04] p-4 text-sm leading-6 text-zinc-300">
                  <p>
                    I found three areas worth reviewing. Revenue is healthy
                    overall, but Peak Supply Co. has dropped by{" "}
                    <span className="font-semibold text-rose-300">6.2%</span>{" "}
                    since yesterday.
                  </p>

                  <div className="mt-4 rounded-xl border border-violet-400/15 bg-violet-500/[0.07] p-3.5">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-xs font-semibold text-violet-200">
                        Inventory risk detected
                      </p>
                      <span className="rounded-md bg-violet-400/15 px-2 py-1 text-[10px] font-medium text-violet-200">
                        High impact
                      </span>
                    </div>

                    <p className="mt-2 text-xs leading-5 text-zinc-400">
                      Three best-selling products are running low. This is
                      likely affecting sales availability.
                    </p>

                    <button className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-violet-300">
                      Review recommendation
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-black/20 px-4 py-3 text-sm text-zinc-500">
                  <Sparkles size={15} className="text-violet-300" />
                  Ask a follow-up question…
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="border-y border-white/[0.07] bg-white/[0.015]"
        >
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
            <div className="flex max-w-2xl flex-col gap-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">
                How it works
              </p>

              <h2 className="text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl lg:text-5xl">
                From complexity to a clear next move.
              </h2>

              <p className="text-base leading-7 text-zinc-400">
                OpsPilot is designed to make operational intelligence feel
                simple, useful, and always close at hand.
              </p>
            </div>

            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {workflowSteps.map((step) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.number}
                    className="relative rounded-xl border border-white/[0.08] bg-[#101012] p-6"
                  >
                    <span className="text-xs font-semibold tracking-[0.16em] text-zinc-600">
                      {step.number}
                    </span>

                    <span className="mt-8 grid size-10 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-violet-300">
                      <Icon size={19} />
                    </span>

                    <h3 className="mt-6 text-lg font-semibold tracking-[-0.025em] text-white">
                      {step.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-zinc-400">
                      {step.text}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 flex flex-col items-start justify-between gap-5 rounded-2xl border border-violet-400/15 bg-violet-500/[0.06] px-6 py-6 sm:flex-row sm:items-center sm:px-8">
              <div>
                <p className="text-lg font-semibold tracking-[-0.025em] text-white">
                  Ready to run a calmer operation?
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  Start turning daily complexity into clear decisions.
                </p>
              </div>

              <Link
                to="/register"
                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
              >
                Get started
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.07]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>© 2026 OpsPilot. Built for better operations.</span>

          <div className="flex gap-5">
            <a href="#product" className="transition hover:text-zinc-200">
              Product
            </a>
            <a href="#intelligence" className="transition hover:text-zinc-200">
              Intelligence
            </a>
            <a href="#how-it-works" className="transition hover:text-zinc-200">
              How it works
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
