import * as React from "react";

export type AppearanceMode = "light" | "dark";

const STORAGE_KEY = "appearance-mode";

function getInitialMode(): AppearanceMode {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "dark" || stored === "light") return stored;
  return "light";
}

function applyMode(mode: AppearanceMode) {
  const root = document.documentElement;
  root.classList.toggle("dark", mode === "dark");
  root.style.colorScheme = mode;
}

export function useDarkMode() {
  const [mode, setModeState] = React.useState<AppearanceMode>(getInitialMode);

  React.useEffect(() => {
    applyMode(mode);
    window.localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const setMode = React.useCallback((next: AppearanceMode) => {
    setModeState(next);
  }, []);

  const toggle = React.useCallback(() => {
    setModeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return { mode, setMode, toggle };
}

export function initAppearanceMode() {
  applyMode(getInitialMode());
}
