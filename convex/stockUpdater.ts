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
  type: string; // "seeds" or "gears"
}

interface StockData {
  name: string;
  quantity: number;
};

// Action to fetch stock data from the external API
export const fetchStockData = internalAction({
  args: {
    type: v.union(v.literal("seeds"), v.literal("gears"),v.literal("eggs"))
  },
  handler: async (ctx, args): Promise<void> => {
    try {
      // Fetch data from the external API
      const response = await fetch("https://growagardenvalues.com/stock/refresh_stock.php?type=" + args.type);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stock data: ${response.status} ${response.statusText}`);
      }

      let seeds: StockData[] = [];
      let gear: StockData[] = [];
      let eggs: StockData[] = [];

      const data = (await response.json()) as StockApiResponse;

      if (!data.success) {
        throw new Error("API returned unsuccessful response");
      }

      switch (args.type) {
        case "seeds":
          seeds = data.data.records.map(info => ({name: info.Data.Name, quantity: info.Amount}))
          break;
        case "gears":
          gear = []
          break;
        case "eggs":
          eggs = []
          break;
        default:
          throw new Error("Invalid stock type");
      }
      
      const timestamp = (new Date(data?.data?.records[0]?.Timestamp ?? "")).getTime();

      // Process the stock data
      await ctx.runMutation(internal.stockUpdater.updateStockFromApiData, {
        gear,
        seeds,
        eggs,
        timestamp,
        lastUpdated: data.timestamp,
      });

      console.log(`Stock updated successfully at ${data.timestamp}`);
    } catch (error) {
      console.error("Error fetching stock data:", error);
      throw error;
    }
  },
});

// Internal mutation to clear existing stock and update with new data
export const updateStockFromApiData = internalMutation({
  args: {
    gear: v.array(v.object({
      name: v.string(),
      quantity: v.number(),
    })),
    seeds: v.array(v.object({
      name: v.string(),
      quantity: v.number(),
    })),
    eggs: v.array(v.object({
      name: v.string(),
      quantity: v.number(),
    })),
    timestamp: v.number(),
    lastUpdated: v.string(),
  },
  handler: async (ctx, args) => {
    // First, clear all existing stock by setting quantities to 0
    const existingStocks = await ctx.db.query("stocks").collect();
    
    for (const stock of existingStocks) {
      await ctx.db.patch(stock._id, {
        quantityInStock: 0,
        lastSeenSource: 0,
      });
    }

    // Helper function to update or create stock for an item
    const updateItemStock = async (itemName: string, quantity: number, type: string) => {
      // Find the item by name
      const item = await ctx.db
        .query("items")
        .withIndex("by_name", q => q.eq("name", itemName))
        .unique();

      if (!item) {
        console.warn(`Item not found: ${itemName} (${type})`);
        return;
      }

      // Check if stock entry exists
      const existingStock = await ctx.db
        .query("stocks")
        .withIndex("by_itemId", q => q.eq("itemId", item._id))
        .unique();

      const now = Date.now();

      if (existingStock) {
        // Update existing stock
        await ctx.db.patch(existingStock._id, {
          quantityInStock: quantity,
          lastSeenSource: args.timestamp,
        });
      } else {
        // Create new stock entry
        await ctx.db.insert("stocks", {
          itemId: item._id,
          quantityInStock: quantity,
          averageBuyPrice: undefined,
          lastSeenSource: args.timestamp,
        });
      }

      // Add to stock history
      await ctx.db.insert("stockHistory", {
        itemId: item._id,
        quantity: quantity,
        price: undefined,
        timestamp: now,
      });
    };

    // Update gear items
    for (const gearItem of args.gear) {
      await updateItemStock(gearItem.name, gearItem.quantity, "Gear");
    }

    // Update seed items
    for (const seedItem of args.seeds) {
      await updateItemStock(seedItem.name, seedItem.quantity, "Seed");
    }

    // Update egg items
    for (const eggItem of args.eggs) {
      await updateItemStock(eggItem.name, eggItem.quantity, "Egg");
    }

    console.log(`Stock update completed. Timestamp: ${args.timestamp}, Last Updated: ${args.lastUpdated}`);
  },
});
