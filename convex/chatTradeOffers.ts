import { v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server";
import type { Id, Doc } from "./_generated/dataModel";
import { api } from "./_generated/api";
import { type PublicUserProfile } from "./user";
import { getUser } from "./utils/auth";

// Type definitions for resolved trade offer data
export type ResolvedTradeOffer = Doc<"chat_trade_offers"> & {
  message?: Doc<"messages"> | null;
  chat?: Doc<"chats"> | null;
  creator?: PublicUserProfile | null;
};

// Validators for item objects in trade offers
const tradeItemValidator = v.object({
  id: v.string(),
  name: v.string(),
  thumbnailUrl: v.string(),
  quantity: v.number(),
  rarity: v.string(),
});

const tradeOfferStatusValidator = v.union(
  v.literal("pending"),
  v.literal("accepted"),
  v.literal("declined"),
  v.literal("cancelled")
);

// --- Trade Offer Management ---

export const createTradeOffer = mutation({
  args: {
    chatId: v.id("chats"),
    offering: v.array(tradeItemValidator),
    requesting: v.array(tradeItemValidator),
    session: v.id("session"),
  },
  handler: async (ctx, { chatId, offering, requesting, session }): Promise<Id<"messages">> => {
    const user = await getUser(ctx, session);
    if (!user) {
      throw new Error("You must be logged in to create trade offers.");
    }

    const chat = await ctx.db.get(chatId);
    if (!chat) {
      throw new Error("Chat not found.");
    }

    if (!chat.participantIds.includes(user._id) && (!user.roles?.includes("middleman") && !user.roles?.includes("admin"))) {
      throw new Error("You are not a participant in this chat.");
    }

    if (offering.length === 0 && requesting.length === 0) {
      throw new Error("Trade offer must include at least one item to offer or request.");
    }

    // Validate item quantities
    for (const item of [...offering, ...requesting]) {
      if (item.quantity <= 0) {
        throw new Error("Item quantities must be positive.");
      }
      if (!Number.isInteger(item.quantity)) {
        throw new Error("Item quantities must be whole numbers.");
      }
    }

    const now = Date.now();
    
    // Create the trade offer record
    const tradeOfferId = await ctx.db.insert("chat_trade_offers", {
      status: "pending",
      offering,
      requesting,
      createdAt: now,
      updatedAt: now,
    });

    // Create the message referencing the trade offer
    const messageId = await ctx.db.insert("messages", {
      chatId,
      senderId: user._id,
      type: "trade_offer",
      tradeOfferId,
      timestamp: now,
    });

    // Update chat status to pending and set active trade offer
    await ctx.db.patch(chatId, { 
      lastMessageAt: now,
      tradeStatus: "pending",
      activeTradeOfferId: tradeOfferId,
    });

    return messageId;
  },
});

export const updateTradeOfferStatus = mutation({
  args: {
    tradeOfferId: v.id("chat_trade_offers"),
    status: tradeOfferStatusValidator,
    session: v.id("session"),
  },
  handler: async (ctx, { tradeOfferId, status, session }): Promise<{ success: boolean }> => {
    const user = await getUser(ctx, session);
    if (!user) {
      throw new Error("You must be logged in to update trade offers.");
    }

    const tradeOffer = await ctx.db.get(tradeOfferId);
    if (!tradeOffer) {
      throw new Error("Trade offer not found.");
    }

    // Find the message associated with this trade offer to check chat access
    const message = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("tradeOfferId"), tradeOfferId))
      .first();

    if (!message) {
      throw new Error("Associated message not found.");
    }

    const chat = await ctx.db.get(message.chatId);
    if (!chat?.participantIds.includes(user._id)) {
      throw new Error("You do not have access to this trade offer.");
    }

    // Only allow certain status transitions
    const validTransitions: Record<string, string[]> = {
      pending: ["accepted", "declined", "cancelled"],
      accepted: ["cancelled"],
      declined: ["cancelled"],
      cancelled: [], // Cannot change from cancelled
    };

    if (!validTransitions[tradeOffer.status]?.includes(status)) {
      throw new Error(`Cannot change trade offer status from ${tradeOffer.status} to ${status}.`);
    }

    // Only the creator can cancel, others can accept/decline
    if (status === "cancelled" && message.senderId !== user._id) {
      throw new Error("Only the creator can cancel a trade offer.");
    }

    if ((status === "accepted" || status === "declined") && message.senderId === user._id) {
      throw new Error("You cannot accept or decline your own trade offer.");
    }

    await ctx.db.patch(tradeOfferId, {
      status,
      updatedAt: Date.now(),
    });

    // Update chat trade status and send system message based on the new status
    if (status === "accepted") {
      // Update chat status to accepted and set active trade offer
      await ctx.db.patch(message.chatId, {
        tradeStatus: "accepted",
        activeTradeOfferId: tradeOfferId,
        lastMessageAt: Date.now(),
      });

      // Get the chat to access the trade ad
      const chat = await ctx.db.get(message.chatId);
      if (chat?.tradeAd) {
        // Update the associated trade ad status to closed when trade is accepted
        await ctx.db.patch(chat.tradeAd, {
          status: "closed",
          closedAt: Date.now(),
        });
      }

      await ctx.db.insert("messages", {
        chatId: message.chatId,
        type: "system",
        systemType: "trade_completed",
        content: "Trade offer has been accepted!",
        timestamp: Date.now(),
      });
    } else if (status === "declined") {
      // Reset chat status to none when trade is declined
      await ctx.db.patch(message.chatId, {
        tradeStatus: "none",
        activeTradeOfferId: undefined,
        lastMessageAt: Date.now(),
      });

      // Get the chat to access the trade ad
      const chat = await ctx.db.get(message.chatId);
      if (chat?.tradeAd) {
        // Reopen the trade ad when trade offer is declined
        await ctx.db.patch(chat.tradeAd, {
          status: "open",
          closedAt: undefined,
        });
      }

      await ctx.db.insert("messages", {
        chatId: message.chatId,
        type: "system",
        content: "Trade offer has been declined.",
        timestamp: Date.now(),
      });
    } else if (status === "cancelled") {
      // Reset chat status to none when trade is cancelled
      await ctx.db.patch(message.chatId, {
        tradeStatus: "none",
        activeTradeOfferId: undefined,
        lastMessageAt: Date.now(),
      });

      // Get the chat to access the trade ad
      const chat = await ctx.db.get(message.chatId);
      if (chat?.tradeAd) {
        // Reopen the trade ad when trade offer is cancelled
        await ctx.db.patch(chat.tradeAd, {
          status: "open",
          closedAt: undefined,
        });
      }

      await ctx.db.insert("messages", {
        chatId: message.chatId,
        type: "system",
        content: "Trade offer has been cancelled.",
        timestamp: Date.now(),
      });
    }

    return { success: true };
  },
});

export const getTradeOfferById = query({
  args: {
    tradeOfferId: v.id("chat_trade_offers"),
    session: v.id("session"),
  },
  handler: async (ctx, { tradeOfferId, session }): Promise<ResolvedTradeOffer | null> => {
    const user = await getUser(ctx, session);
    if (!user) {
      throw new Error("You must be logged in to view trade offers.");
    }

    const tradeOffer = await ctx.db.get(tradeOfferId);
    if (!tradeOffer) return null;

    // Verify user has access through the associated message/chat
    const message = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("tradeOfferId"), tradeOfferId))
      .first();

    if (!message) {
      throw new Error("Associated message not found.");
    }

    const chat = await ctx.db.get(message.chatId);
    if (!chat?.participantIds.includes(user._id)) {
      throw new Error("You do not have access to this trade offer.");
    }

    return await resolveTradeOfferDetails(ctx, tradeOffer);
  },
});

export const getTradeOffersForChat = query({
  args: {
    chatId: v.id("chats"),
    status: v.optional(tradeOfferStatusValidator),
    session: v.id("session"),
  },
  handler: async (ctx, { chatId, status, session }): Promise<ResolvedTradeOffer[]> => {
    const user = await getUser(ctx, session);
    if (!user) {
      throw new Error("You must be logged in to view trade offers.");
    }

    const chat = await ctx.db.get(chatId);
    if (!chat?.participantIds.includes(user._id) && (!user.roles?.includes("middleman") && !user.roles?.includes("admin"))) {
      throw new Error("You do not have access to this chat.");
    }

    // Get all messages with trade offers for this chat
    const messages = await ctx.db
      .query("messages")
      .withIndex("chatId", (q) => q.eq("chatId", chatId))
      .filter((q) => q.eq(q.field("type"), "trade_offer"))
      .order("desc")
      .collect();

    // Get the trade offers
    const tradeOfferIds = messages
      .map(msg => msg.tradeOfferId)
      .filter((id): id is Id<"chat_trade_offers"> => id !== undefined);

    const tradeOffers = await Promise.all(
      tradeOfferIds.map(id => ctx.db.get(id))
    );

    // Filter by status if provided
    let filteredOffers = tradeOffers.filter((offer): offer is Doc<"chat_trade_offers"> => offer !== null);
    if (status) {
      filteredOffers = filteredOffers.filter(offer => offer.status === status);
    }

    return Promise.all(filteredOffers.map(offer => resolveTradeOfferDetails(ctx, offer)));
  },
});

export const getUserTradeOffers = query({
  args: {
    status: v.optional(tradeOfferStatusValidator),
    session: v.id("session"),
  },
  handler: async (ctx, { status, session }): Promise<ResolvedTradeOffer[]> => {
    const user = await getUser(ctx, session);
    if (!user) {
      throw new Error("You must be logged in to view trade offers.");
    }

    // Get all chats the user participates in
    const chats = await ctx.db
      .query("chats")
      .collect();

    const userChats = chats.filter(chat => chat.participantIds.includes(user._id));

    const chatIds = userChats.map(chat => chat._id);

    // Get all trade offer messages from these chats
    const messages = await ctx.db
      .query("messages")
      .filter((q) => 
        q.and(
          q.eq(q.field("type"), "trade_offer"),
          q.or(...chatIds.map(id => q.eq(q.field("chatId"), id)))
        )
      )
      .order("desc")
      .collect();

    // Get the trade offers
    const tradeOfferIds = messages
      .map(msg => msg.tradeOfferId)
      .filter((id): id is Id<"chat_trade_offers"> => id !== undefined);

    const tradeOffers = await Promise.all(
      tradeOfferIds.map(id => ctx.db.get(id))
    );

    // Filter by status if provided
    let filteredOffers = tradeOffers.filter((offer): offer is Doc<"chat_trade_offers"> => offer !== null);
    if (status) {
      filteredOffers = filteredOffers.filter(offer => offer.status === status);
    }

    return Promise.all(filteredOffers.map(offer => resolveTradeOfferDetails(ctx, offer)));
  },
});

export const getTradeOfferStats = query({
  args: {
    userId: v.optional(v.id("user")),
    session: v.id("session"),
  },
  handler: async (ctx, { userId, session }) => {
    const user = await getUser(ctx, session);
    if (!user) {
      throw new Error("You must be logged in to view trade offer stats.");
    }

    const targetUserId = userId ?? user._id;

    // Get all chats the target user participates in
    const chats = await ctx.db
      .query("chats")
      .collect();
    
    const userChats = chats.filter(chat => chat.participantIds.includes(targetUserId));

    const chatIds = userChats.map(chat => chat._id);

    // Get all trade offer messages from these chats created by the target user
    const messages = await ctx.db
      .query("messages")
      .withIndex("senderId", (q) => q.eq("senderId", targetUserId))
      .filter((q) => 
        q.and(
          q.eq(q.field("type"), "trade_offer"),
          q.or(...chatIds.map(id => q.eq(q.field("chatId"), id)))
        )
      )
      .collect();

    // Get the trade offers
    const tradeOfferIds = messages
      .map(msg => msg.tradeOfferId)
      .filter((id): id is Id<"chat_trade_offers"> => id !== undefined);

    const tradeOffers = await Promise.all(
      tradeOfferIds.map(id => ctx.db.get(id))
    );

    const validOffers = tradeOffers.filter((offer): offer is Doc<"chat_trade_offers"> => offer !== null);

    const stats = {
      total: validOffers.length,
      pending: validOffers.filter(offer => offer.status === "pending").length,
      accepted: validOffers.filter(offer => offer.status === "accepted").length,
      declined: validOffers.filter(offer => offer.status === "declined").length,
      cancelled: validOffers.filter(offer => offer.status === "cancelled").length,
    };

    return stats;
  },
});

// --- Helper Functions ---

async function resolveTradeOfferDetails(
  ctx: QueryCtx,
  tradeOffer: Doc<"chat_trade_offers">,
): Promise<ResolvedTradeOffer> {
  // Find the associated message
  const message = await ctx.db
    .query("messages")
    .filter((q) => q.eq(q.field("tradeOfferId"), tradeOffer._id))
    .first();

  let chat: Doc<"chats"> | null = null;
  let creator: PublicUserProfile | null = null;

  if (message) {
    chat = await ctx.db.get(message.chatId);
    if (message.senderId) {
      creator = await ctx.runQuery(api.user.getPublicUserProfile, {
        userId: message.senderId,
      });
    }
  }

  return {
    ...tradeOffer,
    message,
    chat,
    creator,
  };
}