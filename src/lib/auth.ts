import "server-only";
import { betterAuth } from "better-auth";
import { convexAdapter } from "@better-auth-kit/convex";
import { jwt } from "better-auth/plugins";
import { ConvexHttpClient } from "convex/browser";
import { env } from "~/env";
import { nextCookies } from "better-auth/next-js";
import { api } from '~convex/_generated/api';
import { cookies } from 'next/headers';

export const convexClient = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);

export const auth = betterAuth({
  database: convexAdapter(convexClient),
  plugins: [
    jwt({
      jwks: {
        keyPairConfig: {
          alg: "RS256",
        },
      },
    }),
    nextCookies(),
  ],
  account: {
    accountLinking: {
      enabled: true,
    },
  },
  socialProviders: {
    roblox: {
      clientId: env.ROBLOX_OAUTH_CLIENT_ID,
      clientSecret: env.ROBLOX_OAUTH_SECRET,
    },
  },
});

export async function getServerSession() {
  try {
    const cookieStore = await cookies();
    const rawToken = cookieStore.get("better-auth.session_token")?.value ?? cookieStore.get("__Secure-better-auth.session_token")?.value;
    const token = rawToken ? rawToken.split(".")[0] : undefined;

    if (!token) {
      return { data: null, error: "No session token found in cookies." };
    }

    const session = await convexClient.action(api.auth.validateSessionToken, {
      token,
    });

    if (!session) {
      return { data: null, error: "Invalid or expired session." };
    }

    return { data: { session }, error: null };
  } catch (error) {
    console.error("Error getting server session:", error);
    return { data: null, error: "Failed to fetch session." };
  }
}