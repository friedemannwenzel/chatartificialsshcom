"use client";

import { useCustomTheme } from "@/hooks/useCustomTheme";
import { useEffect } from "react";

interface CustomThemeProviderProps {
  children: React.ReactNode;
}

export function CustomThemeProvider({ children }: CustomThemeProviderProps) {
  const { currentTheme, isInitialized } = useCustomTheme();

  // Ensure theme is applied on every render
  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      const applyStoredTheme = () => {
        const savedTheme = localStorage.getItem("custom-theme");
        if (savedTheme && savedTheme !== "default") {
          // Re-apply the theme to ensure it persists
          const { themePresets } = require("@/hooks/useCustomTheme");
          const theme = themePresets.find((t: any) => t.id === savedTheme);
          if (theme) {
            const isDark = document.documentElement.classList.contains("dark");
            const variables = isDark ? theme.variables.dark : theme.variables.light;
            const root = document.documentElement;
            Object.entries(variables).forEach(([property, value]) => {
              root.style.setProperty(property, value as string);
            });
          }
        }
      };

      // Apply theme immediately
      applyStoredTheme();

      // Also apply on route changes (for Next.js navigation)
      const handleRouteChange = () => {
        setTimeout(applyStoredTheme, 50);
      };

      // Listen for navigation events
      window.addEventListener("popstate", handleRouteChange);
      
      // For Next.js App Router, we need to listen for DOM changes
      const observer = new MutationObserver(() => {
        setTimeout(applyStoredTheme, 50);
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      return () => {
        window.removeEventListener("popstate", handleRouteChange);
        observer.disconnect();
      };
    }
  }, [isInitialized, currentTheme]);

  return <>{children}</>;
} 