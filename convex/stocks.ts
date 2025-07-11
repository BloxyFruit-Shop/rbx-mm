import { v } from "convex/values";
import { query, internalMutation, type QueryCtx } from "./_generated/server";
import type { Id, Doc } from "./_generated/dataModel";
import { ITEM_TYPES } from "./types";
import { vLiteralUnion } from "./utils/vLiteralUnion";
import { requireAdmin } from "./utils/auth";
import { gameTags } from './schemas/games';

const ItemTypeValidator = vLiteralUnion(ITEM_TYPES);

// Define the color type from schema
type StockColor = "red" | "green" | "blue" | "yellow" | "purple" | "orange" | "pink" | "gray" | "black" | "white" | "cyan" | "teal" | "brown" | "indigo" | "lime" | "violet" | "amber" | "emerald";

// Rarity to color mapping
const RARITY_COLOR_MAP: Record<string, StockColor> = {
  "Common": "gray",
  "Uncommon": "green", 
  "Rare": "blue",
  "Epic": "purple",
  "Legendary": "orange",
  "Mythical": "red",
  "Divine": "yellow",
  "Prismatic": "cyan",
  "N/A": "white"
};

// Helper function to get color with proper typing
function getRarityColor(rarity?: string): StockColor {
  if (!rarity) return "white";
  const color = RARITY_COLOR_MAP[rarity];
  return color || "white";
}

// --- Stock Management (Primarily Admin/System Driven) ---

export const updateStock = internalMutation({
  args: {
    title: v.string(),
    thumbnailUrl: v.optional(v.string()),
    gameTag: gameTags,
    category: v.string(),
    quantityInStock: v.number(),
    lastSeenSource: v.optional(v.number()),
    rarity: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Id<"stocks">> => {
    if (args.quantityInStock < 0) {
      throw new Error("Quantity in stock cannot be negative.");
    }

    // Look for existing stock with same title and category
    const existingStock = await ctx.db
      .query("stocks")
      .filter((q) => 
        q.and(
          q.eq(q.field("title"), args.title),
          q.eq(q.field("category"), args.category)
        )
      )
      .first();

    const color = getRarityColor(args.rarity);

    let stockId: Id<"stocks">;

    if (existingStock) {
      // Sum quantities instead of replacing
      const newQuantity = existingStock.quantityInStock + args.quantityInStock;
      await ctx.db.patch(existingStock._id, {
        quantityInStock: newQuantity,
        lastSeenSource: args.lastSeenSource,
        thumbnailUrl: args.thumbnailUrl ?? existingStock.thumbnailUrl,
        color: color,
      });
      stockId = existingStock._id;
    } else {
      stockId = await ctx.db.insert("stocks", {
        title: args.title,
        thumbnailUrl: args.thumbnailUrl,
        color: color,
        gameTag: args.gameTag,
        category: args.category,
        quantityInStock: args.quantityInStock,
        lastSeenSource: args.lastSeenSource,
      });
    }

    return stockId;
  },
});

export const getStockByTitle = query({
  args: { title: v.string(), category: v.optional(v.string()) },
  handler: async (ctx, { title, category }): Promise<Doc<"stocks"> | null> => {
    let query = ctx.db
      .query("stocks")
      .filter((q) => q.eq(q.field("title"), title));
    
    if (category) {
      query = query.filter((q) => q.eq(q.field("category"), category));
    }
    
    return await query.first();
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
    data: Doc<"stocks">[]; 
    lastUpdate: number;
    categoryLastUpdates: {
      Crop: number;
      Egg: number;
      Gear: number;
      Event: number;
      Cosmetic: number;
      Weather: number;
    };
  }> => {
    let allStocks = await ctx.db.query("stocks").collect();

    // Filter by itemType if provided (using category field)
    if (itemType) {
      allStocks = allStocks.filter(stock => stock.category === itemType);
    }

    // Calculate category-specific last update times
    const cropStocks = allStocks.filter(stock => stock.category === "Crop");
    const eggStocks = allStocks.filter(stock => stock.category === "Egg");
    const gearStocks = allStocks.filter(stock => stock.category === "Gear");
    const eventStocks = allStocks.filter(stock => stock.category === "Event");
    const cosmeticStocks = allStocks.filter(stock => stock.category === "Cosmetic");
    const weatherStocks = allStocks.filter(stock => stock.category === "Weather");

    const categoryLastUpdates = {
      Crop: cropStocks.length > 0 ? Math.max(...cropStocks.map(stock => stock.lastSeenSource ?? 0)) : 0,
      Egg: eggStocks.length > 0 ? Math.max(...eggStocks.map(stock => stock.lastSeenSource ?? 0)) : 0,
      Gear: gearStocks.length > 0 ? Math.max(...gearStocks.map(stock => stock.lastSeenSource ?? 0)) : 0,
      Event: eventStocks.length > 0 ? Math.max(...eventStocks.map(stock => stock.lastSeenSource ?? 0)) : 0,
      Cosmetic: cosmeticStocks.length > 0 ? Math.max(...cosmeticStocks.map(stock => stock.lastSeenSource ?? 0)) : 0,
      Weather: weatherStocks.length > 0 ? Math.max(...weatherStocks.map(stock => stock.lastSeenSource ?? 0)) : 0,
    };

    return {
      data: allStocks.sort((a, b) => a.title.localeCompare(b.title)),
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