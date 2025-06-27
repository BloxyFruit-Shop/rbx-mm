import { v } from "convex/values";
import { query, internalMutation, type QueryCtx } from "./_generated/server";
import type { Id, Doc } from "./_generated/dataModel";
import { ITEM_TYPES, type ResolvedStock } from "./types";
import { vLiteralUnion } from "./utils/vLiteralUnion";
import { requireAdmin } from "./utils/auth";
import { gameTags } from './schemas/games';

const ItemTypeValidator = vLiteralUnion(ITEM_TYPES);

// --- Stock Management (Primarily Admin/System Driven) ---

export const updateStock = internalMutation({
  args: {
    itemId: v.id("items"),
    gameTag: gameTags,
    category: v.string(),
    quantityInStock: v.number(),
    lastSeenSource: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<Id<"stocks">> => {
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Item not found, cannot update stock.");
    }

    if (args.quantityInStock < 0) {
      throw new Error("Quantity in stock cannot be negative.");
    }
    const existingStock = await ctx.db
      .query("stocks")
      .withIndex("by_itemId", (q) => q.eq("itemId", args.itemId))
      .unique();

    let stockId: Id<"stocks">;

    if (existingStock) {
      await ctx.db.patch(existingStock._id, {
        quantityInStock: args.quantityInStock,
        lastSeenSource: args.lastSeenSource,
      });
      stockId = existingStock._id;
    } else {
      stockId = await ctx.db.insert("stocks", {
        itemId: args.itemId,
        gameTag: args.gameTag,
        category: args.category,
        quantityInStock: args.quantityInStock,
        lastSeenSource: args.lastSeenSource,
      });
    }

    return stockId;
  },
});

async function resolveStockItem(
  ctx: QueryCtx,
  stockDoc: Doc<"stocks">,
): Promise<ResolvedStock> {
  const item = await ctx.db.get(stockDoc.itemId);
  return { ...stockDoc, item };
}

export const getStockByItemId = query({
  args: { itemId: v.id("items") },
  handler: async (ctx, { itemId }): Promise<ResolvedStock | null> => {
    const stockDoc = await ctx.db
      .query("stocks")
      .withIndex("by_itemId", (q) => q.eq("itemId", itemId))
      .unique();
    if (!stockDoc) return null;
    return resolveStockItem(ctx, stockDoc);
  },
});

export const listStocks = query({
  args: {
    itemType: v.optional(ItemTypeValidator),
  },
  handler: async (
    ctx,
    { itemType },
  ): Promise<{ 
    data: ResolvedStock[]; 
    lastUpdate: number;
    categoryLastUpdates: {
      Crop: number;
      Egg: number;
      Gear: number;
    };
  }> => {
    const allStocks = await ctx.db.query("stocks").collect();
    const resolvedStocks: ResolvedStock[] = [];

    for (const stockDoc of allStocks) {
      const resolved = await resolveStockItem(ctx, stockDoc);
      if (itemType && resolved.item) {
        if (resolved.item.category === itemType) {
          resolvedStocks.push(resolved);
        }
      } else if (!itemType) {
        resolvedStocks.push(resolved);
      }
    }

    // Calculate category-specific last update times
    const cropStocks = allStocks.filter(stock => stock.category === "Crop");
    const eggStocks = allStocks.filter(stock => stock.category === "Egg");
    const gearStocks = allStocks.filter(stock => stock.category === "Gear");

    const categoryLastUpdates = {
      Crop: cropStocks.length > 0 ? Math.max(...cropStocks.map(stock => stock.lastSeenSource ?? 0)) : 0,
      Egg: eggStocks.length > 0 ? Math.max(...eggStocks.map(stock => stock.lastSeenSource ?? 0)) : 0,
      Gear: gearStocks.length > 0 ? Math.max(...gearStocks.map(stock => stock.lastSeenSource ?? 0)) : 0,
    };

    return {
      data: resolvedStocks.sort((a, b) =>
        (a.item?.name ?? "").localeCompare(b.item?.name ?? ""),
      ),
      lastUpdate: Math.max(
        ...allStocks.map((stock) => stock.lastSeenSource ?? 0),
      ),
      categoryLastUpdates,
    };
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
  },
});
