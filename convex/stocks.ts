import { v } from "convex/values";
import { query, internalMutation, type QueryCtx } from "./_generated/server";
import type { Id, Doc } from "./_generated/dataModel";
import { internal } from "./_generated/api"; // Removed unused api
import { ITEM_TYPES } from "./types"; 
import { vLiteralUnion } from './utils/vLiteralUnion';
import { requireAdmin } from './utils/auth';

const ItemTypeValidator = vLiteralUnion(ITEM_TYPES);

// --- Stock Management (Primarily Admin/System Driven) ---

export const updateStock = internalMutation({
  args: {
    itemId: v.id("items"),
    quantityInStock: v.number(),
    averageBuyPrice: v.optional(v.number()),
    lastSeenSource: v.optional(v.number()), 
  },
  handler: async (ctx, args): Promise<Id<"stocks">> => {
    await requireAdmin(ctx);

    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Item not found, cannot update stock.");
    }
    
    const stockableTypes: Array<"Crop" | "Gear" | "Egg"> = [ITEM_TYPES[0], ITEM_TYPES[2], ITEM_TYPES[5]];
    if (!stockableTypes.includes(item.type as "Crop" | "Gear" | "Egg")) { 
      console.warn(`Attempting to update stock for non-stockable item type: ${item.type}`);
    }

    if (args.quantityInStock < 0) {
      throw new Error("Quantity in stock cannot be negative.");
    }
    if (args.averageBuyPrice !== undefined && args.averageBuyPrice < 0) {
      throw new Error("Average buy price cannot be negative.");
    }

    const existingStock = await ctx.db.query("stocks")
      .withIndex("by_itemId", q => q.eq("itemId", args.itemId))
      .unique();

    const now = Date.now();
    let stockId: Id<"stocks">;

    if (existingStock) {
      await ctx.db.patch(existingStock._id, {
        quantityInStock: args.quantityInStock,
        averageBuyPrice: args.averageBuyPrice,
        lastSeenSource: args.lastSeenSource,
      });
      stockId = existingStock._id;
    } else {
      stockId = await ctx.db.insert("stocks", {
        itemId: args.itemId,
        quantityInStock: args.quantityInStock,
        averageBuyPrice: args.averageBuyPrice,
        lastSeenSource: args.lastSeenSource,
      });
    }

    await ctx.runMutation(internal.stocks.addStockHistoryEntry, {
      itemId: args.itemId,
      quantity: args.quantityInStock,
      price: args.averageBuyPrice,
      timestamp: now,
    });

    return stockId;
  },
});

export const addStockHistoryEntry = internalMutation({
  args: {
    itemId: v.id("items"),
    quantity: v.number(),
    price: v.optional(v.number()),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("stockHistory", {
      itemId: args.itemId,
      quantity: args.quantity,
      price: args.price,
      timestamp: args.timestamp,
    });
  },
});

// --- Public Queries for Stocks ---
type ResolvedStock = Doc<"stocks"> & {
  item?: Doc<"items"> | null;
};

async function resolveStockItem(ctx: QueryCtx, stockDoc: Doc<"stocks">): Promise<ResolvedStock> {
  const item = await ctx.db.get(stockDoc.itemId); 
  return { ...stockDoc, item };
}

export const getStockByItemId = query({
  args: { itemId: v.id("items") },
  handler: async (ctx, { itemId }): Promise<ResolvedStock | null> => {
    const stockDoc = await ctx.db.query("stocks")
      .withIndex("by_itemId", q => q.eq("itemId", itemId))
      .unique();
    if (!stockDoc) return null;
    return resolveStockItem(ctx, stockDoc);
  },
});

export const listStocks = query({
  args: {
    itemType: v.optional(ItemTypeValidator),
  },
  handler: async (ctx, { itemType }): Promise<{data: ResolvedStock[], lastUpdate : number}> => {
    const allStocks = await ctx.db.query("stocks").collect();
    const resolvedStocks: ResolvedStock[] = [];

    for (const stockDoc of allStocks) {
      const resolved = await resolveStockItem(ctx, stockDoc);
      if (itemType && resolved.item) {
        if (resolved.item.type === itemType) {
          resolvedStocks.push(resolved);
        }
      } else if (!itemType) { 
        resolvedStocks.push(resolved);
      }
    }
    return {
      data : resolvedStocks.sort((a, b) => (a.item?.name ?? "").localeCompare(b.item?.name ?? "")),
      lastUpdate : Math.max(...allStocks.map(stock => stock.lastSeenSource ?? 0)),
    }
  },
});

export const getStockHistory = query({
  args: {
    itemId: v.id("items"),
  },
  handler: async (ctx, { itemId }): Promise<Doc<"stockHistory">[]> => {
    return await ctx.db
      .query("stockHistory")
      .withIndex("by_itemId_timestamp", q => q.eq("itemId", itemId))
      .order("desc") 
      .collect();
  },
});

export const getLastTimeOfUpdate = query({
  handler: async (ctx): Promise<number> => {
    // Return timestamp of last stock update (lastSeenSource) as a number
    const stocks = await ctx.db.query("stocks").collect();
    if (stocks.length > 0) {
      return stocks[0]?.lastSeenSource ?? 0;
    }
    return 0;
  }
});