import { v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server"; // Removed unused internalMutation
import type { Id, Doc } from "./_generated/dataModel";
import { TRADE_AD_STATUSES, ROLES } from "./types";
import { api } from "./_generated/api";
import { type PublicUserProfile } from "./user";
import { vLiteralUnion } from "./utils/vLiteralUnion";
import { getUser } from "./utils/auth";

const statusValidator = vLiteralUnion(TRADE_AD_STATUSES);

export type ResolvedTradeAd = Doc<"tradeAds"> & {
  creator: PublicUserProfile | null;
  haveItemsResolved: (Doc<"items"> & {
    quantity: number;
    weightKg?: number;
    mutations?: string[];
  })[];
  wantItemsResolved: (Doc<"items"> & {
    quantity: number;
    weightKg?: number;
    mutations?: string[];
  })[];
};

const itemDetailsValidator = v.object({
  itemId: v.id("items"),
  quantity: v.number(),
  weightKg: v.optional(v.number()),
  mutations: v.optional(v.array(v.string())),
});

// --- Trade Ad Management ---
export const createTradeAd = mutation({
  args: {
    haveItems: v.array(itemDetailsValidator),
    wantItems: v.array(itemDetailsValidator),
    notes: v.optional(v.string()),
    session: v.id("session")
  },
  handler: async (ctx, args): Promise<Id<"tradeAds">> => {
    const user = await getUser(ctx, args.session);

    if (!user) {
      throw new Error("You must be logged in to create a trade ad.");
    }

    if (args.notes && args.notes.length > 500) {
      throw new Error("Notes cannot exceed 500 characters.");
    }
    if (args.haveItems.length === 0 && args.wantItems.length === 0) {
      throw new Error(
        "Trade ad must have at least one item to offer or request.",
      );
    }

    for (const item of [...args.haveItems, ...args.wantItems]) {
      if (item.quantity <= 0) {
        throw new Error("Item quantities must be positive.");
      }
    }

    const tradeAdId = await ctx.db.insert("tradeAds", {
      creatorId: user._id,
      haveItems: args.haveItems,
      wantItems: args.wantItems,
      notes: args.notes,
      status: "open",
    });

    return tradeAdId;
  },
});

export const updateTradeAd = mutation({
  args: {
    tradeAdId: v.id("tradeAds"),
    haveItems: v.optional(v.array(itemDetailsValidator)),
    wantItems: v.optional(v.array(itemDetailsValidator)),
    notes: v.optional(v.string()),
    status: v.optional(statusValidator),
    session: v.id("session")
  },
  handler: async (ctx, args): Promise<{ success: boolean }> => {
    const user = await getUser(ctx, args.session);

    if (!user) {
      throw new Error("You must be logged in to create a trade ad.");
    }

    const tradeAd = await ctx.db.get(args.tradeAdId);

    if (!tradeAd) {
      throw new Error("Trade ad not found.");
    }

    const isAdmin = user.roles?.includes(ROLES.ADMIN);
    if (tradeAd.creatorId !== user._id && !isAdmin) {
      throw new Error("You do not have permission to edit this trade ad.");
    }

    if (tradeAd.status !== "open" && !isAdmin && args.status === undefined) {
      throw new Error(
        "Only admins can edit a non-open trade ad if not changing its status.",
      );
    }
    if (
      tradeAd.status !== "open" &&
      !isAdmin &&
      args.status !== undefined &&
      args.status === tradeAd.status
    ) {
      throw new Error(
        "Cannot edit a non-open trade ad unless changing its status (admins exempt).",
      );
    }

    if (args.notes && args.notes.length > 500) {
      throw new Error("Notes cannot exceed 500 characters.");
    }

    const updates: Partial<Doc<"tradeAds">> = {};
    if (args.haveItems !== undefined) {
      if (
        args.haveItems.length === 0 &&
        (args.wantItems === undefined
          ? tradeAd.wantItems.length === 0
          : args.wantItems.length === 0)
      ) {
        throw new Error(
          "Trade ad must have at least one item to offer or request if haveItems are being updated.",
        );
      }
      for (const item of args.haveItems)
        if (item.quantity <= 0)
          throw new Error("Item quantities must be positive.");
      updates.haveItems = args.haveItems;
    }
    if (args.wantItems !== undefined) {
      if (
        args.wantItems.length === 0 &&
        (args.haveItems === undefined
          ? tradeAd.haveItems.length === 0
          : args.haveItems.length === 0)
      ) {
        throw new Error(
          "Trade ad must have at least one item to offer or request if wantItems are being updated.",
        );
      }
      for (const item of args.wantItems)
        if (item.quantity <= 0)
          throw new Error("Item quantities must be positive.");
      updates.wantItems = args.wantItems;
    }
    if (args.notes !== undefined) updates.notes = args.notes;
    if (args.status !== undefined) {
      updates.status = args.status;
      if (["closed", "expired", "cancelled"].includes(args.status)) {
        updates.closedAt = Date.now();
      } else {
        updates.closedAt = undefined;
      }
    }

    await ctx.db.patch(args.tradeAdId, updates);
    return { success: true };
  },
});

export const deleteTradeAd = mutation({
  args: { tradeAdId: v.id("tradeAds"), session: v.id("session") },
  handler: async (ctx, { tradeAdId, session }): Promise<{ success: boolean }> => {
    const user = await getUser(ctx, session);

    if (!user) {
      throw new Error("You must be logged in to create a trade ad.");
    }

    const tradeAd = await ctx.db.get(tradeAdId);

    if (!tradeAd) {
      throw new Error("Trade ad not found.");
    }

    if (tradeAd.creatorId !== user._id && !user.roles?.includes(ROLES.ADMIN)) {
      throw new Error("You do not have permission to delete this trade ad.");
    }

    await ctx.db.delete(tradeAdId);
    return { success: true };
  },
});

async function resolveTradeAdItems(
  ctx: QueryCtx,
  tradeAd: Doc<"tradeAds">,
): Promise<ResolvedTradeAd> {
  const haveItemIds = tradeAd.haveItems.map((item) => item.itemId);
  const wantItemIds = tradeAd.wantItems.map((item) => item.itemId);
  const allItemIds = [...new Set([...haveItemIds, ...wantItemIds])];

  const dbItemsArray: Doc<"items">[] = await ctx.runQuery(
    api.items.getItemsByIds,
    { itemIds: allItemIds },
  );
  const dbItemsMap = new Map(
    dbItemsArray.map((item) => [item._id.toString(), item]),
  );

  const resolve = (
    itemDetailsArray: typeof tradeAd.haveItems,
  ): (Doc<"items"> & {
    quantity: number;
    weightKg?: number;
    mutations?: string[];
  })[] => {
    return itemDetailsArray
      .map((detail) => {
        const itemInfo = dbItemsMap.get(detail.itemId.toString());
        return itemInfo
          ? {
              ...itemInfo,
              quantity: detail.quantity,
              weightKg: detail.weightKg,
              mutations: detail.mutations,
            }
          : null;
      })
      .filter(Boolean) as (Doc<"items"> & {
      quantity: number;
      weightKg?: number;
      mutations?: string[];
    })[];
  };

  const creatorProfile = await ctx.runQuery(api.user.getPublicUserProfile, {
    userId: tradeAd.creatorId,
  });

  return {
    ...tradeAd,
    creator: creatorProfile,
    haveItemsResolved: resolve(tradeAd.haveItems),
    wantItemsResolved: resolve(tradeAd.wantItems),
  };
}

export const getTradeAdById = query({
  args: { tradeAdId: v.id("tradeAds") },
  handler: async (ctx, { tradeAdId }): Promise<ResolvedTradeAd | null> => {
    const tradeAd = await ctx.db.get(tradeAdId);
    if (!tradeAd) return null;
    return await resolveTradeAdItems(ctx, tradeAd);
  },
});

export const listTradeAds = query({
  args: {
    status: v.optional(statusValidator),
    creatorId: v.optional(v.id("user")),
    itemId: v.optional(v.id("items")),
  },
  handler: async (
    ctx,
    { status, creatorId, itemId },
  ): Promise<ResolvedTradeAd[]> => {
    let ads: Doc<"tradeAds">[];
    if (creatorId && status) {
      ads = await ctx.db
        .query("tradeAds")
        .withIndex("by_creatorId_status", (q) =>
          q.eq("creatorId", creatorId).eq("status", status),
        )
        .order("desc")
        .collect();
    } else if (creatorId) {
      ads = await ctx.db
        .query("tradeAds")
        .withIndex("by_creatorId_status", (q) => q.eq("creatorId", creatorId))
        .order("desc")
        .collect();
    } else if (status) {
      ads = await ctx.db
        .query("tradeAds")
        .withIndex("by_status", (q) => q.eq("status", status))
        .order("desc")
        .collect();
    } else if (!itemId) {
      ads = await ctx.db
        .query("tradeAds")
        .withIndex("by_status", (q) => q.eq("status", "open"))
        .order("desc")
        .collect();
    } else {
      ads = await ctx.db.query("tradeAds").order("desc").collect();
    }

    let filteredAds = ads;
    if (itemId) {
      filteredAds = ads.filter(
        (ad) =>
          ad.haveItems.some((item) => item.itemId === itemId) ||
          ad.wantItems.some((item) => item.itemId === itemId),
      );
    }

    const resolvedAds = await Promise.all(
      filteredAds.map((ad) => resolveTradeAdItems(ctx, ad)),
    );
    return resolvedAds;
  },
});

export const listMyTradeAds = query({
  args: {
    status: v.optional(statusValidator),
    session: v.id("session")
  },
  handler: async (ctx, args): Promise<ResolvedTradeAd[]> => {
    const user = await getUser(ctx, args.session);
    if (!user) {
      throw new Error("You must be logged in to view your trade ads.");
    }

    const { status } = args;
    let ads: Doc<"tradeAds">[];
    if (status === undefined) {
      ads = await ctx.db
        .query("tradeAds")
        .withIndex("by_creatorId_status", (q) => q.eq("creatorId", user._id))
        .order("desc")
        .collect();
    } else {
      ads = await ctx.db
        .query("tradeAds")
        .withIndex("by_creatorId_status", (q) =>
          q.eq("creatorId", user._id).eq("status", status),
        )
        .order("desc")
        .collect();
    }

    const resolvedAds = await Promise.all(
      ads.map((ad) => resolveTradeAdItems(ctx, ad)),
    );
    return resolvedAds;
  },
});
