"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Check, Cloud, CloudOff } from "lucide-react";
import { useCustomTheme } from "@/hooks/useCustomTheme";
import { cn } from "@/lib/utils";

export function ThemeSelector() {
  const { currentTheme, setTheme, themePresets, syncAcrossDevices, toggleSyncAcrossDevices } = useCustomTheme();

  const getPreviewColors = (themeId: string) => {
    const theme = themePresets.find(t => t.id === themeId);
    if (!theme) {
      return {
        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))",
        accent: "hsl(var(--accent))",
        background: "hsl(var(--background))",
      };
    }

    // Use OKLCH colors directly for preview
    const variables = theme.variables.light;
    return {
      primary: variables["--primary"] || "hsl(var(--primary))",
      secondary: variables["--secondary"] || "hsl(var(--secondary))",
      accent: variables["--accent"] || "hsl(var(--accent))",
      background: variables["--background"] || "hsl(var(--background))",
    };
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Choose Your Theme</h3>
        <p className="text-sm text-muted-foreground">
          Select a theme preset to customize the look and feel of your chat interface.
        </p>
      </div>

      <div className="border rounded-md">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-4 max-h-[300px] overflow-y-auto">
          {themePresets.map((theme) => {
          const colors = getPreviewColors(theme.id);
          const isSelected = currentTheme === theme.id;

          return (
            <Card
              key={theme.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                isSelected && "ring-2 ring-primary"
              )}
              onClick={() => setTheme(theme.id)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Theme Preview */}
                  <div className="h-20 rounded-md border overflow-hidden">
                    <div 
                      className="h-full w-full relative"
                      style={{ backgroundColor: colors.background }}
                    >
                      {/* Simulated UI elements */}
                      <div className="absolute top-2 left-2 right-2 h-2 rounded-sm opacity-20" 
                           style={{ backgroundColor: colors.primary }} />
                      <div className="absolute top-6 left-2 w-1/2 h-1.5 rounded-sm opacity-30" 
                           style={{ backgroundColor: colors.secondary }} />
                      <div className="absolute top-9 left-2 w-1/3 h-1.5 rounded-sm opacity-30" 
                           style={{ backgroundColor: colors.secondary }} />
                      <div className="absolute bottom-2 right-2 w-8 h-6 rounded-sm" 
                           style={{ backgroundColor: colors.accent }} />
                      <div className="absolute bottom-2 left-2 w-6 h-6 rounded-full" 
                           style={{ backgroundColor: colors.primary }} />
                    </div>
                  </div>

                  {/* Theme Info */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{theme.name}</h4>
                      {isSelected && (
                        <Badge variant="default" className="h-5">
                          <Check className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {theme.description}
                    </p>
                  </div>

                  {/* Color Palette */}
                  <div className="flex gap-1">
                    <div 
                      className="w-4 h-4 rounded-full border border-border"
                      style={{ backgroundColor: colors.primary }}
                      title="Primary"
                    />
                    <div 
                      className="w-4 h-4 rounded-full border border-border"
                      style={{ backgroundColor: colors.secondary }}
                      title="Secondary"
                    />
                    <div 
                      className="w-4 h-4 rounded-full border border-border"
                      style={{ backgroundColor: colors.accent }}
                      title="Accent"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
                      );
          })}
        </div>
      </div>

      <div className="space-y-6 pt-4 border-t">
        {/* Sync Across Devices */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {syncAcrossDevices ? (
                  <Cloud className="h-4 w-4 text-primary" />
                ) : (
                  <CloudOff className="h-4 w-4 text-muted-foreground" />
                )}
                <Label htmlFor="sync-toggle" className="font-medium">
                  Sync Across Devices
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                {syncAcrossDevices 
                  ? "Your theme preferences are synced across all your devices"
                  : "Theme preferences are stored locally on this device only"
                }
              </p>
            </div>
            <Switch
              id="sync-toggle"
              checked={syncAcrossDevices}
              onCheckedChange={toggleSyncAcrossDevices}
            />
          </div>
        </div>

        {/* Current Theme */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Current Theme</h4>
            <p className="text-sm text-muted-foreground">
              {themePresets.find(t => t.id === currentTheme)?.name || "T3 Chat"}
            </p>
          </div>
          {currentTheme !== "default" && (
            <Button 
              variant="outline" 
              onClick={() => setTheme("default")}
            >
              Reset to T3 Chat
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 