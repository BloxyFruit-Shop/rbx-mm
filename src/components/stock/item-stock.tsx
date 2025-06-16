"use client";

import { useState, useEffect, memo } from "react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import {
  Package,
  Clock,
  ChevronDown,
  ChevronUp,
  Activity,
  TrendingUp,
} from "lucide-react";
import StockGrid from "./stock-grid";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { api } from "~convex/_generated/api";
import { useStableQuery } from "~/hooks/use-stable-query";
import { useQuery } from 'convex/react';

interface ItemStockProps {
  className?: string;
}

interface CountdownProps {
  targetTime: number;
  onComplete?: () => void;
}

const Countdown = memo(function Countdown({
  targetTime,
  onComplete,
}: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    minutes: number;
    seconds: number;
  }>({ minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft({ minutes: 0, seconds: 0 });
        onComplete?.();
        return;
      }

      const minutes = Math.floor(difference / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetTime, onComplete]);

  const isUrgent = timeLeft.minutes < 1;
  const isWarning = timeLeft.minutes < 2;

  return (
    <div className="relative">
      <div className="absolute inset-0 animate-pulse rounded-lg bg-gradient-to-r from-[#9747FF]/20 to-[#7E3BFF]/20 blur-xl"></div>
      <div
        className={cn(
          "relative flex items-center gap-2 rounded-lg border px-3 py-2 transition-all duration-300",
          isUrgent
            ? "border-red-500/30 bg-red-500/10 text-red-400"
            : isWarning
              ? "border-orange-500/30 bg-orange-500/10 text-orange-400"
              : "border-[#9747FF]/30 bg-[#9747FF]/10 text-[#9747FF]",
        )}
      >
        <Clock
          className={cn(
            "h-4 w-4 transition-all duration-300",
            isUrgent && "animate-pulse",
          )}
        />
        <span className="font-mono text-sm font-semibold">
          {String(timeLeft.minutes).padStart(2, "0")}:
          {String(timeLeft.seconds).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
});

const ItemStock = memo(function ItemStock({ className }: ItemStockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [nextUpdateTime, setNextUpdateTime] = useState<number>(
    Date.now() + 5 * 60 * 1000,
  );
  const { data: stocks, lastUpdate } = useQuery(
    api.stocks.listStocks,
    {},
  ) ?? { data: [], lastUpdate: 0 };

  // Update the next update time when we get new data
  useEffect(() => {
    if (lastUpdate) {
      // Next update is 5 minutes after the last update
      const nextUpdate = new Date(lastUpdate).getTime() + 5 * 60 * 1000;
      setNextUpdateTime(nextUpdate);
    }
  }, [lastUpdate]);

  const handleCountdownComplete = (lastUpdate: number) => {
    // Reset countdown for next 5 minutes
    setNextUpdateTime(lastUpdate + 5 * 60 * 1000);
  };

  const formatLastUpdate = (timestamp?: number) => {
    if (!timestamp) return "Never";

    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  const getUpdateStatus = () => {
    if (!lastUpdate) return { status: "unknown", color: "text-white/40" };

    const now = Date.now();
    const diff = now - lastUpdate;
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return { status: "live", color: "text-green-400" };
    if (minutes < 5) return { status: "recent", color: "text-[#9747FF]" };
    if (minutes < 10) return { status: "stale", color: "text-orange-400" };
    return { status: "outdated", color: "text-red-400" };
  };

  const updateStatus = getUpdateStatus();

  return (
    <div className={cn("space-y-6", className)}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <Card className="overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex w-full flex-col items-center justify-between gap-2 sm:flex-row sm:gap-0">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 animate-pulse rounded-xl bg-gradient-to-r from-[#9747FF]/30 to-[#7E3BFF]/30 blur-xl"></div>
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-xl border border-[#9747FF]/30 bg-gradient-to-r from-[#9747FF]/20 to-[#7E3BFF]/20">
                    <Package className="h-7 w-7 text-[#9747FF]" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-white">
                      Stock Tracker
                    </h2>
                    <Badge
                      className={cn(
                        "hidden border text-xs shadow-lg sm:inline-flex",
                        updateStatus.status === "live"
                          ? "border-green-500/30 bg-green-500/20 text-green-400"
                          : updateStatus.status === "recent"
                            ? "border-[#9747FF]/30 bg-[#9747FF]/20 text-[#9747FF]"
                            : updateStatus.status === "stale"
                              ? "border-orange-500/30 bg-orange-500/20 text-orange-400"
                              : "border-red-500/30 bg-red-500/20 text-red-400",
                      )}
                    >
                      <div
                        className={cn(
                          "mr-1.5 h-2 w-2 rounded-full",
                          updateStatus.status === "live" &&
                            "animate-pulse bg-green-400",
                          updateStatus.status === "recent" && "bg-[#9747FF]",
                          updateStatus.status === "stale" && "bg-orange-400",
                          updateStatus.status === "outdated" && "bg-red-400",
                        )}
                      />
                      {updateStatus.status.charAt(0).toUpperCase() +
                        updateStatus.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="hidden text-sm text-white/60 sm:inline">
                    Real-time inventory tracking
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <div className="flex justify-between text-right sm:flex-col sm:gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-white/60">Next update:</span>
                    <Countdown
                      targetTime={nextUpdateTime}
                      onComplete={() =>
                        handleCountdownComplete(lastUpdate ?? 0)
                      }
                    />
                  </div>

                  <div className="textgap-2 hidden items-center justify-end sm:flex">
                    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
                      <Activity className="h-3 w-3 text-white/50" />
                      <span className="text-xs text-white/50">
                        Last:{" "}
                        {lastUpdate ? formatLastUpdate(lastUpdate) : "Never"}
                      </span>
                    </div>
                  </div>
                </div>

                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 w-full border border-white/10 p-0 text-white/60 transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white sm:w-10"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>
          </CardHeader>

          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#9747FF]/5 to-[#7E3BFF]/5 blur-xl"></div>
                <div className="relative rounded-xl border border-white/10 bg-purple-400/5 p-6">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-[#9747FF]" />
                      <span className="text-sm font-medium text-white">
                        Market Inventory
                      </span>
                    </div>
                  </div>

                  <StockGrid stocks={stocks} />
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
});

export default ItemStock;
