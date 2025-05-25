// Helper functions for authentication and authorization
import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { ROLES, type Role } from "../types";
import { getAuthUserId } from "@convex-dev/auth/server";

// This function should be used to get the application-specific user document
// which includes roles and other profile data.
export async function getAppUser(ctx: QueryCtx | MutationCtx) {
  const authUserId = await getAuthUserId(ctx);
  if (!authUserId) {
    return null;
  }
  // The `authUserId` from `getAuthUserId` is the `_id` of the user document
  // in the `users` table defined in `authTables`.
  // Our `applicationTables.users` extends this, so we fetch directly.
  const user = await ctx.db.get(authUserId as Id<"users">);
  if (!user) {
    // This case should ideally not happen if authUserId is valid
    // unless there's a data consistency issue or the user was deleted
    // after auth check.
    console.warn(`User document not found for authUserId: ${authUserId}`);
    return null;
  }
  return user;
}

export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const user = await getAppUser(ctx);
  if (!user?.roles?.includes(ROLES.ADMIN)) {
    throw new Error("Admin privileges required.");
  }
  return user;
}

export async function requireMiddleman(ctx: QueryCtx | MutationCtx) {
  const user = await getAppUser(ctx);
  if (!user?.roles?.includes(ROLES.MIDDLEMAN)) {
    throw new Error("Middleman privileges required.");
  }
  return user;
}

export async function requireUser(ctx: QueryCtx | MutationCtx) {
  const user = await getAppUser(ctx);
  if (!user) {
    throw new Error("User authentication required.");
  }
  return user;
}

// Use this to ensure the logged-in user is the owner of a document
export function ensureOwnership(user: { _id: Id<"users"> }, ownerId: Id<"users">) {
  if (user._id !== ownerId) {
    throw new Error("Permission denied: You are not the owner of this resource.");
  }
}

// Use this to check if a user has a specific role, or is an admin (who bypasses some checks)
export function hasRoleOrIsAdmin(user: { roles?: Role[] }, roleToCheck: Role): boolean {
  if (!user.roles) return false;
  return user.roles.includes(ROLES.ADMIN) || user.roles.includes(roleToCheck);
}
