import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import type { Id, Doc } from "./_generated/dataModel";
import { ROLES, type Role } from "./types";
import { api } from "./_generated/api";
import { getUser, requireAdmin } from "./utils/auth";
import { paginationOptsValidator } from "convex/server";

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
  handler: async (ctx, { session }): Promise<Doc<"user"> | null> => {
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
  handler: async (ctx, args): Promise<{ success: boolean; }> => {
    const user = await getUser(ctx, args.session);
    if (!user) {
      throw new Error("You must be logged in to update your profile.");
    }

    const updates: Partial<typeof args & { name?: string; email?: string; }> = {
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
  handler: async (ctx, { userId, roles, session }): Promise<{ success: boolean; }> => {
    const adminUser = await requireAdmin(ctx, session);
    const targetUser = await ctx.db.get(userId);
    if (!targetUser) {
      throw new Error("User not found.");
    }
    if (targetUser._id === adminUser._id && !roles.includes(ROLES.ADMIN)) {
      throw new Error("Admin cannot remove their own admin role.");
    }

    await ctx.db.patch(userId, { roles });

    return { success: true };
  },
});

export const addBadgeToUser = mutation({
  args: { userId: v.id("user"), badge: v.string(), session: v.id("session") },
  handler: async (ctx, { userId, badge, session }): Promise<{ success: boolean; }> => {
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
  handler: async (ctx, { userId, badge, session }): Promise<{ success: boolean; }> => {
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
  ): Promise<{ success: boolean; message: string; }> => {
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

export const markUserOnline = mutation({
  args: { userId: v.id("user") },
  handler: async (ctx, { userId }): Promise<{ success: boolean; }> => {
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found.");
    }

    await ctx.db.patch(userId, {
      lastSeen: Date.now(),
    });

    return { success: true };
  },
});

export const getOtherUserPresence = query({
  args: { userId: v.id("user") },
  handler: async (ctx, { userId }): Promise<number | null> => {
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }

    return user.lastSeen ?? null;
  },
});

export const getUserByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, { username }): Promise<PublicUserProfile | null> => {
    const user = await ctx.db
      .query("user")
      .withIndex("byEmail", (q) => q.eq("email", username))
      .unique();

    if (!user) {
      return null;
    }

    const vouchStats: VouchStats = await ctx.runQuery(
      api.vouches.getUserVouchStats,
      { userId: user._id },
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

export const searchMiddlemen = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { query, limit = 10 }): Promise<PublicUserProfile[]> => {
    if (query.length < 2) {
      return [];
    }

    // Get all users with middleman role
    const allUsers = await ctx.db.query("user").collect();
    const middlemen = allUsers.filter(user =>
      user.roles?.includes(ROLES.MIDDLEMAN) ?? user.roles?.includes(ROLES.ADMIN)
    );

    // Filter by search query (name or username)
    const filteredMiddlemen = middlemen.filter(user => {
      const name = user.name?.toLowerCase() || '';
      const username = user.email?.toLowerCase() || '';
      const searchQuery = query.toLowerCase();

      return name.includes(searchQuery) || username.includes(searchQuery);
    }).slice(0, limit);

    // Convert to PublicUserProfile format
    const results = await Promise.all(
      filteredMiddlemen.map(async (user) => {
        const vouchStats: VouchStats = await ctx.runQuery(
          api.vouches.getUserVouchStats,
          { userId: user._id },
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
      })
    );

    return results;
  },
});

export const searchUsers = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { query, limit = 5 }): Promise<PublicUserProfile[]> => {
    if (query.length < 2) {
      return [];
    }

    // Get all users
    const allUsers = await ctx.db.query("user").collect();

    // Filter by search query (name or username)
    const filteredUsers = allUsers.filter(user => {
      const name = user.name?.toLowerCase() || '';
      const username = user.email?.toLowerCase() || '';
      const searchQuery = query.toLowerCase();

      return name.includes(searchQuery) || username.includes(searchQuery);
    }).slice(0, limit);

    // Convert to PublicUserProfile format
    const results = await Promise.all(
      filteredUsers.map(async (user) => {
        const vouchStats: VouchStats = await ctx.runQuery(
          api.vouches.getUserVouchStats,
          { userId: user._id },
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
      })
    );

    return results;
  },
});

// Get all users with middleman role (replacement for api.middlemen.listAllMiddlemen)
export const listAllMiddlemen = query({
  handler: async (ctx): Promise<PublicUserProfile[]> => {
    // Get all users with middleman or admin role
    const allUsers = await ctx.db.query("user").collect();
    const middlemen = allUsers.filter(user =>
      user.roles?.includes(ROLES.MIDDLEMAN) ?? user.roles?.includes(ROLES.ADMIN)
    );

    // Convert to PublicUserProfile format
    const results = await Promise.all(
      middlemen.map(async (user) => {
        const vouchStats: VouchStats = await ctx.runQuery(
          api.vouches.getUserVouchStats,
          { userId: user._id },
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
      })
    );

    return results;
  },
});

// Get approved middlemen (replacement for api.middlemen.listApprovedMiddlemen)
export const listApprovedMiddlemen = query({
  args: {
    onlineOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, { onlineOnly }): Promise<PublicUserProfile[]> => {
    // Get all users with middleman or admin role
    const allUsers = await ctx.db.query("user").collect();
    let middlemen = allUsers.filter(user =>
      user.roles?.includes(ROLES.MIDDLEMAN) ?? user.roles?.includes(ROLES.ADMIN)
    );

    // Filter by online status if requested
    if (onlineOnly) {
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
      middlemen = middlemen.filter(user =>
        user.lastSeen && user.lastSeen > fiveMinutesAgo
      );
    }

    // Convert to PublicUserProfile format
    const results = await Promise.all(
      middlemen.map(async (user) => {
        const vouchStats: VouchStats = await ctx.runQuery(
          api.vouches.getUserVouchStats,
          { userId: user._id },
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
      })
    );

    return results;
  },
});

// --- Admin Data Table Functions ---

// User roles enum for validation
const userRoles = v.union(
  v.literal("user"),
  v.literal("middleman"),
  v.literal("admin"),
  v.literal("banned"),
);

// Get all users with pagination and filtering for admin data table
export const getUsers = query({
  args: {
    searchTerm: v.optional(v.string()),
    roleFilter: v.optional(userRoles),
    sortBy: v.optional(v.union(
      v.literal("name"),
      v.literal("email"),
      v.literal("lastSeen"),
      v.literal("createdAt"),
    )),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
    paginationOpts: paginationOptsValidator,
    session: v.id("session"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.session);

    // Apply search filter - if search term exists, do manual filtering
    if (args.searchTerm) {
      const searchLower = args.searchTerm.toLowerCase();
      const allUsers = await ctx.db.query("user").collect();
      const filteredUsers = allUsers.filter(user =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );

      // Apply role filter
      let finalUsers = filteredUsers;
      if (args.roleFilter) {
        finalUsers = filteredUsers.filter(user =>
          user.roles?.includes(args.roleFilter!)
        );
      }

      // Apply sorting
      finalUsers.sort((a, b) => {
        let aValue: any, bValue: any;

        switch (args.sortBy) {
          case "name":
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case "email":
            aValue = a.email.toLowerCase();
            bValue = b.email.toLowerCase();
            break;
          case "lastSeen":
            aValue = a.lastSeen ?? 0;
            bValue = b.lastSeen ?? 0;
            break;
          case "createdAt":
          default:
            aValue = a._creationTime;
            bValue = b._creationTime;
            break;
        }

        if (args.sortOrder === "desc") {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        } else {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        }
      });

      // Manual pagination for filtered results
      const startIndex = args.paginationOpts.cursor ?
        parseInt(args.paginationOpts.cursor) : 0;
      const endIndex = startIndex + args.paginationOpts.numItems;
      const paginatedUsers = finalUsers.slice(startIndex, endIndex);

      return {
        page: paginatedUsers,
        isDone: endIndex >= finalUsers.length,
        continueCursor: endIndex >= finalUsers.length ? null : endIndex.toString(),
      };
    }

    // No search term - use database queries with proper typing
    let dbQuery;
    const order = args.sortOrder === "desc" ? "desc" : "asc";

    // Apply sorting - similar to items.ts pattern
    switch (args.sortBy) {
      case "email":
        dbQuery = ctx.db
          .query("user")
          .withIndex("byEmail")
          .order(order);
        break;
      case "name":
      case "lastSeen":
      case "createdAt":
      default:
        dbQuery = ctx.db
          .query("user")
          .order(order);
        break;
    }

    const result = await dbQuery.paginate(args.paginationOpts);

    // Apply role filter if specified
    if (args.roleFilter) {
      const filteredPage = result.page.filter(user =>
        user.roles?.includes(args.roleFilter!)
      );
      return {
        ...result,
        page: filteredPage,
      };
    }

    return result;
  },
});

// Get user statistics for admin dashboard
export const getUserStats = query({
  args: { session: v.id("session") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.session);

    const allUsers = await ctx.db.query("user").collect();

    const stats = {
      total: allUsers.length,
      admins: allUsers.filter(u => u.roles?.includes("admin")).length,
      middlemen: allUsers.filter(u => u.roles?.includes("middleman")).length,
      banned: allUsers.filter(u => u.roles?.includes("banned")).length,
      verified: allUsers.filter(u => u.emailVerified).length,
      activeToday: allUsers.filter(u => {
        if (!u.lastSeen) return false;
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        return u.lastSeen > oneDayAgo;
      }).length,
    };

    return stats;
  },
});

// Update user roles (enhanced version of setUserRole for data table)
export const updateUserRoles = mutation({
  args: {
    userId: v.id("user"),
    roles: v.array(userRoles),
    session: v.id("session"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.session);

    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found.");

    await ctx.db.patch(args.userId, {
      roles: args.roles,
    });

    return { success: true };
  },
});

// Update user badges (enhanced version for data table)
export const updateUserBadges = mutation({
  args: {
    userId: v.id("user"),
    badges: v.array(v.string()),
    session: v.id("session"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.session);

    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found.");

    await ctx.db.patch(args.userId, {
      badges: args.badges,
    });

    return { success: true };
  },
});

// Get user by ID for admin
export const getUserById = query({
  args: {
    userId: v.id("user"),
    session: v.id("session"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.session);
    return ctx.db.get(args.userId);
  },
});

// Get user sessions for admin
export const getUserSessions = query({
  args: {
    userId: v.id("user"),
    session: v.id("session"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.session);

    return ctx.db
      .query("session")
      .withIndex("byUserId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Enhanced ban/unban user function
export const toggleUserBan = mutation({
  args: {
    userId: v.id("user"),
    banned: v.boolean(),
    session: v.id("session"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.session);

    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found.");

    let newRoles = user.roles ?? ["user"];

    if (args.banned) {
      // Add banned role if not present
      if (!newRoles.includes("banned")) {
        newRoles.push("banned");
      }
    } else {
      // Remove banned role
      newRoles = newRoles.filter(role => role !== "banned");
      // Ensure user has at least the "user" role
      if (newRoles.length === 0) {
        newRoles = ["user"];
      }
    }

    await ctx.db.patch(args.userId, {
      roles: newRoles,
    });

    return { success: true };
  },
});

// Get recent users for showcase
export const getRecentUsers = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 4 }): Promise<PublicUserProfile[]> => {
    // Get the most recently created users
    const recentUsers = await ctx.db
      .query("user")
      .order("desc")
      .take(limit);

    // Convert to PublicUserProfile format
    const results = await Promise.all(
      recentUsers.map(async (user) => {
        const vouchStats: VouchStats = await ctx.runQuery(
          api.vouches.getUserVouchStats,
          { userId: user._id },
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
      })
    );

    return results;
  },
});