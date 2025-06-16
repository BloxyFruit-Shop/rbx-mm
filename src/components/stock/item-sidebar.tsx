/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import { Calendar, Package, X } from "lucide-react";
import Image from "next/image";
import { memo, useCallback, useMemo } from "react";
import type { AttributedItem } from "~convex/types";
import SidebarDetails from "./sidebar-details";

interface ItemSidebarProps {
  selectedItem?: AttributedItem;
  onClose?: () => void;
  className?: string;
  variant?: "default" | "minimal";
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


const ItemSidebar = memo(function ItemSidebar({
  selectedItem,
  onClose,
  className,
  variant = "default",
}: ItemSidebarProps) {
  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const handleImageError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const target = e.target as HTMLImageElement;
      target.src = "/images/placeholder-item.png";
    },
    [],
  );

  const formattedDate = useMemo(() => {
    return selectedItem
      ? new Date(selectedItem._creationTime).toLocaleDateString()
      : "";
  }, [selectedItem?._creationTime]);

  if (!selectedItem) {
    return (
      <div className={cn("w-80", className)}>
        <Card
          className={cn(
            "h-fit",
            variant === "default" ? "" : "border-0 bg-transparent",
          )}
        >
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="relative mb-6">
              <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-[#9747FF]/20 to-[#7E3BFF]/20 blur-xl"></div>
              <Package className="relative w-16 h-16 text-white/40" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-white/60">
              No Item Selected
            </h3>
            <p className="max-w-xs text-sm leading-relaxed text-center text-white/50">
              Select an item from the grid to view detailed trading information
              and market data
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn("w-80", className)}>
        <Card
          className={cn(
            "h-fit",
            variant === "default" ? "" : "border-0 bg-transparent",
          )}
        >
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        className={cn(
                          "cursor-help border-0 text-xs font-medium shadow-lg",
                          rarityColors[
                            selectedItem.attributes?.details.rarity ?? "Common"
                          ],
                        )}
                      >
                        {selectedItem.attributes?.details.rarity}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Item rarity tier</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <CardTitle className="text-xl font-bold leading-tight text-white">
                  {selectedItem.name}
                </CardTitle>
                <p className="mt-1 text-sm text-white/60">
                  {selectedItem.attributes?.details.type.category}
                </p>
              </div>
              {onClose && variant === "default" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="w-8 h-8 p-0 transition-all duration-200 text-white/60 hover:bg-white/10 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#9747FF]/20 to-[#7E3BFF]/20 blur-xl"></div>
                <div className="relative flex items-center justify-center w-32 h-32 border rounded-xl border-white/10 bg-white/5">
                  <Image
                    src={selectedItem.thumbnailUrl}
                    alt={selectedItem.name}
                    height={24}
                    width={24}
                    className="object-contain w-24 h-24"
                    onError={handleImageError}
                    loading="lazy"
                    placeholder="blur"
                  />
                </div>
              </div>
            </div>

            {selectedItem.attributes?.details?.type && (
              <SidebarDetails
                gameTag="GrowAGarden"
                category={selectedItem.attributes.details.type.category}
                type={selectedItem.attributes.details.type}
                demand={selectedItem.demand}
              />
            )}

            {selectedItem.description &&
              selectedItem.description.toLowerCase() !== "n/a" &&
              selectedItem.description.toLowerCase() !== "unknown" && (
                <>
                  <Separator className="bg-white/10" />
                  <div>
                    <h4 className="mb-3 font-semibold text-white">
                      Description
                    </h4>
                    <div className="p-4 border rounded-lg border-white/10 bg-white/5">
                      <p className="text-sm leading-relaxed text-white/70">
                        {selectedItem.description}
                      </p>
                    </div>
                  </div>
                </>
              )}

            {(selectedItem.attributes?.details?.type ?? selectedItem.description) && (
              <Separator className="bg-white/10" />
            )}

            <div className="text-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg cursor-help border-white/10 bg-white/5">
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
