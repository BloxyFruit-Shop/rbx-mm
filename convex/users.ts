import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import type { Id, Doc } from "./_generated/dataModel"; 
import { getAppUser, requireAdmin, requireUser } from "./lib/auth";
import { ROLES, type Role } from "./types";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal, api } from "./_generated/api";

export type PublicUserProfile = { 
  _id: Id<"users">;
  _creationTime: number;
  name?: string | null; 
  robloxUsername?: string | null;
  robloxAvatarUrl?: string | null;
  roles: Role[];
  badges: string[];
  bio?: string | null;
  averageRating: number | null;
  vouchCount: number;
};

type VouchStats = {
  averageRating: number | null;
  vouchCount: number;
};

export const initializeNewUser = internalMutation({
  args: { userId: v.id("users"), email: v.optional(v.string()) }, // email is passed but not strictly used in this version
  handler: async (ctx, { userId }) => { // Removed unused email from destructuring
    const existingAppUser = await ctx.db.get(userId);

    if (existingAppUser?.roles && existingAppUser.roles.length > 0) {
      console.log(`User ${userId} already initialized with roles.`);
      return;
    }
    
    await ctx.db.patch(userId, {
      roles: [ROLES.USER], 
      lastLoginAt: Date.now(),
    });
    console.log(`Initialized user ${userId} with default role.`);
  },
});

export const getCurrentUser = query({
  handler: async (ctx): Promise<Doc<"users"> | null> => { 
    const user = await getAppUser(ctx);
    if (!user) return null;
    return user;
  },
});

export const getPublicUserProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }): Promise<PublicUserProfile | null> => {
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    
    const vouchStats: VouchStats = await ctx.runQuery(api.vouches.getUserVouchStats, { userId });

    return {
      _id: user._id,
      _creationTime: user._creationTime, 
      name: user.name, 
      robloxUsername: user.robloxUsername, 
      robloxAvatarUrl: user.robloxAvatarUrl,
      roles: user.roles as Role[], 
      badges: user.badges ?? [],
      bio: user.bio,
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
  },
  handler: async (ctx, args): Promise<{success: boolean}> => { 
    const user = await requireUser(ctx);
    const updates: Partial<typeof args & { name?: string; email?: string }> = {...args};
    await ctx.db.patch(user._id, updates);
    return { success: true };
  },
});

// --- Admin Functions ---
export const setUserRole = mutation({
  args: {
    userId: v.id("users"),
    roles: v.array(v.union(
      v.literal(ROLES.USER),
      v.literal(ROLES.MIDDLEMAN),
      v.literal(ROLES.ADMIN)
    )),
  },
  handler: async (ctx, { userId, roles }): Promise<{success: boolean}> => { 
    const adminUser = await requireAdmin(ctx); 
    const targetUser = await ctx.db.get(userId);
    if (!targetUser) {
      throw new Error("User not found.");
    }
    if (targetUser._id === adminUser._id && !roles.includes(ROLES.ADMIN)) {
        throw new Error("Admin cannot remove their own admin role.");
    }

    await ctx.db.patch(userId, { roles });

    if (roles.includes(ROLES.MIDDLEMAN)) {
      const existingMiddleman = await ctx.db.query("middlemen")
        .withIndex("by_userId", q => q.eq("userId", userId))
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
      const existingMiddleman = await ctx.db.query("middlemen")
        .withIndex("by_userId", q => q.eq("userId", userId))
        .unique();
      if (existingMiddleman && existingMiddleman.approvalStatus === "approved") {
        await ctx.db.patch(existingMiddleman._id, { approvalStatus: "rejected" }); 
      }
    }
    return { success: true };
  },
});

export const addBadgeToUser = mutation({
  args: { userId: v.id("users"), badge: v.string() },
  handler: async (ctx, { userId, badge }): Promise<{success: boolean}> => { 
    await requireAdmin(ctx);
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
  args: { userId: v.id("users"), badge: v.string() },
  handler: async (ctx, { userId, badge }): Promise<{success: boolean}> => { 
    await requireAdmin(ctx);
    const user = await ctx.db.get(userId);
    if (!user?.badges) throw new Error("User or badges not found");
    await ctx.db.patch(userId, { badges: user.badges.filter(b => b !== badge) });
    return { success: true };
  },
});

export const toggleUserBanStatus = mutation({
  args: { userId: v.id("users"), ban: v.boolean() },
  handler: async (ctx, { userId, ban }): Promise<{success: boolean, message: string}> => { 
    const admin = await requireAdmin(ctx);
    if (userId === admin._id) {
      throw new Error("Admins cannot ban themselves.");
    }
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");
    
    console.log(`Admin ${admin._id} ${ban ? 'banned' : 'unbanned'} user ${userId}. (Conceptual: isBanned field not in schema)`);
    
    return { success: true, message: `User ${userId} ban status update logged (conceptual).` };
  },
});

export const recordLogin = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => { 
    try {
      const user = await ctx.db.get(userId);
      if (user) {
        await ctx.db.patch(userId, { lastLoginAt: Date.now() });
      } else {
        console.warn(`User ${userId} not found. Cannot record login.`);
      }
    } catch (error) {
      console.error(`Failed to record login for user ${userId}:`, error);
    }
  },
});

export const ensureUserInitialized = mutation({
  args: {},
  handler: async (ctx): Promise<{success: boolean, message: string}> => { 
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) {
      throw new Error("Not authenticated");
    }
    const user = await ctx.db.get(authUserId); 
    if (!user) {
        throw new Error("Authenticated user not found in database.");
    }

    if (!user.roles || user.roles.length === 0) {
      await ctx.runMutation(internal.users.initializeNewUser, { userId: authUserId, email: user.email });
      return { success: true, message: "User initialized." };
    }
    return { success: true, message: "User already initialized."};
  }
});
