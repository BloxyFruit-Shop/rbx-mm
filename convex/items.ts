import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./utils/auth";

// Validators
const DemandLevel = v.union(
  v.literal("VeryLow"),
  v.literal("Low"),
  v.literal("Medium"),
  v.literal("High"),
  v.literal("VeryHigh"),
  v.literal("Unknown"),
);

// GrowAGarden item detail schema
const GAGDetail = v.object({
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
  isLimited: v.optional(v.boolean()),
  type: v.union(
    v.object({
      category: v.literal("Crop"),
      isMultiHarvest: v.boolean(),
      sellValue: v.number(),
      buyPrice: v.optional(v.number()),
      shopAmountRange: v.optional(v.string()),
    }),
    v.object({
      category: v.literal("Pet"),
      comesFromEggId: v.optional(v.id("items")),
      spawnChance: v.number(),
    }),
    v.object({
      category: v.literal("Egg"),
      shopAppearanceChance: v.optional(v.number()),
      buyPrice: v.optional(v.number()),
      incubationTime: v.number(),
    }),
    v.object({
      category: v.literal("Gear"),
      buyPrice: v.optional(v.number()),
      powerLevel: v.number(),
    }),
  ),
});

// Create a new item with attributes
export const createItem = mutation({
  args: {
    name: v.string(),
    gameId: v.id("games"),
    thumbnailUrl: v.string(),
    description: v.optional(v.string()),
    demand: DemandLevel,
    isObtainable: v.optional(v.boolean()),
    details: GAGDetail,
    session: v.id("session"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.session);
    // Check for duplicate name
    const exists = await ctx.db
      .query("items")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .unique();
    if (exists) throw new Error(`Item \"${args.name}\" already exists.`);
    const now = Date.now();
    const itemId = await ctx.db.insert("items", {
      name: args.name,
      gameId: args.gameId,
      thumbnailUrl: args.thumbnailUrl,
      description: args.description,
      demand: args.demand,
      isObtainable: args.isObtainable,
    });
    // Insert game-specific attributes
    await ctx.db.insert("gameItemAttributes", {
      itemId,
      attributes: { gameTag: "GrowAGarden", details: args.details },
      lastUpdatedAt: now,
    });
    return itemId;
  },
});

// Update item and its attributes
export const updateItem = mutation({
  args: {
    itemId: v.id("items"),
    name: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    demand: v.optional(DemandLevel),
    isObtainable: v.optional(v.boolean()),
    details: v.optional(GAGDetail),
    session: v.id("session"),
  },
  handler: async (ctx, { itemId, details, session, ...updates }) => {
    await requireAdmin(ctx, session);
    const item = await ctx.db.get(itemId);
    if (!item) throw new Error("Item not found.");
    // Check name uniqueness
    if (updates.name && updates.name !== item.name) {
      const dup = await ctx.db
        .query("items")
        .withIndex("by_name", (q) => q.eq("name", updates.name!))
        .unique();
      if (dup && dup._id !== itemId) {
        throw new Error(`Another item \"${updates.name}\" exists.`);
      }
    }
    // Patch item fields
    await ctx.db.patch(itemId, updates);
    // Update attributes if provided
    if (details) {
      const attr = await ctx.db
        .query("gameItemAttributes")
        .withIndex("by_itemId", (q) => q.eq("itemId", itemId))
        .unique();
      if (attr) {
        await ctx.db.patch(attr._id, {
          attributes: { gameTag: "GrowAGarden", details },
          lastUpdatedAt: Date.now(),
        });
      } else {
        await ctx.db.insert("gameItemAttributes", {
          itemId,
          attributes: { gameTag: "GrowAGarden", details },
          lastUpdatedAt: Date.now(),
        });
      }
    }
    return { success: true };
  },
});

// Get a single item
export const getItemById = query({
  args: { itemId: v.id("items") },
  handler: async (ctx, { itemId }) => {
    return ctx.db.get(itemId);
  },
});

export const getItemsByIds = query({
  args: { itemIds: v.array(v.id("items")) },
  handler: async (ctx, { itemIds }) => {
    const allItems = await ctx.db.query("items").collect();
    return allItems.filter((item) => itemIds.includes(item._id));
  },
});

// List items optionally filtered by game
export const listItems = query({
  args: { gameId: v.optional(v.id("games")) },
  handler: async (ctx, { gameId }) => {
    if (gameId) {
      return ctx.db
        .query("items")
        .withIndex("by_gameId", (q) => q.eq("gameId", gameId))
        .collect();
    }
    return ctx.db.query("items").collect();
  },
});
