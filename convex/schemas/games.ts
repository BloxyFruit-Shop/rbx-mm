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

export const allItemTypes = v.union(
  v.literal("Crop"),
  v.literal("Pet"),
  v.literal("Egg"),
  v.literal("Gear"),
)

export const gameTags = v.union(
  v.literal("GrowAGarden")
);

// Grow a garden stuff
export const gagTypes = v.union(
  v.object({
    category: v.literal("Crop"),
    isMultiHarvest: v.boolean(),
    sellValue: v.number(),
    buyPrice: v.optional(v.number()),
    shopAmountRange: v.optional(v.string()),
  }),
  v.object({
    category: v.literal("Pet"),
    sellValue: v.optional(v.number()),
    buyPrice: v.optional(v.number()),
    comesFromEggId: v.optional(v.id("items")),
    spawnChance: v.number(),
  }),
  v.object({
    category: v.literal("Egg"),
    shopAppearanceChance: v.optional(v.number()),
    sellValue: v.optional(v.number()),
    buyPrice: v.optional(v.number()),
    incubationTime: v.number(),
  }),
  v.object({
    category: v.literal("Gear"),
    sellValue: v.optional(v.number()),
    buyPrice: v.optional(v.number()),
    powerLevel: v.optional(v.number()),
  }),
);

export const gagAttributes = v.object({
  rarity: v.union(
    v.literal("Common"),
    v.literal("Uncommon"),
    v.literal("Rare"),
    v.literal("Epic"),
    v.literal("Legendary"),
    v.literal("Mythical"),
    v.literal("Divine"),
    v.literal("Prismatic"),
    v.literal("N/A"),
  ),
  isLimited: v.optional(v.boolean()),
  type: gagTypes
});

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
  })
    .index("by_name", ["name", "gameId"])
    .index("by_gameId", ["gameId"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["gameId"],
    }),

  gameItemAttributes: defineTable({
    itemId: v.id("items"),
    attributes: v.union(
      v.object({ gameTag: v.literal("GrowAGarden"), details: gagAttributes })
    ),
    lastUpdatedAt: v.number(), // This is still relevant for data freshness
  })
    .index("by_itemId", ["itemId"])
    .index("by_gameTag", ["attributes.gameTag"])
    .index("by_gameTag_category", ["attributes.gameTag", "attributes.details.type.category"])
    .index("by_gameTag_rarity", ["attributes.gameTag", "attributes.details.rarity"]),

  itemSearchAndSort: defineTable({
    itemId: v.id("items"),
    gameId: v.id("games"),

    // Fields for searching and filtering
    name: v.string(),
    gameTag: gameTags,
    category: allItemTypes,
    rarity: v.string(),
    demand: demandLevel,

    // Fields for sorting
    sellValue: v.optional(v.number()),
    buyPrice: v.optional(v.number()),
    rarityOrder: v.number(), // Numeric value for sorting

    // Key display fields (to avoid a second fetch)
    thumbnailUrl: v.string(),
    isObtainable: v.optional(v.boolean()),
  })
    // Index for the primary search functionality
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["gameTag", "category", "rarity"],
    })
    .index("by_gameTag_category_rarity", [
      "gameTag",
      "category",
      "rarity",
    ])
    .index("by_gameTag_and_sellValue", ["gameTag", "sellValue"])
    .index("by_gameTag_and_buyPrice", ["gameTag", "buyPrice"])
    .index("by_gameTag_and_rarityOrder", ["gameTag", "rarityOrder"])
    .index("by_gameTag_and_name", ["gameTag", "name"])
    .index("by_itemId", ["itemId"])
};