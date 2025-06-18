"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MessageSquare, Calendar, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function MessageUsageBar() {
  const { user } = useUser();
  
  const usageStats = useQuery(
    api.rateLimiting.getUserUsageStats,
    user?.id ? { userId: user.id } : "skip"
  );

  if (!usageStats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Message Usage
          </CardTitle>
          <CardDescription>Loading your usage statistics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={0} className="w-full" />
            <div className="text-sm text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { currentWeek } = usageStats;
  const usagePercentage = (currentWeek.count / currentWeek.limit) * 100;
  const resetDate = new Date(currentWeek.resetDate);
  const now = new Date();
  const daysUntilReset = Math.ceil((resetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-500";
    if (percentage >= 70) return "text-yellow-500";
    return "text-green-500";
  };



  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Message Usage
        </CardTitle>
        <CardDescription>
          Track your weekly message usage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">This Week</span>
            <span className={`text-sm font-bold ${getUsageColor(usagePercentage)}`}>
              {currentWeek.count} / {currentWeek.limit}
            </span>
          </div>
          <Progress 
            value={usagePercentage} 
            className="w-full h-2"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{currentWeek.remaining} messages remaining</span>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Resets in {daysUntilReset} day{daysUntilReset !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Status</span>
            {currentWeek.count >= currentWeek.limit ? (
              <Badge variant="destructive">Limit Reached</Badge>
            ) : currentWeek.count >= currentWeek.limit * 0.9 ? (
              <Badge variant="secondary">Nearly Full</Badge>
            ) : (
              <Badge variant="default">Available</Badge>
            )}
          </div>
          
          {currentWeek.count >= currentWeek.limit && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <RotateCcw className="h-3 w-3" />
              Your usage will reset on {resetDate.toLocaleDateString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 