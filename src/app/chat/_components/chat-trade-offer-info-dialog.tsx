"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  ArrowRightLeft,
  Package,
  Search,
  Hash,
  Sparkles,
  DollarSign,
  Clock,
  X,
} from "lucide-react";
import { cn } from "~/lib/utils";
import Image from "next/image";

interface ChatTradeOfferInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tradeOffer: {
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
  };
  senderName: string;
}

const rarityColors = {
  common: "border-gray-500/30",
  uncommon: "border-green-500/30",
  rare: "border-blue-500/30",
  epic: "border-purple-500/30",
  legendary: "border-yellow-500/30",
  divine: "border-yellow-500/30",
};

const mutationColors = [
  "bg-red-500/20 text-red-400",
  "bg-blue-500/20 text-blue-400", 
  "bg-green-500/20 text-green-400",
  "bg-purple-500/20 text-purple-400",
  "bg-yellow-500/20 text-yellow-400",
  "bg-pink-500/20 text-pink-400",
  "bg-indigo-500/20 text-indigo-400",
  "bg-orange-500/20 text-orange-400",
];

function DetailedItemGrid({ 
  items, 
  title, 
  icon: Icon, 
  accentColor = "blue" 
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
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon className={cn("size-4", accentColors[accentColor])} />
        <h4 className="text-sm font-medium text-white/80">{title}</h4>
        <Badge variant="outline" className="h-4 px-1 text-xs">
          {items.length}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className={cn(
              "relative rounded-lg border bg-white/5 p-4 transition-all hover:bg-white/10",
              rarityColors[item.rarity.toLowerCase() as keyof typeof rarityColors] || rarityColors.common
            )}
          >
            <div className="flex gap-3">
              <div className="relative flex-shrink-0 w-16 h-16">
                <Image
                  src={item.thumbnailUrl}
                  alt={item.name}
                  fill
                  className="object-contain rounded-lg"
                  sizes="64px"
                />
                {item.quantity > 1 && (
                  <div className="absolute -right-1 -bottom-1 flex items-center gap-0.5 rounded-full bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
                    <Hash className="size-2" />
                    {item.quantity}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h5 className="font-medium text-white truncate">{item.name}</h5>
                <p className="text-xs text-white/60 capitalize">{item.rarity}</p>
                
                {item.mutations && item.mutations.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.mutations.map((mutation, mutIndex) => (
                      <Badge
                        key={mutIndex}
                        variant="outline"
                        className={cn(
                          "text-xs px-1.5 py-0.5 h-auto",
                          mutationColors[mutIndex % mutationColors.length]
                        )}
                      >
                        <Sparkles className="mr-1 size-2" />
                        {mutation}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-2">
                  {item.price && (
                    <div className="flex items-center gap-1 text-xs text-green-400">
                      <DollarSign className="size-3" />
                      <span>{item.price}</span>
                    </div>
                  )}
                  {item.age && (
                    <div className="flex items-center gap-1 text-xs text-blue-400">
                      <Clock className="size-3" />
                      <span>{item.age} Age</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ChatTradeOfferInfoDialog({
  open,
  onOpenChange,
  tradeOffer,
  senderName,
}: ChatTradeOfferInfoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-4xl max-h-[90vh] flex flex-col bg-gradient-to-b from-[#0f051d] to-[#1a0b2e] border-white/10 p-0 overflow-y-auto">
        <div className="flex-shrink-0 p-6 pb-0">
          <DialogHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20">
                  <ArrowRightLeft className="text-white size-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-white">
                    Trade Offer Details
                  </DialogTitle>
                  <p className="text-sm text-white/60">
                    From {senderName}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <X className="size-4" />
              </Button>
            </div>
          </DialogHeader>
        </div>

        <div className="flex-1 min-h-0 p-6 overflow-y-auto">
          <div className="space-y-8">
            <DetailedItemGrid
              items={tradeOffer.offering}
              title="Items Offered"
              icon={Package}
              accentColor="green"
            />

            <div className="flex justify-center">
              <div className="relative">
                <div className="p-3 border rounded-full border-white/10 bg-gradient-to-r from-blue-500/20 to-purple-500/20">
                  <ArrowRightLeft className="text-white size-6" />
                </div>
                <div className="absolute inset-0 rounded-full animate-pulse bg-gradient-to-r from-blue-500 to-purple-600 opacity-20" />
              </div>
            </div>

            {tradeOffer.requesting.length > 0 ? (
              <DetailedItemGrid
                items={tradeOffer.requesting}
                title="Items Requested"
                icon={Search}
                accentColor="blue"
              />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Search className="size-4 text-blue-400" />
                  <h4 className="text-sm font-medium text-white/80">Items Requested</h4>
                  <Badge variant="outline" className="h-4 px-1 text-xs">
                    0
                  </Badge>
                </div>
                <div className="flex items-center justify-center p-8 border border-dashed rounded-xl border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                  <div className="text-center">
                    <Search className="mx-auto mb-2 text-blue-400 size-8" />
                    <p className="text-blue-400">No specific items requested</p>
                    <p className="text-sm text-blue-400/70">Open to any offers</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 p-6 pt-0">
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/10"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}