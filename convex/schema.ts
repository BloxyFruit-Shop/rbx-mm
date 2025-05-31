import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

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
  // BetterAuth User Management
  user: defineTable({
    name: v.string(),
    email: v.string(),
    emailVerified: v.boolean(),
    image: v.optional(v.string()),
    updatedAt: v.string(),
    roles: v.optional(v.array(v.union(
      v.literal("user"),
      v.literal("middleman"),
      v.literal("admin"),
      v.literal("banned")
    ))),
    badges: v.optional(v.array(v.string())), // e.g., ["Trader", "Collector"]
  }).index("byEmail", ["email"]),
  session: defineTable({
    expiresAt: v.string(),
    token: v.string(),
    updatedAt: v.string(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    userId: v.id("user"),
  })
    .index("byToken", ["token"])
    .index("byUserId", ["userId"]),
  account: defineTable({
    accountId: v.string(),
    providerId: v.string(),
    userId: v.id("user"),
    accessToken: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    idToken: v.optional(v.string()),
    accessTokenExpiresAt: v.optional(v.string()),
    refreshTokenExpiresAt: v.optional(v.string()),
    scope: v.optional(v.string()),
    password: v.optional(v.string()),
    updatedAt: v.string(),
  }).index("byUserId", ["userId"]),
  verification: defineTable({
    identifier: v.string(),
    value: v.string(),
    expiresAt: v.string(),
    updatedAt: v.optional(v.string()),
  }),
  jwks: defineTable({
    publicKey: v.string(),
    privateKey: v.string(),
  }),
  // End of BetterAuth User Management

  items: defineTable({
    name: v.string(),
    type: v.union(
      v.literal("Crop"),
      v.literal("Pet"),
      v.literal("Gear"),
      v.literal("Sprinkler"),
      v.literal("Fruit"),
      v.literal("Egg"),
      v.literal("Tool"),
      v.literal("Material"),
      v.literal("Misc")
    ),
    rarity: v.union(
      v.literal("Common"),
      v.literal("Uncommon"),
      v.literal("Rare"),
      v.literal("Epic"),
      v.literal("Legendary"),
      v.literal("Mythical"),
      v.literal("Divine"),
      v.literal("Prismatic"),
      v.literal("N/A"),
    ),
    thumbnailUrl: v.string(),
    description: v.optional(v.string()),
    sellValue: v.number(),
    buyPrice: v.number(),
    demand: v.union(
      v.literal("VeryLow"),
      v.literal("Low"),
      v.literal("Medium"),
      v.literal("High"),
      v.literal("VeryHigh"),
      v.literal("Unknown")
    ),
    isMultiHarvest: v.boolean(),
    shopAmountRange: v.optional(v.string()),
    dropChance: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    isLimited: v.optional(v.boolean()),
    isObtainable: v.optional(v.boolean()),
    // Metadata for tracking data freshness
    valueLastUpdatedAt: v.number(),
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
      v.literal("VeryHigh"),
      v.literal("Unknown")
    ),
  }).index("by_itemId_timestamp", ["itemId", "timestamp"]),

  tradeAds: defineTable({
    creatorId: v.id("user"),
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
      v.literal("rejected")
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
    lastSeenSource: v.optional(v.number()),
  })
    .index("by_itemId", ["itemId"]),

  stockHistory: defineTable({
    itemId: v.id("items"),
    timestamp: v.number(),
    quantity: v.number(),
    price: v.optional(v.number()),
  }).index("by_itemId_timestamp", ["itemId", "timestamp"]),

  userSettings: defineTable({
    userId: v.id("user"),
    notifications: v.optional(v.object({
      newTradeAds: v.optional(v.boolean()),
      vouchReceived: v.optional(v.boolean()),
    })),
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
