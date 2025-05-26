import { betterAuth } from "better-auth";
import { convexAdapter } from "@better-auth-kit/convex";
import { jwt } from "better-auth/plugins"
import { ConvexHttpClient } from "convex/browser";
import { env } from '~/env';
import { nextCookies } from 'better-auth/next-js';
 
const convexClient = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);
 
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
    nextCookies()
  ],
  account: {
    accountLinking: {
      enabled: true,
    }
  },
  socialProviders: {
    roblox: { 
        clientId: env.ROBLOX_OAUTH_CLIENT_ID, 
        clientSecret: env.ROBLOX_OAUTH_SECRET,
    }, 
  }
});