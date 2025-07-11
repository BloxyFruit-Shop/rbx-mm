"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "~convex/_generated/api";
import { useTranslations } from 'next-intl';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { 
  MessageSquare,
  Package,
  Users,
  Search,
  Filter,
  TrendingUp,
  AlertTriangle,
  Home,
  ChevronDown,
} from "lucide-react";
import { DataTable } from "~/components/ui/data-table";
import { useColumns } from "./columns";
import { getSession } from "~/lib/auth-client";
import type { Id } from "~convex/_generated/dataModel";
import Link from "next/link";

export default function ChatsClient() {
  const t = useTranslations('admin.chats');
  const columns = useColumns();
  const [session, setSession] = useState<{ sessionId: Id<"session"> } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [chatTypeFilter, setChatTypeFilter] = useState<string>("all");
  const [tradeStatusFilter, setTradeStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("lastMessageAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [hasError, setHasError] = useState(false);
  const [errorType, setErrorType] = useState<"unauthorized" | "serverError" | null>(null);

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

  // Only try to fetch data if we have a session and no error
  const shouldSkip = !session || hasError;

  // Fetch chats
  const chats = useQuery(
    api.chats.getAllChatsForAdmin,
    shouldSkip ? "skip" : {
      searchTerm: searchTerm || undefined,
      chatType: chatTypeFilter === "all" ? undefined : chatTypeFilter as any,
      tradeStatus: tradeStatusFilter === "all" ? undefined : tradeStatusFilter as any,
      sortBy: sortBy as any,
      sortOrder,
      paginationOpts: { numItems: 50, cursor: null },
      session: session.sessionId,
    }
  );

  // Fetch chat statistics
  const stats = useQuery(
    api.chats.getChatStatsForAdmin,
    shouldSkip ? "skip" : { session: session.sessionId }
  );

  // Monitor for errors in the query results
  useEffect(() => {
    // Check if either query returned an error
    if (chats instanceof Error) {
      console.error("Chats query error:", chats);
      setHasError(true);
      if (chats.message.includes("Unauthorized") || chats.message.includes("permission")) {
        setErrorType("unauthorized");
      } else {
        setErrorType("serverError");
      }
    } else if (stats instanceof Error) {
      console.error("Stats query error:", stats);
      setHasError(true);
      if (stats.message.includes("Unauthorized") || stats.message.includes("permission")) {
        setErrorType("unauthorized");
      } else {
        setErrorType("serverError");
      }
    }
  }, [chats, stats]);

  // Global error handler for uncaught errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.error?.message?.includes("Unauthorized") || event.error?.message?.includes("permission")) {
        console.error("Caught unauthorized error:", event.error);
        setHasError(true);
        setErrorType("unauthorized");
        event.preventDefault(); // Prevent the error from propagating
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes("Unauthorized") || event.reason?.message?.includes("permission")) {
        console.error("Caught unauthorized promise rejection:", event.reason);
        setHasError(true);
        setErrorType("unauthorized");
        event.preventDefault(); // Prevent the error from propagating
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-12 text-center sm:py-20">
        <div className="p-6 mb-4 rounded-full sm:p-8 sm:mb-6 bg-gradient-to-br from-white/5 to-white/10">
          <MessageSquare className="size-12 sm:size-16 text-white/40" />
        </div>
        <h3 className="mb-3 text-xl font-semibold sm:mb-4 sm:text-2xl text-white/80">
          {t('loginRequired')}
        </h3>
        <p className="max-w-md text-sm sm:text-lg text-white/60">
          {t('loginDescription')}
        </p>
      </div>
    );
  }

  // Handle authorization errors
  if (errorType === "unauthorized") {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-12 text-center sm:py-20">
        <div className="p-6 mb-4 rounded-full sm:p-8 sm:mb-6 bg-gradient-to-br from-red-500/20 to-orange-500/20">
          <AlertTriangle className="text-red-400 size-12 sm:size-16" />
        </div>
        <h3 className="mb-3 text-xl font-semibold sm:mb-4 sm:text-2xl text-white/80">
          {t('accessDenied')}
        </h3>
        <p className="max-w-md mb-6 text-sm sm:text-lg text-white/60">
          {t('accessDeniedDescription')}
        </p>
        <p className="max-w-md mb-6 text-xs sm:text-sm text-white/50">
          {t('adminOrMiddlemanRequired')}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/admin">
            <Button variant="outline" className="border-white/20 bg-white/5 hover:bg-white/10">
              <Home className="w-4 h-4 mr-2" />
              {t('backToAdminDashboard')}
            </Button>
          </Link>
        </div>
        <p className="mt-6 text-xs text-white/40">
          {t('contactAdminError')}
        </p>
      </div>
    );
  }

  // Handle other server errors
  if (errorType === "serverError") {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-12 text-center sm:py-20">
        <div className="p-6 mb-4 rounded-full sm:p-8 sm:mb-6 bg-gradient-to-br from-red-500/20 to-orange-500/20">
          <AlertTriangle className="text-red-400 size-12 sm:size-16" />
        </div>
        <h3 className="mb-3 text-xl font-semibold sm:mb-4 sm:text-2xl text-white/80">
          {t('loadingFailed')}
        </h3>
        <p className="max-w-md mb-6 text-sm sm:text-lg text-white/60">
          {t('loadingFailedDescription')}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="border-white/20 bg-white/5 hover:bg-white/10"
          >
            {t('retry')}
          </Button>
          <Link href="/admin">
            <Button variant="outline" className="border-white/20 bg-white/5 hover:bg-white/10">
              <Home className="w-4 h-4 mr-2" />
              {t('goBack')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen overflow-hidden">
        <div className="flex-shrink-0 p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-2 gap-3 mb-4 sm:gap-4 lg:grid-cols-4 sm:mb-6">
            <div className="p-3 border rounded-lg sm:p-4 sm:rounded-xl border-white/10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-2 sm:gap-3">
                <MessageSquare className="text-blue-400 size-4 sm:size-5" />
                <div>
                  <p className="text-lg font-bold text-white sm:text-xl">{stats?.total ?? 0}</p>
                  <p className="text-xs text-white/60">{t('stats.totalChats')}</p>
                </div>
              </div>
            </div>
            
            <div className="p-3 border rounded-lg sm:p-4 sm:rounded-xl border-white/10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-2 sm:gap-3">
                <Package className="text-green-400 size-4 sm:size-5" />
                <div>
                  <p className="text-lg font-bold text-white sm:text-xl">{stats?.tradeChats ?? 0}</p>
                  <p className="text-xs text-white/60">{t('stats.tradeChats')}</p>
                </div>
              </div>
            </div>

            <div className="p-3 border rounded-lg sm:p-4 sm:rounded-xl border-white/10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-2 sm:gap-3">
                <Users className="text-purple-400 size-4 sm:size-5" />
                <div>
                  <p className="text-lg font-bold text-white sm:text-xl">{stats?.directMessages ?? 0}</p>
                  <p className="text-xs text-white/60">{t('stats.directMessages')}</p>
                </div>
              </div>
            </div>

            <div className="p-3 border rounded-lg sm:p-4 sm:rounded-xl border-white/10 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-2 sm:gap-3">
                <TrendingUp className="text-yellow-400 size-4 sm:size-5" />
                <div>
                  <p className="text-lg font-bold text-white sm:text-xl">{stats?.activeTradeChats ?? 0}</p>
                  <p className="text-xs text-white/60">{t('stats.activeTrades')}</p>
                </div>
              </div>
            </div>
          </div>

          <Collapsible defaultOpen={false} className="mb-4 sm:mb-6">
            <div className="border rounded-xl border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center justify-between w-full p-4 py-8 text-left rounded hover:bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                      <Filter className="text-white size-4 sm:size-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white sm:text-base">{t('filtersAndSearch')}</h3>
                      <p className="text-xs sm:text-sm text-white/60">{t('filtersDescription')}</p>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-white/60 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="px-4 pb-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <div className="space-y-2">
                    <label className="text-xs font-medium sm:text-sm text-white/80">{t('searchParticipants')}</label>
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

                  <div className="space-y-2">
                    <label className="text-xs font-medium sm:text-sm text-white/80">{t('chatType')}</label>
                    <Select value={chatTypeFilter} onValueChange={setChatTypeFilter}>
                      <SelectTrigger className="bg-white/5 border-white/20">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('types.allTypes')}</SelectItem>
                        <SelectItem value="trade">{t('types.trade')}</SelectItem>
                        <SelectItem value="direct_message">{t('types.directMessage')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium sm:text-sm text-white/80">{t('tradeStatus')}</label>
                    <Select value={tradeStatusFilter} onValueChange={setTradeStatusFilter}>
                      <SelectTrigger className="bg-white/5 border-white/20">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('statuses.allStatuses')}</SelectItem>
                        <SelectItem value="none">{t('statuses.noTrade')}</SelectItem>
                        <SelectItem value="pending">{t('statuses.pending')}</SelectItem>
                        <SelectItem value="accepted">{t('statuses.accepted')}</SelectItem>
                        <SelectItem value="waiting_for_middleman">{t('statuses.waitingForMiddleman')}</SelectItem>
                        <SelectItem value="completed">{t('statuses.completed')}</SelectItem>
                        <SelectItem value="cancelled">{t('statuses.cancelled')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium sm:text-sm text-white/80">{t('sortBy')}</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="bg-white/5 border-white/20">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lastMessageAt">{t('sort.lastActivity')}</SelectItem>
                        <SelectItem value="createdAt">{t('sort.createdDate')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium sm:text-sm text-white/80">{t('order')}</label>
                    <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
                      <SelectTrigger className="bg-white/5 border-white/20">
                        <SelectValue placeholder="Order" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">{t('sort.newestFirst')}</SelectItem>
                        <SelectItem value="asc">{t('sort.oldestFirst')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setChatTypeFilter("all");
                      setTradeStatusFilter("all");
                      setSortBy("lastMessageAt");
                      setSortOrder("desc");
                    }}
                    className="text-xs border-white/20 bg-white/5 hover:bg-white/10 sm:text-sm"
                  >
                    {t('resetFilters')}
                  </Button>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg font-semibold text-white sm:text-xl">
              {t('chatDatabase')}
            </h2>
            <p className="text-xs sm:text-sm text-white/70">
              {t('showingChats', { count: chats?.page?.length ?? 0, total: chats?.totalCount ?? 0 })}
            </p>
          </div>
        </div>

        <div className="flex-1 min-h-0 px-4 pb-4 sm:px-6 lg:px-8 sm:pb-6 lg:pb-8">
          <div className="h-full overflow-auto">
            {chats?.page ? (
              <DataTable 
                columns={columns} 
                data={chats.page} 
                searchKey="participants"
                searchPlaceholder={t('searchPlaceholder')}
              />
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full animate-pulse bg-gradient-to-br from-white/5 to-white/10" />
                  <p className="text-white/60">{t('loadingChats')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}