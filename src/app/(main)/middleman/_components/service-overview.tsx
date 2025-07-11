"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "convex/react";
import { api } from "~convex/_generated/api";
import { TrendingUp, Users, Shield, Star } from "lucide-react";

export default function ServiceOverview() {
  const t = useTranslations("middleman.stats");
  const platformStats = useQuery(api.platformStats.getPlatformStats);
  const middlemen = useQuery(api.user.listApprovedMiddlemen, {
    onlineOnly: true,
  });

  const quickStats = [
    {
      icon: TrendingUp,
      value: platformStats
        ? `${(platformStats.tradesCompleted / 1000).toFixed(1)}K`
        : "0",
      label: t("tradesCompleted"),
    },
    {
      icon: Users,
      value: middlemen ? middlemen.length.toString() : "0",
      label: t("middlemenActive"),
    },
    {
      icon: Shield,
      value: "99.9%",
      label: t("successRate"),
    },
    {
      icon: Star,
      value: "4.9",
      label: t("avgRating"),
    },
  ];

  return (
    <div className="flex flex-wrap gap-4 lg:gap-6">
      {quickStats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
          >
            <Icon className="h-4 w-4 text-emerald-400" />
            <div>
              <div className="text-sm font-bold text-white">{stat.value}</div>
              <div className="text-xs text-white/60">{stat.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
