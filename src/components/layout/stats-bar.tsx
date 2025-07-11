"use client";

import { Handshake, UsersRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { useQuery } from "convex/react";
import { api } from "~convex/_generated/api";

export function StatsBar() {
  const t = useTranslations("home.stats");
  const platformStats = useQuery(api.platformStats.getPlatformStats);

  // Show loading state with placeholder numbers if data isn't loaded yet
  const stats = platformStats ?? {
    tradesCompleted: 0,
    usersOnline: 0,
    itemsTracked: 0,
  };

  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-8">
      <div className="group relative w-full overflow-hidden rounded-2xl border border-white/10 bg-purple-500/5 p-8 transition-all duration-500 hover:-translate-y-2 hover:border-white/20 hover:bg-purple-500/10 hover:shadow-2xl hover:shadow-blue-500/10 sm:w-[calc(50%-16px)] lg:flex-1">
        <div className="absolute -inset-5 rounded-xl bg-[url('/images/pattern.webp')] mask-b-from-50% opacity-10 transition-opacity duration-500 group-hover:opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="animate-shimmer-fast absolute inset-0 bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
        </div>

        <div className="relative flex items-center gap-6">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-blue-600/30 shadow-lg shadow-blue-500/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-blue-500/40">
            <Handshake className="size-8 text-blue-400 transition-colors duration-300 group-hover:text-blue-300" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-4xl font-bold text-white transition-all duration-300 group-hover:text-blue-100">
              {stats.tradesCompleted.toLocaleString()}
            </p>
            <p className="text-base font-medium text-white/70 transition-colors duration-300 group-hover:text-white/90">
              {t("tradesCompleted")}
            </p>
          </div>
        </div>
      </div>

      <div className="group relative w-full overflow-hidden rounded-2xl border border-white/10 bg-purple-500/5 p-8 transition-all duration-500 hover:-translate-y-2 hover:border-white/20 hover:bg-purple-500/10 hover:shadow-2xl hover:shadow-green-500/10 sm:w-[calc(50%-16px)] lg:flex-1">
        <div className="absolute -inset-5 rounded-xl bg-[url('/images/pattern.webp')] mask-b-from-50% opacity-10 transition-opacity duration-500 group-hover:opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="animate-shimmer-fast absolute inset-0 bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
        </div>

        <div className="relative flex items-center gap-6">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl border border-green-500/30 bg-gradient-to-br from-green-500/20 to-green-600/30 shadow-lg shadow-green-500/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-green-500/40">
            <UsersRound className="h-8 w-8 text-green-400 transition-colors duration-300 group-hover:text-green-300" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-4xl font-bold text-white transition-all duration-300 group-hover:text-green-100">
              {stats.usersOnline.toLocaleString()}
            </p>
            <p className="text-base font-medium text-white/70 transition-colors duration-300 group-hover:text-white/90">
              {t("usersOnline")}
            </p>
          </div>
        </div>
      </div>

      <div className="group relative w-full overflow-hidden rounded-2xl border border-white/10 bg-purple-500/5 p-8 transition-all duration-500 hover:-translate-y-2 hover:border-white/20 hover:bg-purple-500/10 hover:shadow-2xl hover:shadow-purple-500/10 lg:w-auto lg:flex-1">
        <div className="absolute -inset-5 rounded-xl bg-[url('/images/pattern.webp')] mask-b-from-50% opacity-10 transition-opacity duration-500 group-hover:opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="animate-shimmer-fast absolute inset-0 bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
        </div>

        <div className="relative flex items-center gap-6">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/20 to-purple-600/30 shadow-lg shadow-purple-500/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-purple-500/40">
            <svg
              className="h-8 w-8 text-purple-400 transition-colors duration-300 group-hover:text-purple-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-4xl font-bold text-white transition-all duration-300 group-hover:text-purple-100">
              {stats.itemsTracked.toLocaleString()}
            </p>
            <p className="text-base font-medium text-white/70 transition-colors duration-300 group-hover:text-white/90">
              {t("itemsTracked")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}