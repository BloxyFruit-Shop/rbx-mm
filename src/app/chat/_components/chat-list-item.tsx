"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import {
  Clock,
  CheckCircle2,
  MessageCircle,
  Shield,
} from "lucide-react";
import { cn } from "~/lib/utils";
import type { ResolvedChat } from "~convex/chats";
import type { Id } from "~convex/_generated/dataModel";

interface ChatListItemProps {
  chat: ResolvedChat;
  currentUserId: Id<"user">;
  isActive: boolean;
  onSelect?: () => void;
}

const tradeStatusConfig = {
  pending: { 
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30", 
    label: "Pending",
    icon: Clock 
  },
  negotiating: { 
    color: "bg-orange-500/20 text-orange-400 border-orange-500/30", 
    label: "Negotiating",
    icon: MessageCircle 
  },
  accepted: { 
    color: "bg-green-500/20 text-green-400 border-green-500/30", 
    label: "Accepted",
    icon: CheckCircle2 
  },
  dm: {
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    label: "Direct Message",
    icon: MessageCircle
  },
  completed: { 
    color: "bg-green-500/20 text-green-400 border-green-500/30", 
    label: "Completed",
    icon: CheckCircle2 
  },
  middleman_called: { 
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30", 
    label: "Middleman Called",
    icon: Shield 
  },
  receiving_items: { 
    color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30", 
    label: "Receiving Items",
    icon: Shield 
  },
};

function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return "now";
}

function getTradeStatus(chat: ResolvedChat): keyof typeof tradeStatusConfig {
  // For direct messages, always show as negotiating (active conversation)
  if (chat.type === "direct_message") {
    return "dm";
  }

  if (!chat.tradeStatus) return "negotiating";

  switch (chat.tradeStatus) {
    case "none":
      return "negotiating";
    case "waiting_for_middleman":
      return "middleman_called";
    case "cancelled":
      return "negotiating";
    default:
      return chat.tradeStatus as keyof typeof tradeStatusConfig;
  }
}

function getLastMessagePreview(chat: ResolvedChat): string {
  if (!chat.lastMessage) return "No messages yet";

  switch (chat.lastMessage.type) {
    case "message":
      return chat.lastMessage.content ?? "Message";
    case "trade_offer":
      return "📦 Trade offer sent";
    case "middleman_call":
      return "🛡️ Middleman requested";
    case "system":
      if (chat.lastMessage.systemType === "trade_completed") {
        return "✅ Trade completed";
      }
      return chat.lastMessage.content ?? "System message";
    default:
      return "New message";
  }
}

function hasActiveOffer(chat: ResolvedChat): boolean {
  return chat.lastMessage?.tradeOffer?.status === "pending" || 
         chat.lastMessage?.middlemanCall?.status === "pending";
}

export function ChatListItem({ chat, currentUserId, isActive, onSelect }: ChatListItemProps) {
  // Check if current user is the middleman for this chat
  const isMiddleman = chat.middleman === currentUserId;
  
  // Get the other participant (not the current user)
  // If user is middleman, show both participants or the trade ad info
  let displayName: string;
  let displayAvatar: string;
  
  if (isMiddleman) {
    // For middleman, show a combined name or trade info
    const participants = chat.participants.filter(p => p && p._id !== currentUserId);
    if (participants.length >= 2) {
      displayName = `${participants[0]?.name} ↔ ${participants[1]?.name}`;
    } else if (participants.length === 1) {
      displayName = `Trade with ${participants[0]?.name}`;
    } else {
      displayName = "Trade Chat";
    }
    displayAvatar = "/images/middleman-avatar.png";
  } else {
    const otherParticipant = chat.participants.find(p => p && p._id !== currentUserId);
    displayName = otherParticipant?.name ?? "Unknown User";
    
    // Use thumbnailUrl for trade chats, user avatar for direct messages
    if (chat.type === "trade" && chat.thumbnailUrl) {
      displayAvatar = chat.thumbnailUrl;
    } else {
      displayAvatar = otherParticipant?.robloxAvatarUrl ?? "/images/default-avatar.png";
    }
  }

  const tradeStatus = getTradeStatus(chat);
  const tradeInfo = tradeStatusConfig[tradeStatus];
  const TradeIcon = tradeInfo.icon;
  const lastMessagePreview = getLastMessagePreview(chat);
  const hasActiveOfferFlag = hasActiveOffer(chat);

  return (
    <Link href={`/chat/${chat._id}`} onClick={onSelect}>
      <div
        className={cn(
          "group relative rounded border p-3 transition-all duration-200 hover:border-white/20 hover:bg-white/10",
          isActive 
            ? "border-purple-500/50 bg-purple-500/10" 
            : "border-white/10 bg-white/5",
          isMiddleman && "ring-1 ring-blue-500/30 bg-blue-500/5"
        )}
      >
        {isActive && (
          <div className={cn(
            "absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r",
            isMiddleman ? "bg-blue-500" : "bg-purple-500"
          )} />
        )}
        
        {isMiddleman && !isActive && (
          <div className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r bg-blue-500/60" />
        )}

        <div className="flex items-start gap-3">
          <Avatar className={cn(
            "size-10 ring-1 flex-shrink-0",
            isMiddleman ? "ring-blue-500/40" : "ring-purple-500/40"
          )}>
            <AvatarImage src={displayAvatar} alt={displayName} />
            <AvatarFallback className={cn(
              "text-sm font-medium text-white",
              isMiddleman 
                ? "bg-gradient-to-br from-blue-500 to-cyan-500" 
                : chat.type === "trade"
                ? "bg-gradient-to-br from-green-500 to-emerald-500"
                : "bg-gradient-to-br from-purple-500 to-blue-500"
            )}>
              {isMiddleman ? "🛡️" : chat.type === "trade" ? "📦" : displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between mb-1">
              <p className="truncate font-medium text-white">
                {displayName}
              </p>
              <div className="flex items-center gap-1">
                {hasActiveOfferFlag && (
                  <div className="size-2 rounded-full bg-orange-500 animate-pulse" />
                )}
                <span className="text-xs text-white/50">
                  {formatTimeAgo(chat.lastMessageAt)}
                </span>
              </div>
            </div>

            <p className="truncate text-sm text-white/70 mb-2">
              {lastMessagePreview}
            </p>

            <div className="flex items-center justify-between">
              <Badge 
                variant="outline" 
                className={cn("text-xs h-5", tradeInfo.color)}
              >
                <TradeIcon className="size-2.5 mr-1" />
                {tradeInfo.label}
              </Badge>

              {!!chat.unreadCount && chat.unreadCount > 0 && (
                <div className="flex size-5 items-center justify-center rounded-full bg-purple-500 text-xs font-medium text-white">
                  {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}