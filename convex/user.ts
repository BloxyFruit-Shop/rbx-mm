import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import type { Id, Doc } from "./_generated/dataModel";
import { ROLES, type Role } from "./types";
import { api } from "./_generated/api";
import { getUser, requireAdmin } from "./utils/auth";

export type PublicUserProfile = {
  _id: Id<"user">;
  _creationTime: number;
  name?: string | null;
  robloxUsername?: string | null;
  robloxAvatarUrl?: string | null;
  roles: Role[];
  badges: string[];
  averageRating: number | null;
  vouchCount: number;
};

type VouchStats = {
  averageRating: number | null;
  vouchCount: number;
};

export const initializeNewUser = internalMutation({
  args: { userId: v.id("user"), email: v.optional(v.string()) }, // email is passed but not strictly used in this version
  handler: async (ctx, { userId }) => {
    // Removed unused email from destructuring
    const existingAppUser = await ctx.db.get(userId);

    if (existingAppUser?.roles && existingAppUser.roles.length > 0) {
      console.log(`User ${userId} already initialized with roles.`);
      return;
    }

    await ctx.db.patch(userId, {
      roles: [ROLES.USER],
    });
    console.log(`Initialized user ${userId} with default role.`);
  },
});

export const getCurrentUser = query({
  args: { session: v.id("session") },
  handler: async (ctx, {session}): Promise<Doc<"user"> | null> => {
    const user = await getUser(ctx, session);
    if (!user) return null;
    return user;
  },
});

export const getPublicUserProfile = query({
  args: { userId: v.id("user") },
  handler: async (ctx, { userId }): Promise<PublicUserProfile | null> => {
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }

    const vouchStats: VouchStats = await ctx.runQuery(
      api.vouches.getUserVouchStats,
      { userId },
    );

    return {
      _id: user._id,
      _creationTime: user._creationTime,
      name: user.name,
      robloxUsername: user.email,
      robloxAvatarUrl: user.image,
      roles: user.roles as Role[],
      badges: user.badges ?? [],
      averageRating: vouchStats.averageRating,
      vouchCount: vouchStats.vouchCount,
    };
  },
});

export const updateMyProfile = mutation({
  args: {
    robloxUsername: v.optional(v.string()),
    robloxAvatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    session: v.id("session")
  },
  handler: async (ctx, args): Promise<{ success: boolean }> => {
    const user = await getUser(ctx, args.session);
    if (!user) {
      throw new Error("You must be logged in to update your profile.");
    }

    const updates: Partial<typeof args & { name?: string; email?: string }> = {
      ...args,
    };
    await ctx.db.patch(user._id, updates);
    return { success: true };
  },
});

// --- Admin Functions ---
export const setUserRole = mutation({
  args: {
    userId: v.id("user"),
    roles: v.array(
      v.union(
        v.literal(ROLES.USER),
        v.literal(ROLES.MIDDLEMAN),
        v.literal(ROLES.ADMIN),
      ),
    ),
    session: v.id("session"),
  },
  handler: async (ctx, { userId, roles, session }): Promise<{ success: boolean }> => {
    const adminUser = await requireAdmin(ctx, session);
    const targetUser = await ctx.db.get(userId);
    if (!targetUser) {
      throw new Error("User not found.");
    }
    if (targetUser._id === adminUser._id && !roles.includes(ROLES.ADMIN)) {
      throw new Error("Admin cannot remove their own admin role.");
    }

    await ctx.db.patch(userId, { roles });

    if (roles.includes(ROLES.MIDDLEMAN)) {
      const existingMiddleman = await ctx.db
        .query("middlemen")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .unique();
      if (!existingMiddleman) {
        await ctx.db.insert("middlemen", {
          userId: userId,
          commissionPercent: 0,
          onlineStatus: false,
          approvalStatus: "approved",
          approvedBy: adminUser._id,
          approvedAt: Date.now(),
        });
      } else if (existingMiddleman.approvalStatus !== "approved") {
        await ctx.db.patch(existingMiddleman._id, {
          approvalStatus: "approved",
          approvedBy: adminUser._id,
          approvedAt: Date.now(),
        });
      }
    } else {
      const existingMiddleman = await ctx.db
        .query("middlemen")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .unique();
      if (
        existingMiddleman &&
        existingMiddleman.approvalStatus === "approved"
      ) {
        await ctx.db.patch(existingMiddleman._id, {
          approvalStatus: "rejected",
        });
      }
    }
    return { success: true };
  },
});

export const addBadgeToUser = mutation({
  args: { userId: v.id("user"), badge: v.string(), session: v.id("session") },
  handler: async (ctx, { userId, badge, session }): Promise<{ success: boolean }> => {
    await requireAdmin(ctx, session);
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");
    const badges = user.badges ?? [];
    if (!badges.includes(badge)) {
      await ctx.db.patch(userId, { badges: [...badges, badge] });
    }
    return { success: true };
  },
});

export const removeBadgeFromUser = mutation({
  args: { userId: v.id("user"), badge: v.string(), session: v.id("session") },
  handler: async (ctx, { userId, badge, session }): Promise<{ success: boolean }> => {
    await requireAdmin(ctx, session);
    const user = await ctx.db.get(userId);
    if (!user?.badges) throw new Error("User or badges not found");
    await ctx.db.patch(userId, {
      badges: user.badges.filter((b) => b !== badge),
    });
    return { success: true };
  },
});

export const toggleUserBanStatus = mutation({
  args: { userId: v.id("user"), ban: v.boolean(), session: v.id("session") },
  handler: async (
    ctx,
    { userId, ban, session },
  ): Promise<{ success: boolean; message: string }> => {
    const admin = await requireAdmin(ctx, session);
    if (userId === admin._id) {
      throw new Error("Admins cannot ban themselves.");
    }
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    console.log(
      `Admin ${admin._id} ${ban ? "banned" : "unbanned"} user ${userId}. (Conceptual: isBanned field not in schema)`,
    );

    return {
      success: true,
      message: `User ${userId} ban status update logged (conceptual).`,
    };
  },
});
