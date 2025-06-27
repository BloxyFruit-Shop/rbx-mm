"use client";

import { Badge } from "~/components/ui/badge";
import { Hash, DollarSign, Calendar } from "lucide-react";
import { cn } from "~/lib/utils";
import Image from "next/image";
import type { ResolvedTradeAd } from "~convex/tradeAds";

interface TradeItemListProps {
  items: ResolvedTradeAd["haveItemsResolved"];
  title: string;
  emptyText: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor?: "blue" | "green" | "purple";
}

export function TradeItemList({
  items,
  title,
  emptyText,
  icon: Icon,
  accentColor = "blue",
}: TradeItemListProps) {
  const accentColors = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    green: "text-green-400 bg-green-500/10 border-green-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  };

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/5">
            <Icon className="size-5 text-white/60" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="text-sm text-white/60">0 items</p>
          </div>
        </div>
        <div className="flex items-center justify-center p-8 border border-dashed rounded-xl border-white/20 bg-white/5">
          <p className="text-white/50">{emptyText}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/5">
            <Icon className="size-5 text-white/60" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="text-sm text-white/60">{items.length} items</p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn("text-sm", accentColors[accentColor])}
        >
          {items.length}
        </Badge>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={`${item._id}-${index}`}
            className="flex items-center gap-4 p-4 transition-all duration-200 border rounded-xl border-white/10 bg-gradient-to-br from-white/5 to-white/10 hover:border-white/20 hover:from-white/10 hover:to-white/15"
          >
            <div className="relative flex-shrink-0 overflow-hidden border rounded-lg size-16 border-white/10 bg-gradient-to-br from-white/5 to-white/10">
              <Image
                src={item.thumbnailUrl}
                alt={item.name}
                fill
                className="object-contain p-2"
                sizes="64px"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white truncate">{item.name}</h4>
                  
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {item.quantity > 1 && (
                      <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white rounded-full bg-blue-500/20">
                        <Hash className="size-3" />
                        <span>Quantity: {item.quantity}</span>
                      </div>
                    )}
                    
                    {item.price && (
                      <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white rounded-full bg-green-500/20">
                        <DollarSign className="size-3" />
                        <span>{item.price}</span>
                      </div>
                    )}
                    
                    {item.age && (
                      <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white rounded-full bg-blue-500/20">
                        <Calendar className="size-3" />
                        <span>{item.age} age</span>
                      </div>
                    )}
                  </div>

                  {item.mutations && item.mutations.length > 0 && (
                    <div className="mt-2">
                      <p className="mb-1 text-xs font-medium text-purple-300">Mutations:</p>
                      <div className="flex flex-wrap gap-1">
                        {item.mutations.map((mutation, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 text-xs font-medium text-purple-300 border rounded bg-purple-500/20 border-purple-500/30"
                          >
                            {mutation}
                          </span>
                        ))}
                      </div>
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