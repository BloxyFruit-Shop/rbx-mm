import { v } from 'convex/values';
import { internalMutation } from './_generated/server';
import { RARITY_SORT_ORDER } from './types';

export const updateSearchTable = internalMutation({
  handler: async (ctx) => {
    const items = await ctx.db.query("items").collect();
    const searchTable = items.map(async item => {
      const attributes = await ctx.db.query("gameItemAttributes")
        .withIndex("by_itemId", (q) => q.eq("itemId", item._id))
        .unique();
      
      if (!attributes) {
        const existing = await ctx.db
          .query("itemSearchAndSort")
          .withIndex("by_itemId", (q) => q.eq("itemId", item._id))
          .unique();
        if (existing) {
          await ctx.db.delete(existing._id);
        }
        return;
      }

      const searchDoc = {
        itemId: item._id,
        gameId: item.gameId,
        name: item.name,
        thumbnailUrl: item.thumbnailUrl,
        demand: item.demand,
        isObtainable: item.isObtainable,
        gameTag: attributes.attributes.gameTag,
        category: attributes.attributes.details.type.category,
        rarity: attributes.attributes.details.rarity,
        rarityOrder:
          RARITY_SORT_ORDER[attributes.attributes.details.rarity] ?? 0,
        // Use optional chaining and nullish coalescing for optional fields
        sellValue: attributes.attributes.details.type.sellValue,
        buyPrice: attributes.attributes.details.type.buyPrice,
      };

      const existing = await ctx.db
        .query("itemSearchAndSort")
        .withIndex("by_itemId", (q) => q.eq("itemId", item._id))
        .unique();
      
      if (existing) {
        await ctx.db.patch(existing._id, searchDoc);
      } else {
        await ctx.db.insert("itemSearchAndSort", searchDoc);
      }
    })

  }
})

export const updateItemSearchTable = internalMutation({
  args: { itemId: v.id("items") },
  handler: async (ctx, { itemId }) => {
    // 1. Get the source-of-truth data
    const item = await ctx.db.get(itemId);
    const attributes = await ctx.db
      .query("gameItemAttributes")
      .withIndex("by_itemId", (q) => q.eq("itemId", itemId))
      .unique();

    // If the item or its core attributes don't exist, delete the search doc
    if (!item || !attributes) {
      const existing = await ctx.db
        .query("itemSearchAndSort")
        .withIndex("by_itemId", (q) => q.eq("itemId", itemId))
        .unique();
      if (existing) {
        await ctx.db.delete(existing._id);
      }
      return;
    }

    // 2. Construct the denormalized document
    const searchDoc = {
      itemId: item._id,
      gameId: item.gameId,
      name: item.name,
      thumbnailUrl: item.thumbnailUrl,
      demand: item.demand,
      isObtainable: item.isObtainable,
      gameTag: attributes.attributes.gameTag,
      category: attributes.attributes.details.type.category,
      rarity: attributes.attributes.details.rarity,
      rarityOrder:
        RARITY_SORT_ORDER[attributes.attributes.details.rarity] ?? 0,
      // Use optional chaining and nullish coalescing for optional fields
      sellValue: attributes.attributes.details.type.sellValue,
      buyPrice: attributes.attributes.details.type.buyPrice,
    };

    // 3. Find existing search doc to update, or create a new one
    const existing = await ctx.db
      .query("itemSearchAndSort")
      .withIndex("by_itemId", (q) => q.eq("itemId", itemId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, searchDoc);
    } else {
      await ctx.db.insert("itemSearchAndSort", searchDoc);
    }
  },
});

