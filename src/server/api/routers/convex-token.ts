
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { auth } from "~/lib/auth";
import { mintTokenForConvex } from '~/lib/get-convex-token';

/**
 * Router for generating a Convex ID token for an authenticated user.
 */
export const convexTokenRouter = createTRPCRouter({
  getConvexToken: publicProcedure
    .query(async ({ctx}) => {
      // Retrieve the current session from the request headers
      const session = await auth.api.getSession({
        headers: ctx.headers,
      });

      // If there is no session, return an unauthorized error
      if (!session) {
        return { error: "Unauthorized" };
      }

      try {
        // Mint a Convex-specific token for the authenticated user
        const idToken = await mintTokenForConvex(session.user);
        return { idToken };
      } catch (error) {
        console.error("Error minting token for Convex:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Token minting failed";
        return {
          error: "Failed to generate token",
          details: errorMessage,
        };
      }
    }),
  getServerSession: publicProcedure
    .query(async ({ctx}) => {
      const session = await auth.api.getSession({
        headers: ctx.headers,
      });
      return session;
    })
});
