import { defineTable } from "convex/server";
import { v } from "convex/values";

const itemDetailsSchema = v.object({
  itemId: v.id("items"),
  quantity: v.number(),
  weightKg: v.optional(v.number()), // Weight in kg
  mutations: v.optional(v.array(v.string())), // e.g., ["Shiny", "Large"]
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

  middlemen: defineTable({
    userId: v.id("user"),
    commissionPercent: v.number(),
    socialLinks: v.optional(v.array(socialLinkSchema)),
    onlineStatus: v.boolean(),
    approvalStatus: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
    approvedBy: v.optional(v.id("user")),
    approvedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_approvalStatus", ["approvalStatus"])
    .index("by_onlineStatus", ["onlineStatus"]),

  middlemanRequests: defineTable({
    requesterId: v.id("user"),
    middlemanUserId: v.id("user"),
    tradeAdId: v.optional(v.id("tradeAds")),
    messageToMiddleman: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("cancelled"),
      v.literal("completed"),
    ),
    respondedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_requesterId_status", ["requesterId", "status"])
    .index("by_middlemanUserId_status", ["middlemanUserId", "status"]),
};
