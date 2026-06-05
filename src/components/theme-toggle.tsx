"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  /** When collapsed we render a single compact button instead of the segmented control. */
  collapsed?: boolean;
}

export function ThemeToggle({ collapsed = false }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // next-themes only knows the real theme after mount; avoid hydration mismatch.
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  if (collapsed) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-elevated text-dim transition-colors hover:text-ink hover:cursor-pointer"
      >
        {mounted && isDark ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
      </button>
    );
  }

  return (
    <div className="relative flex items-center rounded-full border border-line bg-app p-0.5">
      {/* sliding thumb */}
      <span
        aria-hidden
        className={cn(
          "absolute top-0.5 bottom-0.5 w-1/2 rounded-full bg-elevated shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          mounted && isDark ? "translate-x-[calc(100%-0.25rem)]" : "translate-x-0.5"
        )}
      />
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={cn(
          "relative z-10 flex h-7 flex-1 items-center justify-center gap-1.5 rounded-full text-xs font-medium transition-colors hover:cursor-pointer",
          mounted && !isDark ? "text-ink" : "text-faint hover:text-dim"
        )}
      >
        <Sun className="h-3.5 w-3.5" />
        Light
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={cn(
          "relative z-10 flex h-7 flex-1 items-center justify-center gap-1.5 rounded-full text-xs font-medium transition-colors hover:cursor-pointer",
          mounted && isDark ? "text-ink" : "text-faint hover:text-dim"
        )}
      >
        <Moon className="h-3.5 w-3.5" />
        Dark
      </button>
    </div>
  );
}
