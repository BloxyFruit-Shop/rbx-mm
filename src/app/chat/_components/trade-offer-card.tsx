"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  ArrowRightLeft,
  Check,
  X,
  Clock,
  Package,
  Search,
  Sparkles,
  Hash,
  Eye,
} from "lucide-react";
import { cn } from "~/lib/utils";
import Image from "next/image";
import { api } from "~convex/_generated/api";
import type { Id } from "~convex/_generated/dataModel";
import { toast } from "sonner";
import ChatTradeOfferInfoDialog from "./chat-trade-offer-info-dialog";

interface TradeOfferCardProps {
  message: {
    id: string;
    senderId?: string;
    senderName: string;
    senderAvatar?: string;
    timestamp: number;
    isCurrentUser: boolean;
    tradeOffer?: {
      _id: string;
      status: "pending" | "accepted" | "declined" | "cancelled";
      offering: Array<{
        id: string;
        name: string;
        thumbnailUrl: string;
        quantity: number;
        rarity: string;
        mutations?: string[];
        price?: number;
        age?: number;
      }>;
      requesting: Array<{
        id: string;
        name: string;
        thumbnailUrl: string;
        quantity: number;
        rarity: string;
        mutations?: string[];
        price?: number;
        age?: number;
      }>;
    } | null;
  };
  showAvatar: boolean;
  sessionId: Id<"session">;
}

const statusConfig = {
  pending: {
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    label: "Pending",
    icon: Clock,
  },
  accepted: {
    color: "bg-green-500/20 text-green-400 border-green-500/30",
    label: "Accepted",
    icon: Check,
  },
  declined: {
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    label: "Declined",
    icon: X,
  },
  cancelled: {
    color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    label: "Cancelled",
    icon: X,
  },
};

const rarityColors = {
  common: "border-gray-500/30",
  uncommon: "border-green-500/30",
  rare: "border-blue-500/30",
  epic: "border-purple-500/30",
  legendary: "border-yellow-500/30",
};

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ItemGrid({
  items,
  title,
  icon: Icon,
  accentColor = "blue",
}: {
  items: Array<{
    id: string;
    name: string;
    thumbnailUrl: string;
    quantity: number;
    rarity: string;
    mutations?: string[];
    price?: number;
    age?: number;
  }>;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor?: "blue" | "green";
}) {
  const accentColors = {
    blue: "text-blue-400",
    green: "text-green-400",
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className={cn("size-3 sm:size-4", accentColors[accentColor])} />
        <h4 className="text-xs font-medium text-white/80 sm:text-sm">
          {title}
        </h4>
        <Badge variant="outline" className="h-4 px-1 text-xs">
          {items.length}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "relative aspect-square rounded-lg border bg-white/5 p-2 transition-all hover:bg-white/10",
              rarityColors[item.rarity as keyof typeof rarityColors] ||
                rarityColors.common,
            )}
          >
            <Image
              src={item.thumbnailUrl}
              alt={item.name}
              fill
              className="object-contain p-1"
              sizes="(max-width: 640px) 25vw, 20vw"
            />

            {item.quantity > 1 && (
              <div className="absolute -right-1 -bottom-1 flex items-center gap-0.5 rounded-full bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
                <Hash className="size-2" />
                {item.quantity}
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 rounded-b-lg bg-gradient-to-t from-black/80 to-transparent p-1 opacity-0 transition-opacity hover:opacity-100">
              <p className="truncate text-xs text-white">{item.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TradeOfferCard({
  message,
  showAvatar,
  sessionId,
}: TradeOfferCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const { tradeOffer } = message;

  const updateTradeOfferStatus = useMutation(
    api.chatTradeOffers.updateTradeOfferStatus,
  );

  if (!tradeOffer) {
    return (
      <div className="flex items-center justify-center p-4 text-white/60">
        <span>Trade offer data not available</span>
      </div>
    );
  }

  const statusInfo = statusConfig[tradeOffer.status];
  const StatusIcon = statusInfo.icon;

  const handleAccept = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await updateTradeOfferStatus({
        tradeOfferId: tradeOffer._id as Id<"chat_trade_offers">,
        status: "accepted",
        session: sessionId,
      });
      toast.success("Trade offer accepted!");
    } catch (error) {
      console.error("Failed to accept trade offer:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to accept trade offer.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await updateTradeOfferStatus({
        tradeOfferId: tradeOffer._id as Id<"chat_trade_offers">,
        status: "declined",
        session: sessionId,
      });
      toast.success("Trade offer declined.");
    } catch (error) {
      console.error("Failed to decline trade offer:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to decline trade offer.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        className={cn(
          "flex gap-2 sm:gap-3",
          message.isCurrentUser ? "flex-row-reverse" : "flex-row",
        )}
      >
        <div className="flex-shrink-0">
          {showAvatar ? (
            <Avatar className="size-8 ring-1 ring-white/20 sm:size-9">
              <AvatarImage
                src={message.senderAvatar}
                alt={message.senderName}
              />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-xs font-medium text-white">
                {message.senderName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="size-8 sm:size-9" />
          )}
        </div>

        <div
          className={cn(
            "flex max-w-[90%] flex-col gap-1 sm:max-w-[80%]",
            message.isCurrentUser ? "items-end" : "items-start",
          )}
        >
          {showAvatar && (
            <div
              className={cn(
                "flex items-center gap-2 text-xs text-white/60",
                message.isCurrentUser ? "flex-row-reverse" : "flex-row",
              )}
            >
              <span className="font-medium">{message.senderName}</span>
              <span>{formatTime(message.timestamp)}</span>
            </div>
          )}

          <Card
            className={cn(
              "border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm",
              tradeOffer.status === "pending" && "ring-1 ring-blue-500/20",
              tradeOffer.status === "accepted" && "ring-1 ring-green-500/20",
              tradeOffer.status === "declined" && "ring-1 ring-red-500/20",
            )}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-2">
                    <ArrowRightLeft className="size-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Trade Offer
                    </h3>
                    <p className="text-xs text-white/60">
                      {message.isCurrentUser
                        ? "You sent an offer"
                        : `${message.senderName} sent an offer`}
                    </p>
                  </div>
                </div>

                <Badge className={cn("text-xs", statusInfo.color)}>
                  <StatusIcon className="mr-1 size-2.5" />
                  {statusInfo.label}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <ItemGrid
                items={tradeOffer.offering}
                title="Offering"
                icon={Package}
                accentColor="green"
              />

              <div className="flex justify-center">
                <div className="rounded-full border border-white/10 bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-2">
                  <ArrowRightLeft className="size-4 text-white" />
                </div>
              </div>

              <ItemGrid
                items={tradeOffer.requesting}
                title="Requesting"
                icon={Search}
                accentColor="blue"
              />

              {tradeOffer.status === "pending" && !message.isCurrentUser && (
                <div className="space-y-2 pt-2">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={handleAccept}
                      disabled={isLoading}
                      className="min-w-[100px] flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 disabled:opacity-50"
                    >
                      <Check className="mr-1 size-3" />
                      {isLoading ? "Accepting..." : "Accept"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDecline}
                      disabled={isLoading}
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowInfoDialog(true)}
                    className="w-full border-white/20 text-white/70 hover:border-white/30 hover:bg-white/10 hover:text-white"
                  >
                    <Eye className="mr-2 size-3" />
                    View Details
                  </Button>
                </div>
              )}

              {tradeOffer.status === "pending" && message.isCurrentUser && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-center gap-2 text-xs text-white/60">
                    <Clock className="size-3" />
                    <span>Waiting for response...</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowInfoDialog(true)}
                    className="w-full border-white/20 text-white/70 hover:border-white/30 hover:bg-white/10 hover:text-white"
                  >
                    <Eye className="mr-2 size-3" />
                    View Details
                  </Button>
                </div>
              )}

              {tradeOffer.status === "accepted" && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-center gap-2 text-sm text-green-400">
                    <Check className="size-4" />
                    <span>Trade offer accepted!</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowInfoDialog(true)}
                    className="w-full border-white/20 text-white/70 hover:border-white/30 hover:bg-white/10 hover:text-white"
                  >
                    <Eye className="mr-2 size-3" />
                    View Details
                  </Button>
                </div>
              )}

              {tradeOffer.status === "declined" && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-center gap-2 text-sm text-red-400">
                    <X className="size-4" />
                    <span>Trade offer declined</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowInfoDialog(true)}
                    className="w-full border-white/20 text-white/70 hover:border-white/30 hover:bg-white/10 hover:text-white"
                  >
                    <Eye className="mr-2 size-3" />
                    View Details
                  </Button>
                </div>
              )}

              {tradeOffer.status === "cancelled" && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                    <X className="size-4" />
                    <span>Trade offer cancelled</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowInfoDialog(true)}
                    className="w-full border-white/20 text-white/70 hover:border-white/30 hover:bg-white/10 hover:text-white"
                  >
                    <Eye className="mr-2 size-3" />
                    View Details
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {!showAvatar && (
            <div className="text-xs text-white/50">
              {formatTime(message.timestamp)}
            </div>
          )}
        </div>
      </div>
      <ChatTradeOfferInfoDialog
        open={showInfoDialog}
        onOpenChange={setShowInfoDialog}
        tradeOffer={tradeOffer}
        senderName={message.senderName}
      />
    </>
  );
}
