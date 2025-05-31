import GradientBackground from "~/components/layout/gradient-background";
import { BetterBadge } from "~/components/ui/better-badge";
import { Sparkles } from "lucide-react";
import ItemGridSkeleton from "~/components/stock/item-grid-skeleton";
import { Skeleton } from "~/components/ui/skeleton";

export default function Loading() {
  return (
    <GradientBackground still>
      <div className="min-h-screen pt-[72px]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="animate-pulse-slow absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-gradient-to-r from-[#9747FF]/10 to-[#7E3BFF]/10 blur-3xl" />
          <div
            className="animate-pulse-slow absolute right-1/4 bottom-1/4 h-80 w-80 rounded-full bg-gradient-to-r from-[#7E3BFF]/10 to-[#9747FF]/10 blur-3xl"
            style={{ animationDelay: "2s" }}
          />
        </div>

        <div className="relative z-10">
          <div className="container px-4 py-16 mx-auto max-w-7xl">
            <div className="relative mb-12">
              <div className="absolute inset-0 bg-gradient-to-r from-[#9747FF]/5 to-[#7E3BFF]/5 rounded-3xl blur-3xl"></div>
              <div className="relative">
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <BetterBadge variant="premium" size="default">
                      <span className="flex items-center gap-2">
                        Live Market Data <Sparkles className="size-3" />
                      </span>
                    </BetterBadge>
                  </div>
                  
                  <div>
                    <h1 className="mb-4 text-4xl font-bold text-white lg:text-6xl">
                      <span className="bg-gradient-to-r from-[#9747FF] to-[#7E3BFF] bg-clip-text text-transparent">
                        Item Values
                      </span>{" "}
                      Database
                    </h1>
                    <p className="max-w-3xl text-lg leading-relaxed text-white/70 lg:text-xl">
                      Discover real-time market values, trading insights, and detailed
                      information for all Grow a Garden items.
                      <span className="font-medium text-white">
                        {" "}
                        Make informed trading decisions with our comprehensive
                        database.
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4 sm:flex-row lg:flex-col xl:flex-row">
                <Skeleton className="ml-auto h-11 w-36 bg-white/10 lg:mr-6" />
              </div>
              
              <ItemGridSkeleton />
            </div>
          </div>
        </div>
      </div>
    </GradientBackground>
  );
}