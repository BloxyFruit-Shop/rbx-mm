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

function ItemPreview({
  items,
  maxItems = 3,
}: {
  items: ResolvedTradeAd["haveItemsResolved"];
  maxItems?: number;
}) {
  const displayItems = items.slice(0, maxItems);
  const remainingCount = items.length - maxItems;

  return (
    <div className="flex gap-2">
      {displayItems.map((item, index) => (
        <div
          key={`${item._id}-${index}`}
          className="relative size-12 overflow-hidden rounded border border-white/10 bg-gradient-to-br from-white/5 to-white/10"
        >
          <Image
            src={item.thumbnailUrl}
            alt={item.name}
            fill
            className="object-contain p-2"
            sizes="48px"
          />
        </div>
      ))}
      {remainingCount > 0 && (
        <div className="flex size-12 items-center justify-center rounded border border-dashed border-white/20 bg-white/5">
          <span className="text-xs font-medium text-white/60">
            +{remainingCount}
          </span>
        </div>
      )}
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
          "group relative flex h-full flex-col overflow-hidden bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/30",
          tradeAd.status === "open" && "ring-1 ring-green-500/20",
          className,
        )}
      >
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600" />

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="relative">
                <Avatar className="size-12 ring-2 ring-white/20">
                  <AvatarImage
                    src={tradeAd.creator?.robloxAvatarUrl ?? undefined}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 font-semibold text-white">
                    {tradeAd.creator?.name?.charAt(0) ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -right-1 -bottom-1 rounded-full bg-white/10 p-1 backdrop-blur-sm">
                  <StatusIcon className="size-3 text-white" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="cursor-pointer truncate font-semibold text-white">
                  {tradeAd.creator?.name ?? "Unknown User"}
                </p>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Clock className="size-4" />
                  {formatTimeAgo(tradeAd._creationTime)}
                </div>
              </div>
            </div>

            <Badge className={cn("text-sm font-medium", statusInfo.color)}>
              {statusInfo.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex-1 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Package className="size-4 text-green-400" />
              <span className="text-sm font-medium text-white/80">
                Offering ({tradeAd.haveItemsResolved.length})
              </span>
            </div>
            <ItemPreview items={tradeAd.haveItemsResolved} maxItems={4} />
          </div>

          <div className="flex justify-center">
            <div className="relative">
              <div className="rounded-full border border-white/10 bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-2">
                <ArrowRightLeft className="size-4 text-white" />
              </div>
              <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-20" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Search className="size-4 text-blue-400" />
              <span className="text-sm font-medium text-white/80">
                Wanting{" "}
                {isHearingOffers
                  ? "(Any Offers)"
                  : `(${tradeAd.wantItemsResolved.length})`}
              </span>
            </div>
            {isHearingOffers ? (
              <div className="flex items-center justify-center rounded-lg border border-dashed border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-4">
                <div className="text-center">
                  <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
                    <Sparkles className="size-4 text-green-400" />
                  </div>
                  <p className="text-sm font-medium text-green-400">
                    Hearing Offers
                  </p>
                  <p className="text-xs text-green-400/70">Open to any items</p>
                </div>
              </div>
            ) : (
              <ItemPreview items={tradeAd.wantItemsResolved} maxItems={4} />
            )}
          </div>

          {tradeAd.notes && (
            <div className="rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-white/10 p-3">
              <p className="line-clamp-2 text-sm text-white/80">
                {tradeAd.notes}
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="@container mt-auto pt-2">
          <div className="flex w-full flex-col gap-2 @sm:flex-row">
            <Button
              variant="outline"
              size="sm"
              onClick={onSeeDetails}
              className="flex-1 border-white/20 bg-white/5 py-2 hover:border-white/30 hover:bg-white/10"
            >
              <Info className="mr-2 size-4" />
              See Details
            </Button>
            {tradeAd.status === "open" && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleChat}
                  disabled={isCreatingChat}
                  className="flex-1 border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/10 disabled:opacity-50 @sm:flex-none"
                >
                  <MessageCircle className="size-4 @sm:mr-2" />
                  <span className="hidden @sm:inline">Chat</span>
                </Button>
                <Button
                  size="sm"
                  onClick={handleTradeOffer}
                  disabled={isCreatingChat}
                  className="flex-1 border-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 @sm:flex-none"
                >
                  <ArrowRightLeft className="size-4 @sm:mr-2" />
                  <span className="hidden @sm:inline">Trade</span>
                </Button>
              </div>
            )}
          </div>
        </CardFooter>
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
