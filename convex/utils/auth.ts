/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  customMutation,
  customQuery,
} from "convex-helpers/server/customFunctions";
import type { Doc, Id, TableNames } from "../_generated/dataModel";
import {
  type MutationCtx,
  type QueryCtx,
  mutation as baseMutation,
  query as baseQuery,
} from "../_generated/server";
import type { SystemTableNames } from "convex/server";
import { ROLES } from "../types";
import { internal } from '../_generated/api';
import { v } from 'convex/values';

export function withoutSystemFields<
  T extends { _creationTime: number; _id: Id<TableNames | SystemTableNames>; },
>(doc: T) {
  // Exclude _id and _creationTime from the returned object
  const { _id, _creationTime, ...rest } = doc;
  return rest;
}

export async function getUser(ctx: MutationCtx | QueryCtx, sessionToken: Id<"session">) {
  const session = await ctx.db.query("session").withIndex("by_id", (q) => q.eq("_id", sessionToken)).unique();
  if (!session) throw new Error("Session not found");

  const user = await ctx.db.get(session.userId);


  if (!user) return null;

  return user;
}

export const authedMutation = customMutation(baseMutation, {
  args: { session: v.id("session") },
  input: async (ctx, args) => {
    const user = await getUser(ctx, args.session);
    console.log("USER", user);
    if (!user) throw new Error("Unauthorized");

    return { ctx: { ...ctx, user }, args };
  },
});

export const authedQuery = customQuery(baseQuery, {
  args: { session: v.id("session") },
  input: async (ctx, args) => {
    const user = await getUser(ctx, args.session);
    console.log("USER", user);
    if (!user) throw new Error("Unauthorized");

    return { ctx: { ...ctx, user }, args };
  },
});

export const requireAdmin = async (ctx: QueryCtx, sessionToken: Id<"session">) => {
  const user = await getUser(ctx, sessionToken);
  if (!user) throw new Error("Unauthorized");

  if (!user.roles?.includes(ROLES.ADMIN)) throw new Error("Unauthorized");

  return user;
};

export const requireMiddleman = async (ctx: QueryCtx, sessionToken: Id<"session">) => {
  const user = await getUser(ctx, sessionToken);
  if (!user) throw new Error("Unauthorized");

  if (!user.roles?.includes(ROLES.MIDDLEMAN)) throw new Error("Unauthorized");

  return user;
};
