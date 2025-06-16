"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "~convex/_generated/api";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
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
  Plus, 
  Search, 
  Users, 
  Package,
  Clock,
  Star,
  BarChart3,
  Grid3X3,
  List,
  SlidersHorizontal,
  PanelRightOpen,
  PanelRightClose,
} from "lucide-react";
import TradeAdCard from "./trade-ad-card";
import CreateTradeAdDialog from "./create-trade-ad-dialog";
import { useDebouncedValue } from "~/hooks/use-debounced-value";

type FilterStatus = "all" | "open" | "closed" | "expired" | "cancelled";
type SortOption = "newest" | "oldest" | "most_items" | "least_items";
type ViewMode = "grid" | "list";

export default function TradesClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("open");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

  // Check if we're on desktop
  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkIsDesktop();
    window.addEventListener("resize", checkIsDesktop);

    return () => window.removeEventListener("resize", checkIsDesktop);
  }, []);

  // Fetch trade ads
  const tradeAds = useQuery(api.tradeAds.listTradeAds, {
    status: filterStatus === "all" ? undefined : filterStatus,
  });

  // Filter and sort trade ads
  const filteredAndSortedAds = useMemo(() => {
    if (!tradeAds) return [];

    let filtered = tradeAds;

    // Apply search filter
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter((ad) => {
        // Search in creator name
        const creatorMatch = ad.creator?.name?.toLowerCase().includes(searchLower);
        
        // Search in item names
        const haveItemsMatch = ad.haveItemsResolved.some((item) =>
          item.name.toLowerCase().includes(searchLower)
        );
        const wantItemsMatch = ad.wantItemsResolved.some((item) =>
          item.name.toLowerCase().includes(searchLower)
        );
        
        // Search in notes
        const notesMatch = ad.notes?.toLowerCase().includes(searchLower);

        return creatorMatch ?? haveItemsMatch ?? wantItemsMatch ?? notesMatch;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b._creationTime - a._creationTime;
        case "oldest":
          return a._creationTime - b._creationTime;
        case "most_items":
          const aTotal = a.haveItemsResolved.length + a.wantItemsResolved.length;
          const bTotal = b.haveItemsResolved.length + b.wantItemsResolved.length;
          return bTotal - aTotal;
        case "least_items":
          const aTotalLeast = a.haveItemsResolved.length + a.wantItemsResolved.length;
          const bTotalLeast = b.haveItemsResolved.length + b.wantItemsResolved.length;
          return aTotalLeast - bTotalLeast;
        default:
          return b._creationTime - a._creationTime;
      }
    });

    return filtered;
  }, [tradeAds, debouncedSearchTerm, sortBy]);

  const stats = useMemo(() => {
    if (!tradeAds) return { total: 0, open: 0, closed: 0 };
    
    return {
      total: tradeAds.length,
      open: tradeAds.filter(ad => ad.status === "open").length,
      closed: tradeAds.filter(ad => ad.status !== "open").length,
    };
  }, [tradeAds]);

  const toggleSidebar = useCallback(() => {
    if (isDesktop) {
      setSidebarOpen((prev) => !prev);
    } else {
      setMobileDrawerOpen((prev) => !prev);
    }
  }, [isDesktop]);

  const FiltersContent = () => (
    <div className="p-6 space-y-6 border rounded-xl border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
          <SlidersHorizontal className="text-white size-5" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Filters & Search</h3>
          <p className="text-sm text-white/60">Refine your results</p>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-white/80">Search</label>
        <div className="relative">
          <Search className="absolute -translate-y-1/2 left-3 top-1/2 size-4 text-white/50" />
          <Input
            placeholder="Search trades, items, users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/5 border-white/20 focus:border-white/40"
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-white/80">Status</label>
        <Select
          value={filterStatus}
          onValueChange={(value: FilterStatus) => setFilterStatus(value)}
        >
          <SelectTrigger className="bg-white/5 border-white/20">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-white/80">Sort By</label>
        <Select
          value={sortBy}
          onValueChange={(value: SortOption) => setSortBy(value)}
        >
          <SelectTrigger className="bg-white/5 border-white/20">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="most_items">Most Items</SelectItem>
            <SelectItem value="least_items">Least Items</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-white/80">View Mode</label>
        <div className="flex items-center p-1 border rounded-lg border-white/20 bg-white/5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("list")}
            className={`flex-1 h-8 ${viewMode === "list" ? "bg-white/10 text-white" : "text-white/60"}`}
          >
            <List className="mr-2 size-3" />
            List
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("grid")}
            className={`flex-1 h-8 ${viewMode === "grid" ? "bg-white/10 text-white" : "text-white/60"}`}
          >
            <Grid3X3 className="mr-2 size-3" />
            Grid
          </Button>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setFilterStatus("open");
          setSortBy("newest");
          setSearchTerm("");
        }}
        className="w-full border-white/20 bg-white/5 hover:bg-white/10"
      >
        Reset Filters
      </Button>
    </div>
  );

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6">
        <div className="hidden grid-cols-4 gap-6 lg:grid">
          <div className="p-6 transition-all duration-200 border rounded-xl border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/20">
                <Users className="text-blue-400 size-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
                <p className="text-sm text-white/60">Total Ads</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 transition-all duration-200 border rounded-xl border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-500/20">
                <Star className="text-green-400 size-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{stats.open}</p>
                <p className="text-sm text-white/60">Active Ads</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 transition-all duration-200 border rounded-xl border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500/20">
                <BarChart3 className="text-purple-400 size-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{filteredAndSortedAds.length}</p>
                <p className="text-sm text-white/60">Filtered Results</p>
              </div>
            </div>
          </div>

          <div className="p-6 transition-all duration-200 border rounded-xl border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-orange-500/20">
                <Clock className="text-orange-400 size-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{stats.closed}</p>
                <p className="text-sm text-white/60">Completed</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row lg:flex-col xl:flex-row">
          <Button
            size="xl"
            variant="gradient"
            gradientType="purple"
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="size-5" />
            <span>Create Trade Ad</span>
          </Button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                onClick={toggleSidebar}
                className="ml-auto"
              >
                {sidebarOpen ? (
                  <>
                    <PanelRightClose className="size-4" />
                    Hide Filters
                  </>
                ) : (
                  <>
                    <PanelRightOpen className="size-4" />
                    Show Filters
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {sidebarOpen
                  ? "Hide filters panel"
                  : "Show filters panel"}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="relative flex gap-6">
          <div
            className={sidebarOpen ? "flex-1" : "w-full"}
          >
            <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Trade Advertisements
                </h2>
                <p className="text-sm text-white/70">
                  Showing {filteredAndSortedAds.length} of {stats.total} trade ads
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Package className="size-4" />
                  {viewMode === "grid" ? "Grid View" : "List View"}
                </div>
                <div className="flex items-center p-1 border rounded-lg border-white/20 bg-white/5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={`px-3 h-8 ${viewMode === "list" ? "bg-white/10 text-white" : "text-white/60"}`}
                  >
                    <List className="mr-2 size-3" />
                    List
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={`px-3 h-8 ${viewMode === "grid" ? "bg-white/10 text-white" : "text-white/60"}`}
                  >
                    <Grid3X3 className="mr-2 size-3" />
                    Grid
                  </Button>
                </div>
              </div>
            </div>

            <div className="@container">
              {!tradeAds ? (
                <div className={`grid gap-4 ${
                  viewMode === "grid" 
                    ? "@md:grid-cols-2 @2xl:grid-cols-3" 
                    : "grid-cols-1"
                }`}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-48 rounded-xl animate-pulse bg-gradient-to-br from-white/5 to-white/10" />
                  ))}
                </div>
              ) : filteredAndSortedAds.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="p-8 mb-6 rounded-full bg-gradient-to-br from-white/5 to-white/10">
                    <Search className="size-16 text-white/40" />
                  </div>
                  <h3 className="mb-4 text-2xl font-semibold text-white/80">
                    No trade ads found
                  </h3>
                  <p className="max-w-md mb-8 text-lg text-white/60">
                    {searchTerm || filterStatus !== "open"
                      ? "Try adjusting your search or filter criteria"
                      : "Be the first to create a trade advertisement!"}
                  </p>
                  {!searchTerm && filterStatus === "open" && (
                    <Button
                      size="lg"
                      onClick={() => setShowCreateDialog(true)}
                      className="text-white border-0 shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-blue-500/25"
                    >
                      <Plus className="mr-2 size-5" />
                      Create First Trade Ad
                    </Button>
                  )}
                </div>
              ) : (
                <div className={`grid gap-4 ${
                  viewMode === "grid" 
                    ? "@md:grid-cols-2 @2xl:grid-cols-3" 
                    : "grid-cols-1"
                }`}>
                  {filteredAndSortedAds.map((ad) => (
                    <TradeAdCard 
                      key={ad._id} 
                      tradeAd={ad} 
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {sidebarOpen && (
            <div className="hidden lg:block">
              <div className="sticky top-24 h-fit">
                <div className="w-80">
                  <FiltersContent />
                </div>
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
                <FiltersContent />
              </div>
            </div>
          </DrawerContent>
        </Drawer>

        <CreateTradeAdDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />
      </div>
    </TooltipProvider>
  );
}