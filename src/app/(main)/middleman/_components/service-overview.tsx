"use client";

import { useTranslations } from 'next-intl';
import { TrendingUp, Users, Shield, Star } from 'lucide-react';

export default function ServiceOverview() {
  const t = useTranslations('middleman.stats');

  const quickStats = [
    { icon: TrendingUp, value: "15K+", label: t('tradesCompleted') },
    { icon: Users, value: "25", label: t('middlemenActive') },
    { icon: Shield, value: "99.9%", label: t('successRate') },
    { icon: Star, value: "4.9", label: t('avgRating') }
  ];

  return (
    <div className="flex flex-wrap gap-4 lg:gap-6">
      {quickStats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="flex items-center gap-2 px-3 py-2 border rounded-xl bg-white/5 border-white/10">
            <Icon className="w-4 h-4 text-emerald-400" />
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