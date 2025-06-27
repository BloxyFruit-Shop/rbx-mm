"use client";

import { useTranslations } from 'next-intl';
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Star, MessageCircle, User, TrendingUp } from 'lucide-react';
import type { Doc } from "~convex/_generated/dataModel";
import type { PublicUserProfile } from "~convex/user";

type MiddlemanWithProfile = Doc<"middlemen"> & {
  userProfile?: PublicUserProfile | null;
};

interface MiddlemanCardProps {
  middleman: MiddlemanWithProfile;
}

export default function MiddlemanCard({ middleman }: MiddlemanCardProps) {
  const t = useTranslations('middleman.middlemenList');

  const isOnline = middleman.onlineStatus;
  const profile = middleman.userProfile;
  
  // Mock data - replace with actual data
  const tradesCompleted = Math.floor(Math.random() * 5000) + 1000;
  const rating = (4.8 + Math.random() * 0.2).toFixed(1);

  return (
    <div className="p-6 transition-all duration-300 border group bg-white/5 border-white/10 rounded-2xl hover:border-white/20 hover:bg-white/10">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-purple-400 to-blue-500">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${
              isOnline ? 'bg-emerald-400' : 'bg-gray-400'
            }`} />
          </div>
          <div>
            <h3 className="font-bold text-white">
              {profile?.name ?? profile?.robloxUsername ?? 'Anonymous'}
            </h3>
            <Badge variant={isOnline ? "success" : "secondary"} size="sm">
              {isOnline ? t('online') : t('offline')}
            </Badge>
          </div>
        </div>
        
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <div>
            <div className="text-sm font-medium text-white">{tradesCompleted.toLocaleString()}</div>
            <div className="text-xs text-white/60">{t('trades')}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <div>
            <div className="text-sm font-medium text-white">{rating}</div>
            <div className="text-xs text-white/60">{t('rating')}</div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Button size="sm" className="w-full" variant="gradient" gradientType="purple">
          <MessageCircle className="w-4 h-4 mr-2" />
          {t('contact')}
        </Button>
        <Button size="sm" variant="outline" className="w-full border-white/10 hover:bg-white/5">
          {t('viewProfile')}
        </Button>
      </div>
    </div>
  );
}