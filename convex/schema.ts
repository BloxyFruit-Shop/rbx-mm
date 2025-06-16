import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "./schemas/auth";
import { gameTables, gameTags } from "./schemas/games";
import { tradeTables } from "./schemas/trade";

const applicationTables = {
  // BetterAuth User Management
  ...authTables,
  ...gameTables,
  ...tradeTables,

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
