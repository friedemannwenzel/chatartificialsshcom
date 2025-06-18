"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { MessageSquare } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function QuickUsageIndicator() {
  const { user } = useUser();
  
  const usageStats = useQuery(
    api.rateLimiting.getUserUsageStats,
    user?.id ? { userId: user.id } : "skip"
  );

  if (!usageStats) {
    return null;
  }

  const { currentWeek } = usageStats;
  const usagePercentage = (currentWeek.count / currentWeek.limit) * 100;
  
  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-400";
    if (percentage >= 70) return "text-yellow-400";
    return "text-green-400";
  };

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <MessageSquare className="h-3 w-3" />
      <span className={`font-medium ${getUsageColor(usagePercentage)}`}>
        {currentWeek.count}/{currentWeek.limit}
      </span>
      <div className="flex-1 min-w-[40px]">
        <Progress 
          value={usagePercentage} 
          className="h-1.5"
        />
      </div>
    </div>
  );
} 