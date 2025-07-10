import { v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server";
import type { Id, Doc } from "./_generated/dataModel";
import { api } from "./_generated/api";
import { type PublicUserProfile } from "./user";
import { type ResolvedMiddlemanCall } from "./middlemanCalls";
import { getUser } from "./utils/auth";

// Type definitions for resolved message data
export type ResolvedMessage = Doc<"messages"> & {
  sender?: PublicUserProfile | null;
  tradeOffer?: Doc<"chat_trade_offers"> | null;
  middlemanCall?: ResolvedMiddlemanCall | null;
};

// Validators
const messageTypeValidator = v.union(
  v.literal("message"),
  v.literal("trade_offer"),
  v.literal("system"),
  v.literal("middleman_call")
);

const systemTypeValidator = v.union(
  v.literal("typing"),
  v.literal("trade_completed"),
  v.literal("trade_cancelled"),
  v.literal("trade_closed")
);

// --- Message Management ---

export const sendMessage = mutation({
  args: {
    chatId: v.id("chats"),
    content: v.string(),
    session: v.id("session"),
  },
  handler: async (ctx, { chatId, content, session }): Promise<Id<"messages">> => {
    const user = await getUser(ctx, session);
    if (!user) {
      throw new Error("You must be logged in to send messages.");
    }

    const chat = await ctx.db.get(chatId);
    if (!chat) {
      throw new Error("Chat not found.");
    }

    if (!chat.participantIds.includes(user._id) && (!user.roles?.includes("middleman") && !user.roles?.includes("admin"))) {
      throw new Error("You are not a participant in this chat.");
    }

    if (content.trim().length === 0) {
      throw new Error("Message content cannot be empty.");
    }

    if (content.length > 1000) {
      throw new Error("Message content cannot exceed 1000 characters.");
    }

    const timestamp = Date.now();
    const messageId = await ctx.db.insert("messages", {
      chatId,
      senderId: user._id,
      type: "message",
      content,
      timestamp,
    });

    // Update chat's last message timestamp
    await ctx.db.patch(chatId, { lastMessageAt: timestamp });

    // Notify other chat participants about the new message
    const senderName = user.name ?? user.email ?? "Someone";
    await ctx.runMutation(api.notifications.createNotificationForUsers, {
      userIds: chat.participantIds,
      type: "chat_message",
      content: `${senderName}: ${content.length > 50 ? content.substring(0, 50) + "..." : content}`,
      chatId,
      excludeUserId: user._id,
    });

    return messageId;
  },
});

export const sendSystemMessage = mutation({
  args: {
    chatId: v.id("chats"),
    systemType: systemTypeValidator,
    content: v.optional(v.string()),
    session: v.id("session"),
  },
  handler: async (ctx, { chatId, systemType, content, session }): Promise<Id<"messages">> => {
    const user = await getUser(ctx, session);
    if (!user) {
      throw new Error("You must be logged in to send system messages.");
    }

    const chat = await ctx.db.get(chatId);
    if (!chat) {
      throw new Error("Chat not found.");
    }

    if (!chat.participantIds.includes(user._id) && (!user.roles?.includes("middleman") && !user.roles?.includes("admin"))) {
      throw new Error("You are not a participant in this chat.");
    }

    const timestamp = Date.now();
    const messageId = await ctx.db.insert("messages", {
      chatId,
      type: "system",
      systemType,
      content,
      timestamp,
    });

    await ctx.db.patch(chatId, { lastMessageAt: timestamp });

    return messageId;
  },
});

export const getChatMessages = query({
  args: {
    chatId: v.id("chats"),
    session: v.id("session"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { chatId, session, limit = 50 }): Promise<ResolvedMessage[]> => {
    const user = await getUser(ctx, session);
    if (!user) {
      throw new Error("You must be logged in to view messages.");
    }

    const chat = await ctx.db.get(chatId);
    if (!chat) {
      throw new Error("Chat not found.");
    }

    if (!chat.participantIds.includes(user._id) && (!user.roles?.includes("middleman") && !user.roles?.includes("admin"))) {
      throw new Error("You are not a participant in this chat.");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("chatId", (q) => q.eq("chatId", chatId))
      .order("desc")
      .take(limit);

    // Reverse to get chronological order (oldest first)
    const chronologicalMessages = messages.reverse();

    return Promise.all(chronologicalMessages.map(message => resolveMessageDetails(ctx, message)));
  },
});

export const getMessageById = query({
  args: {
    messageId: v.id("messages"),
    session: v.id("session"),
  },
  handler: async (ctx, { messageId, session }): Promise<ResolvedMessage | null> => {
    const user = await getUser(ctx, session);
    if (!user) {
      throw new Error("You must be logged in to view messages.");
    }

    const message = await ctx.db.get(messageId);
    if (!message) return null;

    const chat = await ctx.db.get(message.chatId);
    if (!chat?.participantIds.includes(user._id)) {
      throw new Error("You do not have access to this message.");
    }

    return await resolveMessageDetails(ctx, message);
  },
});

export const getMessagesBySender = query({
  args: {
    senderId: v.id("user"),
    chatId: v.optional(v.id("chats")),
    session: v.id("session"),
  },
  handler: async (ctx, { senderId, chatId, session }): Promise<ResolvedMessage[]> => {
    const user = await getUser(ctx, session);
    if (!user) {
      throw new Error("You must be logged in to view messages.");
    }

    let messages: Doc<"messages">[];

    if (chatId) {
      // Verify user has access to the chat
      const chat = await ctx.db.get(chatId);
      if (!chat?.participantIds.includes(user._id) && (!user.roles?.includes("middleman") && !user.roles?.includes("admin"))) {
        throw new Error("You do not have access to this chat.");
      }

      messages = await ctx.db
        .query("messages")
        .withIndex("senderId", (q) => q.eq("senderId", senderId))
        .filter((q) => q.eq(q.field("chatId"), chatId))
        .order("desc")
        .collect();
    } else {
      // Get messages from all chats the user has access to
      const chats = await ctx.db
        .query("chats")
        .collect();
      
      const userChats = chats.filter(chat => chat.participantIds.includes(user._id));

      const chatIds = userChats.map(chat => chat._id);
      
      messages = await ctx.db
        .query("messages")
        .withIndex("senderId", (q) => q.eq("senderId", senderId))
        .filter((q) => q.or(...chatIds.map(id => q.eq(q.field("chatId"), id))))
        .order("desc")
        .collect();
    }

    return Promise.all(messages.map(message => resolveMessageDetails(ctx, message)));
  },
});

export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
    session: v.id("session"),
  },
  handler: async (ctx, { messageId, session }): Promise<{ success: boolean }> => {
    const user = await getUser(ctx, session);
    if (!user) {
      throw new Error("You must be logged in to delete messages.");
    }

    const message = await ctx.db.get(messageId);
    if (!message) {
      throw new Error("Message not found.");
    }

    // Only the sender can delete their own messages
    if (message.senderId !== user._id) {
      throw new Error("You can only delete your own messages.");
    }

    // Don't allow deletion of trade offers or middleman calls
    if (message.type === "trade_offer" || message.type === "middleman_call") {
      throw new Error("Trade offers and middleman calls cannot be deleted.");
    }

    await ctx.db.delete(messageId);

    return { success: true };
  },
});

export const editMessage = mutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
    session: v.id("session"),
  },
  handler: async (ctx, { messageId, content, session }): Promise<{ success: boolean }> => {
    const user = await getUser(ctx, session);
    if (!user) {
      throw new Error("You must be logged in to edit messages.");
    }

    const message = await ctx.db.get(messageId);
    if (!message) {
      throw new Error("Message not found.");
    }

    // Only the sender can edit their own messages
    if (message.senderId !== user._id) {
      throw new Error("You can only edit your own messages.");
    }

    // Only allow editing of regular messages
    if (message.type !== "message") {
      throw new Error("Only regular messages can be edited.");
    }

    if (content.trim().length === 0) {
      throw new Error("Message content cannot be empty.");
    }

    if (content.length > 1000) {
      throw new Error("Message content cannot exceed 1000 characters.");
    }

    await ctx.db.patch(messageId, { content });

    return { success: true };
  },
});

// --- Trade Chat Management ---

export const closeRelatedTradeChats = mutation({
  args: {
    tradeAdId: v.id("tradeAds"),
    excludeChatId: v.optional(v.id("chats")), // Chat to exclude from closing (e.g., the one where trade was accepted)
    reason: v.union(v.literal("trade_cancelled"), v.literal("trade_accepted")),
    session: v.id("session"),
  },
  handler: async (ctx, { tradeAdId, excludeChatId, reason, session }): Promise<{ success: boolean; closedChatsCount: number }> => {
    const user = await getUser(ctx, session);
    if (!user) {
      throw new Error("You must be logged in to close trade chats.");
    }

    // Verify the trade ad exists
    const tradeAd = await ctx.db.get(tradeAdId);
    if (!tradeAd) {
      throw new Error("Trade ad not found.");
    }

    // Find all chats related to this trade ad
    const relatedChats = await ctx.db
      .query("chats")
      .withIndex("byTradeAd", (q) => q.eq("tradeAd", tradeAdId))
      .collect();

    // Filter out the excluded chat and only include chats that aren't already cancelled
    const chatsToClose = relatedChats.filter(chat => 
      chat._id !== excludeChatId && 
      chat.tradeStatus !== "cancelled" &&
      chat.tradeStatus !== "completed"
    );

    const timestamp = Date.now();
    let closedChatsCount = 0;

    // Close each chat and send system message
    for (const chat of chatsToClose) {
      // Update chat status to cancelled
      await ctx.db.patch(chat._id, {
        tradeStatus: "cancelled",
        lastMessageAt: timestamp,
      });

      // Determine the system message content
      let systemMessage: string;
      if (reason === "trade_cancelled") {
        systemMessage = "This trade has been cancelled by the trade ad owner.";
      } else {
        systemMessage = "This trade has been closed because the trade ad owner accepted another offer.";
      }

      // Send system message to the chat
      await ctx.db.insert("messages", {
        chatId: chat._id,
        type: "system",
        systemType: "trade_closed",
        content: systemMessage,
        timestamp,
      });

      // Notify chat participants about the trade closure
      const notificationContent = reason === "trade_cancelled" 
        ? "Trade cancelled by owner"
        : "Trade closed - owner accepted another offer";

      await ctx.runMutation(api.notifications.createNotificationForUsers, {
        userIds: chat.participantIds,
        type: "trade_cancelled",
        content: notificationContent,
        chatId: chat._id,
      });

      closedChatsCount++;
    }

    return { success: true, closedChatsCount };
  },
});

// --- Helper Functions ---

async function resolveMessageDetails(
  ctx: QueryCtx,
  message: Doc<"messages">,
): Promise<ResolvedMessage> {
  let sender: PublicUserProfile | null = null;
  if (message.senderId) {
    sender = await ctx.runQuery(api.user.getPublicUserProfile, {
      userId: message.senderId,
    });
  }

  let tradeOffer: Doc<"chat_trade_offers"> | null = null;
  if (message.tradeOfferId) {
    tradeOffer = await ctx.db.get(message.tradeOfferId);
  }

  let middlemanCall: ResolvedMiddlemanCall | null = null;
  if (message.middlemanCallId) {
    const rawMiddlemanCall = await ctx.db.get(message.middlemanCallId);
    if (rawMiddlemanCall) {
      // Resolve the middleman call with all its details
      let desiredMiddlemanProfile: PublicUserProfile | null = null;
      if (rawMiddlemanCall.desiredMiddleman) {
        desiredMiddlemanProfile = await ctx.runQuery(api.user.getPublicUserProfile, {
          userId: rawMiddlemanCall.desiredMiddleman,
        });
      }

      middlemanCall = {
        ...rawMiddlemanCall,
        message,
        chat: await ctx.db.get(message.chatId),
        creator: sender,
        desiredMiddlemanProfile,
      };
    }
  }

  return {
    ...message,
    sender,
    tradeOffer,
    middlemanCall,
  };
}