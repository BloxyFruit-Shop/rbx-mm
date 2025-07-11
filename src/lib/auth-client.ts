import { queryOptions, useQuery } from "@tanstack/react-query";
import { createAuthClient } from "better-auth/react";
import type { ConvexProviderWithAuth } from "convex/react";

export const { signIn, signUp, signOut, getSession } = createAuthClient({
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://rbxmm-dev.lat/",
  plugins: [],
});

export const sessionQueryOptions = queryOptions({
  queryKey: ["session"],
  queryFn: async () => {
    const session = await getSession();
    if (session.error)
      throw new Error(session.error.message ?? "Failed to fetch session");
    return session.data;
  },
});

export function useAuthForConvex(): ReturnType<
  React.ComponentProps<typeof ConvexProviderWithAuth>["useAuth"]
> {
  const sessionQuery = useQuery(sessionQueryOptions);

  return {
    isLoading: sessionQuery.isPending,
    isAuthenticated: sessionQuery.data !== null,
    fetchAccessToken: async () => {
      // Convex usará la autenticación de better-auth, no un token separado.
      // Devolvemos null porque no hay token que fetchear.
      return null;
    },
  };
}
