import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { selectedModelValidator } from "./modelValidators";

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
    attachments: v.optional(v.array(v.object({
      url: v.string(),
      name: v.string(),
      type: v.string(),
      size: v.optional(v.number()),
    }))),
    reasoningContent: v.optional(v.string()),
    createdAt: v.number(),
    groundingMetadata: v.optional(v.object({
      groundingChunks: v.array(v.object({
        web: v.optional(v.object({
          uri: v.string(),
          title: v.string(),
        })),
      })),
      groundingSupports: v.array(v.object({
        segment: v.object({
          startIndex: v.number(),
          endIndex: v.number(),
          text: v.string(),
        }),
        groundingChunkIndices: v.array(v.number()),
        confidenceScores: v.array(v.number()),
      })),
      webSearchQueries: v.array(v.string()),
      searchEntryPoint: v.optional(v.object({
        renderedContent: v.string(),
      })),
    })),
  })
    .index("by_chatId", ["chatId"])
    .index("by_createdAt", ["createdAt"]),

  userPreferences: defineTable({
    userId: v.string(),
    selectedModel: selectedModelValidator,
    lastUsed: v.number(),
  })
    .index("by_userId", ["userId"]),

  userMessageUsage: defineTable({
    userId: v.string(),
    weekStartDate: v.number(),
    messageCount: v.number(),
    lastUpdated: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_week", ["userId", "weekStartDate"]),
}); 
