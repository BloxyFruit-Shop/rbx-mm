"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { useTranslations } from 'next-intl';
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import {
  Info,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageCircle,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { api } from "~convex/_generated/api";
import type { Id } from "~convex/_generated/dataModel";
import { MiddlemanTradeControls } from "./middleman-trade-controls";
import TradeInfoDialog from "~/components/trade/trade-info-dialog";
import { UserHoverCard } from "~/components/user/user-hover-card";
import Link from "next/link";

const statusConfig = {
  online: { color: "bg-green-500", label: "Online" },
  away: { color: "bg-yellow-500", label: "Away" },
  offline: { color: "bg-gray-500", label: "Offline" },
};

const tradeStatusConfig = {
  none: {
    color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    label: "No Active Trade",
    icon: Clock
  },
  pending: { 
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30", 
    label: "Pending Trade",
    icon: Clock 
  },
  accepted: { 
    color: "bg-orange-500/20 text-orange-400 border-orange-500/30", 
    label: "Trade Accepted",
    icon: AlertCircle 
  },
  waiting_for_middleman: { 
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30", 
    label: "Middleman Called",
    icon: AlertCircle 
  },
  completed: { 
    color: "bg-green-500/20 text-green-400 border-green-500/30", 
    label: "Trade Complete",
    icon: CheckCircle2 
  },
  cancelled: { 
    color: "bg-red-500/20 text-red-400 border-red-500/30", 
    label: "Trade Cancelled",
    icon: CheckCircle2 
  },
};

function formatLastSeen(timestamp: number | null): { text: string; isOnline: boolean } {
  if (!timestamp) return { text: "Last seen unknown", isOnline: false };
  
  const now = Date.now();
  const diff = now - timestamp;
  
  // Consider user online if last seen within 60 seconds
  if (diff <= 60000) {
    return { text: "Online", isOnline: true };
  }
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days > 0) return { text: `Last seen ${days}d ago`, isOnline: false };
  if (hours > 0) return { text: `Last seen ${hours}h ago`, isOnline: false };
  if (minutes > 0) return { text: `Last seen ${minutes}m ago`, isOnline: false };
  return { text: "Last seen just now", isOnline: false };
}

interface ChatHeaderProps {
  chatId: string;
  sessionId: Id<"session">;
  currentUserId: Id<"user">;
  isMiddleman: boolean;
  tradeStatus: string;
}

export function ChatHeader({ chatId, sessionId, currentUserId, isMiddleman, tradeStatus }: ChatHeaderProps) {
  const [tradeInfoDialogOpen, setTradeInfoDialogOpen] = useState(false);
  const t = useTranslations('chat');

  const chat = useQuery(api.chats.getChatById, {
    chatId: chatId as Id<"chats">,
    session: sessionId,
  });

  // Get the trade ad if this chat is associated with one
  const tradeAd = useQuery(api.tradeAds.getTradeAdById, 
    chat?.tradeAd ? { tradeAdId: chat.tradeAd } : "skip"
  );

  // Check if current user is the middleman for this specific chat
  const isCurrentUserMiddleman = !chat?.participantIds.includes(currentUserId);
  
  // Debug logging
  console.log("ChatHeader Debug:", {
    currentUserId,
    chatMiddleman: chat?.middleman,
    isCurrentUserMiddleman,
    participants: chat?.participants,
    isMiddlemanProp: isMiddleman,
    chatParticipants: chat?.participants?.map(p => ({ id: p?._id, name: p?.name }))
  });
  
  // Get display information based on whether user is middleman or participant
  let displayName: string;
  let displayAvatar: string;
  let otherParticipant: any = null;
  
  if (isCurrentUserMiddleman) {
    // For middleman, show a combined name or trade info
    const participants = chat?.participants.filter(p => p && p._id !== currentUserId) || [];
    console.log("Middleman participants:", participants);
    if (participants.length >= 2) {
      displayName = `${participants[0]?.name} ↔ ${participants[1]?.name}`;
    } else if (participants.length === 1) {
      displayName = `Trade with ${participants[0]?.name}`;
    } else {
      displayName = "Trade Chat";
    }
    displayAvatar = "/images/middleman-avatar.png";
  } else {
    // For participants, show the other participant
    otherParticipant = chat?.participants.find(p => p && p._id !== currentUserId);
    displayName = otherParticipant?.name ?? "Unknown User";
    
    // Use thumbnailUrl for trade chats, user avatar for direct messages
    if (chat?.type === "trade" && chat?.thumbnailUrl) {
      displayAvatar = chat.thumbnailUrl;
    } else {
      displayAvatar = otherParticipant?.robloxAvatarUrl ?? "/images/default-avatar.png";
    }
  }
  
  const otherUserPresence = useQuery(api.user.getOtherUserPresence, 
    otherParticipant ? { userId: otherParticipant._id } : "skip"
  );
  
  if (chat === undefined) {
    return (
      <div className="p-4 border-b border-white/10 bg-white/5">
        <div className="text-white/60">Loading...</div>
      </div>
    );
  }
  
  if (!chat) {
    return (
      <div className="p-4 border-b border-white/10 bg-white/5">
        <div className="text-white/60">Chat not found</div>
      </div>
    );
  }

  // For non-middleman users, check if we have the other participant
  if (!isCurrentUserMiddleman && !otherParticipant) {
    return (
      <div className="p-4 border-b border-white/10 bg-white/5">
        <div className="text-white/60">Participant not found</div>
      </div>
    );
  }

  // Get presence status (only for non-middleman users)
  const presenceInfo = !isCurrentUserMiddleman ? formatLastSeen(otherUserPresence ?? null) : { text: "Multiple users", isOnline: false };
  const statusInfo = presenceInfo.isOnline ? statusConfig.online : statusConfig.offline;
  const tradeInfo = tradeStatusConfig[tradeStatus as keyof typeof tradeStatusConfig] || tradeStatusConfig.none;
  const TradeIcon = tradeInfo.icon;

  return (
    <div className="z-50 border-b border-white/10 bg-white/5 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2 p-3 sm:p-4">
        <div className="flex items-center flex-1 min-w-0 gap-2 sm:gap-3">
          <div className="relative flex-shrink-0">
            <Avatar className={cn(
              "size-9 sm:size-10 md:size-12 ring-1",
              isCurrentUserMiddleman ? "ring-blue-500/40" : "ring-white/20"
            )}>
              <AvatarImage 
                src={displayAvatar} 
                alt={displayName} 
              />
              <AvatarFallback className={cn(
                "text-xs sm:text-sm font-medium text-white",
                isCurrentUserMiddleman 
                  ? "bg-gradient-to-br from-blue-500 to-cyan-500" 
                  : chat?.type === "trade"
                  ? "bg-gradient-to-br from-green-500 to-emerald-500"
                  : "bg-gradient-to-br from-purple-500 to-blue-500"
              )}>
                {isCurrentUserMiddleman ? "🛡️" : chat?.type === "trade" ? "📦" : displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {!isCurrentUserMiddleman && (
              <div className={cn(
                "absolute -bottom-0.5 -right-0.5 size-2.5 sm:size-3 md:size-3.5 rounded-full border-2 border-white/20",
                statusInfo.color
              )} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
              {!isCurrentUserMiddleman && otherParticipant ? (
                <UserHoverCard user={otherParticipant} side="bottom" align="start">
                  <div className="relative z-50">
                    <Link 
                      href={`/user/${encodeURIComponent(otherParticipant.robloxUsername ?? otherParticipant.name ?? "")}`}
                      className="transition-colors hover:text-white/80"
                    >
                      <h1 className="text-sm font-semibold text-white truncate cursor-pointer sm:text-base md:text-lg">
                        {displayName}
                      </h1>
                    </Link>
                  </div>
                </UserHoverCard>
              ) : (
                <h1 className="text-sm font-semibold text-white truncate sm:text-base md:text-lg">
                    {displayName}
                </h1>
              )}
              {!isCurrentUserMiddleman && otherParticipant?.robloxUsername && (
                <span className="hidden text-xs sm:text-sm opacity-80 xs:inline">@{otherParticipant.robloxUsername}</span>
              )}
            </div>
            
            <div className="flex flex-col gap-0.5 xs:flex-row xs:items-center xs:gap-2 sm:gap-3">
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-xs truncate sm:text-sm text-white/60">
                  {presenceInfo.text}
                </span>
              </div>
              
              {chat.type === "trade" && (
                <Badge 
                  variant="outline" 
                  className={cn("text-xs h-4 sm:h-5 w-fit flex-shrink-0", tradeInfo.color)}
                >
                  <TradeIcon className="size-2 sm:size-2.5 mr-0.5 sm:mr-1" />
                  <span className="hidden xs:inline">{tradeInfo.label}</span>
                  <span className="xs:hidden">
                    {tradeInfo.label === "No Active Trade" ? "None" : 
                     tradeInfo.label === "Pending Trade" ? "Pending" :
                     tradeInfo.label === "Trade Accepted" ? "Accepted" :
                     tradeInfo.label === "Middleman Called" ? "MM Called" :
                     tradeInfo.label === "Trade Complete" ? "Complete" :
                     tradeInfo.label === "Trade Cancelled" ? "Cancelled" : tradeInfo.label}
                  </span>
                </Badge>
              )}

              {chat.type === "direct_message" && (
                <Badge 
                  variant="outline" 
                  className="flex-shrink-0 h-4 text-xs text-purple-400 sm:h-5 w-fit bg-purple-500/20 border-purple-500/30"
                >
                  <MessageCircle className="size-2 sm:size-2.5 mr-0.5 sm:mr-1" />
                  <span className="hidden xs:inline">{t('types.directMessage')}</span>
                  <span className="xs:hidden">DM</span>
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 flex-shrink-0">
          {chat.type === "trade" && isMiddleman && (tradeStatus === "accepted" || tradeStatus === "waiting_for_middleman") && (
            <div className="flex items-center">
              <MiddlemanTradeControls chatId={chatId} sessionId={sessionId} />
            </div>
          )}
          
          {chat.type === "trade" && tradeAd && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-shrink-0 p-1 sm:p-2 size-7 sm:size-8"
              onClick={() => setTradeInfoDialogOpen(true)}
            >
              <Info className="size-3 sm:size-4" />
            </Button>
          )}
        </div>
      </div>

      {chat.type === "trade" && tradeAd && (
        <TradeInfoDialog
          tradeAd={tradeAd}
          open={tradeInfoDialogOpen}
          onOpenChange={setTradeInfoDialogOpen}
        />
      )}
    </div>
  );
}