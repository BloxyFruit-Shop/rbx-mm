import { defineTable } from "convex/server";
import { v } from "convex/values";

export const authTables = {
  user: defineTable({
    name: v.string(),
    email: v.string(),
    emailVerified: v.boolean(),
    image: v.optional(v.string()),
    updatedAt: v.string(),
    roles: v.optional(
      v.array(
        v.union(
          v.literal("user"),
          v.literal("middleman"),
          v.literal("admin"),
          v.literal("banned"),
        ),
      ),
    ),
    badges: v.optional(v.array(v.string())),
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
};
