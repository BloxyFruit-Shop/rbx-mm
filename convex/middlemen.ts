import { v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server"; // Removed unused internalMutation
import type { Id, Doc } from "./_generated/dataModel";
import { ROLES, type MiddlemanRequestStatus } from "./types"; // Removed unused MIDDLEMAN_APPROVAL_STATUSES, MIDDLEMAN_REQUEST_STATUSES, SocialLink
import { api } from "./_generated/api";
import { type ResolvedTradeAd } from "./tradeAds";
import { type PublicUserProfile } from "./user";
import { getUser, requireAdmin, requireMiddleman } from "./utils/auth";

const socialLinkValidator = v.object({
  type: v.union(
    v.literal("discord"),
    v.literal("twitter"),
    v.literal("roblox"),
    v.literal("youtube"),
    v.literal("twitch"),
  ),
  url: v.string(),
});

// --- Middleman Profile Management ---
export const applyForMiddleman = mutation({
  args: {
    commissionPercent: v.number(),
    socialLinks: v.optional(v.array(socialLinkValidator)),
    session: v.id("session")
  },
  handler: async (ctx, args): Promise<Id<"middlemen">> => {
    const user = await getUser(ctx, args.session);

    if (!user) {
      throw new Error("User not found.");
    }

    if (user.roles?.includes(ROLES.MIDDLEMAN)) {
      const existingApproved = await ctx.db
        .query("middlemen")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .filter((q) => q.eq(q.field("approvalStatus"), "approved"))
        .first();
      if (existingApproved) {
        throw new Error("You are already an approved middleman.");
      }
    }

    const existingApplication = await ctx.db
      .query("middlemen")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    if (existingApplication) {
      if (existingApplication.approvalStatus === "pending") {
        throw new Error("You already have a pending middleman application.");
      }
      await ctx.db?.patch(existingApplication._id, {
        commissionPercent: args.commissionPercent,
        socialLinks: args.socialLinks,
        onlineStatus: existingApplication.onlineStatus ?? false,
        approvalStatus: "pending",
        approvedBy: undefined,
        approvedAt: undefined,
      });
      return existingApplication._id;
    }

    if (args.commissionPercent < 0 || args.commissionPercent > 100) {
      throw new Error("Commission percentage must be between 0 and 100.");
    }

    const middlemanEntryId = await ctx.db.insert("middlemen", {
      userId: user._id,
      commissionPercent: args.commissionPercent,
      socialLinks: args.socialLinks,
      onlineStatus: false,
      approvalStatus: "pending",
    });
    return middlemanEntryId;
  },
});

export const updateMyMiddlemanProfile = mutation({
  args: {
    commissionPercent: v.optional(v.number()),
    socialLinks: v.optional(v.array(socialLinkValidator)),
    onlineStatus: v.optional(v.boolean()),
    session: v.id("session"),
  },
  handler: async (ctx, args): Promise<{ success: boolean; }> => {
    const user = await requireMiddleman(ctx, args.session);

    const middlemanProfile = await ctx.db
      .query("middlemen")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("approvalStatus"), "approved"))
      .unique();

    if (!middlemanProfile) {
      throw new Error(
        "Approved middleman profile not found or you are not authorized.",
      );
    }

    if (
      args.commissionPercent !== undefined &&
      (args.commissionPercent < 0 || args.commissionPercent > 100)
    ) {
      throw new Error("Commission percentage must be between 0 and 100.");
    }

    const updates: Partial<Doc<"middlemen">> = {};
    if (args.commissionPercent !== undefined)
      updates.commissionPercent = args.commissionPercent;
    if (args.socialLinks !== undefined) updates.socialLinks = args.socialLinks;
    if (args.onlineStatus !== undefined)
      updates.onlineStatus = args.onlineStatus;

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(middlemanProfile._id, updates);
    }
    return { success: true };
  },
});

// --- Admin: Middleman Application Management ---
export const reviewMiddlemanApplication = mutation({
  args: {
    middlemanEntryId: v.id("middlemen"),
    newStatus: v.union(v.literal("approved"), v.literal("rejected")),
    commissionPercentOverride: v.optional(v.number()),
    session: v.id("session"),
  },
  handler: async (ctx, args): Promise<{ success: boolean; }> => {
    const admin = await requireAdmin(ctx, args.session);
    const application = await ctx.db.get(args.middlemanEntryId);

    if (!application) {
      throw new Error("Middleman application not found.");
    }
    if (application.approvalStatus === args.newStatus) {
      throw new Error(`Application is already ${args.newStatus}.`);
    }

    const updates: Partial<Doc<"middlemen">> = {
      approvalStatus: args.newStatus,
      approvedBy: args.newStatus === "approved" ? admin._id : undefined,
      approvedAt: args.newStatus === "approved" ? Date.now() : undefined,
    };

    if (
      args.newStatus === "approved" &&
      args.commissionPercentOverride !== undefined
    ) {
      if (
        args.commissionPercentOverride < 0 ||
        args.commissionPercentOverride > 100
      ) {
        throw new Error("Commission percentage must be between 0 and 100.");
      }
      updates.commissionPercent = args.commissionPercentOverride;
    }

    await ctx.db.patch(args.middlemanEntryId, updates);

    if (args.newStatus === "approved") {
      const targetUser = await ctx.db.get(application.userId);
      if (targetUser && !targetUser.roles?.includes(ROLES.MIDDLEMAN)) {
        const currentRoles = targetUser.roles ?? [];
        const newRoles = [...new Set([...currentRoles, ROLES.MIDDLEMAN])];
        await ctx.db.patch(application.userId, { roles: newRoles });
      }
    } else if (args.newStatus === "rejected") {
      const targetUser = await ctx.db.get(application.userId);
      if (targetUser?.roles?.includes(ROLES.MIDDLEMAN)) {
        const newRoles = (targetUser.roles ?? []).filter(
          (r) => r !== ROLES.MIDDLEMAN,
        );
        if (newRoles.length === 0) newRoles.push(ROLES.USER);
        await ctx.db.patch(application.userId, { roles: newRoles });
      }
    }
    return { success: true };
  },
});

// --- Public Queries for Middlemen ---
type ResolvedMiddleman = Doc<"middlemen"> & {
  userProfile?: PublicUserProfile | null;
};

async function resolveMiddlemanUser(
  ctx: QueryCtx,
  mmDoc: Doc<"middlemen">,
): Promise<ResolvedMiddleman> {
  const userProfile = await ctx.runQuery(api.user.getPublicUserProfile, {
    userId: mmDoc.userId,
  });
  return { ...mmDoc, userProfile };
}

export const listApprovedMiddlemen = query({
  args: {
    onlineOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, { onlineOnly }): Promise<ResolvedMiddleman[]> => {
    const queryBuilder = ctx.db
      .query("middlemen")
      .withIndex("by_approvalStatus", (q) =>
        q.eq("approvalStatus", "approved"),
      );

    const middlemenDocs = await queryBuilder.collect();
    let filteredMiddlemen = middlemenDocs;

    if (onlineOnly) {
      filteredMiddlemen = middlemenDocs.filter(
        (mm) => mm.onlineStatus === true,
      );
    }

    return Promise.all(
      filteredMiddlemen.map((mm) => resolveMiddlemanUser(ctx, mm)),
    );
  },
});

export const getMiddlemanProfileByUserId = query({
  args: { userId: v.id("user") },
  handler: async (ctx, { userId }): Promise<ResolvedMiddleman | null> => {
    const middlemanDoc = await ctx.db
      .query("middlemen")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!middlemanDoc) return null;
    return resolveMiddlemanUser(ctx, middlemanDoc);
  },
});

// --- Middleman Trade Requests ---
export const requestMiddlemanService = mutation({
  args: {
    middlemanUserId: v.id("user"),
    tradeAdId: v.optional(v.id("tradeAds")),
    messageToMiddleman: v.optional(v.string()),
    session: v.id("session")
  },
  handler: async (ctx, args): Promise<Id<"middlemanRequests">> => {
    const requester = await getUser(ctx, args.session);

    if (!requester) {
      throw new Error("User not found.");
    }

    if (requester._id === args.middlemanUserId) {
      throw new Error("You cannot request yourself as a middleman.");
    }

    const middlemanUser = await ctx.db.get(args.middlemanUserId);
    if (!middlemanUser?.roles?.includes(ROLES.MIDDLEMAN)) {
      throw new Error("The requested user is not a middleman.");
    }

    const middlemanProfile = await ctx.db
      .query("middlemen")
      .withIndex("by_userId", (q) => q.eq("userId", args.middlemanUserId))
      .filter((q) => q.eq(q.field("approvalStatus"), "approved"))
      .unique();
    if (!middlemanProfile) {
      throw new Error(
        "The requested middleman is not currently approved or active.",
      );
    }

    if (args.tradeAdId) {
      const ad = await ctx.db.get(args.tradeAdId);
      if (!ad) throw new Error("Trade Ad not found.");
    }

    const requestId = await ctx.db.insert("middlemanRequests", {
      requesterId: requester._id,
      middlemanUserId: args.middlemanUserId,
      tradeAdId: args.tradeAdId,
      messageToMiddleman: args.messageToMiddleman,
      status: "pending",
    });
    return requestId;
  },
});

export const respondToMiddlemanRequest = mutation({
  args: {
    requestId: v.id("middlemanRequests"),
    responseStatus: v.union(v.literal("accepted"), v.literal("declined")),
    session: v.id("session"),
  },
  handler: async (ctx, args): Promise<{ success: boolean; }> => {
    const middlemanUser = await requireMiddleman(ctx, args.session);
    const request = await ctx.db.get(args.requestId);

    if (!request) {
      throw new Error("Middleman request not found.");
    }
    if (request.middlemanUserId !== middlemanUser._id) {
      throw new Error("You are not authorized to respond to this request.");
    }
    if (request.status !== "pending") {
      throw new Error(
        `Request is already ${request.status}, cannot change response.`,
      );
    }

    await ctx.db.patch(args.requestId, {
      status: args.responseStatus,
      respondedAt: Date.now(),
    });
    return { success: true };
  },
});

export const cancelMiddlemanRequest = mutation({
  args: { requestId: v.id("middlemanRequests"), session: v.id("session") },
  handler: async (ctx, { requestId, session }): Promise<{ success: boolean; }> => {
    const user = await getUser(ctx, session);

    if (!user) {
      throw new Error("User not found.");
    }

    const request = await ctx.db.get(requestId);
    if (!request) throw new Error("Request not found.");

    if (
      request.requesterId !== user._id &&
      request.middlemanUserId !== user._id &&
      !user.roles?.includes(ROLES.ADMIN)
    ) {
      throw new Error("Not authorized to cancel this request.");
    }
    if (!["pending", "accepted"].includes(request.status)) {
      throw new Error(`Cannot cancel a request with status ${request.status}.`);
    }
    await ctx.db.patch(requestId, {
      status: "cancelled",
      respondedAt: Date.now(),
    });
    return { success: true };
  },
});

export const completeMiddlemanRequest = mutation({
  args: { requestId: v.id("middlemanRequests"), session: v.id("session") },
  handler: async (ctx, { requestId, session }): Promise<{ success: boolean; }> => {
    const user = await getUser(ctx, session);
    if (!user) {
      throw new Error("User not found.");
    }
    const request = await ctx.db.get(requestId);
    if (!request) throw new Error("Request not found.");

    if (request.status !== "accepted") {
      throw new Error("Only accepted requests can be marked as completed.");
    }
    if (
      request.requesterId !== user._id &&
      request.middlemanUserId !== user._id &&
      !user.roles?.includes(ROLES.ADMIN)
    ) {
      throw new Error("Not authorized to complete this request.");
    }

    await ctx.db.patch(requestId, {
      status: "completed",
      completedAt: Date.now(),
    });
    return { success: true };
  },
});

// Queries for middleman requests
type ResolvedMiddlemanRequest = Doc<"middlemanRequests"> & {
  requesterProfile?: PublicUserProfile | null;
  middlemanProfile?: ResolvedMiddleman | null;
  tradeAdDetails?: ResolvedTradeAd | null;
};

async function resolveMiddlemanRequestDetails(
  ctx: QueryCtx,
  req: Doc<"middlemanRequests">,
): Promise<ResolvedMiddlemanRequest> {
  const requesterProfile = await ctx.runQuery(api.user.getPublicUserProfile, {
    userId: req.requesterId,
  });
  const middlemanProfile = await ctx.runQuery(
    api.middlemen.getMiddlemanProfileByUserId,
    { userId: req.middlemanUserId },
  );
  let tradeAdDetails: ResolvedTradeAd | null = null;
  if (req.tradeAdId) {
    tradeAdDetails = await ctx.runQuery(api.tradeAds.getTradeAdById, {
      tradeAdId: req.tradeAdId,
    });
  }
  return { ...req, requesterProfile, middlemanProfile, tradeAdDetails };
}

export const listMyMiddlemanRequestsAsRequester = query({
  args: { status: v.optional(v.string()), session: v.id("session") },
  handler: async (ctx, args): Promise<ResolvedMiddlemanRequest[]> => {
    const user = await getUser(ctx, args.session);

    if (!user) {
      throw new Error("User not found.");
    }

    let requests: Doc<"middlemanRequests">[];
    if (args.status) {
      requests = await ctx.db
        .query("middlemanRequests")
        .withIndex("by_requesterId_status", (q) =>
          q
            .eq("requesterId", user._id)
            .eq("status", args.status as MiddlemanRequestStatus),
        )
        .order("desc")
        .collect();
    } else {
      requests = await ctx.db
        .query("middlemanRequests")
        .withIndex("by_requesterId_status", (q) =>
          q.eq("requesterId", user._id),
        )
        .order("desc")
        .collect();
    }

    return Promise.all(
      requests.map((req) => resolveMiddlemanRequestDetails(ctx, req)),
    );
  },
});

export const listMyMiddlemanRequestsAsMiddleman = query({
  args: { status: v.optional(v.string()), session: v.id("session") },
  handler: async (ctx, args): Promise<ResolvedMiddlemanRequest[]> => {
    const user = await getUser(ctx, args.session);

    if (!user) {
      throw new Error("User not found.");
    }

    let requests: Doc<"middlemanRequests">[];
    if (args.status) {
      requests = await ctx.db
        .query("middlemanRequests")
        .withIndex("by_middlemanUserId_status", (q) =>
          q
            .eq("middlemanUserId", user._id)
            .eq("status", args.status as MiddlemanRequestStatus),
        )
        .order("desc")
        .collect();
    } else {
      requests = await ctx.db
        .query("middlemanRequests")
        .withIndex("by_middlemanUserId_status", (q) =>
          q.eq("middlemanUserId", user._id),
        )
        .order("desc")
        .collect();
    }
    return Promise.all(
      requests.map((req) => resolveMiddlemanRequestDetails(ctx, req)),
    );
  },
});
