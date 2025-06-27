import { v } from 'convex/values';
import { action, internalQuery } from './_generated/server';
import { internal } from './_generated/api';

export const validateSessionToken = action({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.runQuery(internal.auth.getSessionByToken, {
      token: args.token,
    });
    
    return session;
  },
});

export const getSessionByToken = internalQuery({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("session")
      .withIndex("byToken", (q) => q.eq("token", args.token))
      .unique();
  
    if (!session) {
      // No session found for this token.
      return null;
    }

    // IMPORTANT: Check if the session is expired.
    if (new Date(session.expiresAt) < new Date()) {
      // The session has expired. For good hygiene, you could even delete it.
      // await ctx.db.delete(session._id);
      return null;
    }

    // The session is valid, return it.
    return session;
  },
});
