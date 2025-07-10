"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { usePaginatedQuery } from "convex/react";
import { useTranslations } from 'next-intl';
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
  Clock,
  Star,
  BarChart3,
  SlidersHorizontal,
  PanelRightOpen,
  PanelRightClose,
} from "lucide-react";
import TradeAdCard from "./trade-ad-card";
import TradeInfoDialog from "~/components/trade/trade-info-dialog";
import CreateTradeAdDialog from "./create-trade-ad-dialog";
import { useDebouncedValue } from "~/hooks/use-debounced-value";
import type { ResolvedTradeAd } from "~convex/tradeAds";

type FilterStatus = "all" | "open" | "closed" | "expired" | "cancelled";
type SortOption = "newest" | "oldest" | "most_items" | "least_items";

export default function TradesClient() {
  const t = useTranslations('trades');
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("open");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [selectedTradeAd, setSelectedTradeAd] = useState<ResolvedTradeAd | null>(null);
  const [tradeInfoDialogOpen, setTradeInfoDialogOpen] = useState(false);

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

  // Memoize query args to prevent unnecessary re-renders
  const queryArgs = useMemo(
    () => ({
      status: filterStatus === "all" ? undefined : filterStatus,
      searchTerm: debouncedSearchTerm || undefined,
      sortBy,
    }),
    [filterStatus, debouncedSearchTerm, sortBy],
  );

  // Use paginated query for trade ads
  const {
    results: tradeAds,
    status: queryStatus,
    isLoading,
    loadMore,
  } = usePaginatedQuery(
    api.tradeAds.searchTradeAds,
    queryArgs,
    {
      initialNumItems: 12,
    },
  );

  // Calculate stats from all available results
  const stats = useMemo(() => {
    if (!tradeAds) return { total: 0, open: 0, closed: 0, filtered: 0 };
    
    return {
      total: tradeAds.length,
      open: tradeAds.filter(ad => ad.status === "open").length,
      closed: tradeAds.filter(ad => ad.status !== "open").length,
      filtered: tradeAds.length,
    };
  }, [tradeAds]);

  const toggleSidebar = useCallback(() => {
    if (isDesktop) {
      setSidebarOpen((prev) => !prev);
    } else {
      setMobileDrawerOpen((prev) => !prev);
    }
  }, [isDesktop]);

  const handleSeeDetails = useCallback((tradeAd: ResolvedTradeAd) => {
    setSelectedTradeAd(tradeAd);
    setTradeInfoDialogOpen(true);
  }, []);

  // Memoize the filters content to prevent re-renders
  const filtersContent = useMemo(() => (
    <div className="p-6 space-y-6 border rounded-xl border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
          <SlidersHorizontal className="text-white size-5" />
        </div>
        <div>
          <h3 className="font-semibold text-white">{t('filtersAndSearch')}</h3>
          <p className="text-sm text-white/60">{t('refineResults')}</p>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-white/80">{t('search')}</label>
        <div className="relative">
          <Search className="absolute -translate-y-1/2 left-3 top-1/2 size-4 text-white/50" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/5 border-white/20 focus:border-white/40"
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-white/80">{t('filters.status')}</label>
        <Select
          value={filterStatus}
          onValueChange={(value: FilterStatus) => setFilterStatus(value)}
        >
          <SelectTrigger className="bg-white/5 border-white/20">
            <SelectValue placeholder={t('filters.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filters.all')}</SelectItem>
            <SelectItem value="open">{t('status.active')}</SelectItem>
            <SelectItem value="closed">{t('status.completed')}</SelectItem>
            <SelectItem value="expired">{t('filters.expired')}</SelectItem>
            <SelectItem value="cancelled">{t('status.cancelled')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-white/80">{t('sortBy')}</label>
        <Select
          value={sortBy}
          onValueChange={(value: SortOption) => setSortBy(value)}
        >
          <SelectTrigger className="bg-white/5 border-white/20">
            <SelectValue placeholder={t('sortBy')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{t('sort.newest')}</SelectItem>
            <SelectItem value="oldest">{t('sort.oldest')}</SelectItem>
            <SelectItem value="most_items">{t('sort.mostItems')}</SelectItem>
            <SelectItem value="least_items">{t('sort.leastItems')}</SelectItem>
          </SelectContent>
        </Select>
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
        {t('resetFilters')}
      </Button>
    </div>
  ), [searchTerm, filterStatus, sortBy, t]);

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
                <p className="text-sm text-white/60">{t('stats.totalAds')}</p>
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
                <p className="text-sm text-white/60">{t('stats.activeAds')}</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 transition-all duration-200 border rounded-xl border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500/20">
                <BarChart3 className="text-purple-400 size-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{stats.filtered}</p>
                <p className="text-sm text-white/60">{t('stats.filteredResults')}</p>
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
                <p className="text-sm text-white/60">{t('stats.completed')}</p>
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
            <span>{t('createAd')}</span>
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
                    {t('hideFilters')}
                  </>
                ) : (
                  <>
                    <PanelRightOpen className="size-4" />
                    {t('showFilters')}
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {sidebarOpen
                  ? t('hideFiltersTooltip')
                  : t('showFiltersTooltip')}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="relative flex gap-6">
          <div
            className={sidebarOpen ? "flex-1" : "w-full"}
          >
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white">
                {t('tradeAdvertisements')}
              </h2>
              <p className="text-sm text-white/70">
                {t('showingResults', { filtered: stats.filtered, total: stats.total })}
              </p>
            </div>

            <div className="@container">
              {queryStatus === "LoadingFirstPage" ? (
                <div className="grid gap-4 @sm:grid-cols-2 @lg:grid-cols-3 @2xl:grid-cols-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="h-64 rounded-xl animate-pulse bg-gradient-to-br from-white/5 to-white/10" />
                  ))}
                </div>
              ) : tradeAds && tradeAds.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="p-8 mb-6 rounded-full bg-gradient-to-br from-white/5 to-white/10">
                    <Search className="size-16 text-white/40" />
                  </div>
                  <h3 className="mb-4 text-2xl font-semibold text-white/80">
                    {t('noTrades')}
                  </h3>
                  <p className="max-w-md mb-8 text-lg text-white/60">
                    {searchTerm || filterStatus !== "open"
                      ? t('adjustFilters')
                      : t('beFirstToCreate')}
                  </p>
                  {!searchTerm && filterStatus === "open" && (
                    <Button
                      size="lg"
                      onClick={() => setShowCreateDialog(true)}
                      className="text-white border-0 shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-blue-500/25"
                    >
                      <Plus className="mr-2 size-5" />
                      {t('createFirstAd')}
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid gap-4 @lg:grid-cols-2 @3xl:grid-cols-3">
                    {tradeAds?.map((ad) => (
                      <TradeAdCard 
                        key={ad._id} 
                        tradeAd={ad} 
                        onSeeDetails={() => handleSeeDetails(ad)}
                      />
                    ))}
                  </div>

                  {queryStatus === "CanLoadMore" && (
                    <div className="flex justify-center mt-8">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => loadMore(12)}
                        disabled={isLoading}
                        className="border-white/20 bg-white/5 hover:bg-white/10"
                      >
                        {isLoading ? (
                          <>
                            <div className="mr-2 size-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                            Loading...
                          </>
                        ) : (
                          "Load More"
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {sidebarOpen && (
            <div className="hidden lg:block">
              <div className="sticky top-24 h-fit">
                <div className="w-80">
                  {filtersContent}
                </div>
              </div>
            </div>
          )}
        </div>

        <Drawer open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
          <DrawerContent className="border-white/10 bg-gradient-to-b from-[#0f051d] to-[#1a0b2e]">
            <DrawerHeader className="sr-only">
              <DrawerTitle>{t('filtersAndSearch')}</DrawerTitle>
            </DrawerHeader>
            <div className="h-full max-h-[80vh] overflow-y-auto">
              <div className="p-4">
                {filtersContent}
              </div>
            </div>
          </DrawerContent>
        </Drawer>

        <CreateTradeAdDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />

        <TradeInfoDialog
          tradeAd={selectedTradeAd}
          open={tradeInfoDialogOpen}
          onOpenChange={setTradeInfoDialogOpen}
        />
      </div>
    </TooltipProvider>
  );
}