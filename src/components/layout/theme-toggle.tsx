"use client";

import { useEffect } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

const icons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const;

const themeOrder = ["light", "dark", "system"] as const;

export function ThemeToggle(): React.ReactElement {
  const { theme, setTheme } = useUIStore();

  useEffect(() => {
    const root = document.documentElement;

    function applyTheme(t: string): void {
      if (t === "system") {
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)",
        ).matches;
        root.classList.toggle("dark", prefersDark);
      } else {
        root.classList.toggle("dark", t === "dark");
      }
    }

    applyTheme(theme);

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = (): void => applyTheme("system");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme]);

  function cycleTheme(): void {
    const currentIndex = themeOrder.indexOf(theme);
    const next = themeOrder[(currentIndex + 1) % themeOrder.length];
    setTheme(next);
  }

  const Icon = icons[theme];

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className={cn(
        "inline-flex items-center justify-center rounded-md p-2",
        "text-muted-foreground hover:bg-muted hover:text-foreground",
        "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
      aria-label={`Current theme: ${theme}. Click to change.`}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
