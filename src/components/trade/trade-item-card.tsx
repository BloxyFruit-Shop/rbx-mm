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
  Weight,
  Hash,
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
    <div className="border border-white/10 rounded-md bg-white/5 backdrop-blur-sm">
      {/* Main item row */}
      <div className="flex items-center gap-3 p-3">
        {/* Item thumbnail and info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative size-12 rounded-md overflow-hidden border border-white/20 bg-white/10 flex-shrink-0">
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
            <p className="text-sm text-white/60 truncate">
              {tradeItem.item.category}
            </p>
          </div>
        </div>

        {/* Quantity controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="size-8 p-0 border-white/20 bg-white/5 hover:bg-white/10"
            onClick={() =>
              onUpdate(index, {
                quantity: Math.max(1, tradeItem.quantity - 1),
              })
            }
          >
            <Minus className="size-3" />
          </Button>
          <div className="w-12 h-8 flex items-center justify-center text-sm font-medium text-white border border-white/20 bg-white/5 rounded">
            {tradeItem.quantity}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="size-8 p-0 border-white/20 bg-white/5 hover:bg-white/10"
            onClick={() =>
              onUpdate(index, {
                quantity: tradeItem.quantity + 1,
              })
            }
          >
            <Plus className="size-3" />
          </Button>
        </div>

        {/* Remove button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(index)}
          className="size-8 p-0 text-red-400 hover:bg-red-500/10 hover:text-red-300 flex-shrink-0"
        >
          <X className="size-3" />
        </Button>
      </div>

      {/* Expandable details section */}
      {!compact && (
        <div className="border-t border-white/10">
          <button
            type="button"
            onClick={() => setShowMutations(!showMutations)}
            className="w-full px-3 py-2 flex items-center justify-between text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="size-3" />
              Mutations & Details
              {(tradeItem.mutations.length > 0 || tradeItem.weightKg) && (
                <span className="text-xs bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">
                  {tradeItem.mutations.length > 0 && `${tradeItem.mutations.length} mutations`}
                  {tradeItem.mutations.length > 0 && tradeItem.weightKg && ", "}
                  {tradeItem.weightKg && `${tradeItem.weightKg}kg`}
                </span>
              )}
            </span>
            <ChevronDown className={`size-3 transition-transform ${showMutations ? 'rotate-180' : ''}`} />
          </button>
          
          {showMutations && (
            <div className="px-3 pb-3 space-y-3">
              {/* Weight input */}
              <div className="space-y-1">
                <Label className="text-xs text-white/70">Weight (optional)</Label>
                <div className="flex items-center gap-2">
                  <Weight className="size-3 text-white/60" />
                  <Input
                    type="number"
                    placeholder="Enter weight in kg"
                    value={tradeItem.weightKg ?? ""}
                    onChange={(e) =>
                      onUpdate(index, {
                        weightKg: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      })
                    }
                    className="h-8 text-sm"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>

              {/* Mutations selector */}
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
                  badgeClassName="bg-purple-500/20 border-purple-500/30 text-purple-300 text-xs"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}