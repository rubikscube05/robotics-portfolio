import { useCallback, useEffect, useState } from "react";
import type { Theme } from "../data/content";

function getInitialTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    meta?.setAttribute("content", theme === "dark" ? "#0d1012" : "#eef0f1");
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("theme", next);
      } catch {
        /* storage unavailable: the choice lasts for this visit */
      }
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
