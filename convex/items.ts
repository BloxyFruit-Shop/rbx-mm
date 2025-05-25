import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import type { Doc } from "./_generated/dataModel"; // Removed unused Id
import { requireAdmin } from "./lib/auth";
import { DEMAND_LEVELS, ITEM_RARITIES, ITEM_TYPES } from "./types";
import { internal } from "./_generated/api";
import { vLiteralUnion } from './utils/vLiteralUnion';

const ItemTypeValidator = vLiteralUnion(ITEM_TYPES);
const ItemRarityValidator = vLiteralUnion(ITEM_RARITIES);
const DemandValidator = vLiteralUnion(DEMAND_LEVELS);

// --- Item Management (Admin Only) ---
export const createItem = mutation({
  args: {
    name: v.string(),
    type: ItemTypeValidator,
    rarity: ItemRarityValidator,
    thumbnailUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    initialValue: v.number(),
    initialDemand: DemandValidator,
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const existingItem = await ctx.db
      .query("items")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .unique();

    if (existingItem) {
      throw new Error(`Item with name "${args.name}" already exists.`);
    }

    const itemId = await ctx.db.insert("items", {
      name: args.name,
      type: args.type,
      rarity: args.rarity,
      thumbnailUrl: args.thumbnailUrl,
      description: args.description,
      currentValue: args.initialValue,
      demand: args.initialDemand,
      valueLastUpdatedAt: Date.now(),
    });

    await ctx.runMutation(internal.items?.addItemValueHistoryEntry, {
      itemId,
      value: args.initialValue,
      demand: args.initialDemand,
      timestamp: Date.now(),
    });

    return itemId;
  },
});

export const updateItemDetails = mutation({
  args: {
    itemId: v.id("items"),
    name: v.optional(v.string()),
    type: ItemTypeValidator,
    rarity: ItemRarityValidator,
    thumbnailUrl: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, { itemId, ...updates }) => {
    await requireAdmin(ctx);
    const item = await ctx.db.get(itemId);
    if (!item) {
      throw new Error("Item not found.");
    }

    if (updates.name && updates.name !== item.name) {
      const existingItemByName = await ctx.db
        .query("items")
        .withIndex("by_name", (q) => q.eq("name", updates.name!))
        .unique();
      if (existingItemByName && existingItemByName._id !== itemId) {
        throw new Error(`Another item with name "${updates.name}" already exists.`);
      }
    }

    await ctx.db.patch(itemId, updates);
    return { success: true };
  },
});

export const updateItemValue = mutation({
  args: {
    itemId: v.id("items"),
    newValue: v.number(),
    newDemand: DemandValidator,
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Item not found.");
    }

    const now = Date.now();
    await ctx.db.patch(args.itemId, {
      currentValue: args.newValue,
      demand: args.newDemand,
      valueLastUpdatedAt: now,
    });

    await ctx.runMutation(internal.items.addItemValueHistoryEntry, {
      itemId: args.itemId,
      value: args.newValue,
      demand: args.newDemand,
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
    if (!item) {
      throw new Error("Item not found.");
    }
    await ctx.db.delete(itemId);
    return { success: true, message: "Item deleted. Consider implications for related data." };
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
    return await ctx.db.get(itemId);
  },
});

export const listItems = query({
  args: {
    type: ItemTypeValidator,
    rarity: ItemRarityValidator,
  },
  handler: async (ctx, { type, rarity }) => {
    let items: Doc<"items">[];

    if (type) {
      const queryByType = ctx.db
        .query("items")
        .withIndex("by_type", (q) => q.eq("type", type));
      items = await queryByType.collect();
      // If rarity is also specified, filter the results from the type query
      if (rarity) {
        items = items.filter(item => item?.rarity === rarity);
      }
    } else if (rarity) {
      // If only rarity is specified, query by rarity index
      const queryByRarity = ctx.db
        .query("items")
        .withIndex("by_rarity", (q) => q.eq("rarity", rarity));
      items = await queryByRarity.collect();
    } else {
      // No filters, get all items
      items = await ctx.db.query("items").collect();
    }
    return items;
  },
});

export const getItemValueHistory = query({
  args: {
    itemId: v.id("items"),
  },
  handler: async (ctx, { itemId }) => {
    return await ctx.db
      .query("itemValueHistory")
      .withIndex("by_itemId_timestamp", (q) => q.eq("itemId", itemId))
      .order("desc") 
      .collect();
  },
});

export const getItemsByIds = query({
  args: {
    itemIds: v.array(v.id("items")),
  },
  handler: async (ctx, { itemIds }) => {
    const itemsResult: (Doc<"items"> | null)[] = []; 
    for (const id of itemIds) {
      itemsResult.push(await ctx.db.get(id));
    }
    return itemsResult.filter(item => item !== null);
  }
});
