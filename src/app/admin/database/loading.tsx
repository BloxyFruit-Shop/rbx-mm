import { Skeleton } from "~/components/ui/skeleton";
import { BetterBadge } from "~/components/ui/better-badge";
import { 
  Database, 
  Package, 
  Plus,
  Search,
  Filter,
  SlidersHorizontal,
  PanelRightOpen,
  TrendingUp,
  BarChart3,
} from "lucide-react";

export default function DatabaseLoading() {
  return (
    <div className="h-full">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="animate-pulse-slow absolute top-1/4 left-1/4 h-64 w-64 sm:h-96 sm:w-96 rounded-full bg-gradient-to-r from-[#9747FF]/10 to-[#7E3BFF]/10 blur-3xl" />
        <div
          className="animate-pulse-slow absolute right-1/4 bottom-1/4 h-48 w-48 sm:h-80 sm:w-80 rounded-full bg-gradient-to-r from-[#7E3BFF]/10 to-[#9747FF]/10 blur-3xl"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative z-10 h-full">
        <div className="h-full p-4 sm:p-6 lg:p-8">
          <div className="relative mb-6 sm:mb-8 lg:mb-12">
            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#9747FF]/5 to-[#7E3BFF]/5 blur-2xl sm:blur-3xl"></div>
            <div className="relative">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <BetterBadge variant="success" size="default">
                    <span className="flex items-center gap-1 text-xs sm:gap-2 sm:text-sm">
                      <Database className="size-3 sm:size-4" />
                      Database Management
                    </span>
                  </BetterBadge>
                  <BetterBadge variant="info" size="default">
                    <span className="flex items-center gap-1 text-xs sm:gap-2 sm:text-sm">
                      <Package className="size-3 sm:size-4" />
                      Items & Games
                    </span>
                  </BetterBadge>
                </div>

                <div>
                  <h1 className="mb-3 text-2xl font-bold text-white sm:mb-4 sm:text-4xl lg:text-5xl xl:text-6xl">
                    <span className="bg-gradient-to-r from-[#9747FF] to-[#7E3BFF] bg-clip-text text-transparent">
                      Database Management
                    </span>
                  </h1>
                  <p className="max-w-full text-sm leading-relaxed sm:max-w-2xl lg:max-w-3xl sm:text-base lg:text-lg xl:text-xl text-white/70">
                    Manage items, games, and platform data.
                    <span className="font-medium text-white">
                      {" "}
                      Create, update, and delete items across all supported games.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col h-full gap-4 overflow-hidden sm:gap-6">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              <div className="p-3 border rounded-lg sm:p-4 sm:rounded-xl border-white/10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Package className="text-blue-400 size-4 sm:size-5" />
                  <div>
                    <Skeleton className="w-12 h-5 mb-1 bg-white/10 sm:h-6 sm:w-16" />
                    <p className="text-xs text-white/60">Total Items</p>
                  </div>
                </div>
              </div>
              <div className="p-3 border rounded-lg sm:p-4 sm:rounded-xl border-white/10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Filter className="text-green-400 size-4 sm:size-5" />
                  <div>
                    <Skeleton className="w-8 h-5 mb-1 bg-white/10 sm:h-6 sm:w-10" />
                    <p className="text-xs text-white/60">Categories</p>
                  </div>
                </div>
              </div>
              <div className="p-3 border rounded-lg sm:p-4 sm:rounded-xl border-white/10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm">
                <div className="flex items-center gap-2 sm:gap-3">
                  <BarChart3 className="text-purple-400 size-4 sm:size-5" />
                  <div>
                    <Skeleton className="w-8 h-5 mb-1 bg-white/10 sm:h-6 sm:w-10" />
                    <p className="text-xs text-white/60">Rarities</p>
                  </div>
                </div>
              </div>
              <div className="p-3 border rounded-lg sm:p-4 sm:rounded-xl border-white/10 bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm">
                <div className="flex items-center gap-2 sm:gap-3">
                  <TrendingUp className="text-orange-400 size-4 sm:size-5" />
                  <div>
                    <Skeleton className="w-16 h-5 mb-1 bg-white/10 sm:h-6 sm:w-20" />
                    <p className="text-xs text-white/60">Avg Sell Value</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <Skeleton className="h-8 w-28 bg-white/10 sm:h-9 sm:w-32" />
              </div>
              
              <Skeleton className="w-24 h-8 bg-white/10 sm:h-9 sm:w-28" />
            </div>

            <div className="relative flex flex-1 gap-4 overflow-hidden lg:gap-6">
              <div className="w-full overflow-hidden">
                <div className="mb-4 sm:mb-6">
                  <Skeleton className="w-32 h-6 mb-2 bg-white/10 sm:h-7 sm:w-40" />
                  <Skeleton className="w-48 h-4 bg-white/10 sm:w-56" />
                </div>

                <div className="h-[calc(100%-80px)] overflow-y-auto">
                  <div className="grid grid-cols-1 gap-3 pb-4 sm:gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {Array.from({ length: 15 }).map((_, index) => (
                      <div key={index} className="relative p-4 border rounded-xl border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm">
                        <div className="absolute z-10 top-3 left-3">
                          <Skeleton className="w-16 h-5 rounded-full bg-white/10" />
                        </div>
                        <div className="absolute z-10 top-3 right-3">
                          <Skeleton className="w-12 h-5 rounded bg-white/10" />
                        </div>
                        
                        <div className="flex flex-col items-center gap-3 pt-6">
                          <div className="flex items-center justify-center w-20 h-20 overflow-hidden border rounded-lg border-white/10 bg-white/5">
                            <Skeleton className="w-16 h-16 bg-white/10" />
                          </div>
                          
                          <div className="w-full text-center">
                            <Skeleton className="w-32 h-4 mx-auto mb-2 bg-white/10" />
                            <Skeleton className="w-20 h-3 mx-auto bg-white/10" />
                          </div>
                          
                          <div className="w-full space-y-2">
                            <div className="flex items-center justify-between">
                              <Skeleton className="w-20 h-3 bg-white/10" />
                              <Skeleton className="w-16 h-4 bg-white/10" />
                            </div>
                            <div className="flex items-center justify-between">
                              <Skeleton className="w-16 h-3 bg-white/10" />
                              <Skeleton className="h-4 w-14 bg-white/10" />
                            </div>
                            <div className="flex items-center justify-between">
                              <Skeleton className="w-20 h-3 bg-white/10" />
                              <Skeleton className="w-12 h-4 bg-white/10" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}