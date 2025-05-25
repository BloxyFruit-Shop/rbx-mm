import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const itemDetailsSchema = v.object({
  itemId: v.id("items"),
  quantity: v.number(),
  weightKg: v.optional(v.number()), // Weight in kg
  mutations: v.optional(v.array(v.string())), // e.g., ["Shiny", "Large"]
});

const socialLinkSchema = v.object({
  type: v.union( // Add more social types as needed
    v.literal("discord"),
    v.literal("twitter"),
    v.literal("roblox"),
    v.literal("youtube"),
    v.literal("twitch")
  ),
  url: v.string(),
});

const applicationTables = {
  // Extend the users table from authTables
  // Explicitly define fields from authTables here to help TypeScript inference,
  // even if authTables already defines them. The schema merge will handle it.
  users: defineTable({
    // Fields from authTables (explicitly listed for TS)
    name: v.optional(v.string()), 
    email: v.optional(v.string()),
    // emailVerificationTime: v.optional(v.number()), // from authTables if needed
    // phone: v.optional(v.string()), // from authTables if needed
    // phoneVerificationTime: v.optional(v.number()), // from authTables if needed
    isAnonymous: v.optional(v.boolean()), // from authTables

    // Application-specific fields
    robloxUserId: v.optional(v.string()),
    robloxUsername: v.optional(v.string()), 
    robloxAvatarUrl: v.optional(v.string()),
    discordUserId: v.optional(v.string()),
    discordUsername: v.optional(v.string()),
    discordAvatarUrl: v.optional(v.string()),
    roles: v.optional(v.array(v.union( 
      v.literal("user"),
      v.literal("middleman"),
      v.literal("admin")
      // Add "banned" here if you plan to use it as a role: v.literal("banned")
    ))),
    badges: v.optional(v.array(v.string())),
    bio: v.optional(v.string()),
    lastLoginAt: v.optional(v.number()), // Timestamp
  })
  .index("by_robloxUserId", ["robloxUserId"])
  .index("by_discordUserId", ["discordUserId"]),
  // Note: authTables also defines .index("email", ["email"]) and .index("phone", ["phone"]) on users.

  items: defineTable({
    name: v.string(),
    type: v.union( 
      v.literal("Seed"),
      v.literal("Gear"),
      v.literal("Egg"),
      v.literal("Misc"),
      v.literal("Pet")
    ),
    rarity: v.union( 
      v.literal("Common"),
      v.literal("Uncommon"),
      v.literal("Rare"),
      v.literal("Epic"),
      v.literal("Legendary"),
      v.literal("Mythic")
    ),
    thumbnailUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    currentValue: v.number(),
    demand: v.union( 
      v.literal("VeryLow"),
      v.literal("Low"),
      v.literal("Medium"),
      v.literal("High"),
      v.literal("VeryHigh")
    ),
    valueLastUpdatedAt: v.number(), // Timestamp
  })
  .index("by_name", ["name"])
  .index("by_type", ["type"])
  .index("by_rarity", ["rarity"]),

  itemValueHistory: defineTable({
    itemId: v.id("items"),
    timestamp: v.number(),
    value: v.number(),
    demand: v.union(
      v.literal("VeryLow"),
      v.literal("Low"),
      v.literal("Medium"),
      v.literal("High"),
      v.literal("VeryHigh")
    ),
  }).index("by_itemId_timestamp", ["itemId", "timestamp"]),

  tradeAds: defineTable({
    creatorId: v.id("users"),
    haveItems: v.array(itemDetailsSchema),
    wantItems: v.array(itemDetailsSchema),
    notes: v.optional(v.string()), 
    status: v.union(
      v.literal("open"),
      v.literal("closed"), 
      v.literal("expired"), 
      v.literal("cancelled") 
    ),
    closedAt: v.optional(v.number()), 
  })
  .index("by_creatorId_status", ["creatorId", "status"])
  .index("by_status", ["status"]),

  vouches: defineTable({
    fromUserId: v.id("users"),
    toUserId: v.id("users"),
    rating: v.number(), // 1-5
    comment: v.optional(v.string()), 
    tradeAdId: v.optional(v.id("tradeAds")),
  })
  .index("by_toUserId", ["toUserId"])
  .index("by_fromUserId", ["fromUserId"])
  .index("by_toUserId_fromUserId", ["toUserId", "fromUserId"]),

  middlemen: defineTable({ 
    userId: v.id("users"), 
    commissionPercent: v.number(), 
    socialLinks: v.optional(v.array(socialLinkSchema)),
    onlineStatus: v.boolean(), 
    approvalStatus: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    approvedBy: v.optional(v.id("users")), 
    approvedAt: v.optional(v.number()),
  })
  .index("by_userId", ["userId"])
  .index("by_approvalStatus", ["approvalStatus"])
  .index("by_onlineStatus", ["onlineStatus"]),

  middlemanRequests: defineTable({
    requesterId: v.id("users"),
    middlemanUserId: v.id("users"), 
    tradeAdId: v.optional(v.id("tradeAds")), 
    messageToMiddleman: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined"), 
      v.literal("cancelled"), 
      v.literal("completed")
    ),
    respondedAt: v.optional(v.number()), 
    completedAt: v.optional(v.number()),
  })
  .index("by_requesterId_status", ["requesterId", "status"])
  .index("by_middlemanUserId_status", ["middlemanUserId", "status"]),

  stocks: defineTable({ 
    itemId: v.id("items"),
    quantityInStock: v.number(),
    averageBuyPrice: v.optional(v.number()), 
    lastSeenSource: v.optional(v.string()), 
  })
  .index("by_itemId", ["itemId"]), 

  stockHistory: defineTable({
    itemId: v.id("items"),
    timestamp: v.number(),
    quantity: v.number(),
    price: v.optional(v.number()), 
  }).index("by_itemId_timestamp", ["itemId", "timestamp"]),

  userSettings: defineTable({
    userId: v.id("users"),
    notifications: v.optional(v.object({
      newTradeAds: v.optional(v.boolean()),
      vouchReceived: v.optional(v.boolean()),
    })),
  }).index("by_userId", ["userId"]),
};

export default defineSchema({
  ...authTables, 
  ...applicationTables,
});

export type UserIdentity = {
  subject: string; 
  issuer: string;
  name?: string;
  email?: string;
  tokenIdentifier?: string; 
};
