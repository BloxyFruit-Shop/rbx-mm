"use client";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import MultipleSelector from "~/components/ui/multiselect";
import {
  Plus,
  Minus,
  X,
  Sparkles,
  DollarSign,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import type { TradeItem } from "./trade-item-types";
import { availableMutations } from "./trade-item-types";

interface TradeItemCardProps {
  tradeItem: TradeItem;
  index: number;
  onUpdate: (index: number, updates: Partial<TradeItem>) => void;
  onRemove: (index: number) => void;
  compact?: boolean;
}

export function TradeItemCard({
  tradeItem,
  index,
  onUpdate,
  onRemove,
  compact = false,
}: TradeItemCardProps) {
  const [showMutations, setShowMutations] = useState(false);

  return (
    <div className="border rounded-md border-white/10 bg-white/5 backdrop-blur-sm">
      <div className="flex items-center gap-3 p-3">
        <div className="flex items-center flex-1 min-w-0 gap-3">
          <div className="relative flex-shrink-0 overflow-hidden border rounded-md size-12 border-white/20 bg-white/10">
            <Image
              src={tradeItem.item.thumbnailUrl}
              alt={tradeItem.item.name}
              width={48}
              height={48}
              className="object-contain size-full"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-white truncate">
              {tradeItem.item.name}
            </h4>
            <p className="text-sm truncate text-white/60">
              {tradeItem.item.category}
            </p>
          </div>
        </div>

        <div className="flex items-center flex-shrink-0 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="p-0 size-8 border-white/20 bg-white/5 hover:bg-white/10"
            onClick={() =>
              onUpdate(index, {
                quantity: Math.max(1, tradeItem.quantity - 1),
              })
            }
          >
            <Minus className="size-3" />
          </Button>
          <div className="flex items-center justify-center w-12 h-8 text-sm font-medium text-white border rounded border-white/20 bg-white/5">
            {tradeItem.quantity}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="p-0 size-8 border-white/20 bg-white/5 hover:bg-white/10"
            onClick={() =>
              onUpdate(index, {
                quantity: tradeItem.quantity + 1,
              })
            }
          >
            <Plus className="size-3" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(index)}
          className="flex-shrink-0 p-0 text-red-400 size-8 hover:bg-red-500/10 hover:text-red-300"
        >
          <X className="size-3" />
        </Button>
      </div>

      {!compact && (
        <div className="border-t border-white/10">
          <button
            type="button"
            onClick={() => setShowMutations(!showMutations)}
            className="flex items-center justify-between w-full px-3 py-2 text-sm transition-colors text-white/70 hover:text-white hover:bg-white/5"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="size-3" />
              {tradeItem.item.category === "Crop" ? "Price & Mutations" : "Pet Age"}
              {(tradeItem.mutations.length > 0 || (tradeItem.price ?? tradeItem.age)) && (
                <span className="text-xs bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">
                  {tradeItem.mutations.length > 0 && `${tradeItem.mutations.length} mutations`}
                  {tradeItem.mutations.length > 0 && (tradeItem.price ?? tradeItem.age) && ", "}
                  {!!tradeItem.price && `$${tradeItem.price}`}
                  {!!tradeItem.age && `${tradeItem.age} Age`}
                </span>
              )}
            </span>
            <ChevronDown className={`size-3 transition-transform ${showMutations ? 'rotate-180' : ''}`} />
          </button>
          
          {showMutations && (
            <div className="px-3 pb-3 space-y-3">
              {tradeItem.item.category === "Crop" && (
                <>
                <div className="space-y-1">
                  <Label className="text-xs text-white/70">Price (optional)</Label>
                  <div className="flex items-center gap-2">
                    <DollarSign className="size-3 text-white/60" />
                    <Input
                      type="number"
                      placeholder="Enter crop price"
                      value={tradeItem.price ?? ""}
                      onChange={(e) =>
                        onUpdate(index, {
                          price: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        })
                      }
                      className="h-8 text-sm"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                <Label className="text-xs text-white/70">Mutations (optional)</Label>
                <MultipleSelector
                  value={tradeItem.mutations.map((m) => ({
                    value: m,
                    label: m,
                  }))}
                  onChange={(selected) => {
                    onUpdate(index, {
                      mutations: selected.map((s) => s.value),
                    });
                  }}
                  defaultOptions={availableMutations}
                  placeholder="Select mutations..."
                  emptyIndicator={
                    <p className="text-sm text-center text-white/60">
                      No mutations found
                    </p>
                  }
                  badgeClassName="bg-slate-900/80 border-purple-500/30 text-purple-300 text-xs z-50"
                />
              </div>
              </>
              )}

              {tradeItem.item.category === "Pet" && (
                <div className="space-y-1">
                  <Label className="text-xs text-white/70">Pet Age</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="size-3 text-white/60" />
                    <Input
                      type="number"
                      placeholder="Enter age"
                      value={tradeItem.age ?? ""}
                      onChange={(e) =>
                        onUpdate(index, {
                          age: e.target.value
                            ? parseInt(e.target.value)
                            : undefined,
                        })
                      }
                      className="h-8 text-sm"
                      min="0"
                      step="1"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}