"use client";

import { useState, useEffect } from "react";

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
    description: "The classic T3 Chat theme",
    variables: {
      light: {},
      dark: {},
    },
  },
  {
    id: "rose",
    name: "Rose Garden",
    description: "Elegant pink and rose tones",
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
];

export function useCustomTheme() {
  const [currentTheme, setCurrentTheme] = useState<string>("default");
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    const initializeTheme = () => {
      const savedTheme = localStorage.getItem("custom-theme");
      if (savedTheme && savedTheme !== "default") {
        setCurrentTheme(savedTheme);
        // Apply theme after a short delay to ensure DOM is ready
        setTimeout(() => {
          applyTheme(savedTheme);
        }, 100);
      }
      setIsInitialized(true);
    };

    if (typeof window !== "undefined") {
      initializeTheme();
    }
  }, []);

  const applyTheme = (themeId: string) => {
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
  };

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

  const setTheme = (themeId: string) => {
    setCurrentTheme(themeId);
    localStorage.setItem("custom-theme", themeId);
    applyTheme(themeId);
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
  }, [currentTheme, isInitialized]);

  // Re-apply theme when navigating between pages
  useEffect(() => {
    if (isInitialized && currentTheme !== "default") {
      applyTheme(currentTheme);
    }
  }, [currentTheme, isInitialized]);

  return {
    currentTheme,
    setTheme,
    themePresets,
    isInitialized,
  };
} 