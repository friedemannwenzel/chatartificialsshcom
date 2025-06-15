"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  variables: {
    light: Record<string, string>;
    dark: Record<string, string>;
  };
}

export const themePresets: ThemePreset[] = [
  {
    id: "default",
    name: "Default",
    description: "Clean and modern green theme",
    variables: {
      light: {
        "--background": "oklch(0.9761 0 0)",
        "--foreground": "oklch(0.3211 0 0)",
        "--card": "oklch(1.0000 0 0)",
        "--card-foreground": "oklch(0.3211 0 0)",
        "--popover": "oklch(1.0000 0 0)",
        "--popover-foreground": "oklch(0.3211 0 0)",
        "--primary": "oklch(0.6531 0.1347 242.6867)",
        "--primary-foreground": "oklch(1.0000 0 0)",
        "--secondary": "oklch(0.8358 0.1690 91.7666)",
        "--secondary-foreground": "oklch(0.3211 0 0)",
        "--muted": "oklch(0.8137 0.0087 236.5895)",
        "--muted-foreground": "oklch(0.3211 0 0)",
        "--accent": "oklch(0.7459 0.1812 152.3266)",
        "--accent-foreground": "oklch(1.0000 0 0)",
        "--destructive": "oklch(0.6307 0.1940 29.4415)",
        "--destructive-foreground": "oklch(1.0000 0 0)",
        "--border": "oklch(0.8792 0 0)",
        "--input": "oklch(1.0000 0 0)",
        "--ring": "oklch(0.8269 0.1080 211.9627)",
        "--chart-1": "oklch(0.7459 0.1812 152.3266)",
        "--chart-2": "oklch(0.8358 0.1690 91.7666)",
        "--chart-3": "oklch(0.6531 0.1347 242.6867)",
        "--chart-4": "oklch(0.6307 0.1940 29.4415)",
        "--chart-5": "oklch(0.5772 0.1525 315.3182)",
        "--sidebar": "oklch(0.9761 0 0)",
        "--sidebar-foreground": "oklch(0.3211 0 0)",
        "--sidebar-primary": "oklch(0.6531 0.1347 242.6867)",
        "--sidebar-primary-foreground": "oklch(1.0000 0 0)",
        "--sidebar-accent": "oklch(0.7459 0.1812 152.3266)",
        "--sidebar-accent-foreground": "oklch(1.0000 0 0)",
        "--sidebar-border": "oklch(0.8792 0 0)",
        "--sidebar-ring": "oklch(0.8269 0.1080 211.9627)",
        "--font-sans": "Geist",
        "--font-serif": "Geist",
        "--font-mono": "Geist_Mono",
        "--radius": "16px",
        "--shadow-2xs": "0px 4px 16px 0px hsl(0 0% 0% / 0.10)",
        "--shadow-xs": "0px 4px 16px 0px hsl(0 0% 0% / 0.10)",
        "--shadow-sm": "0px 4px 16px 0px hsl(0 0% 0% / 0.20), 0px 1px 2px -1px hsl(0 0% 0% / 0.20)",
        "--shadow": "0px 4px 16px 0px hsl(0 0% 0% / 0.20), 0px 1px 2px -1px hsl(0 0% 0% / 0.20)",
        "--shadow-md": "0px 4px 16px 0px hsl(0 0% 0% / 0.20), 0px 2px 4px -1px hsl(0 0% 0% / 0.20)",
        "--shadow-lg": "0px 4px 16px 0px hsl(0 0% 0% / 0.20), 0px 4px 6px -1px hsl(0 0% 0% / 0.20)",
        "--shadow-xl": "0px 4px 16px 0px hsl(0 0% 0% / 0.20), 0px 8px 10px -1px hsl(0 0% 0% / 0.20)",
        "--shadow-2xl": "0px 4px 16px 0px hsl(0 0% 0% / 0.50)",
        "--tracking-normal": "0.5px",
      },
      
      dark: {
        "--background": "oklch(0.3052 0 0)",
        "--foreground": "oklch(1.0000 0 0)",
        "--card": "oklch(0.3523 0 0)",
        "--card-foreground": "oklch(1.0000 0 0)",
        "--popover": "oklch(0.3523 0 0)",
        "--popover-foreground": "oklch(1.0000 0 0)",
        "--primary": "oklch(0.5759 0.1190 242.2817)",
        "--primary-foreground": "oklch(1.0000 0 0)",
        "--secondary": "oklch(0.8955 0.1322 95.6535)",
        "--secondary-foreground": "oklch(0.3211 0 0)",
        "--muted": "oklch(0.4748 0 0)",
        "--muted-foreground": "oklch(0.8297 0 0)",
        "--accent": "oklch(0.7115 0.1310 174.1956)",
        "--accent-foreground": "oklch(1.0000 0 0)",
        "--destructive": "oklch(0.5433 0.1740 29.6967)",
        "--destructive-foreground": "oklch(1.0000 0 0)",
        "--border": "oklch(0.4276 0 0)",
        "--input": "oklch(0.3523 0 0)",
        "--ring": "oklch(0.6817 0.1351 244.8071)",
        "--chart-1": "oklch(0.7115 0.1310 174.1956)",
        "--chart-2": "oklch(0.8955 0.1322 95.6535)",
        "--chart-3": "oklch(0.5759 0.1190 242.2817)",
        "--chart-4": "oklch(0.5433 0.1740 29.6967)",
        "--chart-5": "oklch(0.5261 0.1705 314.6534)",
        "--sidebar": "oklch(0.3052 0 0)",
        "--sidebar-foreground": "oklch(1.0000 0 0)",
        "--sidebar-primary": "oklch(0.5759 0.1190 242.2817)",
        "--sidebar-primary-foreground": "oklch(1.0000 0 0)",
        "--sidebar-accent": "oklch(0.7115 0.1310 174.1956)",
        "--sidebar-accent-foreground": "oklch(1.0000 0 0)",
        "--sidebar-border": "oklch(0.4276 0 0)",
        "--sidebar-ring": "oklch(0.6817 0.1351 244.8071)",
        "--font-sans": "Geist",
        "--font-serif": "Geist",
        "--font-mono": "Geist_Mono",
        "--radius": "16px",
        "--shadow-2xs": "0px 4px 16px 0px hsl(0 0% 0% / 0.20)",
        "--shadow-xs": "0px 4px 16px 0px hsl(0 0% 0% / 0.20)",
        "--shadow-sm": "0px 4px 16px 0px hsl(0 0% 0% / 0.40), 0px 1px 2px -1px hsl(0 0% 0% / 0.40)",
        "--shadow": "0px 4px 16px 0px hsl(0 0% 0% / 0.40), 0px 1px 2px -1px hsl(0 0% 0% / 0.40)",
        "--shadow-md": "0px 4px 16px 0px hsl(0 0% 0% / 0.40), 0px 2px 4px -1px hsl(0 0% 0% / 0.40)",
        "--shadow-lg": "0px 4px 16px 0px hsl(0 0% 0% / 0.40), 0px 4px 6px -1px hsl(0 0% 0% / 0.40)",
        "--shadow-xl": "0px 4px 16px 0px hsl(0 0% 0% / 0.40), 0px 8px 10px -1px hsl(0 0% 0% / 0.40)",
        "--shadow-2xl": "0px 4px 16px 0px hsl(0 0% 0% / 1.00)",
      },
    },
  },
  {
    id: "t3chat",
    name: "T3 Chat",
    description: "The classic T3 Chat theme",
    variables: {
      light: {
        "--background": "oklch(0.9754 0.0084 325.6414)",
        "--foreground": "oklch(0.3257 0.1161 325.0372)",
        "--card": "oklch(0.9754 0.0084 325.6414)",
        "--card-foreground": "oklch(0.3257 0.1161 325.0372)",
        "--popover": "oklch(1.0000 0 0)",
        "--popover-foreground": "oklch(0.3257 0.1161 325.0372)",
        "--primary": "oklch(0.5316 0.1409 355.1999)",
        "--primary-foreground": "oklch(1.0000 0 0)",
        "--secondary": "oklch(0.8696 0.0675 334.8991)",
        "--secondary-foreground": "oklch(0.4448 0.1341 324.7991)",
        "--muted": "oklch(0.9395 0.0260 331.5454)",
        "--muted-foreground": "oklch(0.4924 0.1244 324.4523)",
        "--accent": "oklch(0.8696 0.0675 334.8991)",
        "--accent-foreground": "oklch(0.4448 0.1341 324.7991)",
        "--destructive": "oklch(0.5248 0.1368 20.8317)",
        "--destructive-foreground": "oklch(1.0000 0 0)",
        "--border": "oklch(0.8568 0.0829 328.9110)",
        "--input": "oklch(0.8517 0.0558 336.6002)",
        "--ring": "oklch(0.5916 0.2180 0.5844)",
        "--sidebar": "oklch(0.9360 0.0288 320.5788)",
        "--sidebar-foreground": "oklch(0.4948 0.1909 354.5435)",
        "--sidebar-primary": "oklch(0.3963 0.0251 285.1962)",
        "--sidebar-primary-foreground": "oklch(0.9668 0.0124 337.5228)",
        "--sidebar-accent": "oklch(0.9789 0.0013 106.4235)",
        "--sidebar-accent-foreground": "oklch(0.3963 0.0251 285.1962)",
        "--sidebar-border": "oklch(0.9383 0.0026 48.7178)",
        "--sidebar-ring": "oklch(0.5916 0.2180 0.5844)",
        "--chart-1": "oklch(0.5316 0.1409 355.1999)",
        "--chart-2": "oklch(0.6907 0.1554 160.3454)",
        "--chart-3": "oklch(0.8214 0.1600 82.5337)",
        "--chart-4": "oklch(0.7064 0.1822 151.7125)",
        "--chart-5": "oklch(0.5919 0.2186 10.5826)",
        "--font-sans": "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
        "--font-serif": "ui-serif, Georgia, Cambria, \"Times New Roman\", Times, serif",
        "--font-mono": "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace",
        "--radius": "0.5rem",
        "--shadow-2xs": "0px 1px 2px 0px hsl(355.2 50% 85% / 0.05)",
        "--shadow-xs": "0px 1px 2px 0px hsl(355.2 50% 85% / 0.05)",
        "--shadow-sm": "0px 1px 2px 0px hsl(355.2 50% 85% / 0.05), 0px 1px 2px -1px hsl(355.2 50% 85% / 0.05)",
        "--shadow": "0px 1px 3px 0px hsl(355.2 50% 85% / 0.1), 0px 1px 2px -1px hsl(355.2 50% 85% / 0.1)",
        "--shadow-md": "0px 4px 6px -1px hsl(355.2 50% 85% / 0.1), 0px 2px 4px -2px hsl(355.2 50% 85% / 0.1)",
        "--shadow-lg": "0px 10px 15px -3px hsl(355.2 50% 85% / 0.1), 0px 4px 6px -4px hsl(355.2 50% 85% / 0.1)",
        "--shadow-xl": "0px 20px 25px -5px hsl(355.2 50% 85% / 0.1), 0px 8px 10px -6px hsl(355.2 50% 85% / 0.1)",
        "--shadow-2xl": "0px 25px 50px -12px hsl(355.2 50% 85% / 0.25)",
      },
      dark: {
        "--background": "oklch(0.2409 0.0201 307.5346)",
        "--foreground": "oklch(0.8398 0.0387 309.5391)",
        "--card": "oklch(0.2803 0.0232 307.5413)",
        "--card-foreground": "oklch(0.8456 0.0302 341.4597)",
        "--popover": "oklch(0.1548 0.0132 338.9015)",
        "--popover-foreground": "oklch(0.9647 0.0091 341.8035)",
        "--primary": "oklch(0.4607 0.1853 4.0994)",
        "--primary-foreground": "oklch(0.8560 0.0618 346.3684)",
        "--secondary": "oklch(0.3137 0.0306 310.0610)",
        "--secondary-foreground": "oklch(0.8483 0.0382 307.9613)",
        "--muted": "oklch(0.2634 0.0219 309.4748)",
        "--muted-foreground": "oklch(0.7940 0.0372 307.1032)",
        "--accent": "oklch(0.3649 0.0508 308.4911)",
        "--accent-foreground": "oklch(0.9647 0.0091 341.8035)",
        "--destructive": "oklch(0.2258 0.0524 12.6119)",
        "--destructive-foreground": "oklch(1.0000 0 0)",
        "--border": "oklch(0.3286 0.0154 343.4461)",
        "--input": "oklch(0.3387 0.0195 332.8347)",
        "--ring": "oklch(0.5916 0.2180 0.5844)",
        "--sidebar": "oklch(0.1893 0.0163 331.0475)",
        "--sidebar-foreground": "oklch(0.8607 0.0293 343.6612)",
        "--sidebar-primary": "oklch(0.4882 0.2172 264.3763)",
        "--sidebar-primary-foreground": "oklch(1.0000 0 0)",
        "--sidebar-accent": "oklch(0.2337 0.0261 338.1961)",
        "--sidebar-accent-foreground": "oklch(0.9674 0.0013 286.3752)",
        "--sidebar-border": "oklch(0 0 0)",
        "--sidebar-ring": "oklch(0.5916 0.2180 0.5844)",
        "--chart-1": "oklch(0.4607 0.1853 4.0994)",
        "--chart-2": "oklch(0.6907 0.1554 160.3454)",
        "--chart-3": "oklch(0.8214 0.1600 82.5337)",
        "--chart-4": "oklch(0.7064 0.1822 151.7125)",
        "--chart-5": "oklch(0.5919 0.2186 10.5826)",
        "--font-sans": "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
        "--font-serif": "ui-serif, Georgia, Cambria, \"Times New Roman\", Times, serif",
        "--font-mono": "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace",
        "--radius": "0.5rem",
        "--shadow-2xs": "0px 1px 2px 0px hsl(355.2 30% 25% / 0.3)",
        "--shadow-xs": "0px 1px 2px 0px hsl(355.2 30% 25% / 0.3)",
        "--shadow-sm": "0px 1px 2px 0px hsl(355.2 30% 25% / 0.3), 0px 1px 2px -1px hsl(355.2 30% 25% / 0.3)",
        "--shadow": "0px 1px 3px 0px hsl(355.2 30% 25% / 0.4), 0px 1px 2px -1px hsl(355.2 30% 25% / 0.4)",
        "--shadow-md": "0px 4px 6px -1px hsl(355.2 30% 25% / 0.4), 0px 2px 4px -2px hsl(355.2 30% 25% / 0.4)",
        "--shadow-lg": "0px 10px 15px -3px hsl(355.2 30% 25% / 0.4), 0px 4px 6px -4px hsl(355.2 30% 25% / 0.4)",
        "--shadow-xl": "0px 20px 25px -5px hsl(355.2 30% 25% / 0.4), 0px 8px 10px -6px hsl(355.2 30% 25% / 0.4)",
        "--shadow-2xl": "0px 25px 50px -12px hsl(355.2 30% 25% / 0.5)",
      },
    },
  },
  {
    id: "cappuccin",
    name: "Cappuccin",
    description: "The famous developer theme",
    variables: {
      light: {
        "--background": "oklch(0.9578 0.0058 264.5321)",
        "--foreground": "oklch(0.4355 0.0430 279.3250)",
        "--card": "oklch(1.0000 0 0)",
        "--card-foreground": "oklch(0.4355 0.0430 279.3250)",
        "--popover": "oklch(0.8575 0.0145 268.4756)",
        "--popover-foreground": "oklch(0.4355 0.0430 279.3250)",
        "--primary": "oklch(0.5547 0.2503 297.0156)",
        "--primary-foreground": "oklch(1.0000 0 0)",
        "--secondary": "oklch(0.8575 0.0145 268.4756)",
        "--secondary-foreground": "oklch(0.4355 0.0430 279.3250)",
        "--muted": "oklch(0.9060 0.0117 264.5071)",
        "--muted-foreground": "oklch(0.5471 0.0343 279.0837)",
        "--accent": "oklch(0.6820 0.1448 235.3822)",
        "--accent-foreground": "oklch(1.0000 0 0)",
        "--destructive": "oklch(0.5505 0.2155 19.8095)",
        "--destructive-foreground": "oklch(1.0000 0 0)",
        "--border": "oklch(0.8083 0.0174 271.1982)",
        "--input": "oklch(0.8575 0.0145 268.4756)",
        "--ring": "oklch(0.5547 0.2503 297.0156)",
        "--chart-1": "oklch(0.5547 0.2503 297.0156)",
        "--chart-2": "oklch(0.6820 0.1448 235.3822)",
        "--chart-3": "oklch(0.6250 0.1772 140.4448)",
        "--chart-4": "oklch(0.6920 0.2041 42.4293)",
        "--chart-5": "oklch(0.7141 0.1045 33.0967)",
        "--sidebar": "oklch(0.9335 0.0087 264.5206)",
        "--sidebar-foreground": "oklch(0.4355 0.0430 279.3250)",
        "--sidebar-primary": "oklch(0.5547 0.2503 297.0156)",
        "--sidebar-primary-foreground": "oklch(1.0000 0 0)",
        "--sidebar-accent": "oklch(0.6820 0.1448 235.3822)",
        "--sidebar-accent-foreground": "oklch(1.0000 0 0)",
        "--sidebar-border": "oklch(0.8083 0.0174 271.1982)",
        "--sidebar-ring": "oklch(0.5547 0.2503 297.0156)",
        "--font-sans": "Montserrat, sans-serif",
        "--font-serif": "Georgia, serif",
        "--font-mono": "Fira Code, monospace",
        "--radius": "0.35rem",
        "--shadow-2xs": "0px 4px 6px 0px hsl(240 30% 25% / 0.06)",
        "--shadow-xs": "0px 4px 6px 0px hsl(240 30% 25% / 0.06)",
        "--shadow-sm": "0px 4px 6px 0px hsl(240 30% 25% / 0.12), 0px 1px 2px -1px hsl(240 30% 25% / 0.12)",
        "--shadow": "0px 4px 6px 0px hsl(240 30% 25% / 0.12), 0px 1px 2px -1px hsl(240 30% 25% / 0.12)",
        "--shadow-md": "0px 4px 6px 0px hsl(240 30% 25% / 0.12), 0px 2px 4px -1px hsl(240 30% 25% / 0.12)",
        "--shadow-lg": "0px 4px 6px 0px hsl(240 30% 25% / 0.12), 0px 4px 6px -1px hsl(240 30% 25% / 0.12)",
        "--shadow-xl": "0px 4px 6px 0px hsl(240 30% 25% / 0.12), 0px 8px 10px -1px hsl(240 30% 25% / 0.12)",
        "--shadow-2xl": "0px 4px 6px 0px hsl(240 30% 25% / 0.30)",
      },
      dark: {
        "--background": "oklch(0.2155 0.0254 284.0647)",
        "--foreground": "oklch(0.8787 0.0426 272.2767)",
        "--card": "oklch(0.2429 0.0304 283.9110)",
        "--card-foreground": "oklch(0.8787 0.0426 272.2767)",
        "--popover": "oklch(0.4037 0.0320 280.1520)",
        "--popover-foreground": "oklch(0.8787 0.0426 272.2767)",
        "--primary": "oklch(0.7871 0.1187 304.7693)",
        "--primary-foreground": "oklch(0.2429 0.0304 283.9110)",
        "--secondary": "oklch(0.4765 0.0340 278.6430)",
        "--secondary-foreground": "oklch(0.8787 0.0426 272.2767)",
        "--muted": "oklch(0.2973 0.0294 276.2144)",
        "--muted-foreground": "oklch(0.7510 0.0396 273.9320)",
        "--accent": "oklch(0.8467 0.0833 210.2545)",
        "--accent-foreground": "oklch(0.2429 0.0304 283.9110)",
        "--destructive": "oklch(0.7556 0.1297 2.7642)",
        "--destructive-foreground": "oklch(0.2429 0.0304 283.9110)",
        "--border": "oklch(0.3240 0.0319 281.9784)",
        "--input": "oklch(0.3240 0.0319 281.9784)",
        "--ring": "oklch(0.7871 0.1187 304.7693)",
        "--chart-1": "oklch(0.7871 0.1187 304.7693)",
        "--chart-2": "oklch(0.8467 0.0833 210.2545)",
        "--chart-3": "oklch(0.8577 0.1092 142.7153)",
        "--chart-4": "oklch(0.8237 0.1015 52.6294)",
        "--chart-5": "oklch(0.9226 0.0238 30.4919)",
        "--sidebar": "oklch(0.1828 0.0204 284.2039)",
        "--sidebar-foreground": "oklch(0.8787 0.0426 272.2767)",
        "--sidebar-primary": "oklch(0.7871 0.1187 304.7693)",
        "--sidebar-primary-foreground": "oklch(0.2429 0.0304 283.9110)",
        "--sidebar-accent": "oklch(0.8467 0.0833 210.2545)",
        "--sidebar-accent-foreground": "oklch(0.2429 0.0304 283.9110)",
        "--sidebar-border": "oklch(0.4037 0.0320 280.1520)",
        "--sidebar-ring": "oklch(0.7871 0.1187 304.7693)",
        "--font-sans": "Montserrat, sans-serif",
        "--font-serif": "Georgia, serif",
        "--font-mono": "Fira Code, monospace",
        "--radius": "0.35rem",
        "--shadow-2xs": "0px 4px 6px 0px hsl(240 30% 25% / 0.06)",
        "--shadow-xs": "0px 4px 6px 0px hsl(240 30% 25% / 0.06)",
        "--shadow-sm": "0px 4px 6px 0px hsl(240 30% 25% / 0.12), 0px 1px 2px -1px hsl(240 30% 25% / 0.12)",
        "--shadow": "0px 4px 6px 0px hsl(240 30% 25% / 0.12), 0px 1px 2px -1px hsl(240 30% 25% / 0.12)",
        "--shadow-md": "0px 4px 6px 0px hsl(240 30% 25% / 0.12), 0px 2px 4px -1px hsl(240 30% 25% / 0.12)",
        "--shadow-lg": "0px 4px 6px 0px hsl(240 30% 25% / 0.12), 0px 4px 6px -1px hsl(240 30% 25% / 0.12)",
        "--shadow-xl": "0px 4px 6px 0px hsl(240 30% 25% / 0.12), 0px 8px 10px -1px hsl(240 30% 25% / 0.12)",
        "--shadow-2xl": "0px 4px 6px 0px hsl(240 30% 25% / 0.30)",
      },
    },
  },
  {
    id: "claude",
    name: "Claude",
    description: "Claude AI theme",
    variables: {
      light: {
        "--background": "oklch(0.9818 0.0054 95.0986)",
        "--foreground": "oklch(0.3438 0.0269 95.7226)",
        "--card": "oklch(0.9818 0.0054 95.0986)",
        "--card-foreground": "oklch(0.1908 0.0020 106.5859)",
        "--popover": "oklch(1.0000 0 0)",
        "--popover-foreground": "oklch(0.2671 0.0196 98.9390)",
        "--primary": "oklch(0.6171 0.1375 39.0427)",
        "--primary-foreground": "oklch(1.0000 0 0)",
        "--secondary": "oklch(0.9245 0.0138 92.9892)",
        "--secondary-foreground": "oklch(0.4334 0.0177 98.6048)",
        "--muted": "oklch(0.9341 0.0153 90.2390)",
        "--muted-foreground": "oklch(0.6059 0.0075 97.4233)",
        "--accent": "oklch(0.9245 0.0138 92.9892)",
        "--accent-foreground": "oklch(0.2671 0.0196 98.9390)",
        "--destructive": "oklch(0.1908 0.0020 106.5859)",
        "--destructive-foreground": "oklch(1.0000 0 0)",
        "--border": "oklch(0.8847 0.0069 97.3627)",
        "--input": "oklch(0.7621 0.0156 98.3528)",
        "--ring": "oklch(0.5937 0.1673 253.0630)",
        "--sidebar": "oklch(0.9663 0.0080 98.8792)",
        "--sidebar-foreground": "oklch(0.3590 0.0051 106.6524)",
        "--sidebar-primary": "oklch(0.6171 0.1375 39.0427)",
        "--sidebar-primary-foreground": "oklch(0.9881 0 0)",
        "--sidebar-accent": "oklch(0.9245 0.0138 92.9892)",
        "--sidebar-accent-foreground": "oklch(0.3250 0 0)",
        "--sidebar-border": "oklch(0.9401 0 0)",
        "--sidebar-ring": "oklch(0.7731 0 0)",
        "--chart-1": "oklch(0.6171 0.1375 39.0427)",
        "--chart-2": "oklch(0.6907 0.1554 160.3454)",
        "--chart-3": "oklch(0.8214 0.1600 82.5337)",
        "--chart-4": "oklch(0.7064 0.1822 151.7125)",
        "--chart-5": "oklch(0.5919 0.2186 10.5826)",
        "--font-sans": "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
        "--font-serif": "ui-serif, Georgia, Cambria, \"Times New Roman\", Times, serif",
        "--font-mono": "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace",
        "--radius": "0.5rem",
        "--shadow-2xs": "0px 1px 2px 0px hsl(39 60% 85% / 0.05)",
        "--shadow-xs": "0px 1px 2px 0px hsl(39 60% 85% / 0.05)",
        "--shadow-sm": "0px 1px 2px 0px hsl(39 60% 85% / 0.05), 0px 1px 2px -1px hsl(39 60% 85% / 0.05)",
        "--shadow": "0px 1px 3px 0px hsl(39 60% 85% / 0.1), 0px 1px 2px -1px hsl(39 60% 85% / 0.1)",
        "--shadow-md": "0px 4px 6px -1px hsl(39 60% 85% / 0.1), 0px 2px 4px -2px hsl(39 60% 85% / 0.1)",
        "--shadow-lg": "0px 10px 15px -3px hsl(39 60% 85% / 0.1), 0px 4px 6px -4px hsl(39 60% 85% / 0.1)",
        "--shadow-xl": "0px 20px 25px -5px hsl(39 60% 85% / 0.1), 0px 8px 10px -6px hsl(39 60% 85% / 0.1)",
        "--shadow-2xl": "0px 25px 50px -12px hsl(39 60% 85% / 0.25)",
      },
      dark: {
        "--background": "oklch(0.2679 0.0036 106.6427)",
        "--foreground": "oklch(0.8074 0.0142 93.0137)",
        "--card": "oklch(0.2679 0.0036 106.6427)",
        "--card-foreground": "oklch(0.9818 0.0054 95.0986)",
        "--popover": "oklch(0.3085 0.0035 106.6039)",
        "--popover-foreground": "oklch(0.9211 0.0040 106.4781)",
        "--primary": "oklch(0.6724 0.1308 38.7559)",
        "--primary-foreground": "oklch(1.0000 0 0)",
        "--secondary": "oklch(0.9818 0.0054 95.0986)",
        "--secondary-foreground": "oklch(0.3085 0.0035 106.6039)",
        "--muted": "oklch(0.2213 0.0038 106.7070)",
        "--muted-foreground": "oklch(0.7713 0.0169 99.0657)",
        "--accent": "oklch(0.2130 0.0078 95.4245)",
        "--accent-foreground": "oklch(0.9663 0.0080 98.8792)",
        "--destructive": "oklch(0.6368 0.2078 25.3313)",
        "--destructive-foreground": "oklch(1.0000 0 0)",
        "--border": "oklch(0.3618 0.0101 106.8928)",
        "--input": "oklch(0.4336 0.0113 100.2195)",
        "--ring": "oklch(0.5937 0.1673 253.0630)",
        "--sidebar": "oklch(0.2357 0.0024 67.7077)",
        "--sidebar-foreground": "oklch(0.8074 0.0142 93.0137)",
        "--sidebar-primary": "oklch(0.3250 0 0)",
        "--sidebar-primary-foreground": "oklch(0.9881 0 0)",
        "--sidebar-accent": "oklch(0.1680 0.0020 106.6177)",
        "--sidebar-accent-foreground": "oklch(0.8074 0.0142 93.0137)",
        "--sidebar-border": "oklch(0.9401 0 0)",
        "--sidebar-ring": "oklch(0.7731 0 0)",
        "--chart-1": "oklch(0.6724 0.1308 38.7559)",
        "--chart-2": "oklch(0.6907 0.1554 160.3454)",
        "--chart-3": "oklch(0.8214 0.1600 82.5337)",
        "--chart-4": "oklch(0.7064 0.1822 151.7125)",
        "--chart-5": "oklch(0.5919 0.2186 10.5826)",
        "--font-sans": "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
        "--font-serif": "ui-serif, Georgia, Cambria, \"Times New Roman\", Times, serif",
        "--font-mono": "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace",
        "--radius": "0.5rem",
        "--shadow-2xs": "0px 1px 2px 0px hsl(39 30% 15% / 0.3)",
        "--shadow-xs": "0px 1px 2px 0px hsl(39 30% 15% / 0.3)",
        "--shadow-sm": "0px 1px 2px 0px hsl(39 30% 15% / 0.3), 0px 1px 2px -1px hsl(39 30% 15% / 0.3)",
        "--shadow": "0px 1px 3px 0px hsl(39 30% 15% / 0.4), 0px 1px 2px -1px hsl(39 30% 15% / 0.4)",
        "--shadow-md": "0px 4px 6px -1px hsl(39 30% 15% / 0.4), 0px 2px 4px -2px hsl(39 30% 15% / 0.4)",
        "--shadow-lg": "0px 10px 15px -3px hsl(39 30% 15% / 0.4), 0px 4px 6px -4px hsl(39 30% 15% / 0.4)",
        "--shadow-xl": "0px 20px 25px -5px hsl(39 30% 15% / 0.4), 0px 8px 10px -6px hsl(39 30% 15% / 0.4)",
        "--shadow-2xl": "0px 25px 50px -12px hsl(39 30% 15% / 0.5)",
      },
    },
  },
  {
    id: "twitter",
    name: "Twitter",
    description: "Twitter/X inspired theme",
    variables: {
      light: {
        "--background": "oklch(1.0000 0 0)",
        "--foreground": "oklch(0.1884 0.0128 248.5103)",
        "--card": "oklch(0.9784 0.0011 197.1387)",
        "--card-foreground": "oklch(0.1884 0.0128 248.5103)",
        "--popover": "oklch(1.0000 0 0)",
        "--popover-foreground": "oklch(0.1884 0.0128 248.5103)",
        "--primary": "oklch(0.6723 0.1606 244.9955)",
        "--primary-foreground": "oklch(1.0000 0 0)",
        "--secondary": "oklch(0.1884 0.0128 248.5103)",
        "--secondary-foreground": "oklch(1.0000 0 0)",
        "--muted": "oklch(0.9222 0.0013 286.3737)",
        "--muted-foreground": "oklch(0.1884 0.0128 248.5103)",
        "--accent": "oklch(0.9392 0.0166 250.8453)",
        "--accent-foreground": "oklch(0.6723 0.1606 244.9955)",
        "--destructive": "oklch(0.6188 0.2376 25.7658)",
        "--destructive-foreground": "oklch(1.0000 0 0)",
        "--border": "oklch(0.9317 0.0118 231.6594)",
        "--input": "oklch(0.9809 0.0025 228.7836)",
        "--ring": "oklch(0.6818 0.1584 243.3540)",
        "--chart-1": "oklch(0.6723 0.1606 244.9955)",
        "--chart-2": "oklch(0.6907 0.1554 160.3454)",
        "--chart-3": "oklch(0.8214 0.1600 82.5337)",
        "--chart-4": "oklch(0.7064 0.1822 151.7125)",
        "--chart-5": "oklch(0.5919 0.2186 10.5826)",
        "--sidebar": "oklch(0.9784 0.0011 197.1387)",
        "--sidebar-foreground": "oklch(0.1884 0.0128 248.5103)",
        "--sidebar-primary": "oklch(0.6723 0.1606 244.9955)",
        "--sidebar-primary-foreground": "oklch(1.0000 0 0)",
        "--sidebar-accent": "oklch(0.9392 0.0166 250.8453)",
        "--sidebar-accent-foreground": "oklch(0.6723 0.1606 244.9955)",
        "--sidebar-border": "oklch(0.9271 0.0101 238.5177)",
        "--sidebar-ring": "oklch(0.6818 0.1584 243.3540)",
        "--font-sans": "Open Sans, sans-serif",
        "--font-serif": "Georgia, serif",
        "--font-mono": "Menlo, monospace",
        "--radius": "1.3rem",
        "--shadow-2xs": "0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00)",
        "--shadow-xs": "0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00)",
        "--shadow-sm": "0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00), 0px 1px 2px -1px hsl(202.8169 89.1213% 53.1373% / 0.00)",
        "--shadow": "0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00), 0px 1px 2px -1px hsl(202.8169 89.1213% 53.1373% / 0.00)",
        "--shadow-md": "0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00), 0px 2px 4px -1px hsl(202.8169 89.1213% 53.1373% / 0.00)",
        "--shadow-lg": "0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00), 0px 4px 6px -1px hsl(202.8169 89.1213% 53.1373% / 0.00)",
        "--shadow-xl": "0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00), 0px 8px 10px -1px hsl(202.8169 89.1213% 53.1373% / 0.00)",
        "--shadow-2xl": "0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00)",
      },
      dark: {
        "--background": "oklch(0 0 0)",
        "--foreground": "oklch(0.9328 0.0025 228.7857)",
        "--card": "oklch(0.2097 0.0080 274.5332)",
        "--card-foreground": "oklch(0.8853 0 0)",
        "--popover": "oklch(0 0 0)",
        "--popover-foreground": "oklch(0.9328 0.0025 228.7857)",
        "--primary": "oklch(0.6692 0.1607 245.0110)",
        "--primary-foreground": "oklch(1.0000 0 0)",
        "--secondary": "oklch(0.9622 0.0035 219.5331)",
        "--secondary-foreground": "oklch(0.1884 0.0128 248.5103)",
        "--muted": "oklch(0.2090 0 0)",
        "--muted-foreground": "oklch(0.5637 0.0078 247.9662)",
        "--accent": "oklch(0.1928 0.0331 242.5459)",
        "--accent-foreground": "oklch(0.6692 0.1607 245.0110)",
        "--destructive": "oklch(0.6188 0.2376 25.7658)",
        "--destructive-foreground": "oklch(1.0000 0 0)",
        "--border": "oklch(0.2674 0.0047 248.0045)",
        "--input": "oklch(0.3020 0.0288 244.8244)",
        "--ring": "oklch(0.6818 0.1584 243.3540)",
        "--chart-1": "oklch(0.6723 0.1606 244.9955)",
        "--chart-2": "oklch(0.6907 0.1554 160.3454)",
        "--chart-3": "oklch(0.8214 0.1600 82.5337)",
        "--chart-4": "oklch(0.7064 0.1822 151.7125)",
        "--chart-5": "oklch(0.5919 0.2186 10.5826)",
        "--sidebar": "oklch(0.2097 0.0080 274.5332)",
        "--sidebar-foreground": "oklch(0.8853 0 0)",
        "--sidebar-primary": "oklch(0.6818 0.1584 243.3540)",
        "--sidebar-primary-foreground": "oklch(1.0000 0 0)",
        "--sidebar-accent": "oklch(0.1928 0.0331 242.5459)",
        "--sidebar-accent-foreground": "oklch(0.6692 0.1607 245.0110)",
        "--sidebar-border": "oklch(0.3795 0.0220 240.5943)",
        "--sidebar-ring": "oklch(0.6818 0.1584 243.3540)",
        "--font-sans": "Open Sans, sans-serif",
        "--font-serif": "Georgia, serif",
        "--font-mono": "Menlo, monospace",
        "--radius": "1.3rem",
        "--shadow-2xs": "0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00)",
        "--shadow-xs": "0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00)",
        "--shadow-sm": "0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00), 0px 1px 2px -1px hsl(202.8169 89.1213% 53.1373% / 0.00)",
        "--shadow": "0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00), 0px 1px 2px -1px hsl(202.8169 89.1213% 53.1373% / 0.00)",
        "--shadow-md": "0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00), 0px 2px 4px -1px hsl(202.8169 89.1213% 53.1373% / 0.00)",
        "--shadow-lg": "0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00), 0px 4px 6px -1px hsl(202.8169 89.1213% 53.1373% / 0.00)",
        "--shadow-xl": "0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00), 0px 8px 10px -1px hsl(202.8169 89.1213% 53.1373% / 0.00)",
        "--shadow-2xl": "0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00)",
      },
    },
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    description: "Futuristic neon-inspired theme",
    variables: {
      light: {
        "--background": "oklch(0.9816 0.0017 247.8390)",
        "--foreground": "oklch(0.1649 0.0352 281.8285)",
        "--card": "oklch(1.0000 0 0)",
        "--card-foreground": "oklch(0.1649 0.0352 281.8285)",
        "--popover": "oklch(1.0000 0 0)",
        "--popover-foreground": "oklch(0.1649 0.0352 281.8285)",
        "--primary": "oklch(0.6726 0.2904 341.4084)",
        "--primary-foreground": "oklch(1.0000 0 0)",
        "--secondary": "oklch(0.9595 0.0200 286.0164)",
        "--secondary-foreground": "oklch(0.1649 0.0352 281.8285)",
        "--muted": "oklch(0.9595 0.0200 286.0164)",
        "--muted-foreground": "oklch(0.1649 0.0352 281.8285)",
        "--accent": "oklch(0.8903 0.1739 171.2690)",
        "--accent-foreground": "oklch(0.1649 0.0352 281.8285)",
        "--destructive": "oklch(0.6535 0.2348 34.0370)",
        "--destructive-foreground": "oklch(1.0000 0 0)",
        "--border": "oklch(0.9205 0.0086 225.0878)",
        "--input": "oklch(0.9205 0.0086 225.0878)",
        "--ring": "oklch(0.6726 0.2904 341.4084)",
        "--chart-1": "oklch(0.6726 0.2904 341.4084)",
        "--chart-2": "oklch(0.5488 0.2944 299.0954)",
        "--chart-3": "oklch(0.8442 0.1457 209.2851)",
        "--chart-4": "oklch(0.8903 0.1739 171.2690)",
        "--chart-5": "oklch(0.9168 0.1915 101.4070)",
        "--sidebar": "oklch(0.9595 0.0200 286.0164)",
        "--sidebar-foreground": "oklch(0.1649 0.0352 281.8285)",
        "--sidebar-primary": "oklch(0.6726 0.2904 341.4084)",
        "--sidebar-primary-foreground": "oklch(1.0000 0 0)",
        "--sidebar-accent": "oklch(0.8903 0.1739 171.2690)",
        "--sidebar-accent-foreground": "oklch(0.1649 0.0352 281.8285)",
        "--sidebar-border": "oklch(0.9205 0.0086 225.0878)",
        "--sidebar-ring": "oklch(0.6726 0.2904 341.4084)",
        "--font-sans": "Outfit, sans-serif",
        "--font-serif": "ui-serif, Georgia, Cambria, \"Times New Roman\", Times, serif",
        "--font-mono": "Fira Code, monospace",
        "--radius": "0.5rem",
        "--shadow-2xs": "0px 4px 8px -2px hsl(0 0% 0% / 0.05)",
        "--shadow-xs": "0px 4px 8px -2px hsl(0 0% 0% / 0.05)",
        "--shadow-sm": "0px 4px 8px -2px hsl(0 0% 0% / 0.10), 0px 1px 2px -3px hsl(0 0% 0% / 0.10)",
        "--shadow": "0px 4px 8px -2px hsl(0 0% 0% / 0.10), 0px 1px 2px -3px hsl(0 0% 0% / 0.10)",
        "--shadow-md": "0px 4px 8px -2px hsl(0 0% 0% / 0.10), 0px 2px 4px -3px hsl(0 0% 0% / 0.10)",
        "--shadow-lg": "0px 4px 8px -2px hsl(0 0% 0% / 0.10), 0px 4px 6px -3px hsl(0 0% 0% / 0.10)",
        "--shadow-xl": "0px 4px 8px -2px hsl(0 0% 0% / 0.10), 0px 8px 10px -3px hsl(0 0% 0% / 0.10)",
        "--shadow-2xl": "0px 4px 8px -2px hsl(0 0% 0% / 0.25)",
      },
      dark: {
        "--background": "oklch(0.1649 0.0352 281.8285)",
        "--foreground": "oklch(0.9513 0.0074 260.7315)",
        "--card": "oklch(0.2542 0.0611 281.1423)",
        "--card-foreground": "oklch(0.9513 0.0074 260.7315)",
        "--popover": "oklch(0.2542 0.0611 281.1423)",
        "--popover-foreground": "oklch(0.9513 0.0074 260.7315)",
        "--primary": "oklch(0.6726 0.2904 341.4084)",
        "--primary-foreground": "oklch(1.0000 0 0)",
        "--secondary": "oklch(0.2542 0.0611 281.1423)",
        "--secondary-foreground": "oklch(0.9513 0.0074 260.7315)",
        "--muted": "oklch(0.2542 0.0611 281.1423)",
        "--muted-foreground": "oklch(0.6245 0.0500 278.1046)",
        "--accent": "oklch(0.8903 0.1739 171.2690)",
        "--accent-foreground": "oklch(0.1649 0.0352 281.8285)",
        "--destructive": "oklch(0.6535 0.2348 34.0370)",
        "--destructive-foreground": "oklch(1.0000 0 0)",
        "--border": "oklch(0.3279 0.0832 280.7890)",
        "--input": "oklch(0.3279 0.0832 280.7890)",
        "--ring": "oklch(0.6726 0.2904 341.4084)",
        "--chart-1": "oklch(0.6726 0.2904 341.4084)",
        "--chart-2": "oklch(0.5488 0.2944 299.0954)",
        "--chart-3": "oklch(0.8442 0.1457 209.2851)",
        "--chart-4": "oklch(0.8903 0.1739 171.2690)",
        "--chart-5": "oklch(0.9168 0.1915 101.4070)",
        "--sidebar": "oklch(0.1649 0.0352 281.8285)",
        "--sidebar-foreground": "oklch(0.9513 0.0074 260.7315)",
        "--sidebar-primary": "oklch(0.6726 0.2904 341.4084)",
        "--sidebar-primary-foreground": "oklch(1.0000 0 0)",
        "--sidebar-accent": "oklch(0.8903 0.1739 171.2690)",
        "--sidebar-accent-foreground": "oklch(0.1649 0.0352 281.8285)",
        "--sidebar-border": "oklch(0.3279 0.0832 280.7890)",
        "--sidebar-ring": "oklch(0.6726 0.2904 341.4084)",
        "--font-sans": "Outfit, sans-serif",
        "--font-serif": "ui-serif, Georgia, Cambria, \"Times New Roman\", Times, serif",
        "--font-mono": "Fira Code, monospace",
        "--radius": "0.5rem",
        "--shadow-2xs": "0px 4px 8px -2px hsl(0 0% 0% / 0.05)",
        "--shadow-xs": "0px 4px 8px -2px hsl(0 0% 0% / 0.05)",
        "--shadow-sm": "0px 4px 8px -2px hsl(0 0% 0% / 0.10), 0px 1px 2px -3px hsl(0 0% 0% / 0.10)",
        "--shadow": "0px 4px 8px -2px hsl(0 0% 0% / 0.10), 0px 1px 2px -3px hsl(0 0% 0% / 0.10)",
        "--shadow-md": "0px 4px 8px -2px hsl(0 0% 0% / 0.10), 0px 2px 4px -3px hsl(0 0% 0% / 0.10)",
        "--shadow-lg": "0px 4px 8px -2px hsl(0 0% 0% / 0.10), 0px 4px 6px -3px hsl(0 0% 0% / 0.10)",
        "--shadow-xl": "0px 4px 8px -2px hsl(0 0% 0% / 0.10), 0px 8px 10px -3px hsl(0 0% 0% / 0.10)",
        "--shadow-2xl": "0px 4px 8px -2px hsl(0 0% 0% / 0.25)",
      },
    },
  },
  {
    id: "notebook",
    name: "Notebook",
    description: "Hand-drawn notebook style",
    variables: {
      light: {
        "--background": "oklch(0.9821 0 0)",
        "--foreground": "oklch(0.3485 0 0)",
        "--card": "oklch(1.0000 0 0)",
        "--card-foreground": "oklch(0.3485 0 0)",
        "--popover": "oklch(1.0000 0 0)",
        "--popover-foreground": "oklch(0.3485 0 0)",
        "--primary": "oklch(0.4891 0 0)",
        "--primary-foreground": "oklch(0.9551 0 0)",
        "--secondary": "oklch(0.9006 0 0)",
        "--secondary-foreground": "oklch(0.3485 0 0)",
        "--muted": "oklch(0.9158 0 0)",
        "--muted-foreground": "oklch(0.4313 0 0)",
        "--accent": "oklch(0.9354 0.0456 94.8549)",
        "--accent-foreground": "oklch(0.4015 0.0436 37.9587)",
        "--destructive": "oklch(0.6627 0.0978 20.0041)",
        "--destructive-foreground": "oklch(1.0000 0 0)",
        "--border": "oklch(0.5538 0.0025 17.2320)",
        "--input": "oklch(1.0000 0 0)",
        "--ring": "oklch(0.7058 0 0)",
        "--chart-1": "oklch(0.3211 0 0)",
        "--chart-2": "oklch(0.4495 0 0)",
        "--chart-3": "oklch(0.5693 0 0)",
        "--chart-4": "oklch(0.6830 0 0)",
        "--chart-5": "oklch(0.7921 0 0)",
        "--sidebar": "oklch(0.9551 0 0)",
        "--sidebar-foreground": "oklch(0.3485 0 0)",
        "--sidebar-primary": "oklch(0.4891 0 0)",
        "--sidebar-primary-foreground": "oklch(0.9551 0 0)",
        "--sidebar-accent": "oklch(0.9354 0.0456 94.8549)",
        "--sidebar-accent-foreground": "oklch(0.4015 0.0436 37.9587)",
        "--sidebar-border": "oklch(0.8078 0 0)",
        "--sidebar-ring": "oklch(0.7058 0 0)",
        "--font-sans": "Architects Daughter, sans-serif",
        "--font-serif": "\"Times New Roman\", Times, serif",
        "--font-mono": "\"Courier New\", Courier, monospace",
        "--radius": "0.625rem",
        "--shadow-2xs": "1px 4px 5px 0px hsl(0 0% 0% / 0.01)",
        "--shadow-xs": "1px 4px 5px 0px hsl(0 0% 0% / 0.01)",
        "--shadow-sm": "1px 4px 5px 0px hsl(0 0% 0% / 0.03), 1px 1px 2px -1px hsl(0 0% 0% / 0.03)",
        "--shadow": "1px 4px 5px 0px hsl(0 0% 0% / 0.03), 1px 1px 2px -1px hsl(0 0% 0% / 0.03)",
        "--shadow-md": "1px 4px 5px 0px hsl(0 0% 0% / 0.03), 1px 2px 4px -1px hsl(0 0% 0% / 0.03)",
        "--shadow-lg": "1px 4px 5px 0px hsl(0 0% 0% / 0.03), 1px 4px 6px -1px hsl(0 0% 0% / 0.03)",
        "--shadow-xl": "1px 4px 5px 0px hsl(0 0% 0% / 0.03), 1px 8px 10px -1px hsl(0 0% 0% / 0.03)",
        "--shadow-2xl": "1px 4px 5px 0px hsl(0 0% 0% / 0.07)",
        "--tracking-normal": "0.5px",
      },
      dark: {
        "--background": "oklch(0.2891 0 0)",
        "--foreground": "oklch(0.8945 0 0)",
        "--card": "oklch(0.3211 0 0)",
        "--card-foreground": "oklch(0.8945 0 0)",
        "--popover": "oklch(0.3211 0 0)",
        "--popover-foreground": "oklch(0.8945 0 0)",
        "--primary": "oklch(0.7572 0 0)",
        "--primary-foreground": "oklch(0.2891 0 0)",
        "--secondary": "oklch(0.4676 0 0)",
        "--secondary-foreground": "oklch(0.8078 0 0)",
        "--muted": "oklch(0.3904 0 0)",
        "--muted-foreground": "oklch(0.7058 0 0)",
        "--accent": "oklch(0.9067 0 0)",
        "--accent-foreground": "oklch(0.3211 0 0)",
        "--destructive": "oklch(0.7915 0.0491 18.2410)",
        "--destructive-foreground": "oklch(0.2891 0 0)",
        "--border": "oklch(0.4276 0 0)",
        "--input": "oklch(0.3211 0 0)",
        "--ring": "oklch(0.8078 0 0)",
        "--chart-1": "oklch(0.9521 0 0)",
        "--chart-2": "oklch(0.8576 0 0)",
        "--chart-3": "oklch(0.7572 0 0)",
        "--chart-4": "oklch(0.6534 0 0)",
        "--chart-5": "oklch(0.5452 0 0)",
        "--sidebar": "oklch(0.2478 0 0)",
        "--sidebar-foreground": "oklch(0.8945 0 0)",
        "--sidebar-primary": "oklch(0.7572 0 0)",
        "--sidebar-primary-foreground": "oklch(0.2478 0 0)",
        "--sidebar-accent": "oklch(0.9067 0 0)",
        "--sidebar-accent-foreground": "oklch(0.3211 0 0)",
        "--sidebar-border": "oklch(0.4276 0 0)",
        "--sidebar-ring": "oklch(0.8078 0 0)",
        "--font-sans": "Architects Daughter, sans-serif",
        "--font-serif": "Georgia, serif",
        "--font-mono": "\"Fira Code\", \"Courier New\", monospace",
        "--radius": "0.625rem",
        "--shadow-2xs": "1px 4px 5px 0px hsl(0 0% 0% / 0.01)",
        "--shadow-xs": "1px 4px 5px 0px hsl(0 0% 0% / 0.01)",
        "--shadow-sm": "1px 4px 5px 0px hsl(0 0% 0% / 0.03), 1px 1px 2px -1px hsl(0 0% 0% / 0.03)",
        "--shadow": "1px 4px 5px 0px hsl(0 0% 0% / 0.03), 1px 1px 2px -1px hsl(0 0% 0% / 0.03)",
        "--shadow-md": "1px 4px 5px 0px hsl(0 0% 0% / 0.03), 1px 2px 4px -1px hsl(0 0% 0% / 0.03)",
        "--shadow-lg": "1px 4px 5px 0px hsl(0 0% 0% / 0.03), 1px 4px 6px -1px hsl(0 0% 0% / 0.03)",
        "--shadow-xl": "1px 4px 5px 0px hsl(0 0% 0% / 0.03), 1px 8px 10px -1px hsl(0 0% 0% / 0.03)",
        "--shadow-2xl": "1px 4px 5px 0px hsl(0 0% 0% / 0.07)",
      },
    },
  },
];

export function useCustomTheme() {
  const [currentTheme, setCurrentTheme] = useState<string>("default");
  const [isInitialized, setIsInitialized] = useState(false);
  const [syncAcrossDevices, setSyncAcrossDevices] = useState(false);
  
  const { user } = useUser();
  const userPreferences = useQuery(
    api.preferences.getUserPreferences,
    user ? { userId: user.id } : "skip"
  );
  const setUserPreferences = useMutation(api.preferences.setUserPreferences);

  const applyTheme = useCallback((themeId: string) => {
    if (typeof window === "undefined") return;
    
    const theme = themePresets.find(t => t.id === themeId);
    if (!theme || themeId === "default") {
      removeCustomVariables();
      return;
    }

    const isDark = document.documentElement.classList.contains("dark");
    const variables = isDark ? theme.variables.dark : theme.variables.light;

    // Apply variables to root
    const root = document.documentElement;
    Object.entries(variables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }, []);

  // Initialize theme from database or localStorage
  useEffect(() => {
    if (!user || userPreferences === undefined) return;

    const initializeTheme = () => {
      let themeToApply = "default";
      let syncEnabled = false;

      if (userPreferences) {
        // User has preferences in database
        themeToApply = userPreferences.theme || "default";
        syncEnabled = false; // Remove sync feature for now since it's not in the schema
        
        if (syncEnabled) {
          // If sync is enabled, use database theme and update localStorage
          localStorage.setItem("custom-theme", themeToApply);
          localStorage.setItem("theme-sync-enabled", "true");
        } else {
          // If sync is disabled, prefer localStorage
          const localTheme = localStorage.getItem("custom-theme");
          if (localTheme) {
            themeToApply = localTheme;
          }
          localStorage.setItem("theme-sync-enabled", "false");
        }
      } else {
        // No database preferences, check localStorage
        const localTheme = localStorage.getItem("custom-theme");
        const localSyncSetting = localStorage.getItem("theme-sync-enabled");
        
        if (localTheme) {
          themeToApply = localTheme;
        }
        if (localSyncSetting) {
          syncEnabled = localSyncSetting === "true";
        }
      }

      setCurrentTheme(themeToApply);
      setSyncAcrossDevices(syncEnabled);
      
      if (themeToApply !== "default") {
        setTimeout(() => {
          applyTheme(themeToApply);
        }, 100);
      }
      
      setIsInitialized(true);
    };

    if (typeof window !== "undefined") {
      initializeTheme();
    }
  }, [user, userPreferences, applyTheme]);



  const removeCustomVariables = () => {
    if (typeof window === "undefined") return;
    
    const root = document.documentElement;
    themePresets.forEach(theme => {
      Object.keys(theme.variables.light).forEach(property => {
        root.style.removeProperty(property);
      });
      Object.keys(theme.variables.dark).forEach(property => {
        root.style.removeProperty(property);
      });
    });
  };

  const setTheme = async (themeId: string) => {
    setCurrentTheme(themeId);
    localStorage.setItem("custom-theme", themeId);
    applyTheme(themeId);

    // If user is logged in and sync is enabled, update database
    if (user && syncAcrossDevices) {
      try {
        await setUserPreferences({
          userId: user.id,
          theme: themeId,
          selectedModel: {
            id: "gpt-4o",
            name: "GPT-4o",
            provider: "openai",
            description: "Most capable GPT-4 model",
            supportsStreaming: true,
          },
        });
      } catch (error) {
        console.error("Failed to sync theme to database:", error);
      }
    }
  };

  const toggleSyncAcrossDevices = async (enabled: boolean) => {
    setSyncAcrossDevices(enabled);
    localStorage.setItem("theme-sync-enabled", enabled.toString());

    if (user) {
      try {
        if (enabled) {
          // When enabling sync, save current theme to database
          await setUserPreferences({
            userId: user.id,
            theme: currentTheme,
            selectedModel: {
              id: "gpt-4o",
              name: "GPT-4o",
              provider: "openai",
              description: "Most capable GPT-4 model",
              supportsStreaming: true,
            },
          });
        }
      } catch (error) {
        console.error("Failed to update sync setting:", error);
      }
    }
  };

  // Re-apply theme when dark mode changes
  useEffect(() => {
    if (!isInitialized || typeof window === "undefined") return;

    const observer = new MutationObserver(() => {
      if (currentTheme !== "default") {
        // Small delay to ensure dark mode class is applied
        setTimeout(() => {
          applyTheme(currentTheme);
        }, 50);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [currentTheme, isInitialized, applyTheme]);

  // Re-apply theme when navigating between pages
  useEffect(() => {
    if (isInitialized && currentTheme !== "default") {
      applyTheme(currentTheme);
    }
  }, [currentTheme, isInitialized, applyTheme]);

  return {
    currentTheme,
    setTheme,
    themePresets,
    isInitialized,
    syncAcrossDevices,
    toggleSyncAcrossDevices,
  };
} 