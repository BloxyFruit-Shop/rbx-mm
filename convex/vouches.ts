import { v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server";
import type { Id, Doc } from "./_generated/dataModel";
import { api } from "./_generated/api";
import { type ResolvedTradeAd } from "./tradeAds";
import { type PublicUserProfile } from "./user"; // Import PublicUserProfile
import { ROLES } from "./types"; // Added ROLES
import { getUser, requireAdmin } from "./utils/auth";

// Define a more specific return type for resolved vouches
type ResolvedVouch = Doc<"vouches"> & {
  fromUser?: PublicUserProfile | null;
  toUser?: PublicUserProfile | null;
  tradeAd?: ResolvedTradeAd | Doc<"tradeAds"> | null;
};

// --- Vouch Management ---
export const giveVouch = mutation({
  args: {
    toUserId: v.id("user"),
    rating: v.number(),
    comment: v.optional(v.string()),
    tradeAdId: v.optional(v.id("tradeAds")),
    session: v.id("session")
  },
  handler: async (ctx, args): Promise<Id<"vouches">> => {
    const fromUser = await getUser(ctx, args.session);

    if (!fromUser) {
      throw new Error("You must be logged in to give a vouch.");
    }

    if (fromUser._id === args.toUserId) {
      throw new Error("You cannot vouch for yourself.");
    }

    if (args.rating < 1 || args.rating > 5) {
      throw new Error("Rating must be between 1 and 5.");
    }
    if (args.comment && args.comment.length > 300) {
      throw new Error("Comment cannot exceed 300 characters.");
    }

    const existingVouch = await ctx.db
      .query("vouches")
      .withIndex("by_toUserId_fromUserId", (q) =>
        q.eq("toUserId", args.toUserId).eq("fromUserId", fromUser._id),
      )
      .unique();
    if (existingVouch?.tradeAdId === args.tradeAdId) {
      throw new Error("You have already submitted a vouch for this user.");
    }

    const toUserExists = await ctx.db.get(args.toUserId);
    if (!toUserExists) {
      throw new Error("The user you are trying to vouch for does not exist.");
    }

    if (args.tradeAdId) {
      const tradeAdExists = await ctx.db.get(args.tradeAdId);
      if (!tradeAdExists) {
        throw new Error("The referenced trade ad does not exist.");
      }
    }

    const vouchId = await ctx.db.insert("vouches", {
      fromUserId: fromUser._id,
      toUserId: args.toUserId,
      rating: args.rating,
      comment: args.comment,
      tradeAdId: args.tradeAdId,
    });

    // Notify the user who received the vouch
    const fromUserName = fromUser.name ?? fromUser.email ?? "Someone";
    await ctx.runMutation(api.notifications.createNotification, {
      userId: args.toUserId,
      type: "vouch_received",
      content: `${fromUserName} gave you a ${args.rating}-star vouch${args.comment ? `: "${args.comment}"` : ""}`,
      vouchId,
    });

    return vouchId;
  },
});

export const updateMyVouch = mutation({
  args: {
    vouchId: v.id("vouches"),
    rating: v.optional(v.number()),
    comment: v.optional(v.string()),
    session: v.id("session")
  },
  handler: async (ctx, args): Promise<{ success: boolean; }> => {
    const user = await getUser(ctx, args.session);

    if (!user) {
      throw new Error("You must be logged in to update a vouch.");
    }

    const vouch = await ctx.db.get(args.vouchId);

    if (!vouch) {
      throw new Error("Vouch not found.");
    }
    if (vouch.fromUserId !== user._id) {
      throw new Error("You can only edit your own vouches.");
    }

    const updates: Partial<Doc<"vouches">> = {};
    if (args.rating !== undefined) {
      if (args.rating < 1 || args.rating > 5) {
        throw new Error("Rating must be between 1 and 5.");
      }
      updates.rating = args.rating;
    }
    if (args.comment !== undefined) {
      if (args.comment.length > 300) {
        throw new Error("Comment cannot exceed 300 characters.");
      }
      updates.comment = args.comment;
    }

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(args.vouchId, updates);
    }

    return { success: true };
  },
});

export const deleteMyVouch = mutation({
  args: { vouchId: v.id("vouches"), session: v.id("session") },
  handler: async (ctx, { vouchId, session }): Promise<{ success: boolean; }> => {
    const user = await getUser(ctx, session);

    if (!user) {
      throw new Error("You must be logged in to delete a vouch.");
    }

    const vouch = await ctx.db.get(vouchId);

    if (!vouch) {
      throw new Error("Vouch not found.");
    }
    if (vouch.fromUserId !== user._id && !user.roles?.includes(ROLES.ADMIN)) {
      throw new Error("You can only delete your own vouches.");
    }

    await ctx.db.delete(vouchId);
    return { success: true };
  },
});

// Admin function to delete any vouch
export const adminDeleteVouch = mutation({
  args: { vouchId: v.id("vouches"), session: v.id("session") },
  handler: async (ctx, { vouchId, session }): Promise<{ success: boolean; }> => {
    await requireAdmin(ctx, session);
    const vouch = await ctx.db.get(vouchId);
    if (!vouch) {
      throw new Error("Vouch not found.");
    }
    await ctx.db.delete(vouchId);
    return { success: true };
  },
});

// --- Public Queries for Vouches ---

async function resolveVouchDetails(
  ctx: QueryCtx,
  vouch: Doc<"vouches">,
): Promise<ResolvedVouch> {
  const fromUser = await ctx.runQuery(api.user.getPublicUserProfile, {
    userId: vouch.fromUserId,
  });
  const toUser = await ctx.runQuery(api.user.getPublicUserProfile, {
    userId: vouch.toUserId,
  });
  let tradeAd: ResolvedTradeAd | Doc<"tradeAds"> | null = null;
  if (vouch.tradeAdId) {
    tradeAd = await ctx.runQuery(api.tradeAds.getTradeAdById, {
      tradeAdId: vouch.tradeAdId,
    });
  }

  return {
    ...vouch,
    fromUser,
    toUser,
    tradeAd,
  };
}

export const getVouchesForUser = query({
  args: {
    userId: v.id("user"),
  },
  handler: async (ctx, { userId }): Promise<ResolvedVouch[]> => {
    const vouches = await ctx.db
      .query("vouches")
      .withIndex("by_toUserId", (q) => q.eq("toUserId", userId))
      .order("desc")
      .collect();

    return Promise.all(vouches.map((vouch) => resolveVouchDetails(ctx, vouch)));
  },
});

export const getVouchesFromUser = query({
  args: {
    userId: v.id("user"),
  },
  handler: async (ctx, { userId }): Promise<ResolvedVouch[]> => {
    const vouches = await ctx.db
      .query("vouches")
      .withIndex("by_fromUserId", (q) => q.eq("fromUserId", userId))
      .order("desc")
      .collect();

    return Promise.all(vouches.map((vouch) => resolveVouchDetails(ctx, vouch)));
  },
});

export const getUserVouchStats = query({
  args: { userId: v.id("user") },
  handler: async (
    ctx,
    { userId },
  ): Promise<{ averageRating: number | null; vouchCount: number; }> => {
    const vouches = await ctx.db
      .query("vouches")
      .withIndex("by_toUserId", (q) => q.eq("toUserId", userId))
      .collect();

    if (vouches.length === 0) {
      return { averageRating: null, vouchCount: 0 };
    }

    const totalRating = vouches.reduce((sum, v) => sum + v.rating, 0);
    const averageRating = totalRating / vouches.length;

    return {
      averageRating: parseFloat(averageRating.toFixed(2)),
      vouchCount: vouches.length,
    };
  },
});

export const hasUserVouchedForTrade = query({
  args: {
    fromUserId: v.id("user"),
    toUserId: v.id("user"),
    tradeAdId: v.optional(v.id("tradeAds")),
    session: v.id("session")
  },
  handler: async (ctx, { fromUserId, toUserId, tradeAdId, session }): Promise<boolean> => {
    const user = await getUser(ctx, session);
    if (!user || user._id !== fromUserId) {
      return false;
    }

    const existingVouch = await ctx.db
      .query("vouches")
      .withIndex("by_toUserId_fromUserId", (q) =>
        q.eq("toUserId", toUserId).eq("fromUserId", fromUserId),
      )
      .filter((q) =>
        tradeAdId ? q.eq(q.field("tradeAdId"), tradeAdId) : q.eq(q.field("tradeAdId"), undefined)
      )
      .first();

    return !!existingVouch;
  },
});

export const getChatDetailsForVouching = query({
  args: {
    chatId: v.id("chats"),
    session: v.id("session")
  },
  handler: async (ctx, { chatId, session }): Promise<{
    middleman: PublicUserProfile | null;
    participants: PublicUserProfile[];
    tradeAdId: Id<"tradeAds"> | null;
  } | null> => {
    const user = await getUser(ctx, session);
    if (!user) {
      return null;
    }

    const chat = await ctx.db.get(chatId);
    if (!chat) {
      return null;
    }

    // Check if user has access to this chat
    if (!chat.participantIds.includes(user._id) &&
      chat.middleman !== user._id &&
      (!user.roles?.includes("middleman") && !user.roles?.includes("admin"))) {
      return null;
    }

    // Get middleman profile if assigned
    let middleman: PublicUserProfile | null = null;
    if (chat.middleman) {
      middleman = await ctx.runQuery(api.user.getPublicUserProfile, {
        userId: chat.middleman
      });
    }

    // Get participant profiles
    const participants = await Promise.all(
      chat.participantIds.map(async (userId) => {
        return await ctx.runQuery(api.user.getPublicUserProfile, { userId });
      })
    );

    return {
      middleman,
      participants: participants.filter(p => p !== null) as PublicUserProfile[],
      tradeAdId: chat.tradeAd ?? null,
    };
  },
});
