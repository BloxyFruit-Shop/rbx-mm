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
  type: string; // "seeds" or "gears" or "eggs"
}

interface StockData {
  name: string;
  quantity: number;
}

export const fetchStockData = internalAction({
  args: {
    type: v.union(v.literal("seeds"), v.literal("gears"), v.literal("eggs")),
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

export const updateStockFromApiData = internalMutation({
  args: {
    type: v.string(),
    gear: v.array(v.object({ name: v.string(), quantity: v.number() })),
    seeds: v.array(v.object({ name: v.string(), quantity: v.number() })),
    eggs: v.array(v.object({ name: v.string(), quantity: v.number() })),
    timestamp: v.number(),
    lastUpdated: v.string(),
  },
  handler: async (ctx, args) => {
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
    }

    const updateItemStock = async (
      itemName: string,
      quantity: number,
      type: string,
    ) => {
      const item = await ctx.db
        .query("items")
        .withIndex("by_name", (q) => q.eq("name", itemName))
        .unique();

      if (!item) {
        console.warn(`Item not found: ${itemName} (${type})`);
        return;
      }

      const existingStock = await ctx.db
        .query("stocks")
        .withIndex("by_itemId", (q) => q.eq("itemId", item._id))
        .unique();

      if (existingStock) {
        await ctx.db.patch(existingStock._id, {
          quantityInStock: quantity,
          lastSeenSource: args.timestamp,
        });
      } else {
        await ctx.db.insert("stocks", {
          itemId: item._id,
          gameTag: "GrowAGarden",
          category: item.category,
          quantityInStock: quantity,
          lastSeenSource: args.timestamp,
        });
      }
    };

    for (const gearItem of args.gear)
      await updateItemStock(gearItem.name, gearItem.quantity, "Gear");
    for (const seedItem of args.seeds)
      await updateItemStock(seedItem.name, seedItem.quantity, "Seed");
    for (const eggItem of args.eggs)
      await updateItemStock(eggItem.name, eggItem.quantity, "Egg");

    console.log(
      `Stock update completed. Timestamp: ${args.timestamp}, Last Updated: ${args.lastUpdated}`,
    );
  },
});
