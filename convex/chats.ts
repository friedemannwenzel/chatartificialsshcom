import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createChat = mutation({
  args: {
    chatId: v.string(),
    userId: v.string(),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    return await ctx.db.insert("chats", {
      chatId: args.chatId,
      userId: args.userId,
      title: args.title,
      createdAt: now,
    });
  },
});

export const getChatsByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const chats = await ctx.db
      .query("chats")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
    
    return chats;
  },
});

export const getChatById = query({
  args: { chatId: v.string() },
  handler: async (ctx, args) => {
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .first();
    
    return chat;
  },
});

export const updateChatTitle = mutation({
  args: {
    chatId: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .first();
    
    if (!chat) {
      throw new Error("Chat not found");
    }
    
    await ctx.db.patch(chat._id, {
      title: args.title,
    });
  },
});

export const addMessage = mutation({
  args: {
    chatId: v.string(),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    attachments: v.optional(v.array(v.object({
      url: v.string(),
      name: v.string(),
      type: v.string(),
      size: v.optional(v.number()),
    }))),
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", {
      chatId: args.chatId,
      content: args.content,
      role: args.role,
      attachments: args.attachments,
      createdAt: Date.now(),
      groundingMetadata: args.groundingMetadata,
    });
  },
});

export const getMessagesByChat = query({
  args: { chatId: v.string() },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .order("asc")
      .collect();
    
    return messages;
  },
});

export const deleteMessagesFromIndex = mutation({
  args: {
    chatId: v.string(),
    fromIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .order("asc")
      .collect();
    
    // Delete messages from the specified index onwards
    const messagesToDelete = messages.slice(args.fromIndex);
    
    for (const message of messagesToDelete) {
      await ctx.db.delete(message._id);
    }
    
    return messagesToDelete.length;
  },
});

export const deleteChat = mutation({
  args: { chatId: v.string() },
  handler: async (ctx, args) => {
    // Find the chat by chatId
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .first();
    if (!chat) throw new Error("Chat not found");
    // Delete all messages for this chat
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .collect();
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
    // Delete the chat itself
    await ctx.db.delete(chat._id);
    return true;
  },
}); 