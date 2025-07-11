import { query } from "./_generated/server";
import { v } from "convex/values";

export const getPlatformStats = query({
  handler: async (ctx) => {
    // Get total completed trades (closed, completed status)
    // Since "completed" might not be a valid status, let's check for "closed" trades
    const closedTrades = await ctx.db
      .query("tradeAds")
      .withIndex("by_status", (q) => q.eq("status", "closed"))
      .collect();
      
    // Also get all trades to have a total count
    const allTrades = await ctx.db.query("tradeAds").collect();

    // Get total users who have been active in the last 5 minutes (online)
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    const allUsers = await ctx.db.query("user").collect();
    const onlineUsers = allUsers.filter(user => 
      user.lastSeen && user.lastSeen > fiveMinutesAgo
    );

    // Get total items tracked in the database
    const totalItems = await ctx.db.query("items").collect();

    // Get total vouches given (for additional stats)
    const totalVouches = await ctx.db.query("vouches").collect();

    // Get total active chats (chats that are not completed or cancelled)
    const allChats = await ctx.db.query("chats").collect();
    const activeChats = allChats.filter(chat => 
      !chat.tradeStatus || 
      (chat.tradeStatus !== "completed" && chat.tradeStatus !== "cancelled")
    );

    return {
      tradesCompleted: closedTrades.length,
      usersOnline: onlineUsers.length,
      itemsTracked: totalItems.length,
      totalVouches: totalVouches.length,
      activeChats: activeChats.length,
      totalUsers: allUsers.length,
    };
  },
});

export const getWeeklyStats = query({
  handler: async (ctx) => {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    // Get trades completed in the last week
    const weeklyTrades = await ctx.db
      .query("tradeAds")
      .filter((q) => 
        q.and(
          q.eq(q.field("status"), "closed"),
          q.gte(q.field("closedAt"), oneWeekAgo)
        )
      )
      .collect();

    // Get new users in the last week
    const weeklyNewUsers = await ctx.db
      .query("user")
      .filter((q) => q.gte(q.field("_creationTime"), oneWeekAgo))
      .collect();

    // Get vouches given in the last week
    const weeklyVouches = await ctx.db
      .query("vouches")
      .filter((q) => q.gte(q.field("_creationTime"), oneWeekAgo))
      .collect();

    return {
      weeklyTrades: weeklyTrades.length,
      weeklyNewUsers: weeklyNewUsers.length,
      weeklyVouches: weeklyVouches.length,
    };
  },
});