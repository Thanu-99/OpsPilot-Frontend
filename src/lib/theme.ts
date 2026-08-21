export type AppTheme = "dark" | "light";

const THEME_KEY = "opspilot_theme";
const THEME_EVENT = "opspilot-theme-change";

export function getTheme(): AppTheme {
  const savedTheme = localStorage.getItem(THEME_KEY);

  if (savedTheme === "dark" || savedTheme === "light") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

export function applyTheme(theme: AppTheme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function initializeTheme() {
  applyTheme(getTheme());
}

export function saveTheme(theme: AppTheme) {
  localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
  window.dispatchEvent(
    new CustomEvent<AppTheme>(THEME_EVENT, { detail: theme }),
  );
}

export function subscribeToTheme(
  listener: (theme: AppTheme) => void,
) {
  const handleThemeChange = (event: Event) => {
    listener((event as CustomEvent<AppTheme>).detail);
  };

  window.addEventListener(THEME_EVENT, handleThemeChange);

  return () => {
    window.removeEventListener(THEME_EVENT, handleThemeChange);
  };
}
