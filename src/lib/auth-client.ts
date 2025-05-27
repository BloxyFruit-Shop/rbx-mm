import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query';
import { jwtClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { ConvexProviderWithAuth } from 'convex/react';
import { useCallback } from 'react';
import { api } from '~/trpc/react';

export const { signIn, signUp, signOut, getSession } = createAuthClient({
  baseURL: process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://rbxmm-dev.lat/",
  plugins: [jwtClient()]
});

export const sessionQueryOptions = queryOptions({
  queryKey: ["session"],
  queryFn: async () => {
    const session = await getSession();
    if (session.error) throw new Error(session.error.message ?? "Failed to fetch session");
    return session.data;
  },
});

export const jwtQueryOptions = queryOptions({
  queryKey: ["jwt"],
  queryFn: async () => {
    const {data: idToken, error} = api.token.getConvexToken.useQuery();
    if (error) return null;
    return idToken;
  },
  staleTime: 30_000,
});

export function useAuthForConvex(): ReturnType<
  React.ComponentProps<typeof ConvexProviderWithAuth>["useAuth"]
> {
  const queryClient = useQueryClient();
  const sessionQuery = useQuery(sessionQueryOptions);
  const jwtQuery = useQuery(jwtQueryOptions);

  const fetchAccessToken = useCallback(
    async (args: { forceRefreshToken: boolean }) => {
      if (!sessionQuery.data) return null;

      if (args.forceRefreshToken) {
        const token = await queryClient.fetchQuery(jwtQueryOptions);
        return typeof token === 'string' ? token : null;
      }
      const token = await queryClient.ensureQueryData(jwtQueryOptions);
      return typeof token === 'string' ? token : null;
    },
    [queryClient, sessionQuery.data],
  );

  return {
    isLoading: sessionQuery.isPending || jwtQuery.isPending,
    isAuthenticated: sessionQuery.data !== null,
    fetchAccessToken,
  };
}
