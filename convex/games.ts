import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./utils/auth";

// CRUD for games
export const createGame = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    thumbnailUrl: v.string(),
    gameTag: v.union(v.literal("GrowAGarden")),
    session: v.id("session"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.session);
    // ensure no duplicate
    const existing = await ctx.db
      .query("games")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .unique();
    if (existing) {
      throw new Error(`Game \"${args.name}\" already exists.`);
    }
    const gameId = await ctx.db.insert("games", {
      name: args.name,
      description: args.description,
      thumbnailUrl: args.thumbnailUrl,
      gameTag: args.gameTag,
    });
    return gameId;
  },
});

export const updateGame = mutation({
  args: {
    gameId: v.id("games"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    gameTag: v.optional(v.union(v.literal("GrowAGarden"))),
    session: v.id("session"),
  },
  handler: async (ctx, { gameId, session, ...updates }) => {
    await requireAdmin(ctx, session);
    const game = await ctx.db.get(gameId);
    if (!game) throw new Error("Game not found.");
    // check name uniqueness
    if (updates.name && updates.name !== game.name) {
      const dup = await ctx.db
        .query("games")
        .withIndex("by_name", (q) => q.eq("name", updates.name!))
        .unique();
      if (dup && dup._id !== gameId) {
        throw new Error(`Another game \"${updates.name}\" exists.`);
      }
    }
    await ctx.db.patch(gameId, updates);
    return { success: true };
  },
});

export const getGameById = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    return ctx.db.get(gameId);
  },
});

export const listGames = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("games").collect();
  },
});
