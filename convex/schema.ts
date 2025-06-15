import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  chats: defineTable({
    chatId: v.string(),
    userId: v.string(),
    title: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_chatId", ["chatId"])
    .index("by_userId", ["userId"]),

  messages: defineTable({
    chatId: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    createdAt: v.number(),
  })
    .index("by_chatId", ["chatId"])
    .index("by_createdAt", ["createdAt"]),

  userPreferences: defineTable({
    userId: v.string(),
    selectedModel: v.object({
      id: v.string(),
      name: v.string(),
      provider: v.string(),
      description: v.string(),
      maxTokens: v.optional(v.number()),
      supportsStreaming: v.boolean(),
      supportsWebSearch: v.optional(v.boolean()),
      capabilities: v.optional(v.array(v.string())),
    }),
    theme: v.optional(v.string()),
    lastUsed: v.number(),
  })
    .index("by_userId", ["userId"]),
}); 