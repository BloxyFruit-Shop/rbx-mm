"use client";

import { useTranslations } from 'next-intl';
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Star, MessageCircle, User, TrendingUp, Shield } from 'lucide-react';
import type { PublicUserProfile } from "~convex/user";
import Link from "next/link";

interface MiddlemanListItemProps {
  middleman: PublicUserProfile;
}

export default function MiddlemanListItem({ middleman }: MiddlemanListItemProps) {
  const t = useTranslations('middleman.middlemenList');

  const isOnline = false; // We don't have real-time presence, so default to offline
  
  // Use actual vouch data
  const vouchCount = middleman.vouchCount;
  const rating = middleman.averageRating?.toFixed(1) ?? "N/A";

  return (
    <div className="p-4 transition-all duration-300 border bg-white/5 border-white/10 rounded-xl hover:border-white/20 hover:bg-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-purple-400 to-blue-500">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-gray-800 ${
              isOnline ? 'bg-emerald-400' : 'bg-gray-400'
            }`} />
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-white">
                {middleman.name ?? middleman.robloxUsername ?? 'Anonymous'}
              </h3>
              <Badge variant="outline" size="sm" className="text-purple-400 bg-purple-500/10 border-purple-500/20">
                <Shield className="w-3 h-3 mr-1" />
                Middleman
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-white/60">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                {vouchCount} {t('vouches')}
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                {rating} {t('rating')}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="border-white/10 hover:bg-white/5" asChild>
            <Link href={`/user/${encodeURIComponent(middleman.robloxUsername ?? middleman.name ?? "")}`}>
              {t('viewProfile')}
            </Link>
          </Button>
          <Button size="sm" variant="gradient" gradientType="purple">
            <MessageCircle className="w-4 h-4 mr-1" />
            {t('contact')}
          </Button>
        </div>
      </div>
    </div>
  );
}