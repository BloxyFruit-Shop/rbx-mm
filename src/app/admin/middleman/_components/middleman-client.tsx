"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery } from "convex/react";
import { useTranslations } from 'next-intl';
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
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Ban,
  SlidersHorizontal,
  PanelRightOpen,
  PanelRightClose,
  TrendingUp,
  Timer,
  UserCheck,
} from "lucide-react";
import MiddlemanCallCard from "./middleman-call-card";
import { useDebouncedValue } from "~/hooks/use-debounced-value";
import { getSession } from "~/lib/auth-client";
import type { Id } from "~convex/_generated/dataModel";

type FilterStatus = "all" | "pending" | "accepted" | "declined" | "cancelled";
type SortOption = "newest" | "oldest" | "priority";

export default function MiddlemanClient() {
  const t = useTranslations('middleman.panel');
  const [session, setSession] = useState<{ sessionId: Id<"session"> } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortBy, setSortBy] = useState<SortOption>("priority");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

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

  // Fetch priority middleman calls (calls specifically for this user)
  const priorityCalls = useQuery(
    api.middlemanCalls.getPriorityMiddlemanCalls,
    session ? { session: session.sessionId } : "skip"
  );

  // Fetch general middleman calls
  const generalCalls = useQuery(
    api.middlemanCalls.getGeneralMiddlemanCalls,
    session ? { session: session.sessionId } : "skip"
  );

  // Fetch all middleman calls for admin view
  const allCalls = useQuery(
    api.middlemanCalls.adminGetAllMiddlemanCalls,
    session ? {
      status: filterStatus === "all" ? undefined : filterStatus,
      sortBy,
      session: session.sessionId,
    } : "skip"
  );

  // Fetch statistics
  const stats = useQuery(
    api.middlemanCalls.adminGetMiddlemanCallStats,
    session ? { session: session.sessionId } : "skip"
  );

  // Filter priority calls
  const filteredPriorityCalls = useMemo(() => {
    if (!priorityCalls) return [];

    let filtered = priorityCalls;

    // Apply search filter
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter((call) => {
        const creatorMatch = call.creator?.name?.toLowerCase().includes(searchLower);
        const reasonMatch = call.reason?.toLowerCase().includes(searchLower);
        const waitTimeMatch = call.estimatedWaitTime?.toLowerCase().includes(searchLower);
        return creatorMatch ?? reasonMatch ?? waitTimeMatch;
      });
    }

    return filtered;
  }, [priorityCalls, debouncedSearchTerm]);

  // Filter general calls
  const filteredGeneralCalls = useMemo(() => {
    if (!generalCalls) return [];

    let filtered = generalCalls;

    // Apply search filter
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter((call) => {
        const creatorMatch = call.creator?.name?.toLowerCase().includes(searchLower);
        const reasonMatch = call.reason?.toLowerCase().includes(searchLower);
        const waitTimeMatch = call.estimatedWaitTime?.toLowerCase().includes(searchLower);
        return creatorMatch ?? reasonMatch ?? waitTimeMatch;
      });
    }

    return filtered;
  }, [generalCalls, debouncedSearchTerm]);

  // Filter all calls for admin view
  const filteredAllCalls = useMemo(() => {
    if (!allCalls) return [];

    let filtered = allCalls;

    // Apply search filter
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter((call) => {
        const creatorMatch = call.creator?.name?.toLowerCase().includes(searchLower);
        const reasonMatch = call.reason?.toLowerCase().includes(searchLower);
        const waitTimeMatch = call.estimatedWaitTime?.toLowerCase().includes(searchLower);
        return creatorMatch ?? reasonMatch ?? waitTimeMatch;
      });
    }

    return filtered;
  }, [allCalls, debouncedSearchTerm]);

  // Determine which calls to show based on filter status
  const shouldShowSeparateSections = filterStatus === "all" || filterStatus === "pending";
  const totalCalls = shouldShowSeparateSections 
    ? (filteredPriorityCalls.length + filteredGeneralCalls.length)
    : filteredAllCalls.length;

  const toggleSidebar = useCallback(() => {
    if (isDesktop) {
      setSidebarOpen((prev) => !prev);
    } else {
      setMobileDrawerOpen((prev) => !prev);
    }
  }, [isDesktop]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "from-yellow-500/20 to-orange-500/20";
      case "accepted":
        return "from-green-500/20 to-emerald-500/20";
      case "declined":
        return "from-red-500/20 to-pink-500/20";
      case "cancelled":
        return "from-gray-500/20 to-slate-500/20";
      default:
        return "from-blue-500/20 to-purple-500/20";
    }
  };

  const FiltersContent = () => (
    <div className="p-4 space-y-4 border sm:p-6 sm:space-y-6 rounded-xl border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
          <SlidersHorizontal className="text-white size-4 sm:size-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white sm:text-base">{t('filtersAndSearch')}</h3>
          <p className="text-xs sm:text-sm text-white/60">{t('refineResults')}</p>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-medium sm:text-sm text-white/80">{t('search')}</label>
        <div className="relative">
          <Search className="absolute -translate-y-1/2 left-3 top-1/2 size-4 text-white/50" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-sm bg-white/5 border-white/20 focus:border-white/40"
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-medium sm:text-sm text-white/80">{t('statusFilter')}</label>
        <Select
          value={filterStatus}
          onValueChange={(value: FilterStatus) => setFilterStatus(value)}
        >
          <SelectTrigger className="bg-white/5 border-white/20">
            <SelectValue placeholder={t('statusFilter')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('status.all')}</SelectItem>
            <SelectItem value="pending">{t('status.pending')}</SelectItem>
            <SelectItem value="accepted">{t('status.accepted')}</SelectItem>
            <SelectItem value="declined">{t('status.declined')}</SelectItem>
            <SelectItem value="cancelled">{t('status.cancelled')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-medium sm:text-sm text-white/80">{t('sortBy')}</label>
        <Select
          value={sortBy}
          onValueChange={(value: SortOption) => setSortBy(value)}
        >
          <SelectTrigger className="bg-white/5 border-white/20">
            <SelectValue placeholder={t('sortBy')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="priority">{t('sort.priority')}</SelectItem>
            <SelectItem value="newest">{t('sort.newest')}</SelectItem>
            <SelectItem value="oldest">{t('sort.oldest')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setFilterStatus("all");
          setSortBy("priority");
          setSearchTerm("");
        }}
        className="w-full text-xs border-white/20 bg-white/5 hover:bg-white/10 sm:text-sm"
      >
        {t('resetFilters')}
      </Button>
    </div>
  );

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-12 text-center sm:py-20">
        <div className="p-6 mb-4 rounded-full sm:p-8 sm:mb-6 bg-gradient-to-br from-white/5 to-white/10">
          <Users className="size-12 sm:size-16 text-white/40" />
        </div>
        <h3 className="mb-3 text-xl font-semibold sm:mb-4 sm:text-2xl text-white/80">
          {t('authRequired')}
        </h3>
        <p className="max-w-md text-sm sm:text-lg text-white/60">
          {t('loginRequired')}
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full gap-4 overflow-hidden sm:gap-6">
        <div className="hidden grid-cols-4 gap-4 xl:grid lg:gap-6">
          <div className={`p-4 lg:p-6 transition-all duration-200 border rounded-xl border-white/10 bg-gradient-to-br ${getStatusColor("pending")} backdrop-blur-sm hover:from-white/10 hover:to-white/15`}>
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="p-2 lg:p-3 rounded-xl bg-yellow-500/20">
                <AlertTriangle className="text-yellow-400 size-5 lg:size-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white lg:text-3xl">{stats?.pending ?? 0}</p>
                <p className="text-xs lg:text-sm text-white/60">{t('stats.pendingCalls')}</p>
              </div>
            </div>
          </div>
          
          <div className={`p-4 lg:p-6 transition-all duration-200 border rounded-xl border-white/10 bg-gradient-to-br ${getStatusColor("accepted")} backdrop-blur-sm hover:from-white/10 hover:to-white/15`}>
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="p-2 lg:p-3 rounded-xl bg-green-500/20">
                <CheckCircle className="text-green-400 size-5 lg:size-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white lg:text-3xl">{stats?.accepted ?? 0}</p>
                <p className="text-xs lg:text-sm text-white/60">{t('stats.activeCases')}</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 transition-all duration-200 border lg:p-6 rounded-xl border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="p-2 lg:p-3 rounded-xl bg-blue-500/20">
                <TrendingUp className="text-blue-400 size-5 lg:size-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white lg:text-3xl">{stats?.todayCount ?? 0}</p>
                <p className="text-xs lg:text-sm text-white/60">{t('stats.todaysCalls')}</p>
              </div>
            </div>
          </div>

          <div className="p-4 transition-all duration-200 border lg:p-6 rounded-xl border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="p-2 lg:p-3 rounded-xl bg-purple-500/20">
                <Timer className="text-purple-400 size-5 lg:size-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white lg:text-3xl">{stats?.avgResponseTime ?? 0}m</p>
                <p className="text-xs lg:text-sm text-white/60">{t('stats.avgResponse')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:hidden">
          <div className={`p-3 sm:p-4 border rounded-lg sm:rounded-xl border-white/10 bg-gradient-to-br ${getStatusColor("pending")} backdrop-blur-sm`}>
            <div className="flex items-center gap-2 sm:gap-3">
              <AlertTriangle className="text-yellow-400 size-4 sm:size-5" />
              <div>
                <p className="text-lg font-bold text-white sm:text-xl">{stats?.pending ?? 0}</p>
                <p className="text-xs text-white/60">{t('status.pending')}</p>
              </div>
            </div>
          </div>
          <div className={`p-3 sm:p-4 border rounded-lg sm:rounded-xl border-white/10 bg-gradient-to-br ${getStatusColor("accepted")} backdrop-blur-sm`}>
            <div className="flex items-center gap-2 sm:gap-3">
              <CheckCircle className="text-green-400 size-4 sm:size-5" />
              <div>
                <p className="text-lg font-bold text-white sm:text-xl">{stats?.accepted ?? 0}</p>
                <p className="text-xs text-white/60">{t('status.accepted')}</p>
              </div>
            </div>
          </div>
          <div className="p-3 border rounded-lg sm:p-4 sm:rounded-xl border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <TrendingUp className="text-blue-400 size-4 sm:size-5" />
              <div>
                <p className="text-lg font-bold text-white sm:text-xl">{stats?.todayCount ?? 0}</p>
                <p className="text-xs text-white/60">Today</p>
              </div>
            </div>
          </div>
          <div className="p-3 border rounded-lg sm:p-4 sm:rounded-xl border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <Timer className="text-purple-400 size-4 sm:size-5" />
              <div>
                <p className="text-lg font-bold text-white sm:text-xl">{stats?.avgResponseTime ?? 0}m</p>
                <p className="text-xs text-white/60">Avg Response</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSidebar}
            className="text-xs sm:ml-auto sm:text-sm"
          >
            {sidebarOpen ? (
              <>
                <PanelRightClose className="mr-1 size-3 sm:size-4 sm:mr-2" />
                <span className="hidden sm:inline">{t('hideFilters')}</span>
                <span className="sm:hidden">Hide</span>
              </>
            ) : (
              <>
                <PanelRightOpen className="mr-1 size-3 sm:size-4 sm:mr-2" />
                <span className="hidden sm:inline">{t('showFilters')}</span>
                <span className="sm:hidden">Filters</span>
              </>
            )}
          </Button>
        </div>

        <div className="relative flex flex-1 gap-4 overflow-hidden lg:gap-6">
          <div className={`${sidebarOpen ? "flex-1" : "w-full"} overflow-hidden`}>
            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg font-semibold text-white sm:text-xl">
                {t('middlemanCalls')}
              </h2>
              <p className="text-xs sm:text-sm text-white/70">
                {t('showingResults', { filtered: totalCalls, total: stats?.total ?? 0 })}
              </p>
            </div>

            <div className="h-[calc(100%-80px)] overflow-y-auto space-y-6">
              {shouldShowSeparateSections ? (
                <>
                  {filteredPriorityCalls.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                          <UserCheck className="text-purple-400 size-4 sm:size-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-white sm:text-lg">
                            Priority Calls for You
                          </h3>
                          <p className="text-xs sm:text-sm text-white/60">
                            {filteredPriorityCalls.length} call{filteredPriorityCalls.length !== 1 ? 's' : ''} specifically requesting you
                          </p>
                        </div>
                        <Badge className="ml-auto text-purple-400 bg-purple-500/20 border-purple-500/30">
                          {filteredPriorityCalls.length}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                        {filteredPriorityCalls.map((call) => (
                          <MiddlemanCallCard 
                            key={call._id} 
                            call={call}
                            session={session}
                            isPriority={true}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                        <Users className="text-blue-400 size-4 sm:size-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-white sm:text-lg">
                          General Calls
                        </h3>
                        <p className="text-xs sm:text-sm text-white/60">
                          {filteredGeneralCalls.length} call{filteredGeneralCalls.length !== 1 ? 's' : ''} available for any middleman
                        </p>
                      </div>
                      <Badge className="ml-auto text-blue-400 bg-blue-500/20 border-blue-500/30">
                        {filteredGeneralCalls.length}
                      </Badge>
                    </div>
                    
                    {!priorityCalls || !generalCalls ? (
                      <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="h-48 rounded-lg sm:h-64 sm:rounded-xl animate-pulse bg-gradient-to-br from-white/5 to-white/10" />
                        ))}
                      </div>
                    ) : filteredGeneralCalls.length === 0 ? (
                      <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
                        <div className="p-4 mb-3 rounded-full bg-gradient-to-br from-white/5 to-white/10">
                          <Search className="size-8 text-white/40" />
                        </div>
                        <h4 className="mb-2 text-lg font-semibold text-white/80">
                          No general calls
                        </h4>
                        <p className="max-w-md text-sm text-white/60">
                          {searchTerm || filterStatus !== "all"
                            ? "Try adjusting your search or filters"
                            : "No general middleman calls at the moment"}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3 pb-4 sm:gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                        {filteredGeneralCalls.map((call) => (
                          <MiddlemanCallCard 
                            key={call._id} 
                            call={call}
                            session={session}
                            isPriority={false}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                // Show all calls when filtering by specific status
                <>
                  {!allCalls ? (
                    <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-48 rounded-lg sm:h-64 sm:rounded-xl animate-pulse bg-gradient-to-br from-white/5 to-white/10" />
                      ))}
                    </div>
                  ) : filteredAllCalls.length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-4 py-12 text-center sm:py-20">
                      <div className="p-6 mb-4 rounded-full sm:p-8 sm:mb-6 bg-gradient-to-br from-white/5 to-white/10">
                        <Search className="size-12 sm:size-16 text-white/40" />
                      </div>
                      <h3 className="mb-3 text-xl font-semibold sm:mb-4 sm:text-2xl text-white/80">
                        {t('noCalls')}
                      </h3>
                      <p className="max-w-md mb-6 text-sm sm:mb-8 sm:text-lg text-white/60">
                        {searchTerm || filterStatus === "accepted" || filterStatus === "declined" || filterStatus === "cancelled"
                          ? t('adjustFilters')
                          : t('noCallsYet')}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 pb-4 sm:gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                      {filteredAllCalls.map((call) => (
                        <MiddlemanCallCard 
                          key={call._id} 
                          call={call}
                          session={session}
                          isPriority={call.desiredMiddleman !== undefined}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {sidebarOpen && (
            <div className="flex-shrink-0 hidden lg:block w-72 xl:w-80">
              <div className="sticky top-0 h-full overflow-y-auto">
                <FiltersContent />
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
                <FiltersContent />
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </TooltipProvider>
  );
}