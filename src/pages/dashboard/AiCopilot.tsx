import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { FormEvent } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUp,
  Bot,
  Boxes,
  BriefcaseBusiness,
  Check,
  Clock3,
  Copy,
  Crown,
  FileCheck2,
  PackageSearch,
  RefreshCw,
  Sparkles,
  TriangleAlert,
  UsersRound,
} from "lucide-react";

import { chatWithAi } from "../../lib/api";
import { getCurrentUser } from "../../lib/session";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

type PromptSuggestion = {
  title: string;
  prompt: string;
  icon: LucideIcon;
};

const STORAGE_KEY = "opspilot_ai_messages";

function loadStoredMessages(): ChatMessage[] {
  try {
    const storedMessages =
      sessionStorage.getItem(STORAGE_KEY);

    if (!storedMessages) {
      return [];
    }

    const parsedMessages =
      JSON.parse(storedMessages) as ChatMessage[];

    return Array.isArray(parsedMessages)
      ? parsedMessages
      : [];
  } catch {
    return [];
  }
}

function AiCopilot() {
  const currentUser = getCurrentUser();

  const [messages, setMessages] =
    useState<ChatMessage[]>(loadStoredMessages);

  const [message, setMessage] = useState("");
  const [isSending, setIsSending] =
    useState(false);

  const [elapsedSeconds, setElapsedSeconds] =
    useState(0);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [failedPrompt, setFailedPrompt] =
    useState("");

  const [copiedMessageId, setCopiedMessageId] =
    useState<string | null>(null);

  const scrollAnchorRef =
    useRef<HTMLDivElement>(null);

  const textareaRef =
    useRef<HTMLTextAreaElement>(null);

  const role = currentUser?.role ?? "EMPLOYEE";

  const firstName =
    currentUser?.firstName || "there";

  const initials = `${
    currentUser?.firstName?.charAt(0) ?? "O"
  }${
    currentUser?.lastName?.charAt(0) ?? "P"
  }`;

  const suggestions = useMemo<
    PromptSuggestion[]
  >(() => {
    if (role === "ADMIN") {
      return [
        {
          title: "Company health",
          prompt:
            "Give me a concise company health summary and identify the most urgent risks.",
          icon: Crown,
        },
        {
          title: "People and work",
          prompt:
            "How are our managers and employees doing based on their tasks, deadlines, and blocked work?",
          icon: UsersRound,
        },
        {
          title: "Inventory exposure",
          prompt:
            "Which products are low stock or out of stock, and what needs attention first?",
          icon: PackageSearch,
        },
        {
          title: "Revenue and orders",
          prompt:
            "Summarize our revenue and order performance, including pending orders.",
          icon: BriefcaseBusiness,
        },
      ];
    }

    if (role === "MANAGER") {
      return [
        {
          title: "Team workload",
          prompt:
            "Summarize my team workload and tell me who needs attention.",
          icon: UsersRound,
        },
        {
          title: "Blocked work",
          prompt:
            "Which visible tasks are blocked or overdue, and what should I handle first?",
          icon: TriangleAlert,
        },
        {
          title: "Operational risks",
          prompt:
            "Give me the most important operational risks for my workspace.",
          icon: Boxes,
        },
        {
          title: "Today’s priorities",
          prompt:
            "What should I prioritize today based on my team tasks and current operations?",
          icon: FileCheck2,
        },
      ];
    }

    return [
      {
        title: "My work today",
        prompt:
          "What work should I focus on today?",
        icon: FileCheck2,
      },
      {
        title: "My deadlines",
        prompt:
          "Show my upcoming and overdue deadlines in priority order.",
        icon: Clock3,
      },
      {
        title: "Blocked tasks",
        prompt:
          "Do I have any blocked tasks, and what information is available about them?",
        icon: TriangleAlert,
      },
      {
        title: "Next action",
        prompt:
          "Based on my assigned tasks, what is the best next action for me?",
        icon: Sparkles,
      },
    ];
  }, [role]);

  useEffect(() => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(messages),
    );
  }, [messages]);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isSending, errorMessage]);

  useEffect(() => {
    if (!isSending) {
      setElapsedSeconds(0);
      return;
    }

    const timer = window.setInterval(() => {
      setElapsedSeconds(
        (currentSeconds) =>
          currentSeconds + 1,
      );
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isSending]);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(
      textarea.scrollHeight,
      160,
    )}px`;
  }, [message]);

  async function requestResponse(
    prompt: string,
    includeUserMessage: boolean,
  ) {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt || isSending) {
      return;
    }

    if (includeUserMessage) {
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmedPrompt,
      };

      setMessages((currentMessages) => [
        ...currentMessages,
        userMessage,
      ]);
    }

    setMessage("");
    setErrorMessage("");
    setFailedPrompt("");
    setIsSending(true);

    try {
      const response =
        await chatWithAi(trimmedPrompt);

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.response.trim(),
      };

      setMessages((currentMessages) => [
        ...currentMessages,
        assistantMessage,
      ]);
    } catch (error) {
      setFailedPrompt(trimmedPrompt);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "OpsPilot AI could not complete the response.",
      );
    } finally {
      setIsSending(false);
    }
  }

  function sendMessage(content: string) {
    return requestResponse(content, true);
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    void sendMessage(message);
  }

  function startNewChat() {
    setMessages([]);
    setMessage("");
    setErrorMessage("");
    setFailedPrompt("");
    setCopiedMessageId(null);
    sessionStorage.removeItem(STORAGE_KEY);
    textareaRef.current?.focus();
  }

  async function copyMessage(
    chatMessage: ChatMessage,
  ) {
    await navigator.clipboard.writeText(
      chatMessage.content,
    );

    setCopiedMessageId(chatMessage.id);

    window.setTimeout(() => {
      setCopiedMessageId((currentId) =>
        currentId === chatMessage.id
          ? null
          : currentId,
      );
    }, 1600);
  }

  function getWaitingMessage() {
    if (elapsedSeconds < 5) {
      return "Reading your workspace";
    }

    if (elapsedSeconds < 15) {
      return "Analyzing verified operational data";
    }

    return "Preparing your role-aware briefing";
  }

  const hasConversation = messages.length > 0;

  return (
    <div className="relative flex min-h-[calc(100vh-76px)] overflow-hidden bg-[#09090b] text-zinc-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute left-[8%] top-[12%] size-[420px] rounded-full bg-violet-700/[0.07] blur-[120px]" />
        <div className="absolute bottom-[2%] right-[5%] size-[460px] rounded-full bg-indigo-600/[0.06] blur-[130px]" />

        <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:64px_64px]" />

        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-violet-950/[0.12] to-transparent" />
      </div>

      <div className="relative flex min-w-0 flex-1 flex-col">
        <header className="flex h-[69px] shrink-0 items-center justify-between border-b border-white/[0.07] bg-[#09090b]/75 px-5 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <span className="relative grid size-9 place-items-center rounded-xl bg-violet-500 text-white shadow-lg shadow-violet-950/30">
              <Bot size={18} />
              <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-[#09090b] bg-emerald-400" />
            </span>

            <div>
              <h1 className="text-sm font-semibold text-white">
                OpsPilot AI
              </h1>

              <p className="mt-0.5 text-[11px] text-zinc-500">
                {role === "ADMIN"
                  ? "Company intelligence"
                  : role === "MANAGER"
                    ? "Team and operations intelligence"
                    : "Personal work intelligence"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={startNewChat}
            className="inline-flex items-center gap-2 rounded-lg border border-white/[0.09] bg-white/[0.03] px-3 py-2 text-xs font-medium text-zinc-300 transition hover:border-white/[0.15] hover:bg-white/[0.07] hover:text-white"
          >
            <RefreshCw size={14} />
            New chat
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          {!hasConversation &&
          !isSending &&
          !errorMessage ? (
            <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col items-center justify-center px-5 py-14 text-center sm:px-8">
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl bg-violet-500/20 blur-2xl" />

                <span className="relative grid size-14 place-items-center rounded-2xl border border-violet-300/20 bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-2xl shadow-violet-950/40">
                  <Sparkles size={23} />
                </span>
              </div>

              <p className="mt-7 text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">
                Role-aware operational intelligence
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
                What can I help you understand,
                {` ${firstName}`}?
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-500">
                I can analyze the verified OpsPilot
                information available to your{" "}
                {role.toLowerCase()} account and turn
                it into clear operational answers.
              </p>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
              <div className="space-y-8">
                {messages.map((chatMessage) => (
                  <article
                    key={chatMessage.id}
                    className={`flex gap-3 sm:gap-4 ${
                      chatMessage.role === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    {chatMessage.role ===
                    "assistant" ? (
                      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-violet-500 text-white shadow-md shadow-violet-950/30">
                        <Bot size={16} />
                      </span>
                    ) : null}

                    <div
                      className={`group max-w-[88%] ${
                        chatMessage.role === "user"
                          ? "rounded-2xl rounded-br-md border border-violet-300/10 bg-violet-500 px-4 py-3 text-white shadow-lg shadow-violet-950/10"
                          : "min-w-0 pt-1 text-zinc-300"
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-7">
                        {chatMessage.content}
                      </p>

                      {chatMessage.role ===
                      "assistant" ? (
                        <button
                          type="button"
                          onClick={() =>
                            void copyMessage(
                              chatMessage,
                            )
                          }
                          aria-label="Copy response"
                          className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-zinc-600 transition hover:text-zinc-300"
                        >
                          {copiedMessageId ===
                          chatMessage.id ? (
                            <>
                              <Check size={13} />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy size={13} />
                              Copy
                            </>
                          )}
                        </button>
                      ) : null}
                    </div>

                    {chatMessage.role === "user" ? (
                      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-400 to-indigo-600 text-[10px] font-semibold text-white">
                        {initials}
                      </span>
                    ) : null}
                  </article>
                ))}

                {isSending ? (
                  <article className="flex gap-3 sm:gap-4">
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-violet-500 text-white">
                      <Bot size={16} />
                    </span>

                    <div className="pt-1">
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <span className="flex items-center gap-1">
                          <span className="size-1.5 animate-pulse rounded-full bg-violet-300" />
                          <span className="size-1.5 animate-pulse rounded-full bg-violet-300 [animation-delay:150ms]" />
                          <span className="size-1.5 animate-pulse rounded-full bg-violet-300 [animation-delay:300ms]" />
                        </span>

                        {getWaitingMessage()}
                      </div>

                      <p className="mt-2 text-[11px] text-zinc-600">
                        {elapsedSeconds}s · Local
                        database analysis can take a
                        little longer
                      </p>
                    </div>
                  </article>
                ) : null}

                {errorMessage ? (
                  <article className="flex gap-3 sm:gap-4">
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-rose-500/15 text-rose-300">
                      <TriangleAlert size={16} />
                    </span>

                    <div className="rounded-xl border border-rose-400/20 bg-rose-400/[0.07] px-4 py-3">
                      <p className="text-sm text-rose-100">
                        {errorMessage}
                      </p>

                      {failedPrompt ? (
                        <button
                          type="button"
                          disabled={isSending}
                          onClick={() =>
                            void requestResponse(
                              failedPrompt,
                              false,
                            )
                          }
                          className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-rose-200 transition hover:text-white disabled:opacity-50"
                        >
                          <RefreshCw size={13} />
                          Try again
                        </button>
                      ) : null}
                    </div>
                  </article>
                ) : null}

                <div ref={scrollAnchorRef} />
              </div>
            </div>
          )}
        </main>

        <footer className="shrink-0 border-t border-white/[0.07] bg-[#09090b]/90 px-5 pb-4 pt-3 backdrop-blur-xl sm:px-8">
          <div className="mx-auto max-w-3xl">
            {!hasConversation &&
            !isSending ? (
              <div className="mb-3 grid gap-2 sm:grid-cols-2">
                {suggestions.map(
                  ({
                    title,
                    prompt,
                    icon: Icon,
                  }) => (
                    <button
                      key={title}
                      type="button"
                      onClick={() =>
                        void sendMessage(prompt)
                      }
                      className="group flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3.5 py-3 text-left transition hover:border-violet-400/25 hover:bg-violet-400/[0.055]"
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/[0.05] text-violet-300 transition group-hover:bg-violet-400/10">
                        <Icon size={15} />
                      </span>

                      <span className="min-w-0">
                        <span className="block text-xs font-semibold text-zinc-300 group-hover:text-white">
                          {title}
                        </span>

                        <span className="mt-0.5 block truncate text-[11px] text-zinc-600">
                          {prompt}
                        </span>
                      </span>
                    </button>
                  ),
                )}
              </div>
            ) : null}

            <form onSubmit={handleSubmit}>
              <div className="flex items-end gap-2 rounded-2xl border border-white/[0.11] bg-[#151518]/95 p-2 shadow-2xl shadow-black/20 transition focus-within:border-violet-400/40 focus-within:bg-[#18181c]">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={message}
                  disabled={isSending}
                  onChange={(event) =>
                    setMessage(
                      event.target.value,
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey
                    ) {
                      event.preventDefault();

                      if (message.trim()) {
                        void sendMessage(message);
                      }
                    }
                  }}
                  placeholder="Ask about your operation..."
                  className="max-h-40 min-h-[44px] flex-1 resize-none overflow-y-auto bg-transparent px-3 py-2.5 text-sm leading-6 text-white outline-none placeholder:text-zinc-600 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  disabled={
                    !message.trim() || isSending
                  }
                  type="submit"
                  aria-label="Send message"
                  className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-zinc-950 transition hover:bg-violet-200 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-600"
                >
                  <ArrowUp
                    size={18}
                    strokeWidth={2.5}
                  />
                </button>
              </div>

              <p className="mt-2 text-center text-[10px] leading-4 text-zinc-700">
                OpsPilot uses verified information
                permitted for your account. Confirm
                critical operational decisions.
              </p>
            </form>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default AiCopilot;