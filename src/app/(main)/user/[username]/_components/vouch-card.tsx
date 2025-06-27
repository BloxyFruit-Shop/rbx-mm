"use client";

import { memo, useState } from "react";
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import {
  Star,
  Calendar,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import TradeInfoDialog from "~/components/trade/trade-info-dialog";

interface VouchCardProps {
  vouch: {
    _id: string;
    _creationTime: number;
    rating: number;
    comment?: string;
    fromUser?: {
      _id: string;
      robloxUsername?: string | null;
      robloxAvatarUrl?: string | null;
      roles: string[];
    } | null;
    tradeAd?: {
      _id: string;
      status: string;
    } | null;
  };
}

const VouchCard = memo(function VouchCard({ vouch }: VouchCardProps) {
  const t = useTranslations('userProfile');
  const [showTradeDialog, setShowTradeDialog] = useState(false);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-4 w-4",
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : i < rating
              ? "fill-yellow-400/50 text-yellow-400"
              : "text-white/20"
        )}
      />
    ));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-400";
    if (rating >= 3.5) return "text-yellow-400";
    if (rating >= 2.5) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage 
                src={vouch.fromUser?.robloxAvatarUrl ?? undefined} 
                alt={`${vouch.fromUser?.robloxUsername}'s avatar`}
              />
              <AvatarFallback className="bg-gradient-to-br from-[#9747FF]/20 to-[#7E3BFF]/20 text-white">
                {vouch.fromUser?.robloxUsername?.charAt(0)?.toUpperCase() ?? 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Link
                  href={`/user/${vouch.fromUser?.robloxUsername ?? 'unknown'}`}
                  className="font-medium text-white hover:text-[#9747FF] transition-colors"
                >
                  {vouch.fromUser?.robloxUsername ?? 'Unknown User'}
                </Link>
                {vouch.fromUser?.roles?.includes('admin') && (
                  <Badge className="text-xs text-yellow-400 border-yellow-500/30 bg-yellow-500/20">
                    Admin
                  </Badge>
                )}
                {vouch.fromUser?.roles?.includes('middleman') && (
                  <Badge className="text-xs text-blue-400 border-blue-500/30 bg-blue-500/20">
                    Middleman
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="w-3 h-3 text-white/40" />
                <span className="text-xs text-white/60">
                  {formatDate(vouch._creationTime)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1">
              {renderStars(vouch.rating)}
            </div>
            <span className={cn("text-sm font-medium", getRatingColor(vouch.rating))}>
              {vouch.rating}/5
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {vouch.comment && (
          <div className="p-3 mb-4 border rounded-lg border-white/10 bg-white/5">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-white/60 mt-0.5 flex-shrink-0" />
              <p className="text-sm leading-relaxed text-white/80">
                &quot;{vouch.comment}&quot;
              </p>
            </div>
          </div>
        )}

        {vouch.tradeAd && (
          <div className="flex items-center justify-between p-3 border rounded-lg border-white/10 bg-white/5">
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-white/60" />
              <span className="text-sm text-white/80">{t('relatedToTrade')}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTradeDialog(true)}
              className="text-sm text-[#9747FF] hover:text-[#7E3BFF] transition-colors h-auto p-0"
            >
              {t('viewTrade')}
            </Button>
          </div>
        )}
      </CardContent>

      {vouch.tradeAd && (
        <TradeInfoDialog
          tradeAd={vouch.tradeAd}
          open={showTradeDialog}
          onOpenChange={setShowTradeDialog}
        />
      )}
    </Card>
  );
});

export default VouchCard;