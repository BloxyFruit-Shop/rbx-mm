/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { query } from "./_generated/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { gameTags } from "./schemas/games";
import { vLiteralUnion } from "./utils/vLiteralUnion";
import { ITEM_RARITIES, ITEM_TYPES } from "./types";
import { paginationOptsValidator } from "convex/server";

type gagItemAttributes = Doc<"gameItemAttributes">["attributes"];
const ItemTypeValidator = vLiteralUnion(ITEM_TYPES);
const ItemRarityValidator = vLiteralUnion(ITEM_RARITIES);

export const searchItems = query({
  args: {
    gameTag: gameTags,
    searchTerm: v.optional(v.string()),
    type: v.optional(ItemTypeValidator),
    rarity: v.optional(ItemRarityValidator),
    sortBy: v.optional(
      v.union(
        v.literal("name"),
        v.literal("sellValue"),
        v.literal("buyPrice"),
        v.literal("rarity"),
      ),
    ),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    if (args.searchTerm) {
      let searchQuery = ctx.db
        .query("itemSearchAndSort")
        .withSearchIndex("search_name", (q) =>
          q.search("name", args.searchTerm ?? "").eq("gameTag", args.gameTag),
        );

      if (args.type) {
        searchQuery = searchQuery.filter((q) => q.eq(q.field("category"), args.type));
      }
      if (args.rarity) {
        searchQuery = searchQuery.filter((q) => q.eq(q.field("rarity"), args.rarity));
      }
      const paginatedResults = await searchQuery.paginate(args.paginationOpts);
      return {
        ...paginatedResults,
        page: paginatedResults.page.map((item) => {
          return {
            _id: item.itemId,
            _creationTime: item._creationTime,
            name: item.name,
            gameId: item.gameId,
            demand: item.demand,
            thumbnailUrl: item.thumbnailUrl,
            attributes: {
              gameTag: item.gameTag,
              details: {
                rarity: item.rarity,
                type: {
                  category: item.category,
                  sellValue: item.sellValue,
                  buyPrice: item.buyPrice,
                },
              },
            },
          };
        }),
      };
    }

    let query;
    const order = args.sortOrder === "asc" ? "asc" : "desc";

    switch (args.sortBy) {
      case "name":
        query = ctx.db
          .query("itemSearchAndSort")
          .withIndex("by_gameTag_and_name", (q) => q.eq("gameTag", args.gameTag))
          .order(order);
        break;
      case "sellValue":
        query = ctx.db
          .query("itemSearchAndSort")
          .withIndex("by_gameTag_and_sellValue", (q) =>
            q.eq("gameTag", args.gameTag),
          )
          .order(order);
        break;
      case "buyPrice":
        query = ctx.db
          .query("itemSearchAndSort")
          .withIndex("by_gameTag_and_buyPrice", (q) =>
            q.eq("gameTag", args.gameTag),
          )
          .order(order);
        break;
      case "rarity":
      default:
        query = ctx.db
          .query("itemSearchAndSort")
          .withIndex("by_gameTag_and_rarityOrder", (q) =>
            q.eq("gameTag", args.gameTag),
          )
          .order(order);
        break;
    }

    if (args.type) {
      query = query.filter((q) => q.eq(q.field("category"), args.type));
    }
    if (args.rarity) {
      query = query.filter((q) => q.eq(q.field("rarity"), args.rarity));
    }

    const paginatedResults = await query.paginate(args.paginationOpts);

    return {
      ...paginatedResults,
      page: paginatedResults.page.map((item) => {
        return {
          _id: item.itemId,
          _creationTime: item._creationTime,
          name: item.name,
          gameId: item.gameId,
          demand: item.demand,
          thumbnailUrl: item.thumbnailUrl,
          attributes: {
            gameTag: item.gameTag,
            details: {
              rarity: item.rarity,
              type: {
                category: item.category,
                sellValue: item.sellValue,
                buyPrice: item.buyPrice,
              },
            },
          },
        };
      }),
    };
  },
});

// Fetch detailed item including game-specific attributes
export const getItemDetails = query({
  args: { itemId: v.id("items") },
  handler: async (
    ctx,
    { itemId },
  ): Promise<
    (Doc<"items"> & { attributes?: gagItemAttributes | null; }) | null
  > => {
    const item = await ctx.db.get(itemId);
    if (!item) return null;
    const attr = await ctx.db
      .query("gameItemAttributes")
      .withIndex("by_itemId", (q) => q.eq("itemId", itemId))
      .unique();
    return { ...item, attributes: attr?.attributes ?? null };
  },
});

// List detailed items for a given game
export const listItemDetailsByGame = query({
  args: { gameId: v.id("games") },
  handler: async (
    ctx,
    { gameId },
  ): Promise<
    Array<Doc<"items"> & { attributes?: gagItemAttributes | null; }>
  > => {
    const out: Array<Doc<"items"> & { attributes?: gagItemAttributes | null; }> =
      [];
    for await (const item of ctx.db
      .query("items")
      .withIndex("by_gameId", (q) => q.eq("gameId", gameId))) {
      const attr = await ctx.db
        .query("gameItemAttributes")
        .withIndex("by_itemId", (q) => q.eq("itemId", item._id))
        .unique();
      out.push({ ...item, attributes: attr?.attributes ?? null });
    }
    return out;
  },
});
