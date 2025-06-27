/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
"use client";

import { useState, memo, useEffect, useRef, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import ItemInfo from "./item-info";
import type { Doc } from "~convex/_generated/dataModel";
import {
  Search,
  Filter,
  Grid3X3,
  LayoutList,
  TrendingUp,
  ArrowUpDown,
  Loader2,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { api } from "~convex/_generated/api";
import { usePaginatedQuery } from "convex/react";
import { useDebouncedValue } from "~/hooks/use-debounced-value";
import { ITEM_RARITIES } from "~convex/types";
import ItemInfoSkeleton from "./item-info-skeleton";

interface ItemGridProps {
  onItemSelect?: (item: Doc<"items">) => void;
  className?: string;
}

type ItemType = "All" | "Crop" | "Egg" | "Pet" | "Gear";
type SortOption = "name" | "sellValue" | "buyPrice" | "rarity";
type ViewMode = "grid" | "list";

const itemTypes: { value: ItemType; label: string }[] = [
  { value: "All", label: "All" },
  { value: "Crop", label: "Crops" },
  { value: "Egg", label: "Eggs" },
  { value: "Pet", label: "Pets" },
  { value: "Gear", label: "Gear" },
];

const ITEMS_PER_PAGE = 24;

const ItemGrid = memo(function ItemGrid({
  onItemSelect,
  className,
}: ItemGridProps) {
  const [activeTab, setActiveTab] = useState<ItemType>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("rarity");
  const [selectedRarity, setSelectedRarity] = useState<
    "all" | (typeof ITEM_RARITIES)[number]
  >("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortAscending, setSortAscending] = useState(true);

  const observerTarget = useRef<HTMLDivElement>(null);

  // Debounce search term to avoid too many queries
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

  // Memoize query args to prevent unnecessary re-renders
  const queryArgs = useMemo(
    () => ({
      gameTag: "GrowAGarden" as const,
      searchTerm: debouncedSearchTerm ?? undefined,
      category: activeTab === "All" ? undefined : activeTab,
      rarity: selectedRarity !== "all" ? selectedRarity : undefined,
      sortBy,
      sortOrder: (sortAscending ? "asc" : "desc") as "asc" | "desc",
    }),
    [debouncedSearchTerm, activeTab, selectedRarity, sortBy, sortAscending],
  );

  const { results, isLoading, loadMore, status } = usePaginatedQuery(
    api.items.searchItems,
    queryArgs,
    {
      initialNumItems: ITEMS_PER_PAGE,
    },
  );

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!(status === "CanLoadMore") || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target?.isIntersecting) {
          loadMore(10);
        }
      },
      {
        threshold: 0.1, // Lower threshold for better detection
        rootMargin: "200px", // Larger margin to trigger earlier
      },
    );

    // Use a timeout to ensure DOM is ready
    let observedElement: HTMLDivElement | null = null;
    const timeoutId = setTimeout(() => {
      observedElement = observerTarget.current;
      if (observedElement && status === "CanLoadMore" && !isLoading) {
        observer.observe(observedElement);
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (observedElement) {
        observer.unobserve(observedElement);
      }
      observer.disconnect();
    };
  }, [status, activeTab, loadMore, isLoading]);

  // Fallback scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (!(status === "CanLoadMore") || isLoading || !observerTarget.current)
        return;

      const target = observerTarget.current;
      const rect = target.getBoundingClientRect();
      const isVisible = rect.top <= window.innerHeight && rect.bottom >= 0;

      if (isVisible) {
        loadMore(10);
      }
    };

    // Debounce scroll events
    let timeoutId: NodeJS.Timeout;
    const debouncedScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 100);
    };

    window.addEventListener("scroll", debouncedScroll);

    return () => {
      window.removeEventListener("scroll", debouncedScroll);
      clearTimeout(timeoutId);
    };
  }, [status, isLoading, loadMore]);

  return (
    <TooltipProvider>
      <div className={className}>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as ItemType)}
          className="w-full"
        >
          <div className="flex flex-col mb-6 space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
                  <TrendingUp className="size-6 text-[#2663ff]" />
                  Item Values
                </h1>
                <div className="items-center hidden gap-2 lg:flex">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className="h-9"
                      >
                        <Grid3X3 className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Grid view</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className="h-9"
                      >
                        <LayoutList className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>List view</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <Search className="absolute transform -translate-y-1/2 top-1/2 left-3 size-4 text-white/50" />
                      <Input
                        placeholder="Search items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-10 pl-10 sm:w-64"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Search items by name or description</p>
                  </TooltipContent>
                </Tooltip>

                <div className="flex gap-2">
                  <Select
                    value={sortBy}
                    onValueChange={(value: SortOption) => setSortBy(value)}
                  >
                    <SelectTrigger className="w-full h-10 sm:w-40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="sellValue">Value</SelectItem>
                      <SelectItem value="buyPrice">Buy Price</SelectItem>
                      <SelectItem value="rarity">Rarity</SelectItem>
                    </SelectContent>
                  </Select>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSortAscending(!sortAscending)}
                        className="size-10"
                      >
                        <ArrowUpDown className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {sortAscending ? "Sort descending" : "Sort ascending"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Select
                      value={selectedRarity}
                      onValueChange={(value: string) =>
                        setSelectedRarity(
                          value as "all" | (typeof ITEM_RARITIES)[number],
                        )
                      }
                    >
                      <SelectTrigger className="w-full h-10 sm:w-40">
                        <SelectValue placeholder="Rarity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Rarities</SelectItem>
                        {ITEM_RARITIES.map((rarity) => (
                          <SelectItem key={rarity} value={rarity}>
                            {rarity}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Filter by rarity</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            <TabsList className="grid w-full h-12 grid-cols-5">
              {itemTypes.map((type) => (
                <TabsTrigger
                  key={type.value}
                  value={type.value}
                  className="size-full"
                >
                  <span className="font-medium">{type.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {itemTypes.map((type) => {
            // Only render the content for the active tab
            if (type.value !== activeTab) return null;

            return (
              <TabsContent
                key={`${type.value}-${activeTab}`}
                value={type.value}
                className="mt-6"
              >
                {status === "LoadingFirstPage" ? (
                  <div
                    className={cn(
                      "grid gap-4",
                      viewMode === "grid"
                        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6"
                        : "grid-cols-1",
                    )}
                  >
                    {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                      <ItemInfoSkeleton key={index} />
                    ))}
                  </div>
                ) : results.length === 0 && !isLoading ? (
                  <div className="py-16 text-center">
                    <Filter className="mx-auto mb-4 size-12 text-white/40" />
                    <h3 className="mb-2 text-lg font-semibold text-white/60">
                      No items found
                    </h3>
                    <p className="text-white/50">
                      Try adjusting your search or filter criteria
                    </p>
                  </div>
                ) : (
                  <>
                    <div
                      className={cn(
                        "grid gap-4",
                        viewMode === "grid"
                          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6"
                          : "grid-cols-1",
                      )}
                    >
                      {results.map((item) => (
                        <ItemInfo
                          key={item._id}
                          item={item}
                          onSelect={() => onItemSelect?.(item)}
                        />
                      ))}
                    </div>

                    {isLoading && (
                      <div className="flex flex-col items-center justify-center gap-2 py-8">
                        <Loader2 className="size-8 animate-spin text-white/60" />
                        <p className="text-sm text-white/40">
                          Loading more items...
                        </p>
                      </div>
                    )}

                    {status === "CanLoadMore" && !isLoading && (
                      <div
                        ref={observerTarget}
                        className="flex flex-col items-center justify-center gap-4 py-8"
                      >
                        <p className="text-sm text-white/40">Scroll for more</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadMore(10)}
                          className="border-white/20 text-white/60 hover:bg-white/10"
                        >
                          Load More Items
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </TooltipProvider>
  );
});

export default ItemGrid;