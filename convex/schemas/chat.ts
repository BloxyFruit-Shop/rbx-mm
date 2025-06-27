import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const chatSchemes = {
  chats: defineTable({
    tradeAd: v.optional(v.id("tradeAds")),
    participantIds: v.array(v.id("user")),
    lastMessageAt: v.number(),
    tradeStatus: v.optional(v.union(
      v.literal("none"), 
      v.literal("pending"), 
      v.literal("accepted"), 
      v.literal("waiting_for_middleman"), 
      v.literal("completed"), 
      v.literal("cancelled")
    )),
    thumbnailUrl: v.optional(v.string()),
    type: v.union(
      v.literal("trade"),
      v.literal("direct_message")
    ),
    activeTradeOfferId: v.optional(v.id("chat_trade_offers")),
    middleman: v.optional(v.id("user")),
  }),

  messages: defineTable({
    chatId: v.id("chats"),
    senderId: v.optional(v.id("user")),
    type: v.union(
      v.literal("message"),
      v.literal("trade_offer"),
      v.literal("system"),
      v.literal("middleman_call")
    ),
    content: v.optional(v.string()),
    timestamp: v.number(),

    // For trade offers and middleman calls, reference the detail tables
    tradeOfferId: v.optional(v.id("chat_trade_offers")),
    middlemanCallId: v.optional(v.id("middleman_calls")),

    // For system messages
    systemType: v.optional(
      v.union(
        v.literal("typing"),
        v.literal("trade_completed"),
        v.literal("trade_cancelled"),
      )
    ),
  })
    .index("chatId", ["chatId"])
    .index("senderId", ["senderId"]),

  chat_trade_offers: defineTable({
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("cancelled")
    ),
    offering: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        thumbnailUrl: v.string(),
        quantity: v.number(),
        rarity: v.string(),
        mutations: v.optional(v.array(v.string())),
        price: v.optional(v.number()),
        age: v.optional(v.number()),
      })
    ),
    requesting: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        thumbnailUrl: v.string(),
        quantity: v.number(),
        rarity: v.string(),
        mutations: v.optional(v.array(v.string())),
        price: v.optional(v.number()),
        age: v.optional(v.number()),
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  middleman_calls: defineTable({
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("cancelled")
    ),
    reason: v.string(),
    estimatedWaitTime: v.string(),
    desiredMiddleman: v.optional(v.id("user")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  chat_read_states: defineTable({
    chatId: v.id("chats"),
    userId: v.id("user"),
    lastReadMessageId: v.id("messages"),
    lastReadAt: v.number(),
  })
    .index("byChatAndUser", ["chatId", "userId"])
    .index("byUser", ["userId"]),
}