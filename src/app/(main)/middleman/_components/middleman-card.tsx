"use client";

import { useTranslations } from 'next-intl';
import { Badge } from "~/components/ui/badge";
import { Star, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import type { Doc } from "~convex/_generated/dataModel";
import type { PublicUserProfile } from "~convex/user";
import { UserHoverCard } from "~/components/user/user-hover-card";
import Link from "next/link";

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
  
  // Mock data - replace with actual data when available
  const tradesCompleted = Math.floor(Math.random() * 5000) + 1000;
  const rating = (4.8 + Math.random() * 0.2).toFixed(1);

  // Generate Roblox avatar URL
  const avatarUrl = profile?.robloxAvatarUrl ?? 
    undefined;

  return (
    <div className="p-6 transition-all duration-300 border group bg-white/5 border-white/10 rounded-2xl hover:border-white/20 hover:bg-white/10">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={`${profile?.name ?? profile?.robloxUsername ?? 'Middleman'} avatar`}
              width={64}
              height={64}
              className="w-16 h-16 border-2 rounded-xl border-white/10"
              unoptimized
            />
          ) : (
            <div className="flex items-center justify-center w-16 h-16 border-2 rounded-xl bg-gradient-to-r from-purple-400 to-blue-500 border-white/10">
              <span className="text-xl font-bold text-white">
                {((profile?.name ?? profile?.robloxUsername ?? 'A').charAt(0)).toUpperCase()}
              </span>
            </div>
          )}
          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-gray-800 ${
            isOnline ? 'bg-emerald-400' : 'bg-gray-400'
          }`} />
        </div>
        
        <div className="flex-1">
          <UserHoverCard user={profile} side="bottom" align="start">
            <Link 
              href={`/user/${encodeURIComponent(profile?.robloxUsername ?? profile?.name ?? "")}`}
              className="hover:text-white/80 transition-colors"
            >
              <h3 className="mb-1 text-lg font-bold text-white cursor-pointer">
                {profile?.name ?? profile?.robloxUsername ?? 'Anonymous'}
              </h3>
            </Link>
          </UserHoverCard>
          <div className="flex items-center gap-2">
            <Badge variant={isOnline ? "success" : "secondary"} size="sm">
              {isOnline ? t('online') : t('offline')}
            </Badge>
            {profile?.robloxUsername && (
              <span className="text-sm text-white/60">@{profile.robloxUsername}</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 text-center border rounded-lg bg-white/5 border-white/10">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-sm font-medium text-white">{tradesCompleted.toLocaleString()}</div>
          <div className="text-xs text-white/60">{t('trades')}</div>
        </div>
        
        <div className="p-3 text-center border rounded-lg bg-white/5 border-white/10">
          <div className="flex items-center justify-center mb-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
          </div>
          <div className="text-sm font-medium text-white">{rating}</div>
          <div className="text-xs text-white/60">{t('rating')}</div>
        </div>
      </div>

      {middleman.socialLinks && middleman.socialLinks.length > 0 && (
        <div className="pt-4 border-t border-white/10">
          <div className="mb-2 text-xs text-white/60">Social Links</div>
          <div className="flex flex-wrap gap-2">
            {middleman.socialLinks.map((link, index) => (
              <Badge key={index} variant="outline" size="sm" className="text-xs">
                {link.type}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}