import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const demandLevel = v.union(
  v.literal("VeryLow"),
  v.literal("Low"),
  v.literal("Medium"),
  v.literal("High"),
  v.literal("VeryHigh"),
  v.literal("Unknown")
);

export const allItemCategories = v.union(
  v.literal("Crop"),
  v.literal("Pet"),
  v.literal("Egg"),
  v.literal("Gear"),
)

export const allRarities = v.union(
  v.literal("Common"),
  v.literal("Uncommon"),
  v.literal("Rare"),
  v.literal("Epic"),
  v.literal("Legendary"),
  v.literal("Mythical"),
  v.literal("Divine"),
  v.literal("Prismatic"),
  v.literal("N/A"),
);

export const gameTags = v.union(
  v.literal("GrowAGarden")
);

// Dynamic attribute system for flexible item details
export const itemAttribute = v.union(
  v.object({
    type: v.literal("key-value"),
    title: v.string(),
    content: v.string(),
  }),
  v.object({
    type: v.literal("percentile"),
    title: v.string(),
    content: v.number(),
  }),
  v.object({
    type: v.literal("image-link"),
    title: v.string(),
    content: v.string(),
    imageUrl: v.string(),
    link: v.optional(v.string()),
  }),
  v.object({
    type: v.literal("tag"),
    title: v.string(),
  }),
);

// Actual game tables
export const gameTables = {
  games: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    thumbnailUrl: v.string(),
    gameTag: gameTags
  })
    .index("by_name", ["name"])
    .index("by_tag", ["gameTag"]),

  items: defineTable({
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
    rarityOrder: v.number(),
    attributes: v.array(itemAttribute),
  })
    .index("by_name", ["name"])
    .index("by_gameId", ["gameId"])
    .index("by_category", ["category"])
    .index("by_rarity", ["rarity"])
    .index("by_sellValue", ["sellValue"])
    .index("by_buyPrice", ["buyPrice"])
    .index("by_gameId_category", ["gameId", "category"])
    .index("by_gameId_rarity", ["gameId", "rarity"])
    .index("by_gameId_sellValue", ["gameId", "sellValue"])
    .index("by_gameId_buyPrice", ["gameId", "buyPrice"])
    .index("by_gameId_rarityOrder", ["gameId", "rarityOrder"])
    .index("by_gameId_name", ["gameId", "name"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["gameId", "category", "rarity"],
    }),
};