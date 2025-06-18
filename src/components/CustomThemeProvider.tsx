"use client";

import { useCustomTheme } from "@/hooks/useCustomTheme";
import { useEffect } from "react";

interface CustomThemeProviderProps {
  children: React.ReactNode;
}

export function CustomThemeProvider({ children }: CustomThemeProviderProps) {
  const { currentTheme, isInitialized } = useCustomTheme();

  // The theme is fully managed inside useCustomTheme, so nothing else is needed here.
  // We just ensure the hook is initialized.
  useEffect(() => {
    /* No extra side-effects required */
  }, [isInitialized, currentTheme]);

  return <>{children}</>;
} 