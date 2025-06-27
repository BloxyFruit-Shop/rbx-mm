"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "~convex/_generated/api";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "~/components/ui/popover";
import { Search, Plus } from "lucide-react";
import Image from "next/image";
import type { SearchResultItem, TradeItem } from "./trade-item-types";
import type { ITEM_TYPES } from "~convex/types";

interface ItemSearchPopoverProps {
  items: TradeItem[];
  onAddItem: (item: SearchResultItem) => void;
  placeholder?: string;
  compact?: boolean;
}

export function ItemSearchPopover({
  items,
  onAddItem,
  placeholder = "Search items to add...",
  compact = false,
}: ItemSearchPopoverProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchPopoverOpen, setSearchPopoverOpen] = useState(false);

  // Fetch items for selection
  const allItems = useQuery(api.items.searchItems, {
    gameTag: "GrowAGarden", // Using gameTag for backward compatibility
    searchTerm: searchTerm || undefined,
    category:
      selectedCategory === "all"
        ? undefined
        : (selectedCategory as (typeof ITEM_TYPES)[number]),
    sortBy: "name",
    sortOrder: "asc",
    paginationOpts: { numItems: 50, cursor: null },
  });

  const filteredItems = useMemo(() => {
    if (!allItems?.page) return [];

    // Filter out items already selected
    const selectedItemIds = new Set(items.map((item) => item.itemId));
    // Cast the items to the correct type since we know the API transforms them correctly
    const transformedItems = allItems.page as SearchResultItem[];
    return transformedItems.filter((item) => {
      // Only allow crops and pets
      if (item.category !== "Crop" && item.category !== "Pet") {
        return false;
      }
      return !selectedItemIds.has(item._id);
    });
  }, [allItems?.page, items]);

  return (
    <div className={`flex gap-2 ${compact ? 'flex-col @md:flex-row' : 'flex-col @sm:flex-row'}`}>
      <Popover open={searchPopoverOpen} onOpenChange={setSearchPopoverOpen}>
        <div className="relative flex-1">
          <Search className="absolute -translate-y-1/2 top-1/2 left-3 size-4 text-white/50" />
          <PopoverAnchor asChild>
            <Input
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                // Open popover when user starts typing
                if (e.target.value && !searchPopoverOpen) {
                  setSearchPopoverOpen(true);
                }
                // Close popover when search is cleared
                if (!e.target.value) {
                  setSearchPopoverOpen(false);
                }
              }}
              onFocus={() => {
                // Always open popover when focusing if there's a search term
                if (searchTerm) {
                  setSearchPopoverOpen(true);
                }
              }}
              className="pl-10"
            />
          </PopoverAnchor>
        </div>
        <PopoverContent
          className={`p-0 border-white/20 bg-slate-900/95 ${
            compact 
              ? 'max-h-60 w-80' 
              : 'max-h-80 w-96'
          }`}
          align="start"
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div className="p-2">
            <div
              className={`overflow-y-auto ${compact ? 'max-h-52' : 'max-h-72'}`}
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(255, 255, 255, 0.3) transparent",
              }}
              onWheel={(e) => {
                // Allow wheel scrolling within the container
                e.stopPropagation();
              }}
            >
              {searchTerm ? (
                filteredItems.length === 0 ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="text-center">
                      <Search className="mx-auto mb-2 size-6 text-white/40" />
                      <p className="text-sm text-white/60">No items found</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredItems.slice(0, 10).map((item) => (
                      <button
                        key={item._id}
                        type="button"
                        className="flex items-center w-full gap-3 p-2 text-left transition-all duration-200 border rounded-md cursor-pointer border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        onClick={() => {
                          onAddItem(item);
                          setSearchTerm(""); // Clear search after adding
                          setSearchPopoverOpen(false); // Close popover
                        }}
                      >
                        <div className="flex-shrink-0 overflow-hidden border rounded size-8 border-white/20 bg-white/10">
                          <Image
                            src={item.thumbnailUrl}
                            alt={item.name}
                            width={32}
                            height={32}
                            className="object-contain size-full"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-white/60">
                            {item.category}
                          </p>
                        </div>
                        <Plus className="flex-shrink-0 size-4 text-white/60" />
                      </button>
                    ))}
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center py-6">
                  <div className="text-center">
                    <Search className="mx-auto mb-2 size-6 text-white/40" />
                    <p className="text-sm text-white/60">
                      Start typing to search items
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
        <SelectTrigger className={`${compact ? 'w-full @md:w-32' : 'w-full @sm:w-40'}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="Crop">Crops</SelectItem>
          <SelectItem value="Pet">Pets</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}