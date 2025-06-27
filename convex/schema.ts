import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "./schemas/auth";
import { gameTables, gameTags } from "./schemas/games";
import { tradeTables } from "./schemas/trade";
import { chatSchemes } from './schemas/chat';
import { read } from 'fs';

const applicationTables = {
  // BetterAuth User Management
  ...authTables,
  ...gameTables,
  ...tradeTables,
  ...chatSchemes,

  stocks: defineTable({
    itemId: v.id("items"),
    gameTag: gameTags,
    category: v.string(),
    quantityInStock: v.number(),
    lastSeenSource: v.optional(v.number()),
  }).index("by_itemId", ["itemId"])
    .index("by_category", ["category"]),

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
