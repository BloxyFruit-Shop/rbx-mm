"use client";

import { useState, useEffect } from "react";
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
  Users,
  Shield,
  UserCheck,
  UserX,
  Search,
  Filter,
  TrendingUp,
  Clock,
  Ban,
  Crown,
  AlertTriangle,
  Home,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { DataTable } from "~/components/ui/data-table";
import { columns } from "./columns";
import { getSession } from "~/lib/auth-client";
import { useTranslations } from "next-intl";
import Link from "next/link";
import type { Id } from "~convex/_generated/dataModel";

export default function UsersClient() {
  const t = useTranslations();
  const [session, setSession] = useState<{ sessionId: Id<"session"> } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
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

  // Fetch users
  const users = useQuery(
    api.user.getUsers,
    shouldSkip ? "skip" : {
      searchTerm: searchTerm || undefined,
      roleFilter: roleFilter === "all" ? undefined : roleFilter as any,
      sortBy: sortBy as any,
      sortOrder,
      paginationOpts: { numItems: 50, cursor: null },
      session: session.sessionId,
    }
  );

  // Fetch user statistics
  const stats = useQuery(
    api.user.getUserStats,
    shouldSkip ? "skip" : { session: session.sessionId }
  );

  // Monitor for errors in the query results
  useEffect(() => {
    // Check if either query returned an error
    if (users instanceof Error) {
      console.error("Users query error:", users);
      setHasError(true);
      if (users.message.includes("Unauthorized")) {
        setErrorType("unauthorized");
      } else {
        setErrorType("serverError");
      }
    } else if (stats instanceof Error) {
      console.error("Stats query error:", stats);
      setHasError(true);
      if (stats.message.includes("Unauthorized")) {
        setErrorType("unauthorized");
      } else {
        setErrorType("serverError");
      }
    }
  }, [users, stats]);

  // Global error handler for uncaught errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.error?.message?.includes("Unauthorized")) {
        console.error("Caught unauthorized error:", event.error);
        setHasError(true);
        setErrorType("unauthorized");
        event.preventDefault(); // Prevent the error from propagating
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes("Unauthorized")) {
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
          <Users className="size-12 sm:size-16 text-white/40" />
        </div>
        <h3 className="mb-3 text-xl font-semibold sm:mb-4 sm:text-2xl text-white/80">
          {t("admin.unauthorized.loginRequired")}
        </h3>
        <p className="max-w-md text-sm sm:text-lg text-white/60">
          Please log in to access the user management panel.
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
          {t("admin.unauthorized.title")}
        </h3>
        <p className="max-w-md mb-6 text-sm sm:text-lg text-white/60">
          {t("admin.unauthorized.description")}
        </p>
        <p className="max-w-md mb-6 text-xs sm:text-sm text-white/50">
          {t("admin.unauthorized.adminRequired")}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/admin">
            <Button variant="outline" className="border-white/20 bg-white/5 hover:bg-white/10">
              <Home className="w-4 h-4 mr-2" />
              Back to Admin Dashboard
            </Button>
          </Link>
        </div>
        <p className="mt-6 text-xs text-white/40">
          {t("admin.unauthorized.contactAdmin")}
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
          {t("admin.errors.loadingFailed")}
        </h3>
        <p className="max-w-md mb-6 text-sm sm:text-lg text-white/60">
          {t("admin.errors.serverError")}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="border-white/20 bg-white/5 hover:bg-white/10"
          >
            {t("admin.errors.retry")}
          </Button>
          <Link href="/admin">
            <Button variant="outline" className="border-white/20 bg-white/5 hover:bg-white/10">
              <Home className="w-4 h-4 mr-2" />
              {t("admin.errors.goBack")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full p-4 overflow-hidden sm:p-6 lg:p-8">
        <div className="grid grid-cols-2 gap-3 mb-4 sm:gap-4 lg:grid-cols-6 sm:mb-6">
          <div className="p-3 border rounded-lg sm:p-4 sm:rounded-xl border-white/10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <Users className="text-blue-400 size-4 sm:size-5" />
              <div>
                <p className="text-lg font-bold text-white sm:text-xl">{stats?.total ?? 0}</p>
                <p className="text-xs text-white/60">{t("admin.users.totalUsers")}</p>
              </div>
            </div>
          </div>
          
          <div className="p-3 border rounded-lg sm:p-4 sm:rounded-xl border-white/10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <Crown className="text-purple-400 size-4 sm:size-5" />
              <div>
                <p className="text-lg font-bold text-white sm:text-xl">{stats?.admins ?? 0}</p>
                <p className="text-xs text-white/60">{t("admin.users.admins")}</p>
              </div>
            </div>
          </div>

          <div className="p-3 border rounded-lg sm:p-4 sm:rounded-xl border-white/10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <Shield className="text-green-400 size-4 sm:size-5" />
              <div>
                <p className="text-lg font-bold text-white sm:text-xl">{stats?.middlemen ?? 0}</p>
                <p className="text-xs text-white/60">{t("admin.users.middlemen")}</p>
              </div>
            </div>
          </div>

          <div className="p-3 border rounded-lg sm:p-4 sm:rounded-xl border-white/10 bg-gradient-to-br from-red-500/20 to-pink-500/20 backdrop-blur-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <Ban className="text-red-400 size-4 sm:size-5" />
              <div>
                <p className="text-lg font-bold text-white sm:text-xl">{stats?.banned ?? 0}</p>
                <p className="text-xs text-white/60">{t("admin.users.banned")}</p>
              </div>
            </div>
          </div>

          <div className="p-3 border rounded-lg sm:p-4 sm:rounded-xl border-white/10 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <UserCheck className="text-yellow-400 size-4 sm:size-5" />
              <div>
                <p className="text-lg font-bold text-white sm:text-xl">{stats?.verified ?? 0}</p>
                <p className="text-xs text-white/60">{t("admin.users.verified")}</p>
              </div>
            </div>
          </div>

          <div className="p-3 border rounded-lg sm:p-4 sm:rounded-xl border-white/10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <Clock className="text-cyan-400 size-4 sm:size-5" />
              <div>
                <p className="text-lg font-bold text-white sm:text-xl">{stats?.activeToday ?? 0}</p>
                <p className="text-xs text-white/60">{t("admin.users.activeToday")}</p>
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
                    <h3 className="text-sm font-semibold text-white sm:text-base">{t("admin.users.filtersAndSearch")}</h3>
                    <p className="text-xs sm:text-sm text-white/60">{t("admin.users.filterDescription")}</p>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-white/60 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="px-4 pb-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium sm:text-sm text-white/80">{t("admin.users.searchUsers")}</label>
                  <div className="relative">
                    <Search className="absolute -translate-y-1/2 left-3 top-1/2 size-4 text-white/50" />
                    <Input
                      placeholder={t("admin.users.searchPlaceholder")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 text-sm bg-white/5 border-white/20 focus:border-white/40"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium sm:text-sm text-white/80">{t("admin.users.roleFilter")}</label>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="bg-white/5 border-white/20">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("admin.users.roles.all")}</SelectItem>
                      <SelectItem value="user">{t("admin.users.roles.user")}</SelectItem>
                      <SelectItem value="middleman">{t("admin.users.roles.middleman")}</SelectItem>
                      <SelectItem value="admin">{t("admin.users.roles.admin")}</SelectItem>
                      <SelectItem value="banned">{t("admin.users.roles.banned")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium sm:text-sm text-white/80">{t("admin.users.sortBy")}</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="bg-white/5 border-white/20">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">{t("admin.users.sort.joinDate")}</SelectItem>
                      <SelectItem value="name">{t("admin.users.sort.displayName")}</SelectItem>
                      <SelectItem value="email">{t("admin.users.sort.username")}</SelectItem>
                      <SelectItem value="lastSeen">{t("admin.users.sort.lastSeen")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium sm:text-sm text-white/80">{t("admin.users.order")}</label>
                  <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
                    <SelectTrigger className="bg-white/5 border-white/20">
                      <SelectValue placeholder="Order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">{t("admin.users.sort.descending")}</SelectItem>
                      <SelectItem value="asc">{t("admin.users.sort.ascending")}</SelectItem>
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
                    setRoleFilter("all");
                    setSortBy("createdAt");
                    setSortOrder("desc");
                  }}
                  className="text-xs border-white/20 bg-white/5 hover:bg-white/10 sm:text-sm"
                >
                  {t("admin.users.resetFilters")}
                </Button>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg font-semibold text-white sm:text-xl">
              {t("admin.users.usersDatabase")}
            </h2>
            <p className="text-xs sm:text-sm text-white/70">
              {t("admin.users.showingUsers", { count: users?.page?.length ?? 0 })}
            </p>
          </div>

          <div className="h-full overflow-auto">
            {users?.page ? (
              <DataTable 
                columns={columns(session)} 
                data={users.page} 
                searchKey="email"
                searchPlaceholder={t("admin.users.searchPlaceholder")}
              />
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full animate-pulse bg-gradient-to-br from-white/5 to-white/10" />
                  <p className="text-white/60">{t("admin.users.loadingUsers")}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}