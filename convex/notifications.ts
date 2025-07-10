import { v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server";
import type { Id, Doc } from "./_generated/dataModel";
import { api } from "./_generated/api";
import { getUser } from "./utils/auth";
import { PublicUserProfile } from './user';

// Type definitions for notification types
export type NotificationType = 
  | "vouch_received"
  | "middleman_call"
  | "trade_offer"
  | "trade_completed"
  | "trade_cancelled"
  | "system"
  | "chat_message";

// Validators
const notificationTypeValidator = v.union(
  v.literal("vouch_received"),
  v.literal("middleman_call"),
  v.literal("trade_offer"),
  v.literal("trade_completed"),
  v.literal("trade_cancelled"),
  v.literal("system"),
  v.literal("chat_message")
);

// --- Notification Management ---

export const createNotification = mutation({
  args: {
    userId: v.id("user"),
    type: notificationTypeValidator,
    content: v.string(),
    chatId: v.optional(v.id("chats")),
    vouchId: v.optional(v.id("vouches")),
  },
  handler: async (ctx, { userId, type, content, chatId, vouchId }): Promise<Id<"notification">> => {
    const notificationId = await ctx.db.insert("notification", {
      userId,
      type,
      content,
      chatId,
      vouchId,
      read: false,
      createdAt: Date.now(),
    });

    return notificationId;
  },
});

export const getUserNotifications = query({
  args: {
    session: v.id("session"),
    limit: v.optional(v.number()),
    unreadOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, { session, limit = 50, unreadOnly = false }) => {
    try {
      // Check if session exists first to avoid throwing error
      const sessionDoc = await ctx.db.query("session").withIndex("by_id", (q) => q.eq("_id", session)).unique();
      if (!sessionDoc) {
        // Session not found, return empty array (user is signing out)
        return [];
      }

      const user = await ctx.db.get(sessionDoc.userId);
      if (!user) {
        // User not found, return empty array
        return [];
      }

      let query = ctx.db
        .query("notification")
        .filter((q) => q.eq(q.field("userId"), user._id));

      if (unreadOnly) {
        query = query.filter((q) => q.eq(q.field("read"), false));
      }

      const notifications = await query
        .order("desc")
        .take(limit);

      // Resolve additional details for notifications
      const resolvedNotifications = await Promise.all(
        notifications.map(async (notification) => {
          type VouchDetails = (Doc<"vouches"> & { fromUser: PublicUserProfile | null }) | null;
          let vouchDetails: VouchDetails = null;
          if (notification.vouchId) {
            const vouch = await ctx.db.get(notification.vouchId);
            if (vouch) {
              const fromUser : PublicUserProfile | null = await ctx.runQuery(api.user.getPublicUserProfile, {
                userId: vouch.fromUserId,
              });
              vouchDetails = {
                ...vouch,
                fromUser,
              };
            }
          }

          return {
            ...notification,
            vouchDetails,
          };
        })
      );

      return resolvedNotifications;
    } catch (error) {
      // If there's any error (including session not found), return empty array
      console.log("Error in getUserNotifications:", error);
      return [];
    }
  },
});

export const getUnreadNotificationCount = query({
  args: {
    session: v.id("session"),
  },
  handler: async (ctx, { session }) => {
    try {
      // Check if session exists first to avoid throwing error
      const sessionDoc = await ctx.db.query("session").withIndex("by_id", (q) => q.eq("_id", session)).unique();
      if (!sessionDoc) {
        // Session not found, return 0 (user is signing out)
        return 0;
      }

      const user = await ctx.db.get(sessionDoc.userId);
      if (!user) {
        // User not found, return 0
        return 0;
      }

      const unreadNotifications = await ctx.db
        .query("notification")
        .filter((q) => 
          q.and(
            q.eq(q.field("userId"), user._id),
            q.eq(q.field("read"), false)
          )
        )
        .collect();

      return unreadNotifications.length;
    } catch (error) {
      // If there's any error (including session not found), return 0
      console.log("Error in getUnreadNotificationCount:", error);
      return 0;
    }
  },
});

export const markNotificationAsRead = mutation({
  args: {
    notificationId: v.id("notification"),
    session: v.id("session"),
  },
  handler: async (ctx, { notificationId, session }): Promise<{ success: boolean }> => {
    const user = await getUser(ctx, session);
    if (!user) {
      throw new Error("You must be logged in to mark notifications as read.");
    }

    const notification = await ctx.db.get(notificationId);
    if (!notification) {
      throw new Error("Notification not found.");
    }

    if (notification.userId !== user._id) {
      throw new Error("You can only mark your own notifications as read.");
    }

    await ctx.db.patch(notificationId, {
      read: true,
    });

    return { success: true };
  },
});

export const markAllNotificationsAsRead = mutation({
  args: {
    session: v.id("session"),
  },
  handler: async (ctx, { session }): Promise<{ success: boolean }> => {
    const user = await getUser(ctx, session);
    if (!user) {
      throw new Error("You must be logged in to mark notifications as read.");
    }

    const unreadNotifications = await ctx.db
      .query("notification")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), user._id),
          q.eq(q.field("read"), false)
        )
      )
      .collect();

    // Mark all unread notifications as read
    await Promise.all(
      unreadNotifications.map(notification =>
        ctx.db.patch(notification._id, { read: true })
      )
    );

    return { success: true };
  },
});

export const clearReadNotifications = mutation({
  args: {
    session: v.id("session"),
  },
  handler: async (ctx, { session }): Promise<{ success: boolean }> => {
    const user = await getUser(ctx, session);
    if (!user) {
      throw new Error("You must be logged in to clear notifications.");
    }

    const readNotifications = await ctx.db
      .query("notification")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), user._id),
          q.eq(q.field("read"), true)
        )
      )
      .collect();

    // Delete all read notifications
    await Promise.all(
      readNotifications.map(notification =>
        ctx.db.delete(notification._id)
      )
    );

    return { success: true };
  },
});

export const markChatNotificationsAsRead = mutation({
  args: {
    chatId: v.id("chats"),
    session: v.id("session"),
  },
  handler: async (ctx, { chatId, session }): Promise<{ success: boolean }> => {
    const user = await getUser(ctx, session);
    if (!user) {
      throw new Error("You must be logged in to mark notifications as read.");
    }

    // Get all unread chat-related notifications for this user and chat
    const chatNotifications = await ctx.db
      .query("notification")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), user._id),
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

// Helper function to create notifications for multiple users
export const createNotificationForUsers = mutation({
  args: {
    userIds: v.array(v.id("user")),
    type: notificationTypeValidator,
    content: v.string(),
    chatId: v.optional(v.id("chats")),
    vouchId: v.optional(v.id("vouches")),
    excludeUserId: v.optional(v.id("user")), // Don't notify this user (e.g., the one who triggered the action)
  },
  handler: async (ctx, { userIds, type, content, chatId, vouchId, excludeUserId }) => {
    const filteredUserIds = excludeUserId 
      ? userIds.filter(id => id !== excludeUserId)
      : userIds;

    const notificationIds = await Promise.all(
      filteredUserIds.map(userId =>
        ctx.db.insert("notification", {
          userId,
          type,
          content,
          chatId,
          vouchId,
          read: false,
          createdAt: Date.now(),
        })
      )
    );

    return notificationIds;
  },
});

// Helper function to notify middlemen about new calls
export const notifyMiddlemenAboutCall = mutation({
  args: {
    middlemanCallId: v.id("middleman_calls"),
    chatId: v.id("chats"),
    creatorName: v.string(),
    desiredMiddleman: v.optional(v.id("user")),
  },
  handler: async (ctx, { middlemanCallId, chatId, creatorName, desiredMiddleman }) => {
    // Get all users with middleman or admin roles
    const allUsers = await ctx.db.query("user").collect();
    const middlemen = allUsers.filter(user => 
      user.roles?.includes("middleman") || user.roles?.includes("admin")
    );

    if (desiredMiddleman) {
      // If there's a desired middleman, notify only them with priority
      await ctx.db.insert("notification", {
        userId: desiredMiddleman,
        type: "middleman_call",
        content: `${creatorName} specifically requested you as a middleman`,
        chatId,
        read: false,
        createdAt: Date.now(),
      });

      // Also notify other middlemen but with different message
      const otherMiddlemen = middlemen.filter(m => m._id !== desiredMiddleman);
      await Promise.all(
        otherMiddlemen.map(middleman =>
          ctx.db.insert("notification", {
            userId: middleman._id,
            type: "middleman_call",
            content: `${creatorName} called for a middleman (preferred: specific middleman)`,
            chatId,
            read: false,
            createdAt: Date.now(),
          })
        )
      );
    } else {
      // Notify all middlemen
      await Promise.all(
        middlemen.map(middleman =>
          ctx.db.insert("notification", {
            userId: middleman._id,
            type: "middleman_call",
            content: `${creatorName} called for a middleman`,
            chatId,
            read: false,
            createdAt: Date.now(),
          })
        )
      );
    }

    return { success: true };
  },
});