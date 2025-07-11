import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "./schemas/auth";
import { gameTables, gameTags } from "./schemas/games";
import { tradeTables } from "./schemas/trade";
import { chatSchemes } from './schemas/chat';

const applicationTables = {
  // BetterAuth User Management
  ...authTables,
  ...gameTables,
  ...tradeTables,
  ...chatSchemes,

  stocks: defineTable({
    title: v.string(),
    thumbnailUrl: v.optional(v.string()),
    color: v.union(
      v.literal("red"),
      v.literal("green"),
      v.literal("blue"),
      v.literal("yellow"),
      v.literal("purple"),
      v.literal("orange"),
      v.literal("pink"),
      v.literal("gray"),
      v.literal("black"),
      v.literal("white"),
      v.literal("cyan"),
      v.literal("teal"),
      v.literal("brown"),
      v.literal("indigo"),
      v.literal("lime"),
      v.literal("violet"),
      v.literal("amber"),
      v.literal("emerald"),
    ),
    gameTag: gameTags,
    category: v.string(),
    quantityInStock: v.number(),
    lastSeenSource: v.optional(v.number()),
  }).index("by_category", ["category"])
    .index("by_gameTag", ["gameTag"]),

  userSettings: defineTable({
    userId: v.id("user"),
    notifications: v.optional(
      v.object({
        newTradeAds: v.optional(v.boolean()),
        vouchReceived: v.optional(v.boolean()),
      }),
    ),
  }).index("by_userId", ["userId"]),

  notification: defineTable({
    userId: v.id("user"),
    type: v.union(
      v.literal("vouch_received"),
      v.literal("middleman_call"),
      v.literal("trade_offer"),
      v.literal("trade_completed"),
      v.literal("trade_cancelled"),
      v.literal("system"),
      v.literal("chat_message"),
    ),
    content: v.string(),
    chatId: v.optional(v.id("chats")),
    vouchId: v.optional(v.id("vouches")),
    read: v.boolean(),
    createdAt: v.number(),
  })
};

export default defineSchema({
  ...applicationTables,
});

export type UserIdentity = {
  subject: string;
  issuer: string;
  name?: string;
  email?: string;
  tokenIdentifier?: string;
};
