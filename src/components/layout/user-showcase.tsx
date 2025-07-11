"use client";

import { useQuery } from "convex/react";
import { api } from "~convex/_generated/api";
import { useTranslations } from 'next-intl';
import { UserAvatar } from "~/components/user/user-avatar";

export function UserShowcase() {
  const t = useTranslations('home');
  const weeklyStats = useQuery(api.platformStats.getWeeklyStats);
  const recentUsers = useQuery(api.user.getRecentUsers, { limit: 4 });

  // Get first 4 users for display
  const displayUsers = recentUsers ?? [];
  const weeklyTrades = weeklyStats?.weeklyTrades ?? 0;

  return (
    <div className="flex items-center gap-6 pt-6 text-center md:text-left">
      <div className="flex -space-x-2">
        {displayUsers.map((user) => (
          <div key={user._id} className="relative">
            <UserAvatar
              user={user}
              size="sm"
              className="h-8 w-8 bg-white/20"
            />
          </div>
        ))}
        {displayUsers.length < 4 && 
          Array.from({ length: 4 - displayUsers.length }).map((_, i) => (
            <div
              key={`placeholder-${i}`}
              className="h-8 w-8 rounded-full border-2 border-white/20 bg-gradient-to-r from-purple-400 to-blue-400"
            />
          ))
        }
        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/20 bg-white/10">
          <span className="text-xs font-bold text-white">+</span>
        </div>
      </div>
      <div className="text-sm text-white/60">
        <span className="font-semibold text-white">{weeklyTrades.toLocaleString()}</span> {t('weeklyTrades')}
      </div>
    </div>
  );
}