import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { DEMAND_LEVELS, ITEM_RARITIES, ITEM_TYPES } from "./types";
import { internal } from "./_generated/api";
import { vLiteralUnion } from './utils/vLiteralUnion';
import { requireAdmin } from './utils/auth';

const ItemTypeValidator = vLiteralUnion(ITEM_TYPES);
const ItemRarityValidator = vLiteralUnion(ITEM_RARITIES);
const DemandValidator = vLiteralUnion(DEMAND_LEVELS);

// --- Item Management (Admin Only) ---
export const createItem = mutation({
  args: {
    name: v.string(),
    type: ItemTypeValidator,
    rarity: ItemRarityValidator,
    thumbnailUrl: v.string(),
    description: v.optional(v.string()),
    sellValue: v.number(),
    buyPrice: v.number(),
    demand: DemandValidator,
    isMultiHarvest: v.boolean(),
    shopAmountRange: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // ensure no duplicate
    const existing = await ctx.db
      .query("items")
      .withIndex("by_name", q => q.eq("name", args.name))
      .unique();
    if (existing) {
      throw new Error(`Item "${args.name}" already exists.`);
    }

    const now = Date.now();
    const itemId = await ctx.db.insert("items", {
      name: args.name,
      type: args.type,
      rarity: args.rarity,
      thumbnailUrl: args.thumbnailUrl,
      description: args.description,
      sellValue: args.sellValue,
      buyPrice: args.buyPrice,
      demand: args.demand,
      isMultiHarvest: args.isMultiHarvest,
      shopAmountRange: args.shopAmountRange,
      valueLastUpdatedAt: now,
    });

    await ctx.runMutation(internal.items.addItemValueHistoryEntry, {
      itemId,
      value: args.sellValue,
      demand: args.demand,
      timestamp: now,
    });

    return itemId;
  },
});

export const updateItemDetails = mutation({
  args: {
    itemId: v.id("items"),
    name: v.optional(v.string()),
    type: v.optional(ItemTypeValidator),
    rarity: v.optional(ItemRarityValidator),
    thumbnailUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    isMultiHarvest: v.optional(v.boolean()),
    shopAmountRange: v.optional(v.string()),
  },
  handler: async (ctx, { itemId, ...updates }) => {
    await requireAdmin(ctx);

    const item = await ctx.db.get(itemId);
    if (!item) throw new Error("Item not found.");

    // check name uniqueness
    if (updates.name && updates.name !== item.name) {
      const dup = await ctx.db
        .query("items")
        .withIndex("by_name", q => q.eq("name", updates.name!))
        .unique();
      if (dup && dup._id !== itemId) {
        throw new Error(`Another item "${updates.name}" exists.`);
      }
    }

    await ctx.db.patch(itemId, updates);
    return { success: true };
  },
});

export const updateItemValue = mutation({
  args: {
    itemId: v.id("items"),
    newSellValue: v.number(),
    newDemand: DemandValidator,
  },
  handler: async (ctx, { itemId, newSellValue, newDemand }) => {
    await requireAdmin(ctx);

    const item = await ctx.db.get(itemId);
    if (!item) throw new Error("Item not found.");

    const now = Date.now();
    await ctx.db.patch(itemId, {
      sellValue: newSellValue,
      demand: newDemand,
      valueLastUpdatedAt: now,
    });

    await ctx.runMutation(internal.items.addItemValueHistoryEntry, {
      itemId,
      value: newSellValue,
      demand: newDemand,
      timestamp: now,
    });

    return { success: true };
  },
});

export const deleteItem = mutation({
  args: { itemId: v.id("items") },
  handler: async (ctx, { itemId }) => {
    await requireAdmin(ctx);
    const item = await ctx.db.get(itemId);
    if (!item) throw new Error("Item not found.");
    await ctx.db.delete(itemId);
    return {
      success: true,
      message: "Item deleted; please handle related data accordingly.",
    };
  },
});

export const addItemValueHistoryEntry = internalMutation({
  args: {
    itemId: v.id("items"),
    value: v.number(),
    demand: DemandValidator,
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("itemValueHistory", {
      itemId: args.itemId,
      value: args.value,
      demand: args.demand,
      timestamp: args.timestamp,
    });
  },
});

export const getItemById = query({
  args: { itemId: v.id("items") },
  handler: async (ctx, { itemId }) => {
    return ctx.db.get(itemId);
  },
});

export const listItems = query({
  args: {
    type: v.optional(ItemTypeValidator),
    rarity: v.optional(ItemRarityValidator),
  },
  handler: async (ctx, { type, rarity }) => {
    let items: Doc<"items">[];
    if (type) {
      items = await ctx.db
        .query("items")
        .withIndex("by_type", q => q.eq("type", type))
        .collect();
      if (rarity) items = items.filter(i => i.rarity === rarity);
    } else if (rarity) {
      items = await ctx.db
        .query("items")
        .withIndex("by_rarity", q => q.eq("rarity", rarity))
        .collect();
    } else {
      items = await ctx.db.query("items").collect();
    }
    return items;
  },
});

// Enhanced query with filtering, sorting, and pagination
export const searchItems = query({
  args: {
    searchTerm: v.optional(v.string()),
    type: v.optional(ItemTypeValidator),
    rarity: v.optional(ItemRarityValidator),
    sortBy: v.optional(v.union(
      v.literal("name"),
      v.literal("sellValue"),
      v.literal("buyPrice"),
      v.literal("rarity")
    )),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const query = args.type 
      ? ctx.db.query("items").withIndex("by_type", q => q.eq("type", args.type!))
      : ctx.db.query("items");
    
    let items = await query.collect();
    
    // Apply additional filters
    if (args.rarity) {
      items = items.filter(item => item.rarity === args.rarity);
    }
    
    if (args.searchTerm) {
      const searchLower = args.searchTerm.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort items
    const rarityOrder: Record<string, number> = {
      Common: 1,
      Uncommon: 2,
      Rare: 3,
      Epic: 4,
      Legendary: 5,
      Mythical: 6,
      Divine: 7,
      Prismatic: 8,
      Limited: 9,
      "N/A": 0,
    };
    
    items.sort((a, b) => {
      let result = 0;
      switch (args.sortBy) {
        case "name":
          result = a.name.localeCompare(b.name);
          break;
        case "sellValue":
          result = a.sellValue - b.sellValue;
          break;
        case "buyPrice":
          result = a.buyPrice - b.buyPrice;
          break;
        case "rarity":
          result = (rarityOrder[a.rarity] || 0) - (rarityOrder[b.rarity] || 0);
          break;
        default:
          // Default sort by rarity then name
          result = (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
          if (result === 0) {
            result = a.name.localeCompare(b.name);
          }
      }
      
      // If primary sort is equal, use ID for stable sorting
      if (result === 0) {
        result = a._id.localeCompare(b._id);
      }
      
      return args.sortOrder === "asc" ? result : -result;
    });
    
    // Apply pagination
    const limit = args.limit ?? 50; // Default limit if not specified
    const startIndex = args.cursor ? parseInt(args.cursor) : 0;
    
    console.log('Pagination:', {
      cursor: args.cursor,
      startIndex,
      limit,
      totalItems: items.length,
      willHaveMore: startIndex + limit < items.length
    });
    
    const paginatedItems = items.slice(startIndex, startIndex + limit);
    
    return {
      items: paginatedItems,
      nextCursor: startIndex + limit < items.length 
        ? String(startIndex + limit) 
        : null,
      totalCount: items.length,
    };
  },
});

// Get item statistics by type (lightweight version)
export const getItemStats = query({
  args: {},
  handler: async (ctx) => {
    // For performance, we'll calculate basic stats without loading all items
    const stats = {
      totalItems: 0,
      byType: {} as Record<string, number>,
      byRarity: {} as Record<string, number>,
    };
    
    // Count items by type using indexes
    for (const type of ITEM_TYPES) {
      const count = await ctx.db
        .query("items")
        .withIndex("by_type", q => q.eq("type", type))
        .collect()
        .then(items => items.length);
      stats.byType[type] = count;
      stats.totalItems += count;
    }
    
    // For rarities, we need to iterate through all items once
    const allItems = await ctx.db.query("items").collect();
    allItems.forEach(item => {
      stats.byRarity[item.rarity] = (stats.byRarity[item.rarity] || 0) + 1;
    });
    
    return stats;
  },
});

// Get trending items based on recent value changes
export const getTrendingItems = query({
  args: {
    limit: v.optional(v.number()),
    direction: v.optional(v.union(v.literal("up"), v.literal("down"))),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    const items = await ctx.db.query("items").collect();
    
    // Get recent value history for each item
    const itemsWithTrends = await Promise.all(
      items.map(async (item) => {
        const history = await ctx.db
          .query("itemValueHistory")
          .withIndex("by_itemId_timestamp", q => q.eq("itemId", item._id))
          .order("desc")
          .take(2);
        
        if (history?.length < 2) {
          return { item, changePercent: 0, changeAmount: 0 };
        }
        
        const currentValue = history ? history[0]?.value ?? 0 : 0;
        const previousValue = history ?  history[1]?.value ?? 0  : 0;
        const changeAmount = currentValue - previousValue;
        const changePercent = previousValue > 0 
          ? ((changeAmount / previousValue) * 100) 
          : 0;
        
        return { item, changePercent, changeAmount };
      })
    );
    
    // Filter and sort based on direction
    let trending = itemsWithTrends.filter(({ changePercent }) => changePercent !== 0);
    
    if (args.direction === "up") {
      trending = trending.filter(({ changePercent }) => changePercent > 0);
      trending.sort((a, b) => b.changePercent - a.changePercent);
    } else if (args.direction === "down") {
      trending = trending.filter(({ changePercent }) => changePercent < 0);
      trending.sort((a, b) => a.changePercent - b.changePercent);
    } else {
      // Show both directions, sorted by absolute change
      trending.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
    }
    
    return trending.slice(0, limit);
  },
});

// Get items by demand level
export const getItemsByDemand = query({
  args: {
    demand: DemandValidator,
  },
  handler: async (ctx, { demand }) => {
    const items = await ctx.db.query("items").collect();
    return items.filter(item => item.demand === demand);
  },
});

// Get similar items (same type and similar rarity)
export const getSimilarItems = query({
  args: {
    itemId: v.id("items"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) return [];
    
    const limit = args.limit ?? 6;
    
    // Get items of the same type
    const sameTypeItems = await ctx.db
      .query("items")
      .withIndex("by_type", q => q.eq("type", item.type))
      .collect();
    
    // Filter out the current item and sort by similarity
    const rarityOrder: Record<string, number> = {
      Common: 1,
      Uncommon: 2,
      Rare: 3,
      Epic: 4,
      Legendary: 5,
      Mythical: 6,
      Divine: 7,
      Prismatic: 8,
      Limited: 9,
      "N/A": 0,
    };
    
    const currentRarityValue = rarityOrder[item.rarity] || 0;
    
    const similarItems = sameTypeItems
      .filter(i => i._id !== item._id)
      .map(i => ({
        item: i,
        rarityDiff: Math.abs((rarityOrder[i.rarity] || 0) - currentRarityValue),
        valueDiff: Math.abs(i.sellValue - item.sellValue),
      }))
      .sort((a, b) => {
        // Sort by rarity difference first, then by value difference
        if (a.rarityDiff !== b.rarityDiff) {
          return a.rarityDiff - b.rarityDiff;
        }
        return a.valueDiff - b.valueDiff;
      })
      .slice(0, limit)
      .map(({ item }) => item);
    
    return similarItems;
  },
});

export const getItemValueHistory = query({
  args: { itemId: v.id("items") },
  handler: async (ctx, { itemId }) => {
    return ctx.db
      .query("itemValueHistory")
      .withIndex("by_itemId_timestamp", q => q.eq("itemId", itemId))
      .order("desc")
      .collect();
  },
});

export const getItemsByIds = query({
  args: { itemIds: v.array(v.id("items")) },
  handler: async (ctx, { itemIds }) => {
    const out: Doc<"items">[] = [];
    for (const id of itemIds) {
      const itm = await ctx.db.get(id);
      if (itm) out.push(itm);
    }
    return out;
  },
});