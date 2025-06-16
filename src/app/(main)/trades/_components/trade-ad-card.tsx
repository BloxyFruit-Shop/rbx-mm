"use client";

import { useState } from "react";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  MessageCircle,
  ArrowRightLeft,
  Clock,
  Package,
  Heart,
  MoreHorizontal,
  Sparkles,
  Search,
  Hash,
  Weight,
  Eye,
  Star,
} from "lucide-react";
import { cn } from "~/lib/utils";
import Image from "next/image";
import type { ResolvedTradeAd } from "~convex/tradeAds";
import ItemTooltip from "./item-tooltip";

interface TradeAdCardProps {
  tradeAd: ResolvedTradeAd;
  className?: string;
  viewMode?: "grid" | "list";
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
    icon: Heart,
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

function ItemGrid({
  items,
  title,
  emptyText,
  icon: Icon,
  accentColor = "blue",
}: {
  items: ResolvedTradeAd["haveItemsResolved"];
  title: string;
  emptyText: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor?: "blue" | "green" | "purple";
}) {
  const [showAll, setShowAll] = useState(false);
  const displayItems = showAll ? items : items.slice(0, 4);
  const hasMore = items.length > 4;

  const accentColors = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    green: "text-green-400 bg-green-500/10 border-green-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  };

  if (items.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-white/60" />
          <h4 className="text-sm font-medium text-white/80">{title}</h4>
        </div>
        <div className="flex items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/5 p-6">
          <p className="text-sm text-white/50">{emptyText}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-white/60" />
          <h4 className="text-sm font-medium text-white/80">{title}</h4>
        </div>
        <Badge
          variant="outline"
          className={cn("text-xs", accentColors[accentColor])}
        >
          {items.length}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {displayItems.map((item, index) => (
          <TooltipProvider key={`${item._id}-${index}`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 transition-all duration-200 hover:scale-105 hover:border-white/20 hover:from-white/10 hover:to-white/15">
                  <Image
                    src={item.thumbnailUrl}
                    alt={item.name}
                    fill
                    className="object-contain p-3 transition-transform duration-200 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                  />

                  {item.quantity > 1 && (
                    <div className="absolute right-2 bottom-2 flex items-center gap-1 rounded-full bg-black/80 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                      <Hash className="size-3" />
                      {item.quantity}
                    </div>
                  )}

                  {item.mutations && item.mutations.length > 0 && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-purple-500/90 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                      <Sparkles className="size-3" />
                      {item.mutations.length}
                    </div>
                  )}

                  {item.weightKg && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-orange-500/90 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                      <Weight className="size-3" />
                      {item.weightKg}kg
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

                  <div className="absolute right-0 bottom-0 left-0 p-2 text-xs font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <p className="truncate">{item.name}</p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <ItemTooltip item={item} />
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}

        {hasMore && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/5 text-white/60 transition-all duration-200 hover:scale-105 hover:border-white/30 hover:bg-white/10 hover:text-white/80"
          >
            <MoreHorizontal className="size-5" />
            <span className="text-xs font-medium">+{items.length - 4}</span>
          </button>
        )}
      </div>

      {showAll && hasMore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(false)}
          className="w-full text-white/60 hover:text-white/80"
        >
          <Eye className="mr-2 size-4" />
          Show Less
        </Button>
      )}
    </div>
  );
}

export default function TradeAdCard({
  tradeAd,
  className,
  viewMode = "grid",
}: TradeAdCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChat = () => {
    // TODO: Implement chat functionality
    console.log("Open chat with", tradeAd.creator?.name);
  };

  const handleTradeOffer = () => {
    // TODO: Implement trade offer functionality
    console.log("Send trade offer to", tradeAd.creator?.name);
  };

  const isHearingOffers = tradeAd.wantItemsResolved.length === 0;
  const statusInfo = statusConfig[tradeAd.status];
  const StatusIcon = statusInfo.icon;
  const isCompact = viewMode === "list";

  if (isCompact) {
    // Horizontal List View with Container Queries for Mobile Responsiveness
    return (
      <Card
        className={cn(
          "group @container relative overflow-hidden bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm transition-all duration-200 hover:border-white/30 hover:shadow-lg hover:shadow-blue-500/10",
          tradeAd.status === "open" && "ring-1 ring-green-500/20",
          className,
        )}
      >
        <div className="absolute top-0 right-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600" />

        <CardContent className="p-3 @sm:p-4">
          <div className="space-y-3 @sm:hidden">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <Avatar className="size-8 flex-shrink-0 ring-1 ring-white/20">
                  <AvatarImage
                    src={tradeAd.creator?.robloxAvatarUrl ?? undefined}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-xs font-medium text-white">
                    {tradeAd.creator?.name?.charAt(0) ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {tradeAd.creator?.name ?? "Unknown User"}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-white/60">
                    <Clock className="size-2.5" />
                    {formatTimeAgo(tradeAd._creationTime)}
                  </div>
                </div>
              </div>
              <Badge className={cn("flex-shrink-0 text-xs", statusInfo.color)}>
                {statusInfo.label}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Package className="size-3 flex-shrink-0 text-green-400" />
                  <span className="text-xs font-medium text-white/80">
                    Offering ({tradeAd.haveItemsResolved.length})
                  </span>
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {tradeAd.haveItemsResolved.slice(0, 6).map((item, index) => (
                    <TooltipProvider key={`${item._id}-${index}`}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="relative size-8 flex-shrink-0 cursor-pointer overflow-hidden rounded border border-white/10 bg-white/5 transition-colors hover:border-white/20">
                            <Image
                              src={item.thumbnailUrl}
                              alt={item.name}
                              fill
                              className="object-contain p-1"
                              sizes="32px"
                            />
                            {item.quantity > 1 && (
                              <div className="absolute -right-0.5 -bottom-0.5 min-w-[12px] rounded-full bg-black/80 px-0.5 text-center text-[7px] leading-none text-white">
                                {item.quantity}
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <ItemTooltip item={item} />
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                  {tradeAd.haveItemsResolved.length > 6 && (
                    <div className="flex size-8 flex-shrink-0 items-center justify-center rounded border border-dashed border-white/20 bg-white/5">
                      <span className="text-[7px] font-medium text-white/60">
                        +{tradeAd.haveItemsResolved.length - 6}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Search className="size-3 flex-shrink-0 text-blue-400" />
                  <span className="text-xs font-medium text-white/80">
                    Wanting{" "}
                    {isHearingOffers
                      ? "(Any Offers)"
                      : `(${tradeAd.wantItemsResolved.length})`}
                  </span>
                </div>
                {isHearingOffers ? (
                  <div className="rounded border border-green-500/30 bg-green-500/20 px-2 py-1.5">
                    <span className="text-xs font-medium text-green-400">
                      Open to any offers
                    </span>
                  </div>
                ) : (
                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {tradeAd.wantItemsResolved
                      .slice(0, 6)
                      .map((item, index) => (
                        <TooltipProvider key={`${item._id}-${index}`}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="relative size-8 flex-shrink-0 cursor-pointer overflow-hidden rounded border border-white/10 bg-white/5 transition-colors hover:border-white/20">
                                <Image
                                  src={item.thumbnailUrl}
                                  alt={item.name}
                                  fill
                                  className="object-contain p-1"
                                  sizes="32px"
                                />
                                {item.quantity > 1 && (
                                  <div className="absolute -right-0.5 -bottom-0.5 min-w-[12px] rounded-full bg-black/80 px-0.5 text-center text-[7px] leading-none text-white">
                                    {item.quantity}
                                  </div>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <ItemTooltip item={item} />
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    {tradeAd.wantItemsResolved.length > 6 && (
                      <div className="flex size-8 flex-shrink-0 items-center justify-center rounded border border-dashed border-white/20 bg-white/5">
                        <span className="text-[7px] font-medium text-white/60">
                          +{tradeAd.wantItemsResolved.length - 6}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-white/10 pt-1">
              <div className="flex items-center gap-1 text-xs text-white/60">
                <ArrowRightLeft className="size-3" />
                <span>
                  {tradeAd.haveItemsResolved.length} ↔{" "}
                  {isHearingOffers ? "Any" : tradeAd.wantItemsResolved.length}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {tradeAd.status === "open" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleChat}
                      className="h-7 border-white/20 bg-white/5 px-2 text-xs hover:bg-white/10"
                    >
                      <MessageCircle className="size-3" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleTradeOffer}
                      className="h-7 border-0 bg-gradient-to-r from-blue-500 to-purple-600 px-2 text-xs text-white hover:from-blue-600 hover:to-purple-700"
                    >
                      <ArrowRightLeft className="mr-1 size-3" />
                      Trade
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsLiked(!isLiked)}
                  className="size-7 p-1 hover:bg-red-500/10"
                >
                  <Heart
                    className={cn(
                      "size-3 transition-all duration-200",
                      isLiked
                        ? "fill-red-500 text-red-500"
                        : "text-white/60 hover:text-red-400",
                    )}
                  />
                </Button>
              </div>
            </div>
          </div>

          <div className="hidden flex-col gap-3 @sm:flex @md:hidden">
            <div className="flex items-center justify-between">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Avatar className="size-9 ring-1 ring-white/20">
                  <AvatarImage
                    src={tradeAd.creator?.robloxAvatarUrl ?? undefined}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-sm font-medium text-white">
                    {tradeAd.creator?.name?.charAt(0) ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {tradeAd.creator?.name ?? "Unknown User"}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-white/60">
                    <Clock className="size-3" />
                    {formatTimeAgo(tradeAd._creationTime)}
                  </div>
                </div>
              </div>
              <Badge className={cn("text-xs", statusInfo.color)}>
                {statusInfo.label}
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <div className="flex flex-shrink-0 items-center gap-1">
                  <Package className="size-3 text-green-400" />
                  <span className="text-xs font-medium text-white/80">
                    Offering:
                  </span>
                </div>
                <div className="flex min-w-0 gap-1 overflow-x-auto">
                  {tradeAd.haveItemsResolved.slice(0, 4).map((item, index) => (
                    <TooltipProvider key={`${item._id}-${index}`}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="relative size-7 flex-shrink-0 cursor-pointer overflow-hidden rounded border border-white/10 bg-white/5 transition-colors hover:border-white/20">
                            <Image
                              src={item.thumbnailUrl}
                              alt={item.name}
                              fill
                              className="object-contain p-0.5"
                              sizes="28px"
                            />
                            {item.quantity > 1 && (
                              <div className="absolute -right-0.5 -bottom-0.5 rounded-full bg-black/80 px-0.5 text-[7px] leading-none text-white">
                                {item.quantity}
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <ItemTooltip item={item} />
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                  {tradeAd.haveItemsResolved.length > 4 && (
                    <div className="flex size-7 flex-shrink-0 items-center justify-center rounded border border-dashed border-white/20 bg-white/5">
                      <span className="text-[7px] font-medium text-white/60">
                        +{tradeAd.haveItemsResolved.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <ArrowRightLeft className="size-4 flex-shrink-0 text-white/60" />

              <div className="flex min-w-0 flex-1 items-center gap-2">
                <div className="flex flex-shrink-0 items-center gap-1">
                  <Search className="size-3 text-blue-400" />
                  <span className="text-xs font-medium text-white/80">
                    Wanting:
                  </span>
                </div>
                {isHearingOffers ? (
                  <div className="flex-shrink-0 rounded border border-green-500/30 bg-green-500/20 px-2 py-0.5">
                    <span className="text-xs font-medium text-green-400">
                      Any
                    </span>
                  </div>
                ) : (
                  <div className="flex min-w-0 gap-1 overflow-x-auto">
                    {tradeAd.wantItemsResolved
                      .slice(0, 4)
                      .map((item, index) => (
                        <TooltipProvider key={`${item._id}-${index}`}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="relative size-7 flex-shrink-0 cursor-pointer overflow-hidden rounded border border-white/10 bg-white/5 transition-colors hover:border-white/20">
                                <Image
                                  src={item.thumbnailUrl}
                                  alt={item.name}
                                  fill
                                  className="object-contain p-0.5"
                                  sizes="28px"
                                />
                                {item.quantity > 1 && (
                                  <div className="absolute -right-0.5 -bottom-0.5 rounded-full bg-black/80 px-0.5 text-[7px] leading-none text-white">
                                    {item.quantity}
                                  </div>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <ItemTooltip item={item} />
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    {tradeAd.wantItemsResolved.length > 4 && (
                      <div className="flex size-7 flex-shrink-0 items-center justify-center rounded border border-dashed border-white/20 bg-white/5">
                        <span className="text-[7px] font-medium text-white/60">
                          +{tradeAd.wantItemsResolved.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-white/10 pt-1">
              <div className="flex items-center gap-1 text-xs text-white/60">
                <ArrowRightLeft className="size-3" />
                <span>
                  {tradeAd.haveItemsResolved.length} ↔{" "}
                  {isHearingOffers ? "Any" : tradeAd.wantItemsResolved.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {tradeAd.status === "open" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleChat}
                      className="h-7 border-white/20 bg-white/5 px-2 hover:bg-white/10"
                    >
                      <MessageCircle className="size-3" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleTradeOffer}
                      className="h-7 border-0 bg-gradient-to-r from-blue-500 to-purple-600 px-3 text-white hover:from-blue-600 hover:to-purple-700"
                    >
                      <ArrowRightLeft className="mr-1 size-3" />
                      <span className="text-xs">Trade</span>
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsLiked(!isLiked)}
                  className="size-7 p-1 hover:bg-red-500/10"
                >
                  <Heart
                    className={cn(
                      "size-3 transition-all duration-200",
                      isLiked
                        ? "fill-red-500 text-red-500"
                        : "text-white/60 hover:text-red-400",
                    )}
                  />
                </Button>
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-4 @md:flex">
            <div className="flex min-w-0 flex-shrink-0 items-center gap-3">
              <div className="relative">
                <Avatar className="size-10 ring-1 ring-white/20">
                  <AvatarImage
                    src={tradeAd.creator?.robloxAvatarUrl ?? undefined}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-sm font-medium text-white">
                    {tradeAd.creator?.name?.charAt(0) ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -right-0.5 -bottom-0.5 rounded-full bg-white/10 p-0.5 backdrop-blur-sm">
                  <StatusIcon className="size-2 text-white" />
                </div>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {tradeAd.creator?.name ?? "Unknown User"}
                </p>
                <div className="flex items-center gap-1 text-xs text-white/60">
                  <Clock className="size-2" />
                  {formatTimeAgo(tradeAd._creationTime)}
                </div>
              </div>
            </div>

            <div className="flex min-w-0 items-center gap-2">
              <div className="flex items-center gap-1">
                <Package className="size-3 text-green-400" />
                <span className="text-xs font-medium text-white/80">
                  Offering:
                </span>
              </div>
              <div className="flex gap-1">
                {tradeAd.haveItemsResolved.slice(0, 3).map((item, index) => (
                  <TooltipProvider key={`${item._id}-${index}`}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="relative size-8 cursor-pointer overflow-hidden rounded border border-white/10 bg-white/5 transition-colors hover:border-white/20">
                          <Image
                            src={item.thumbnailUrl}
                            alt={item.name}
                            fill
                            className="object-contain p-1"
                            sizes="32px"
                          />
                          {item.quantity > 1 && (
                            <div className="absolute -right-0.5 -bottom-0.5 rounded-full bg-black/80 px-1 text-[8px] leading-none text-white">
                              {item.quantity}
                            </div>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <ItemTooltip item={item} />
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
                {tradeAd.haveItemsResolved.length > 3 && (
                  <div className="flex size-8 items-center justify-center rounded border border-dashed border-white/20 bg-white/5">
                    <span className="text-[8px] font-medium text-white/60">
                      +{tradeAd.haveItemsResolved.length - 3}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-shrink-0">
              <ArrowRightLeft className="size-4 text-white/60" />
            </div>

            <div className="flex min-w-0 items-center gap-2">
              <div className="flex items-center gap-1">
                <Search className="size-3 text-blue-400" />
                <span className="text-xs font-medium text-white/80">
                  Wanting:
                </span>
              </div>
              {isHearingOffers ? (
                <div className="rounded border border-green-500/30 bg-green-500/20 px-2 py-1">
                  <span className="text-xs font-medium text-green-400">
                    Any Offers
                  </span>
                </div>
              ) : (
                <div className="flex gap-1">
                  {tradeAd.wantItemsResolved.slice(0, 3).map((item, index) => (
                    <TooltipProvider key={`${item._id}-${index}`}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="relative size-8 cursor-pointer overflow-hidden rounded border border-white/10 bg-white/5 transition-colors hover:border-white/20">
                            <Image
                              src={item.thumbnailUrl}
                              alt={item.name}
                              fill
                              className="object-contain p-1"
                              sizes="32px"
                            />
                            {item.quantity > 1 && (
                              <div className="absolute -right-0.5 -bottom-0.5 rounded-full bg-black/80 px-1 text-[8px] leading-none text-white">
                                {item.quantity}
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <ItemTooltip item={item} />
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                  {tradeAd.wantItemsResolved.length > 3 && (
                    <div className="flex size-8 items-center justify-center rounded border border-dashed border-white/20 bg-white/5">
                      <span className="text-[8px] font-medium text-white/60">
                        +{tradeAd.wantItemsResolved.length - 3}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="ml-auto flex flex-shrink-0 items-center gap-2">
              <Badge className={cn("text-xs", statusInfo.color)}>
                {statusInfo.label}
              </Badge>
              {tradeAd.status === "open" && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleChat}
                    className="h-7 border-white/20 bg-white/5 px-2 hover:bg-white/10"
                  >
                    <MessageCircle className="size-3" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleTradeOffer}
                    className="h-7 border-0 bg-gradient-to-r from-blue-500 to-purple-600 px-3 text-white hover:from-blue-600 hover:to-purple-700"
                  >
                    <ArrowRightLeft className="mr-1 size-3" />
                    <span className="text-xs">Trade</span>
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
                className="size-7 p-1 hover:bg-red-500/10"
              >
                <Heart
                  className={cn(
                    "size-3 transition-all duration-200",
                    isLiked
                      ? "fill-red-500 text-red-500"
                      : "text-white/60 hover:text-red-400",
                  )}
                />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid View (Original - unchanged)
  return (
    <Card
      className={cn(
        "group relative overflow-hidden bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/30 hover:shadow-xl hover:shadow-blue-500/20",
        tradeAd.status === "open" && "ring-1 ring-green-500/20",
        className,
      )}
    >
      <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600" />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="relative">
              <Avatar className="size-10 ring-2 ring-white/20">
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
              <p className="truncate font-semibold text-white">
                {tradeAd.creator?.name ?? "Unknown User"}
              </p>
              <div className="flex items-center gap-2 text-xs text-white/60">
                <Clock className="size-3" />
                {formatTimeAgo(tradeAd._creationTime)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={cn("text-xs font-medium", statusInfo.color)}>
              {statusInfo.label}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsLiked(!isLiked)}
              className="size-8 p-0 hover:bg-red-500/10"
            >
              <Heart
                className={cn(
                  "size-4 transition-all duration-200",
                  isLiked
                    ? "scale-110 fill-red-500 text-red-500"
                    : "text-white/60 hover:text-red-400",
                )}
              />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col justify-between gap-2">
        <ItemGrid
          items={tradeAd.haveItemsResolved}
          title="Offering"
          emptyText="No items offered"
          icon={Package}
          accentColor="green"
        />

        <div className="flex justify-center">
          <div className="relative">
            <div className="rounded-full border border-white/10 bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-2">
              <ArrowRightLeft className="size-4 text-white" />
            </div>
            <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-20" />
          </div>
        </div>

        {isHearingOffers ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-white/60" />
              <h4 className="text-sm font-medium text-white/80">Looking For</h4>
            </div>
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
          </div>
        ) : (
          <ItemGrid
            items={tradeAd.wantItemsResolved}
            title="Looking For"
            emptyText="Hearing offers"
            icon={Search}
            accentColor="blue"
          />
        )}

        {tradeAd.notes && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MessageCircle className="size-4 text-white/60" />
              <h4 className="text-sm font-medium text-white/80">Notes</h4>
            </div>
            <div className="relative">
              <p
                className={cn(
                  "rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-white/10 p-3 text-sm text-white/80",
                  !isExpanded && tradeAd.notes.length > 80 && "line-clamp-2",
                )}
              >
                {tradeAd.notes}
              </p>
              {tradeAd.notes.length > 80 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-1 h-6 text-xs text-white/60 hover:text-white/80"
                >
                  {isExpanded ? "Show Less" : "Show More"}
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
      {tradeAd.status === "open" && (
        <CardFooter className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleChat}
            className="flex-1 border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/10"
          >
            <MessageCircle className="mr-2 size-4" />
            Chat
          </Button>
          <Button
            size="sm"
            onClick={handleTradeOffer}
            className="flex-1 border-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 hover:from-blue-600 hover:to-purple-700"
          >
            <ArrowRightLeft className="mr-2 size-4" />
            Trade
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
