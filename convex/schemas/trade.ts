import { defineTable } from "convex/server";
import { v } from "convex/values";

const itemDetailsSchema = v.object({
  itemId: v.id("items"),
  quantity: v.number(),
  price: v.optional(v.number()), // Price in dollars
  mutations: v.optional(v.array(v.string())), // e.g., ["Gold", "Rainbow", "Wet"]
  age: v.optional(v.number())
});

const socialLinkSchema = v.object({
  type: v.union(
    // Add more social types as needed
    v.literal("discord"),
    v.literal("twitter"),
    v.literal("roblox"),
    v.literal("youtube"),
    v.literal("twitch"),
  ),
  url: v.string(),
});

export const tradeTables = {
  tradeAds: defineTable({
    creatorId: v.id("user"),
    haveItems: v.array(itemDetailsSchema),
    wantItems: v.array(itemDetailsSchema),
    notes: v.optional(v.string()),
    status: v.union(
      v.literal("open"),
      v.literal("closed"),
      v.literal("expired"),
      v.literal("cancelled"),
    ),
    closedAt: v.optional(v.number()),
  })
    .index("by_creatorId_status", ["creatorId", "status"])
    .index("by_status", ["status"]),

  vouches: defineTable({
    fromUserId: v.id("user"),
    toUserId: v.id("user"),
    rating: v.number(), // 1-5
    comment: v.optional(v.string()),
    tradeAdId: v.optional(v.id("tradeAds")),
  })
    .index("by_toUserId", ["toUserId"])
    .index("by_fromUserId", ["fromUserId"])
    .index("by_toUserId_fromUserId", ["toUserId", "fromUserId"]),

};
