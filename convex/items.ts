/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./utils/auth";
import { demandLevel, allItemCategories, allRarities, itemAttribute, gameTags } from "./schemas/games";
import { paginationOptsValidator } from "convex/server";
import { Doc } from './_generated/dataModel';

// Rarity order mapping for sorting
const RARITY_SORT_ORDER: Record<string, number> = {
  "N/A": 10,
  Common: 1,
  Uncommon: 2,
  Rare: 3,
  Epic: 4,
  Legendary: 5,
  Mythical: 6,
  Divine: 7,
  Prismatic: 8,
};

// Create a new item
export const createItem = mutation({
  args: {
    name: v.string(),
    gameId: v.id("games"),
    thumbnailUrl: v.string(),
    description: v.optional(v.string()),
    demand: demandLevel,
    isObtainable: v.optional(v.boolean()),
    sellValue: v.optional(v.number()),
    buyPrice: v.optional(v.number()),
    category: allItemCategories,
    rarity: allRarities,
    attributes: v.array(itemAttribute),
    session: v.id("session"),
  },
  handler: async (ctx, { session, ...args }) => {
    await requireAdmin(ctx, session);
    // Check for duplicate name
    const exists = await ctx.db
      .query("items")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .unique();
    if (exists) throw new Error(`Item "${args.name}" already exists.`);

    // Calculate rarity order
    const rarityOrder = RARITY_SORT_ORDER[args.rarity] ?? 0;

    const itemId = await ctx.db.insert("items", {
      ...args,
      rarityOrder,
    });
    return itemId;
  },
});

// Update item
export const updateItem = mutation({
  args: {
    itemId: v.id("items"),
    name: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    demand: v.optional(demandLevel),
    isObtainable: v.optional(v.boolean()),
    sellValue: v.optional(v.number()),
    buyPrice: v.optional(v.number()),
    category: v.optional(allItemCategories),
    rarity: v.optional(allRarities),
    attributes: v.optional(v.array(itemAttribute)),
    session: v.id("session"),
  },
  handler: async (ctx, { itemId, session, ...updates }) => {
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
        throw new Error(`Another item "${updates.name}" exists.`);
      }
    }

    // Calculate rarity order if rarity is being updated
    const finalUpdates: Partial<Doc<"items">> = { ...updates };
    if (updates.rarity) {
      finalUpdates.rarityOrder = RARITY_SORT_ORDER[updates.rarity] ?? 0;
    }

    await ctx.db.patch(itemId, finalUpdates);
    return { success: true };
  },
});

// Search items with filtering and sorting
export const searchItems = query({
  args: {
    gameId: v.optional(v.id("games")),
    gameTag: v.optional(gameTags), // For backward compatibility
    searchTerm: v.optional(v.string()),
    category: v.optional(allItemCategories),
    rarity: v.optional(allRarities),
    sortBy: v.optional(
      v.union(
        v.literal("name"),
        v.literal("sellValue"),
        v.literal("buyPrice"),
        v.literal("rarity"),
      ),
    ),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    // Handle backward compatibility - convert gameTag to gameId
    let gameId = args.gameId;
    if (!gameId && args.gameTag) {
      const game = await ctx.db
        .query("games")
        .withIndex("by_tag", (q) => q.eq("gameTag", args.gameTag ?? "GrowAGarden"))
        .unique();
      if (!game) {
        throw new Error(`Game with tag "${args.gameTag}" not found`);
      }
      gameId = game._id;
    }

    if (!gameId) {
      throw new Error("Either gameId or gameTag must be provided");
    }
    if (args.searchTerm) {
      let searchQuery = ctx.db
        .query("items")
        .withSearchIndex("search_name", (q) =>
          q.search("name", args.searchTerm ?? "").eq("gameId", gameId),
        );

      if (args.category) {
        searchQuery = searchQuery.filter((q) => q.eq(q.field("category"), args.category));
      }
      if (args.rarity) {
        searchQuery = searchQuery.filter((q) => q.eq(q.field("rarity"), args.rarity));
      }

      return await searchQuery.paginate(args.paginationOpts);
    }

    let query;
    const order = args.sortOrder === "asc" ? "asc" : "desc";

    switch (args.sortBy) {
      case "name":
        query = ctx.db
          .query("items")
          .withIndex("by_gameId_name", (q) => q.eq("gameId", gameId))
          .order(order);
        break;
      case "sellValue":
        query = ctx.db
          .query("items")
          .withIndex("by_gameId_sellValue", (q) => q.eq("gameId", gameId))
          .order(order);
        break;
      case "buyPrice":
        query = ctx.db
          .query("items")
          .withIndex("by_gameId_buyPrice", (q) => q.eq("gameId", gameId))
          .order(order);
        break;
      case "rarity":
      default:
        query = ctx.db
          .query("items")
          .withIndex("by_gameId_rarityOrder", (q) => q.eq("gameId", gameId))
          .order(order);
        break;
    }

    if (args.category) {
      query = query.filter((q) => q.eq(q.field("category"), args.category));
    }
    if (args.rarity) {
      query = query.filter((q) => q.eq(q.field("rarity"), args.rarity));
    }

    return await query.paginate(args.paginationOpts);
  },
});

// Get item details (simplified - just a direct get)
export const getItemDetails = query({
  args: { itemId: v.id("items") },
  handler: async (ctx, { itemId }) => {
    return ctx.db.get(itemId);
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

// List detailed items for a given game
export const listItemDetailsByGame = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    return ctx.db
      .query("items")
      .withIndex("by_gameId", (q) => q.eq("gameId", gameId))
      .collect();
  },
});

// Delete item
export const deleteItem = mutation({
  args: {
    itemId: v.id("items"),
    session: v.id("session"),
  },
  handler: async (ctx, { itemId, session }) => {
    await requireAdmin(ctx, session);
    const item = await ctx.db.get(itemId);
    if (!item) throw new Error("Item not found.");
    
    await ctx.db.delete(itemId);
    return { success: true };
  },
});
