import { v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server";
import type { Id, Doc } from "./_generated/dataModel";
import { api } from "./_generated/api";
import { type PublicUserProfile } from "./user";
import { type ResolvedMiddlemanCall } from "./middlemanCalls";
import { getUser } from "./utils/auth";

// Type definitions for resolved chat data
export type ResolvedChat = Doc<"chats"> & {
  participants: (PublicUserProfile | null)[];
  lastMessage?: ResolvedMessage | null;
  unreadCount?: number;
  otherParticipantLastReadMessageId?: Id<"messages"> | null;
  otherParticipantLastReadAt?: number | null;
  tradeAdCreatorId?: Id<"user"> | null;
  middlemanProfile?: PublicUserProfile | null;
};

export type ResolvedMessage = Doc<"messages"> & {
  sender?: PublicUserProfile | null;
  tradeOffer?: Doc<"chat_trade_offers"> | null;
  middlemanCall?: ResolvedMiddlemanCall | null;
};

// --- Chat Management ---

export const createChat = mutation({
  args: {
    tradeAd: v.optional(v.id("tradeAds")),
    participantIds: v.array(v.id("user")),
    session: v.id("session"),
    type: v.union(v.literal("trade"), v.literal("direct_message")),
  },
  handler: async (ctx, { tradeAd, participantIds, session, type }): Promise<Id<"chats">> => {
    const user = await getUser(ctx, session);
    if (!user) {
      throw new Error("You must be logged in to create a chat.");
    }

    // For trade chats, verify the trade ad exists
    let thumbnailUrl: string | undefined;
    if (type === "trade") {
      if (!tradeAd) {
        throw new Error("Trade ad is required for trade chats.");
      }
      const tradeAdDoc = await ctx.db.get(tradeAd);
      if (!tradeAdDoc) {
        throw new Error("Trade ad does not exist.");
      }
      
      // Get thumbnail from first item in trade ad
      const tradeAdResolved = await ctx.runQuery(api.tradeAds.getTradeAdById, { tradeAdId: tradeAd });
      if (tradeAdResolved?.haveItemsResolved?.[0]?.thumbnailUrl) {
        thumbnailUrl = tradeAdResolved.haveItemsResolved[0].thumbnailUrl;
      }
    }

    // Ensure the current user is included in participants
    if (!participantIds.includes(user._id)) {
      participantIds.push(user._id);
    }

    // Remove duplicates and ensure we have at least 2 participants
    const uniqueParticipants = [...new Set(participantIds)];
    if (uniqueParticipants.length < 2) {
      throw new Error("A chat must have at least 2 participants.");
    }

    // Check if chat already exists with these exact participants
    const existingChats = await ctx.db.query("chats").collect();
    const existingChat = existingChats.find(chat => {
      const chatParticipants = [...chat.participantIds].sort();
      const newParticipants = [...uniqueParticipants].sort();
      
      if (type === "trade") {
        return chat.tradeAd === tradeAd &&
          chat.type === "trade" &&
          chatParticipants.length === newParticipants.length &&
          chatParticipants.every((id, index) => id === newParticipants[index]);
      } else {
        return chat.type === "direct_message" &&
          chatParticipants.length === newParticipants.length &&
          chatParticipants.every((id, index) => id === newParticipants[index]);
      }
    });

    if (existingChat) {
      return existingChat._id;
    }

    // Verify all participants exist
    for (const participantId of uniqueParticipants) {
      const participant = await ctx.db.get(participantId);
      if (!participant) {
        throw new Error(`User with ID ${participantId} does not exist.`);
      }
    }

    const chatId = await ctx.db.insert("chats", {
      tradeAd,
      participantIds: uniqueParticipants,
      lastMessageAt: Date.now(),
      tradeStatus: type === "trade" ? "none" : undefined,
      type,
      thumbnailUrl,
    });

    return chatId;
  },
});

export const getUserChats = query({
  args: {
    session: v.id("session"),
  },
  handler: async (ctx, { session }): Promise<ResolvedChat[]> => {
    const user = await getUser(ctx, session);
    if (!user) {
      throw new Error("You must be logged in to view chats.");
    }

    const chats = await ctx.db
      .query("chats")
      .order("desc")
      .collect();

    // Include chats where user is a participant OR where user is the assigned middleman
    const userChats = chats.filter(chat => 
      chat.participantIds.includes(user._id) || chat.middleman === user._id
    );

    return Promise.all(userChats.map(chat => resolveChatDetails(ctx, chat, user._id)));
  },
});

export const getChatById = query({
  args: {
    chatId: v.id("chats"),
    session: v.id("session"),
  },
  handler: async (ctx, { chatId, session }): Promise<ResolvedChat | null> => {
    const user = await getUser(ctx, session);
    if (!user) {
      throw new Error("You must be logged in to view this chat.");
    }

    const chat = await ctx.db.get(chatId);
    if (!chat) return null;

    // Check if user is a participant, assigned middleman, or has middleman/admin role
    if (!chat.participantIds.includes(user._id) && 
        chat.middleman !== user._id && 
        (!user.roles?.includes("middleman") && !user.roles?.includes("admin"))) {
      throw new Error("You do not have access to this chat.");
    }

    return await resolveChatDetails(ctx, chat, user._id);
  },
});

export const getChatsByTradeAd = query({
  args: {
    tradeAdId: v.id("tradeAds"),
    session: v.id("session"),
  },
  handler: async (ctx, { tradeAdId, session }): Promise<ResolvedChat[]> => {
    const user = await getUser(ctx, session);
    if (!user) {
      throw new Error("You must be logged in to view chats.");
    }

    // Verify the trade ad exists
    const tradeAd = await ctx.db.get(tradeAdId);
    if (!tradeAd) {
      throw new Error("Trade ad does not exist.");
    }

    const chats = await ctx.db
      .query("chats")
      .filter((q) => q.eq(q.field("tradeAd"), tradeAdId))
      .order("desc")
      .collect();

    // Filter to only chats where the user is a participant
    const userChats = chats.filter(chat => chat.participantIds.includes(user._id));

    return Promise.all(userChats.map(chat => resolveChatDetails(ctx, chat, user._id)));
  },
});

export const findOrCreateDirectChat = mutation({
  args: {
    tradeAd: v.id("tradeAds"),
    otherUserId: v.id("user"),
    session: v.id("session"),
  },
  handler: async (ctx, { tradeAd, otherUserId, session }): Promise<Id<"chats">> => {
    const user = await getUser(ctx, session);
    if (!user) {
      throw new Error("You must be logged in to create a chat.");
    }

    if (user._id === otherUserId) {
      throw new Error("You cannot create a chat with yourself.");
    }

    // Verify the trade ad exists
    const tradeAdDoc = await ctx.db.get(tradeAd);
    if (!tradeAdDoc) {
      throw new Error("Trade ad does not exist.");
    }

    // Verify the other user exists
    const otherUser = await ctx.db.get(otherUserId);
    if (!otherUser) {
      throw new Error("The user you're trying to chat with does not exist.");
    }

    // Get thumbnail from first item in trade ad
    let thumbnailUrl: string | undefined;
    const tradeAdResolved = await ctx.runQuery(api.tradeAds.getTradeAdById, { tradeAdId: tradeAd });
    if (tradeAdResolved?.haveItemsResolved?.[0]?.thumbnailUrl) {
      thumbnailUrl = tradeAdResolved.haveItemsResolved[0].thumbnailUrl;
    }

    // Look for existing direct chat between these two users for this trade ad
    const existingChats = await ctx.db.query("chats").collect();
    const directChat = existingChats.find(chat => {
      const participants = [...chat.participantIds].sort();
      const targetParticipants = [user._id, otherUserId].sort();
      return chat.tradeAd === tradeAd &&
        chat.type === "trade" &&
        participants.length === 2 &&
        participants.every((id, index) => id === targetParticipants[index]);
    });

    if (directChat) {
      return directChat._id;
    }

    // Create new trade chat
    const chatId = await ctx.db.insert("chats", {
      tradeAd,
      participantIds: [user._id, otherUserId],
      lastMessageAt: Date.now(),
      tradeStatus: "none",
      type: "trade",
      thumbnailUrl,
    });

    return chatId;
  },
});

export const findOrCreateDirectMessage = mutation({
  args: {
    otherUserId: v.id("user"),
    session: v.id("session"),
  },
  handler: async (ctx, { otherUserId, session }): Promise<Id<"chats">> => {
    const user = await getUser(ctx, session);
    if (!user) {
      throw new Error("You must be logged in to create a chat.");
    }

    if (user._id === otherUserId) {
      throw new Error("You cannot create a chat with yourself.");
    }

    // Verify the other user exists
    const otherUser = await ctx.db.get(otherUserId);
    if (!otherUser) {
      throw new Error("The user you're trying to chat with does not exist.");
    }

    // Look for existing direct message between these two users
    const existingChats = await ctx.db.query("chats").collect();
    const directChat = existingChats.find(chat => {
      const participants = [...chat.participantIds].sort();
      const targetParticipants = [user._id, otherUserId].sort();
      return chat.type === "direct_message" &&
        participants.length === 2 &&
        participants.every((id, index) => id === targetParticipants[index]);
    });

    if (directChat) {
      return directChat._id;
    }

    // Create new direct message chat
    const chatId = await ctx.db.insert("chats", {
      participantIds: [user._id, otherUserId],
      lastMessageAt: Date.now(),
      type: "direct_message",
    });

    return chatId;
  },
});

export const initiateTradeAndChat = mutation({
  args: {
    tradeAd: v.id("tradeAds"),
    otherUserId: v.id("user"),
    session: v.id("session"),
    initialRequestedItems: v.array(v.object({
      id: v.string(),
      name: v.string(),
      thumbnailUrl: v.string(),
      quantity: v.number(),
      rarity: v.string(),
    })),
  },
  handler: async (ctx, { tradeAd, otherUserId, session, initialRequestedItems }): Promise<Id<"chats">> => {
    const user = await getUser(ctx, session);
    if (!user) {
      throw new Error("You must be logged in to create a chat.");
    }

    if (user._id === otherUserId) {
      throw new Error("You cannot create a chat with yourself.");
    }

    // Verify the trade ad exists
    const tradeAdDoc = await ctx.runQuery(api.tradeAds.getTradeAdById, { tradeAdId: tradeAd });
    if (!tradeAdDoc) {
      throw new Error("Trade ad does not exist.");
    }

    // Verify the other user exists
    const otherUser = await ctx.db.get(otherUserId);
    if (!otherUser) {
      throw new Error("The user you're trying to chat with does not exist.");
    }

    // Get thumbnail from first item in trade ad
    let thumbnailUrl: string | undefined;
    if (tradeAdDoc?.haveItemsResolved?.[0]?.thumbnailUrl) {
      thumbnailUrl = tradeAdDoc.haveItemsResolved[0].thumbnailUrl;
    }

    // Look for existing trade chat between these two users for this trade ad
    const existingChats = await ctx.db.query("chats").collect();
    const directChat = existingChats.find(chat => {
      const participants = [...chat.participantIds].sort();
      const targetParticipants = [user._id, otherUserId].sort();
      return chat.tradeAd === tradeAd &&
        chat.type === "trade" &&
        participants.length === 2 &&
        participants.every((id, index) => id === targetParticipants[index]);
    });

    if (directChat) {
      // Check if there's already an active trade
      if (directChat.tradeStatus === "pending" || directChat.tradeStatus === "accepted" || directChat.tradeStatus === "waiting_for_middleman") {
        return directChat._id;
      }
    }

    let chatId: Id<"chats">;
    
    if (directChat) {
      chatId = directChat._id;
    } else {
      // Create new trade chat
      chatId = await ctx.db.insert("chats", {
        tradeAd,
        participantIds: [user._id, otherUserId],
        lastMessageAt: Date.now(),
        tradeStatus: "none",
        type: "trade",
        thumbnailUrl,
      });
    }

    // Create trade offer
    const tradeOfferId = await ctx.db.insert("chat_trade_offers", {
      status: "pending",
      offering: [], // Initially empty, will be filled by the other user
      requesting: initialRequestedItems,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create trade offer message
    await ctx.db.insert("messages", {
      chatId,
      senderId: user._id,
      type: "trade_offer",
      timestamp: Date.now(),
      tradeOfferId,
    });

    // Update chat status
    await ctx.db.patch(chatId, {
      tradeStatus: "pending",
      activeTradeOfferId: tradeOfferId,
      lastMessageAt: Date.now(),
    });

    return chatId;
  },
});

export const updateTradeStatusByMiddleman = mutation({
  args: {
    chatId: v.id("chats"),
    session: v.id("session"),
    newStatus: v.union(v.literal("completed"), v.literal("cancelled")),
  },
  handler: async (ctx, { chatId, session, newStatus }): Promise<{ success: boolean }> => {
    const user = await getUser(ctx, session);
    if (!user) {
      throw new Error("You must be logged in to update trade status.");
    }

    // Verify user has middleman role
    if (!user.roles?.includes("middleman")) {
      throw new Error("Only middlemen can update trade status.");
    }

    // Verify the chat exists
    const chat = await ctx.db.get(chatId);
    if (!chat) {
      throw new Error("Chat not found.");
    }

    // Update chat trade status and clear active trade offer and middleman
    await ctx.db.patch(chatId, {
      tradeStatus: newStatus,
      activeTradeOfferId: undefined,
      middleman: undefined,
      lastMessageAt: Date.now(),
    });

    // Update the associated trade ad status to closed
    if (chat.tradeAd) {
      await ctx.db.patch(chat.tradeAd, {
        status: "closed",
        closedAt: Date.now(),
      });
    }

    // Send system message
    const systemMessage = newStatus === "completed" 
      ? "Trade marked as completed by middleman"
      : "Trade marked as cancelled by middleman";

    await ctx.db.insert("messages", {
      chatId,
      type: "system",
      content: systemMessage,
      timestamp: Date.now(),
      systemType: newStatus === "completed" ? "trade_completed" : "trade_cancelled",
    });

    // Notify chat participants about the trade status change
    const middlemanName = user.name ?? user.email ?? "Middleman";
    const notificationType = newStatus === "completed" ? "trade_completed" : "trade_cancelled";
    const notificationContent = newStatus === "completed" 
      ? `${middlemanName} marked the trade as completed`
      : `${middlemanName} marked the trade as cancelled`;

    await ctx.runMutation(api.notifications.createNotificationForUsers, {
      userIds: chat.participantIds,
      type: notificationType,
      content: notificationContent,
      chatId,
      excludeUserId: user._id,
    });

    return { success: true };
  },
});


// --- Helper Functions ---

async function resolveChatDetails(
  ctx: QueryCtx,
  chat: Doc<"chats">,
  currentUserId?: Id<"user">,
): Promise<ResolvedChat> {
  // Get participant profiles
  const participants = await Promise.all(
    chat.participantIds.map(async (userId) => {
      return await ctx.runQuery(api.user.getPublicUserProfile, { userId });
    })
  );

  // Get the trade ad to find the creator
  let tradeAdCreatorId: Id<"user"> | null = null;
  if (chat.tradeAd) {
    const tradeAd = await ctx.db.get(chat.tradeAd);
    if (tradeAd) {
      tradeAdCreatorId = tradeAd.creatorId;
    }
  }

  // Get middleman profile if assigned
  let middlemanProfile: PublicUserProfile | null = null;
  if (chat.middleman) {
    middlemanProfile = await ctx.runQuery(api.user.getPublicUserProfile, { 
      userId: chat.middleman 
    });
  }

  // Get the last message
  const lastMessage = await ctx.db
    .query("messages")
    .withIndex("chatId", (q) => q.eq("chatId", chat._id))
    .order("desc")
    .first();

  let resolvedLastMessage: ResolvedMessage | null = null;
  if (lastMessage) {
    resolvedLastMessage = await resolveMessageDetails(ctx, lastMessage);
  }

  let unreadCount = 0;
  let otherParticipantLastReadMessageId: Id<"messages"> | null = null;
  let otherParticipantLastReadAt: number | null = null;

  if (currentUserId) {
    // Get current user's read state
    const currentUserReadState = await ctx.db
      .query("chat_read_states")
      .withIndex("byChatAndUser", (q) => q.eq("chatId", chat._id).eq("userId", currentUserId))
      .unique();

    // Get other participant's read state
    const otherParticipantId = chat.participantIds.find(id => id !== currentUserId);
    if (otherParticipantId) {
      const otherParticipantReadState = await ctx.db
        .query("chat_read_states")
        .withIndex("byChatAndUser", (q) => q.eq("chatId", chat._id).eq("userId", otherParticipantId))
        .unique();

      if (otherParticipantReadState) {
        otherParticipantLastReadMessageId = otherParticipantReadState.lastReadMessageId;
        otherParticipantLastReadAt = otherParticipantReadState.lastReadAt;
      }
    }

    // Calculate unread count
    if (currentUserReadState && currentUserReadState.lastReadMessageId) {
      const lastReadMessage = await ctx.db.get(currentUserReadState.lastReadMessageId);
      if (lastReadMessage) {
        const unreadMessages = await ctx.db
          .query("messages")
          .withIndex("chatId", (q) => q.eq("chatId", chat._id))
          .filter((q) => 
            q.and(
              q.gt(q.field("timestamp"), lastReadMessage.timestamp),
              q.neq(q.field("senderId"), currentUserId)
            )
          )
          .collect();
        unreadCount = unreadMessages.length;
      }
    } else {
      // If no read state exists, count all messages from other users
      const allMessages = await ctx.db
        .query("messages")
        .withIndex("chatId", (q) => q.eq("chatId", chat._id))
        .filter((q) => q.neq(q.field("senderId"), currentUserId))
        .collect();
      unreadCount = allMessages.length;
    }
  }

  return {
    ...chat,
    participants,
    lastMessage: resolvedLastMessage,
    unreadCount,
    otherParticipantLastReadMessageId,
    otherParticipantLastReadAt,
    tradeAdCreatorId,
    middlemanProfile,
  };
}

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

export const markChatAsRead = mutation({
  args: {
    chatId: v.id("chats"),
    userId: v.id("user"),
    lastReadMessageId: v.id("messages"),
  },
  handler: async (ctx, { chatId, userId, lastReadMessageId }): Promise<{ success: boolean }> => {
    const user = await ctx.db.get(userId);

    // Verify the chat exists and user has access
    const chat = await ctx.db.get(chatId);
    if (!chat?.participantIds.includes(userId) && !(user?.roles?.includes("middleman") || user?.roles?.includes("admin"))) {
      throw new Error("Chat not found or access denied.");
    }

    // Verify the message exists and belongs to this chat
    const message = await ctx.db.get(lastReadMessageId);
    if (!message || message.chatId !== chatId) {
      throw new Error("Message not found or doesn't belong to this chat.");
    }

    // Get existing read state
    const existingReadState = await ctx.db
      .query("chat_read_states")
      .withIndex("byChatAndUser", (q) => q.eq("chatId", chatId).eq("userId", userId))
      .unique();

    if (existingReadState) {
      // Only update if the new message is newer
      const existingMessage = await ctx.db.get(existingReadState.lastReadMessageId);
      if (!existingMessage || message.timestamp > existingMessage.timestamp) {
        await ctx.db.patch(existingReadState._id, {
          lastReadMessageId,
          lastReadAt: Date.now(),
        });
      }
    } else {
      // Create new read state
      await ctx.db.insert("chat_read_states", {
        chatId,
        userId,
        lastReadMessageId,
        lastReadAt: Date.now(),
      });
    }

    // Mark chat-related notifications as read directly
    const chatNotifications = await ctx.db
      .query("notification")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), userId),
          q.eq(q.field("chatId"), chatId),
          q.eq(q.field("read"), false),
          q.or(
            q.eq(q.field("type"), "middleman_call"),
            q.eq(q.field("type"), "trade_offer"),
            q.eq(q.field("type"), "trade_completed"),
            q.eq(q.field("type"), "trade_cancelled"),
            q.eq(q.field("type"), "chat_message")
          )
        )
      )
      .collect();

    // Mark all chat notifications as read
    await Promise.all(
      chatNotifications.map(notification =>
        ctx.db.patch(notification._id, { read: true })
      )
    );

    return { success: true };
  },
});

export const getChatParticipantsReadStates = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, { chatId }) => {
    const readStates = await ctx.db
      .query("chat_read_states")
      .withIndex("byChatAndUser", (q) => q.eq("chatId", chatId))
      .collect();

    return readStates.map(state => ({
      userId: state.userId,
      lastReadMessageId: state.lastReadMessageId,
      lastReadAt: state.lastReadAt,
    }));
  },
});

export const isAllowedToViewChat = query({
  args: {
    chatId: v.id("chats"),
    userId: v.id("user"),
  },
  handler: async (ctx, { chatId, userId }) => {
    const chat = await ctx.db.get(chatId);
    if (!chat) return false;

    const user = await ctx.db.get(userId);
    if (!user) return false;

    if (user.roles?.includes("middleman") || user.roles?.includes("admin")) return true;

    // Check if the user is a participant in the chat
    return chat.participantIds.includes(userId);
  }
}
);