import { v } from "convex/values";
import { internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

interface StockApiResponse {
  success: boolean;
  data: {
    success: boolean;
    type: string;
    format: string;
    count: number;
    records: Array<{
      Timestamp: string;
      Source: string;
      Data: {
        Name: string;
      };
      Amount: number;
    }>;
  };
  timestamp: string;
  type: string;
}

interface StockData {
  name: string;
  quantity: number;
}

export const fetchStockData = internalAction({
  args: {
    type: v.union(
      v.literal("seeds"), 
      v.literal("gears"), 
      v.literal("eggs"),
      v.literal("event-shop-stock"),
      v.literal("cosmetics"),
      v.literal("weather")
    ),
  },
  handler: async (ctx, args): Promise<void> => {
    try {
      const response = await fetch(
        "https://growagardenvalues.com/stock/refresh_stock.php?type=" +
        args.type,
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch stock data: ${response.status} ${response.statusText}`,
        );
      }

      let seeds: StockData[] = [];
      let gear: StockData[] = [];
      let eggs: StockData[] = [];
      let eventShop: StockData[] = [];
      let cosmetics: StockData[] = [];
      let weather: StockData[] = [];

      const data = (await response.json()) as StockApiResponse;

      if (!data.success) {
        throw new Error("API returned unsuccessful response");
      }

      switch (args.type) {
        case "seeds":
          seeds = data.data.records.map((info) => ({
            name: info.Data.Name,
            quantity: info.Amount,
          }));
          break;
        case "gears":
          gear = data.data.records.map((info) => ({
            name: info.Data.Name,
            quantity: info.Amount,
          }));
          break;
        case "eggs":
          eggs = data.data.records.map((info) => ({
            name: info.Data.Name,
            quantity: info.Amount,
          }));
          break;
        case "event-shop-stock":
          eventShop = data.data.records.map((info) => ({
            name: info.Data.Name,
            quantity: info.Amount,
          }));
          break;
        case "cosmetics":
          cosmetics = data.data.records.map((info) => ({
            name: info.Data.Name,
            quantity: info.Amount,
          }));
          break;
        case "weather":
          // For weather, if records exist, set quantity to 1, otherwise 0
          weather = data.data.records.map((info) => ({
            name: info.Data.Name,
            quantity: 1, // Weather effects are either active (1) or not (0)
          }));
          break;
        default:
          throw new Error("Invalid stock type");
      }

      const timestamp = new Date(
        data.data.records[0]?.Timestamp ?? "",
      ).getTime();

      await ctx.runMutation(internal.stockUpdater.updateStockFromApiData, {
        type: args.type,
        gear,
        seeds,
        eggs,
        eventShop,
        cosmetics,
        weather,
        timestamp,
        lastUpdated: data.timestamp,
      });

      console.log(`Stock updated successfully for ${args.type} at ${data.timestamp}`);
    } catch (error) {
      console.error(`Error fetching stock data for ${args.type}:`, error);
      throw error;
    }
  },
});

export const updateStockFromApiData = internalMutation({
  args: {
    type: v.string(),
    gear: v.array(v.object({ name: v.string(), quantity: v.number() })),
    seeds: v.array(v.object({ name: v.string(), quantity: v.number() })),
    eggs: v.array(v.object({ name: v.string(), quantity: v.number() })),
    eventShop: v.array(v.object({ name: v.string(), quantity: v.number() })),
    cosmetics: v.array(v.object({ name: v.string(), quantity: v.number() })),
    weather: v.array(v.object({ name: v.string(), quantity: v.number() })),
    timestamp: v.number(),
    lastUpdated: v.string(),
  },
  handler: async (ctx, args) => {
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

    // Available colors for random assignment
    const AVAILABLE_COLORS: StockColor[] = [
      "red", "green", "blue", "yellow", "purple", "orange", "pink", 
      "gray", "cyan", "teal", "brown", "indigo", "lime", "violet", "amber", "emerald"
    ];

    // Helper function to get color with proper typing
    function getRarityColor(rarity?: string): StockColor {
      if (!rarity) return "white";
      const color = RARITY_COLOR_MAP[rarity];
      return color || "white";
    }

    // Helper function to get a consistent random color based on item name
    function getRandomColor(itemName: string): StockColor {
      // Use a simple hash function to get consistent color for same item name
      let hash = 0;
      for (let i = 0; i < itemName.length; i++) {
        const char = itemName.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      const index = Math.abs(hash) % AVAILABLE_COLORS.length;
      return AVAILABLE_COLORS[index];
    }

    // Reset existing stocks for the category to 0
    switch (args.type) {
      case "seeds":
        const cropStocks = ctx.db.query("stocks").withIndex("by_category", (q) => q.eq("category", "Crop"));
        for await (const stock of cropStocks) {
          await ctx.db.patch(stock._id, {
            quantityInStock: 0,
            lastSeenSource: 0,
          });
        }
        break;
      case "gears":
        const gearStocks = ctx.db.query("stocks").withIndex("by_category", (q) => q.eq("category", "Gear"));
        for await (const stock of gearStocks) {
          await ctx.db.patch(stock._id, {
            quantityInStock: 0,
            lastSeenSource: 0,
          });
        }
        break;
      case "eggs":
        const eggStocks = ctx.db.query("stocks").withIndex("by_category", (q) => q.eq("category", "Egg"));
        for await (const stock of eggStocks) {
          await ctx.db.patch(stock._id, {
            quantityInStock: 0,
            lastSeenSource: 0,
          });
        }
        break;
      case "event-shop-stock":
        const eventStocks = ctx.db.query("stocks").withIndex("by_category", (q) => q.eq("category", "Event"));
        for await (const stock of eventStocks) {
          await ctx.db.patch(stock._id, {
            quantityInStock: 0,
            lastSeenSource: 0,
          });
        }
        break;
      case "cosmetics":
        const cosmeticStocks = ctx.db.query("stocks").withIndex("by_category", (q) => q.eq("category", "Cosmetic"));
        for await (const stock of cosmeticStocks) {
          await ctx.db.patch(stock._id, {
            quantityInStock: 0,
            lastSeenSource: 0,
          });
        }
        break;
      case "weather":
        const weatherStocks = ctx.db.query("stocks").withIndex("by_category", (q) => q.eq("category", "Weather"));
        for await (const stock of weatherStocks) {
          await ctx.db.patch(stock._id, {
            quantityInStock: 0,
            lastSeenSource: 0,
          });
        }
        break;
    }

    const updateItemStock = async (
      itemName: string,
      quantity: number,
      category: string,
    ) => {
      // Try to find the item in the database first
      const item = await ctx.db
        .query("items")
        .withIndex("by_name", (q) => q.eq("name", itemName))
        .unique();

      let color: StockColor;
      let thumbnailUrl: string | undefined;

      if (item) {
        // Item found in database, use its properties
        color = getRarityColor(item.rarity);
        thumbnailUrl = item.thumbnailUrl;
      } else {
        // Item not found in database, use random color and no thumbnail
        color = getRandomColor(itemName);
        thumbnailUrl = undefined;
        console.log(`Item not in database, using random color: ${itemName} (${category}) -> ${color}`);
      }

      // Look for existing stock with same title and category
      const existingStock = await ctx.db
        .query("stocks")
        .filter((q) => 
          q.and(
            q.eq(q.field("title"), itemName),
            q.eq(q.field("category"), category)
          )
        )
        .first();

      if (existingStock) {
        // For weather, replace quantity instead of summing
        const newQuantity = category === "Weather" ? quantity : existingStock.quantityInStock + quantity;
        await ctx.db.patch(existingStock._id, {
          quantityInStock: newQuantity,
          lastSeenSource: args.timestamp,
          thumbnailUrl: thumbnailUrl ?? existingStock.thumbnailUrl,
          color: color,
        });
      } else {
        await ctx.db.insert("stocks", {
          title: itemName,
          thumbnailUrl: thumbnailUrl,
          color: color,
          gameTag: "GrowAGarden",
          category: category,
          quantityInStock: quantity,
          lastSeenSource: args.timestamp,
        });
      }
    };

    // Process each category with proper category names
    for (const gearItem of args.gear)
      await updateItemStock(gearItem.name, gearItem.quantity, "Gear");
    for (const seedItem of args.seeds)
      await updateItemStock(seedItem.name, seedItem.quantity, "Crop");
    for (const eggItem of args.eggs)
      await updateItemStock(eggItem.name, eggItem.quantity, "Egg");
    for (const eventItem of args.eventShop)
      await updateItemStock(eventItem.name, eventItem.quantity, "Event");
    for (const cosmeticItem of args.cosmetics)
      await updateItemStock(cosmeticItem.name, cosmeticItem.quantity, "Cosmetic");
    for (const weatherItem of args.weather)
      await updateItemStock(weatherItem.name, weatherItem.quantity, "Weather");

    console.log(
      `Stock update completed for ${args.type}. Timestamp: ${args.timestamp}, Last Updated: ${args.lastUpdated}`,
    );
  },
});