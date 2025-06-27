"use client";

import { Badge } from "~/components/ui/badge";
import { Package } from "lucide-react";
import { TradeItemCard } from "./trade-item-card";
import { ItemSearchPopover } from "./item-search-popover";
import type { SearchResultItem, TradeItem } from "./trade-item-types";

interface TradeItemSelectorProps {
  title: string;
  items: TradeItem[];
  onAddItem: (item: SearchResultItem) => void;
  onRemoveItem: (index: number) => void;
  onUpdateItem: (index: number, updates: Partial<TradeItem>) => void;
  placeholder: string;
  compact?: boolean;
  maxHeight?: string;
}

export function TradeItemSelector({
  title,
  items,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  placeholder,
  compact = false,
  maxHeight,
}: TradeItemSelectorProps) {
  return (
    <div className="space-y-4 @container">
      <div className="flex flex-col gap-3 @sm:flex-row @sm:items-center @sm:justify-between">
        <div className="flex items-center gap-3">
          <h3 className={`font-semibold text-white ${compact ? 'text-base' : 'text-lg'}`}>
            {title}
          </h3>
          <Badge variant="default" className={compact ? 'text-xs' : ''}>
            {items.length} items
          </Badge>
        </div>
      </div>

      {items.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-white/80 font-medium">
              {items.length} item{items.length !== 1 ? 's' : ''} selected
            </div>
            {items.length > 2 && (
              <div className="text-xs text-white/60">
                Scroll to see more
              </div>
            )}
          </div>
          <div 
            className={`space-y-3 ${maxHeight ? 'overflow-y-auto' : ''} ${
              items.length > 2 ? 'max-h-[280px] overflow-y-auto' : ''
            } scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20`}
            style={maxHeight ? { maxHeight } : undefined}
          >
            {items.map((tradeItem, index) => (
              <TradeItemCard
                key={`${tradeItem.itemId}-${index}`}
                tradeItem={tradeItem}
                index={index}
                onUpdate={onUpdateItem}
                onRemove={onRemoveItem}
                compact={compact}
              />
            ))}
          </div>
        </div>
      )}

      <ItemSearchPopover
        items={items}
        onAddItem={onAddItem}
        placeholder="Search items to add..."
        compact={compact}
      />

      {items.length === 0 && (
        <div className={`flex flex-col items-center justify-center text-center border border-dashed rounded-lg border-white/20 bg-white/5 ${
          compact ? 'p-6' : 'p-8'
        }`}>
          <Package className={`${compact ? 'size-8' : 'size-10'} text-white/40 mb-3`} />
          <p className="text-white/60 font-medium">{placeholder}</p>
          <p className={`mt-1 text-white/40 ${compact ? 'text-xs' : 'text-sm'}`}>
            Search and select items above to add them
          </p>
        </div>
      )}
    </div>
  );
}