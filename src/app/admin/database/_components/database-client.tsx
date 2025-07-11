"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "~convex/_generated/api";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { 
  Search, 
  Package,
  Plus,
  Filter,
  SlidersHorizontal,
  PanelRightOpen,
  PanelRightClose,
  Database,
  Gamepad2,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import ItemCard from "./item-card";
import CreateItemDialog from "./create-item-dialog";
import { useDebouncedValue } from "~/hooks/use-debounced-value";
import { getSession } from "~/lib/auth-client";
import type { Id } from "~convex/_generated/dataModel";

type SortOption = "name" | "sellValue" | "buyPrice" | "rarity";
type SortOrder = "asc" | "desc";

export default function DatabaseClient() {
  const [session, setSession] = useState<{ sessionId: Id<"session"> } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGame, setSelectedGame] = useState<Id<"games"> | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedRarity, setSelectedRarity] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("rarity");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

  // Get session on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const sessionData = await getSession();
        if (sessionData.data?.session?.id) {
          setSession({ sessionId: sessionData.data.session.id as Id<"session"> });
        }
      } catch (error) {
        console.error("Failed to load session:", error);
      }
    };

    loadSession().catch(() => console.log("failed to load session"));
  }, []);

  // Check if we're on desktop
  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkIsDesktop();
    window.addEventListener("resize", checkIsDesktop);

    return () => window.removeEventListener("resize", checkIsDesktop);
  }, []);

  // Fetch games
  const games = useQuery(api.games.listGames);

  // Fetch items based on selected game
  const items = useQuery(
    api.items.searchItems,
    selectedGame === "all" || !selectedGame || !games?.length
      ? "skip"
      : {
          gameId: selectedGame,
          searchTerm: debouncedSearchTerm || undefined,
          category: selectedCategory === "all" ? undefined : selectedCategory as any,
          rarity: selectedRarity === "all" ? undefined : selectedRarity as any,
          sortBy,
          sortOrder,
          paginationOpts: { numItems: 50, cursor: null },
        }
  );

  // Get all items for "all games" view
  const allItems = useQuery(
    api.items.listItems,
    selectedGame === "all" ? {} : "skip"
  );

  // Set default game when games load
  useEffect(() => {
    if (games && games.length > 0 && selectedGame === "all") {
      setSelectedGame(games[0]._id);
    }
  }, [games, selectedGame]);

  // Filter items for "all games" view
  const filteredAllItems = useMemo(() => {
    if (!allItems || selectedGame !== "all") return [];

    let filtered = allItems;

    // Apply search filter
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    // Apply rarity filter
    if (selectedRarity !== "all") {
      filtered = filtered.filter((item) => item.rarity === selectedRarity);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "sellValue":
          aValue = a.sellValue ?? 0;
          bValue = b.sellValue ?? 0;
          break;
        case "buyPrice":
          aValue = a.buyPrice ?? 0;
          bValue = b.buyPrice ?? 0;
          break;
        case "rarity":
        default:
          aValue = a.rarityOrder;
          bValue = b.rarityOrder;
          break;
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [allItems, selectedGame, debouncedSearchTerm, selectedCategory, selectedRarity, sortBy, sortOrder]);

  // Get current items to display
  const currentItems = selectedGame === "all" ? filteredAllItems : (items?.page ?? []);

  // Calculate stats
  const stats = useMemo(() => {
    const totalItems = selectedGame === "all" ? (allItems?.length ?? 0) : (currentItems.length);
    const categories = new Set(currentItems.map(item => item.category));
    const rarities = new Set(currentItems.map(item => item.rarity));
    const avgSellValue = currentItems.length > 0 
      ? currentItems.reduce((sum, item) => sum + (item.sellValue ?? 0), 0) / currentItems.length 
      : 0;

    return {
      total: totalItems,
      categories: categories.size,
      rarities: rarities.size,
      avgSellValue: Math.round(avgSellValue),
    };
  }, [currentItems, allItems, selectedGame]);

  const toggleSidebar = useCallback(() => {
    if (isDesktop) {
      setSidebarOpen((prev) => !prev);
    } else {
      setMobileDrawerOpen((prev) => !prev);
    }
  }, [isDesktop]);

  // Memoize the filters content to prevent re-renders
  const filtersContent = useMemo(() => (
    <div className="p-4 space-y-4 border sm:p-6 sm:space-y-6 rounded-xl border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
          <SlidersHorizontal className="text-white size-4 sm:size-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white sm:text-base">Filters & Search</h3>
          <p className="text-xs sm:text-sm text-white/60">Refine your results</p>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-medium sm:text-sm text-white/80">Search Items</label>
        <div className="relative">
          <Search className="absolute -translate-y-1/2 left-3 top-1/2 size-4 text-white/50" />
          <Input
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-sm bg-white/5 border-white/20 focus:border-white/40"
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-medium sm:text-sm text-white/80">Game</label>
        <Select
          value={selectedGame === "all" ? "all" : selectedGame}
          onValueChange={(value) => setSelectedGame(value === "all" ? "all" : value as Id<"games">)}
        >
          <SelectTrigger className="bg-white/5 border-white/20">
            <SelectValue placeholder="Select game" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Games</SelectItem>
            {games?.map((game) => (
              <SelectItem key={game._id} value={game._id}>
                {game.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-medium sm:text-sm text-white/80">Category</label>
        <Select
          value={selectedCategory}
          onValueChange={setSelectedCategory}
        >
          <SelectTrigger className="bg-white/5 border-white/20">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Crop">Crop</SelectItem>
            <SelectItem value="Pet">Pet</SelectItem>
            <SelectItem value="Egg">Egg</SelectItem>
            <SelectItem value="Gear">Gear</SelectItem>
            <SelectItem value="Crate">Crate</SelectItem>
            <SelectItem value="Cosmetic">Cosmetic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-medium sm:text-sm text-white/80">Rarity</label>
        <Select
          value={selectedRarity}
          onValueChange={setSelectedRarity}
        >
          <SelectTrigger className="bg-white/5 border-white/20">
            <SelectValue placeholder="Select rarity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Rarities</SelectItem>
            <SelectItem value="Common">Common</SelectItem>
            <SelectItem value="Uncommon">Uncommon</SelectItem>
            <SelectItem value="Rare">Rare</SelectItem>
            <SelectItem value="Epic">Epic</SelectItem>
            <SelectItem value="Legendary">Legendary</SelectItem>
            <SelectItem value="Mythical">Mythical</SelectItem>
            <SelectItem value="Divine">Divine</SelectItem>
            <SelectItem value="Prismatic">Prismatic</SelectItem>
            <SelectItem value="N/A">N/A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-medium sm:text-sm text-white/80">Sort By</label>
        <div className="grid grid-cols-2 gap-2">
          <Select
            value={sortBy}
            onValueChange={(value: SortOption) => setSortBy(value)}
          >
            <SelectTrigger className="bg-white/5 border-white/20">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="rarity">Rarity</SelectItem>
              <SelectItem value="sellValue">Sell Value</SelectItem>
              <SelectItem value="buyPrice">Buy Price</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={sortOrder}
            onValueChange={(value: SortOrder) => setSortOrder(value)}
          >
            <SelectTrigger className="bg-white/5 border-white/20">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setSelectedCategory("all");
          setSelectedRarity("all");
          setSortBy("rarity");
          setSortOrder("asc");
          setSearchTerm("");
        }}
        className="w-full text-xs border-white/20 bg-white/5 hover:bg-white/10 sm:text-sm"
      >
        Reset Filters
      </Button>
    </div>
  ), [searchTerm, selectedGame, selectedCategory, selectedRarity, sortBy, sortOrder, games]);

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-12 text-center sm:py-20">
        <div className="p-6 mb-4 rounded-full sm:p-8 sm:mb-6 bg-gradient-to-br from-white/5 to-white/10">
          <Database className="size-12 sm:size-16 text-white/40" />
        </div>
        <h3 className="mb-3 text-xl font-semibold sm:mb-4 sm:text-2xl text-white/80">
          Authentication Required
        </h3>
        <p className="max-w-md text-sm sm:text-lg text-white/60">
          Please log in to access the database management panel.
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full gap-4 overflow-hidden sm:gap-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <div className="p-3 border rounded-lg sm:p-4 sm:rounded-xl border-white/10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <Package className="text-blue-400 size-4 sm:size-5" />
              <div>
                <p className="text-lg font-bold text-white sm:text-xl">{stats.total}</p>
                <p className="text-xs text-white/60">Total Items</p>
              </div>
            </div>
          </div>
          <div className="p-3 border rounded-lg sm:p-4 sm:rounded-xl border-white/10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <Filter className="text-green-400 size-4 sm:size-5" />
              <div>
                <p className="text-lg font-bold text-white sm:text-xl">{stats.categories}</p>
                <p className="text-xs text-white/60">Categories</p>
              </div>
            </div>
          </div>
          <div className="p-3 border rounded-lg sm:p-4 sm:rounded-xl border-white/10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <BarChart3 className="text-purple-400 size-4 sm:size-5" />
              <div>
                <p className="text-lg font-bold text-white sm:text-xl">{stats.rarities}</p>
                <p className="text-xs text-white/60">Rarities</p>
              </div>
            </div>
          </div>
          <div className="p-3 border rounded-lg sm:p-4 sm:rounded-xl border-white/10 bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <TrendingUp className="text-orange-400 size-4 sm:size-5" />
              <div>
                <p className="text-lg font-bold text-white sm:text-xl">{stats.avgSellValue}</p>
                <p className="text-xs text-white/60">Avg Sell Value</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-gradient-to-r from-[#9747FF] to-[#7E3BFF] hover:from-[#8A42E6] hover:to-[#7139E6] text-white border-0"
            >
              <Plus className="mr-1 size-3 sm:size-4 sm:mr-2" />
              <span className="text-xs sm:text-sm">Create Item</span>
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSidebar}
            className="text-xs sm:text-sm"
          >
            {sidebarOpen ? (
              <>
                <PanelRightClose className="mr-1 size-3 sm:size-4 sm:mr-2" />
                <span className="hidden sm:inline">Hide Filters</span>
                <span className="sm:hidden">Hide</span>
              </>
            ) : (
              <>
                <PanelRightOpen className="mr-1 size-3 sm:size-4 sm:mr-2" />
                <span className="hidden sm:inline">Show Filters</span>
                <span className="sm:hidden">Filters</span>
              </>
            )}
          </Button>
        </div>

        <div className="relative flex flex-1 gap-4 overflow-hidden lg:gap-6">
          <div className={`${sidebarOpen ? "flex-1" : "w-full"} overflow-hidden`}>
            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg font-semibold text-white sm:text-xl">
                Items Database
              </h2>
              <p className="text-xs sm:text-sm text-white/70">
                Showing {currentItems.length} items
                {selectedGame !== "all" && games && (
                  <span> from {games.find(g => g._id === selectedGame)?.name}</span>
                )}
              </p>
            </div>

            <div className="h-[calc(100%-80px)] overflow-y-auto">
              {!currentItems.length ? (
                <div className="flex flex-col items-center justify-center px-4 py-12 text-center sm:py-20">
                  <div className="p-6 mb-4 rounded-full sm:p-8 sm:mb-6 bg-gradient-to-br from-white/5 to-white/10">
                    <Search className="size-12 sm:size-16 text-white/40" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold sm:mb-4 sm:text-2xl text-white/80">
                    No Items Found
                  </h3>
                  <p className="max-w-md mb-6 text-sm sm:mb-8 sm:text-lg text-white/60">
                    {searchTerm || selectedCategory !== "all" || selectedRarity !== "all"
                      ? "Try adjusting your search or filters"
                      : "No items in the database yet"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 pb-4 sm:gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {currentItems.map((item) => (
                    <ItemCard 
                      key={item._id} 
                      item={item}
                      session={session}
                      games={games ?? []}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {sidebarOpen && (
            <div className="flex-shrink-0 hidden lg:block w-72 xl:w-80">
              <div className="sticky top-0 h-full overflow-y-auto">
                {filtersContent}
              </div>
            </div>
          )}
        </div>

        <Drawer open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
          <DrawerContent className="border-white/10 bg-gradient-to-b from-[#0f051d] to-[#1a0b2e]">
            <DrawerHeader className="sr-only">
              <DrawerTitle>Filters & Search</DrawerTitle>
            </DrawerHeader>
            <div className="h-full max-h-[80vh] overflow-y-auto">
              <div className="p-4">
                {filtersContent}
              </div>
            </div>
          </DrawerContent>
        </Drawer>

        <CreateItemDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          session={session}
          games={games ?? []}
        />
      </div>
    </TooltipProvider>
  );
}