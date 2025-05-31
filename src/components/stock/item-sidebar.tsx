/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import { formatNumber } from "~/lib/format-number";
import type { Doc } from "~convex/_generated/dataModel";
import { 
  Calendar, 
  Package,
  X,
  Activity,
  Sparkles
} from "lucide-react";
import Image from 'next/image';
import { memo, useCallback, useMemo } from "react";

interface ItemSidebarProps {
  selectedItem?: Doc<"items">;
  onClose?: () => void;
  className?: string;
  variant?: 'default' | 'minimal';
}

const rarityColors = {
  Common: "bg-gray-500 text-white",
  Uncommon: "bg-green-500 text-white",
  Rare: "bg-blue-500 text-white",
  Epic: "bg-purple-500 text-white",
  Legendary: "bg-orange-500 text-white",
  Mythical: "bg-red-500 text-white",
  Divine: "bg-yellow-500 text-black",
  Prismatic: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
  Limited: "bg-black text-white",
  "N/A": "bg-gray-400 text-white",
};

const demandColors = {
  VeryLow: "text-red-400 bg-red-500/10 border-red-500/20",
  Low: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  Medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  High: "text-green-400 bg-green-500/10 border-green-500/20",
  VeryHigh: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Unknown: "text-white/60 bg-white/5 border-white/10",
};

const ItemSidebar = memo(function ItemSidebar({ selectedItem, onClose, className, variant = 'default' }: ItemSidebarProps) {
  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = "/images/placeholder-item.png";
  }, []);

  const formattedDate = useMemo(() => {
    return selectedItem ? new Date(selectedItem.valueLastUpdatedAt).toLocaleDateString() : '';
  }, [selectedItem?.valueLastUpdatedAt]);

  const formattedSellValue = useMemo(() => {
    return selectedItem ? formatNumber(selectedItem.sellValue) : '';
  }, [selectedItem?.sellValue]);

  const formattedBuyPrice = useMemo(() => {
    return selectedItem ? formatNumber(selectedItem.buyPrice) : '';
  }, [selectedItem?.buyPrice]);

  if (!selectedItem) {
    return (
      <div className={cn("w-80", className)}>
        <Card className={cn(
          "h-fit",
          variant === 'default' ? "" : "border-0 bg-transparent"
        )}>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-[#9747FF]/20 to-[#7E3BFF]/20 rounded-full blur-xl animate-pulse"></div>
                <Package className="relative w-16 h-16 text-white/40" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-white/60">
                No Item Selected
              </h3>
              <p className="max-w-xs text-sm leading-relaxed text-center text-white/50">
                Select an item from the grid to view detailed trading information and market data
              </p>
            </CardContent>
          </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn("w-80", className)}>
        <Card className={cn(
          "h-fit",
          variant === 'default' ? "" : "border-0 bg-transparent"
        )}>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className={cn("text-xs font-medium border-0 shadow-lg cursor-help", rarityColors[selectedItem.rarity])}>
                          {selectedItem.rarity}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Item rarity tier</p>
                      </TooltipContent>
                    </Tooltip>
                    {selectedItem.isMultiHarvest && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge className="text-xs text-[#23c770] bg-[#23c770]/20 border-[#23c770]/30 shadow-lg cursor-help">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Multi-Harvest
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Can be harvested multiple times</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                <CardTitle className="text-xl font-bold leading-tight text-white">
                  {selectedItem.name}
                </CardTitle>
                <p className="mt-1 text-sm text-white/60">{selectedItem.type}</p>
              </div>
              {onClose && variant === 'default' && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClose} 
                  className="w-8 h-8 p-0 transition-all duration-200 text-white/60 hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#9747FF]/20 to-[#7E3BFF]/20 rounded-xl blur-xl"></div>
                <div className="relative flex items-center justify-center w-32 h-32 border bg-white/5 border-white/10 rounded-xl backdrop-blur-sm">
                  <Image
                    src="https://wy3uj47wg4.ufs.sh/f/Wz3VjHcczjKUUZxsHI3Aw0T9bB7uNlLpzXfMVeUYg6djh8GS"
                    alt={selectedItem.name}
                    height={24}
                    width={24}
                    className="object-contain w-24 h-24"
                    onError={handleImageError}
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Kcp/9k="
                  />
                </div>
              </div>
            </div>

            {selectedItem.sellValue > 0 && (
              <>
                <div className="relative p-6 text-center border rounded-xl bg-gradient-to-r from-[#9747FF]/10 to-[#7E3BFF]/10 border-[#9747FF]/20 backdrop-blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#9747FF]/5 to-[#7E3BFF]/5 rounded-xl blur-xl"></div>
                  <div className="relative">
                    <div className="flex items-end justify-center mb-1">
                      <span className="text-3xl font-bold text-[#9747FF]">
                        ${formattedSellValue}
                      </span>
                      <span className="mb-0.5 text-sm text-white/60">/each</span>
                    </div>
                    <div className="text-sm text-white/60">
                      Current Market Value
                    </div>
                    <div className="text-xs text-white/40">
                      without modifiers
                    </div>
                  </div>
                </div>

                <Separator className="bg-white/10" />
              </>
            )}

            {(selectedItem.buyPrice > 0 || 
              selectedItem.demand !== "Unknown" || 
              (selectedItem.shopAmountRange && 
               selectedItem.shopAmountRange.toLowerCase() !== "n/a" && 
               selectedItem.shopAmountRange.toLowerCase() !== "unknown")) && (
              <div>
                <h4 className="flex items-center gap-2 mb-4 font-semibold text-white">
                  <Activity className="w-4 h-4 text-[#9747FF]" />
                  Market Data
                </h4>
                <div className="space-y-3">
                  {selectedItem.buyPrice > 0 && (
                    <div className="flex items-center justify-between p-4 transition-colors duration-200 border rounded-lg bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10">
                      <span className="text-sm text-white/60">Buy Price</span>
                      <div className="text-right">
                        <div className="flex items-end">
                          <span className="font-semibold text-white">
                            ${formattedBuyPrice}
                          </span>
                          <span className="mb-0.5 text-xs text-white/40">/each</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {selectedItem.demand !== "Unknown" && (
                    <div className="flex items-center justify-between p-4 transition-colors duration-200 border rounded-lg bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10">
                      <span className="text-sm text-white/60">Demand Level</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge className={cn("text-xs border shadow-lg cursor-help", demandColors[selectedItem.demand])}>
                            {selectedItem.demand}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Current market demand for this item</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  )}

                  {selectedItem.shopAmountRange && 
                   selectedItem.shopAmountRange.toLowerCase() !== "n/a" && 
                   selectedItem.shopAmountRange.toLowerCase() !== "unknown" && (
                    <div className="flex items-center justify-between p-4 transition-colors duration-200 border rounded-lg bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10">
                      <span className="text-sm text-white/60">Shop Amount</span>
                      <span className="font-semibold text-white">{selectedItem.shopAmountRange}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedItem.description && 
             selectedItem.description.toLowerCase() !== "n/a" && 
             selectedItem.description.toLowerCase() !== "unknown" && (
              <>
                <Separator className="bg-white/10" />
                <div>
                  <h4 className="mb-3 font-semibold text-white">Description</h4>
                  <div className="p-4 border rounded-lg bg-white/5 border-white/10 backdrop-blur-sm">
                    <p className="text-sm leading-relaxed text-white/70">
                      {selectedItem.description}
                    </p>
                  </div>
                </div>
              </>
            )}

            {(selectedItem.sellValue > 0 || 
              selectedItem.buyPrice > 0 || 
              selectedItem.demand !== "Unknown" || 
              ((selectedItem.shopAmountRange ?? "").toLowerCase() !== "n/a" && (selectedItem.shopAmountRange ?? "").toLowerCase() !== "unknown") ||
              (selectedItem.description && 
               selectedItem.description.toLowerCase() !== "n/a" && 
               selectedItem.description.toLowerCase() !== "unknown")) && (
              <Separator className="bg-white/10" />
            )}

            <div className="text-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg bg-white/5 border-white/10 backdrop-blur-sm cursor-help">
                    <Calendar className="w-3 h-3 text-white/50" />
                    <span className="text-xs text-white/50">
                      Updated {formattedDate}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Last time the value was updated</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
});

export default ItemSidebar;