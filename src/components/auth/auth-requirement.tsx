"use client";

import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { sessionQueryOptions } from "~/lib/auth-client";

interface AuthRequirementProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function Authenticated({ children, fallback }: AuthRequirementProps) {
  const { data: session, isPending } = useQuery(sessionQueryOptions);
  if (isPending || !session?.user.name) return fallback ?? null;
  if (!session?.user.name) return null;
  return <>{children}</>;
}

export function Unauthenticated({ children, fallback }: AuthRequirementProps) {
  const { data: session, isPending } = useQuery(sessionQueryOptions);
  if (isPending || session?.user.name) return fallback ?? null;
  if (session?.user.name) return null;
  return <>{children}</>;
}
