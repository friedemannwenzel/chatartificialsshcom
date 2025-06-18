import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const WEEKLY_MESSAGE_LIMIT = 15;

function getWeekStartDate(date: Date = new Date()): number {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.getTime();
}

export const checkRateLimit = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const weekStart = getWeekStartDate();
    
    const usage = await ctx.db
      .query("userMessageUsage")
      .withIndex("by_userId_week", (q) => 
        q.eq("userId", args.userId).eq("weekStartDate", weekStart)
      )
      .first();

    const currentCount = usage?.messageCount || 0;
    const remaining = Math.max(0, WEEKLY_MESSAGE_LIMIT - currentCount);
    
    return {
      canSendMessage: currentCount < WEEKLY_MESSAGE_LIMIT,
      currentCount,
      limit: WEEKLY_MESSAGE_LIMIT,
      remaining,
      weekStart,
      resetDate: weekStart + 7 * 24 * 60 * 60 * 1000,
    };
  },
});

export const incrementMessageCount = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const weekStart = getWeekStartDate();
    const now = Date.now();
    
    const existing = await ctx.db
      .query("userMessageUsage")
      .withIndex("by_userId_week", (q) => 
        q.eq("userId", args.userId).eq("weekStartDate", weekStart)
      )
      .first();

    if (existing) {
      if (existing.messageCount >= WEEKLY_MESSAGE_LIMIT) {
        throw new Error(`Rate limit exceeded. You can send up to ${WEEKLY_MESSAGE_LIMIT} messages per week.`);
      }
      
      await ctx.db.patch(existing._id, {
        messageCount: existing.messageCount + 1,
        lastUpdated: now,
      });
      
      return existing.messageCount + 1;
    } else {
      await ctx.db.insert("userMessageUsage", {
        userId: args.userId,
        weekStartDate: weekStart,
        messageCount: 1,
        lastUpdated: now,
      });
      
      return 1;
    }
  },
});

export const getUserUsageStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const weekStart = getWeekStartDate();
    
    const currentWeek = await ctx.db
      .query("userMessageUsage")
      .withIndex("by_userId_week", (q) => 
        q.eq("userId", args.userId).eq("weekStartDate", weekStart)
      )
      .first();

    const allUsage = await ctx.db
      .query("userMessageUsage")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(10);

    const currentCount = currentWeek?.messageCount || 0;
    
    return {
      currentWeek: {
        count: currentCount,
        limit: WEEKLY_MESSAGE_LIMIT,
        remaining: Math.max(0, WEEKLY_MESSAGE_LIMIT - currentCount),
        weekStart,
        resetDate: weekStart + 7 * 24 * 60 * 60 * 1000,
      },
      history: allUsage.map(usage => ({
        weekStart: usage.weekStartDate,
        count: usage.messageCount,
        lastUpdated: usage.lastUpdated,
      })),
    };
  },
}); 