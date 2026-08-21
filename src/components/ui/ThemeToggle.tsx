import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import {
  getTheme,
  saveTheme,
  subscribeToTheme,
} from "../../lib/theme";
import type { AppTheme } from "../../lib/theme";

type ThemeToggleProps = {
  className?: string;
};

function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const [theme, setTheme] = useState<AppTheme>(getTheme);

  useEffect(() => subscribeToTheme(setTheme), []);

  const nextTheme = theme === "dark" ? "light" : "dark";
  const label = `Switch to ${nextTheme} theme`;

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => saveTheme(nextTheme)}
      className={`theme-toggle grid size-10 shrink-0 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-zinc-300 transition hover:border-violet-400/30 hover:bg-white/[0.08] hover:text-white ${className}`}
    >
      {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

export default ThemeToggle;
