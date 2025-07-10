"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  MessageCircle,
  ArrowRightLeft,
  Clock,
  Package,
  Sparkles,
  Search,
  Star,
  Info,
} from "lucide-react";
import { cn } from "~/lib/utils";
import Image from "next/image";
import type { ResolvedTradeAd } from "~convex/tradeAds";
import { getSession } from "~/lib/auth-client";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "~convex/_generated/api";
import type { Id } from "~convex/_generated/dataModel";
import { TradeOfferDialog } from "~/components/trade/trade-offer-dialog";
import { UserHoverCard } from "~/components/user/user-hover-card";
import Link from "next/link";

interface TradeAdCardProps {
  tradeAd: ResolvedTradeAd;
  className?: string;
  onSeeDetails?: () => void;
}

const statusConfig = {
  open: {
    color: "bg-green-500/20 text-green-400 border-green-500/30",
    label: "Open",
    icon: Star,
  },
  closed: {
    color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    label: "Closed",
    icon: Package,
  },
  expired: {
    color: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    label: "Expired",
    icon: Clock,
  },
  cancelled: {
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    label: "Cancelled",
    icon: Info,
  },
};

function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
}

function CompactItemDisplay({
  items,
}: {
  items: ResolvedTradeAd["haveItemsResolved"];
}) {
  if (items.length === 0) return null;

  const renderItems = () => {
    if (items.length === 1) {
      // Single item: show item + empty placeholder
      return (
        <>
          <div className="relative w-full h-16 @sm:h-20 overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-white/10 shadow-lg">
            <Image
              src={items[0]!.thumbnailUrl}
              alt={items[0]!.name}
              fill
              className="object-contain p-2"
              sizes="(max-width: 384px) 64px, 80px"
            />
          </div>
          <div className="w-full h-16 @sm:h-20 rounded-lg border border-dashed border-white/10 bg-white/5 opacity-30" />
        </>
      );
    } else if (items.length === 2) {
      // Two items: show both
      return items.slice(0, 2).map((item, index) => (
        <div
          key={`${item._id}-${index}`}
          className="relative w-full h-16 @sm:h-20 overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-white/10 shadow-lg"
        >
          <Image
            src={item.thumbnailUrl}
            alt={item.name}
            fill
            className="object-contain p-2"
            sizes="(max-width: 384px) 64px, 80px"
          />
        </div>
      ));
    } else {
      // Three or more: show first item + counter
      return (
        <>
          <div className="relative w-full h-16 @sm:h-20 overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-white/10 shadow-lg">
            <Image
              src={items[0]!.thumbnailUrl}
              alt={items[0]!.name}
              fill
              className="object-contain p-2"
              sizes="(max-width: 384px) 64px, 80px"
            />
          </div>
          <div className="flex w-full h-16 @sm:h-20 items-center justify-center rounded-lg border border-dashed border-white/20 bg-white/5 shadow-lg">
            <span className="text-sm @sm:text-base font-medium text-white/60">
              +{items.length - 1}
            </span>
          </div>
        </>
      );
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2 @sm:gap-3">
      {renderItems()}
    </div>
  );
}

export default function TradeAdCard({
  tradeAd,
  className,
  onSeeDetails,
}: TradeAdCardProps) {
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [tradeOfferDialogOpen, setTradeOfferDialogOpen] = useState(false);

  const router = useRouter();
  const findOrCreateDirectChat = useMutation(api.chats.findOrCreateDirectChat);

  const handleChat = async () => {
    const sessionData = await getSession();
    if (!sessionData.data) {
      toast.error("You must be logged in to chat with this user.");
      return;
    }

    if (!tradeAd.creator?._id) {
      toast.error("Unable to start chat - user information not available.");
      return;
    }

    if (tradeAd.creator._id === sessionData.data.user.id) {
      toast.error("You cannot chat with yourself.");
      return;
    }

    setIsCreatingChat(true);

    const sessionId = sessionData.data.session.id as Id<"session">;

    try {
      const chatId = await findOrCreateDirectChat({
        tradeAd: tradeAd._id,
        otherUserId: tradeAd.creator._id,
        session: sessionId,
      });

      router.push(`/chat/${chatId}`);
    } catch (error) {
      console.error("Failed to create chat:", error);
      toast.error("Failed to start chat. Please try again.");
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleTradeOffer = async () => {
    const sessionData = await getSession();
    if (!sessionData.data) {
      toast.error("You must be logged in to send a trade offer.");
      return;
    }

    if (!tradeAd.creator?._id) {
      toast.error(
        "Unable to send trade offer - user information not available.",
      );
      return;
    }

    if (tradeAd.creator._id === sessionData.data.user.id) {
      toast.error("You cannot send a trade offer to yourself.");
      return;
    }

    setTradeOfferDialogOpen(true);
  };

  const isHearingOffers = tradeAd.wantItemsResolved.length === 0;
  const statusInfo = statusConfig[tradeAd.status];
  const StatusIcon = statusInfo.icon;

  return (
    <>
      <Card
        className={cn(
          "@container group relative flex flex-col overflow-hidden bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/30 hover:shadow-2xl hover:shadow-blue-500/10",
          tradeAd.status === "open" && "ring-1 ring-green-500/20",
          className,
        )}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600" />

        <div className="flex items-center justify-between flex-shrink-0 p-3 pb-2">
          <div className="flex items-center flex-1 min-w-0 gap-2">
            <div className="relative">
              <Avatar className="size-8 ring-2 ring-white/20">
                <AvatarImage
                  src={tradeAd.creator?.robloxAvatarUrl ?? undefined}
                />
                <AvatarFallback className="text-xs font-semibold text-white bg-gradient-to-br from-purple-500 to-blue-500">
                  {tradeAd.creator?.name?.charAt(0) ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -right-0.5 -bottom-0.5 rounded-full bg-white/10 p-0.5 backdrop-blur-sm">
                <StatusIcon className="text-white size-2" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {tradeAd.creator?.name ?? "Unknown User"}
              </p>
              <div className="flex items-center gap-1 text-xs text-white/60">
                <Clock className="size-2.5" />
                {formatTimeAgo(tradeAd._creationTime)}
              </div>
            </div>
          </div>
          <Badge className={cn("text-xs font-medium shrink-0", statusInfo.color)}>
            {statusInfo.label}
          </Badge>
        </div>

        <div className="flex-1 min-h-0 px-3">
          {isHearingOffers ? (
            <div className="grid h-full grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Package className="text-green-400 size-3" />
                  <span className="text-xs font-medium text-white/80">
                    Offering ({tradeAd.haveItemsResolved.length})
                  </span>
                </div>
                <CompactItemDisplay items={tradeAd.haveItemsResolved} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Search className="text-blue-400 size-3" />
                  <span className="text-xs font-medium text-white/80">
                    Wanting
                  </span>
                </div>
                <div className="flex items-center justify-center h-16 @sm:h-20 border border-dashed rounded-lg border-green-400/40 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
                  <div className="text-center">
                    <Sparkles className="mx-auto mb-1 text-green-400 size-3" />
                    <p className="text-xs font-medium text-green-400">
                      Any Offers
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid h-full grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Package className="text-green-400 size-3" />
                  <span className="text-xs font-medium text-white/80">
                    Offering ({tradeAd.haveItemsResolved.length})
                  </span>
                </div>
                <CompactItemDisplay items={tradeAd.haveItemsResolved} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Search className="text-blue-400 size-3" />
                  <span className="text-xs font-medium text-white/80">
                    Wanting ({tradeAd.wantItemsResolved.length})
                  </span>
                </div>
                <CompactItemDisplay items={tradeAd.wantItemsResolved} />
              </div>
            </div>
          )}

          {!!tradeAd.notes && (
            <div className="p-2 mb-8 border rounded -mt-7 border-white/10 bg-gradient-to-br from-white/5 to-white/10">
              <p className="text-xs line-clamp-1 text-white/70">
                {tradeAd.notes}
              </p>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 p-3">
          <div className="flex flex-wrap w-full gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onSeeDetails}
              className="flex-1 text-xs border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/10 h-7"
            >
              <Info className="mr-1 size-3" />
              Details
            </Button>
            {tradeAd.status === "open" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleChat}
                  disabled={isCreatingChat}
                  className="flex-1 text-xs border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/10 disabled:opacity-50 h-7"
                >
                  <MessageCircle className="mr-1 size-3" />
                  Chat
                </Button>
                <Button
                  size="sm"
                  onClick={handleTradeOffer}
                  disabled={isCreatingChat}
                  className="flex-1 text-xs text-white border-0 shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 shadow-blue-500/25 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 h-7"
                >
                  <ArrowRightLeft className="mr-1 size-3" />
                  Trade
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      <TradeOfferDialog
        open={tradeOfferDialogOpen}
        onOpenChange={setTradeOfferDialogOpen}
        recipientId={tradeAd.creator?._id}
        tradeAdData={{
          id: tradeAd._id,
          wantItems: tradeAd.wantItemsResolved.map((item) => ({
            id: item._id,
            name: item.name,
            thumbnailUrl: item.thumbnailUrl,
            quantity: item.quantity,
            rarity: item.rarity,
          })),
        }}
      />
    </>
  );
}