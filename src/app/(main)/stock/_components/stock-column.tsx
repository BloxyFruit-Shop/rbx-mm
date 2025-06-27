"use client";

import { useState, useEffect, memo } from "react";
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import {
  Package,
  Clock,
  Activity,
} from "lucide-react";
import { formatNumber } from "~/lib/format-number";
import Image from "next/image";
import type { Doc } from "~convex/_generated/dataModel";
import type { AttributedItem } from "~convex/types";

interface StockColumnProps {
  title: string;
  icon: React.ReactNode;
  stocks: (Doc<"stocks"> & { item?: AttributedItem | null })[];
  updateIntervalMinutes: number;
  lastUpdate?: number;
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

interface StockItemProps {
  stock: Doc<"stocks"> & { item?: AttributedItem | null };
}

const StockItem = memo(function StockItem({ stock }: StockItemProps) {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = "/images/placeholder-item.png";
  };

  if (!stock.item) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 opacity-50">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5">
          <Package className="h-5 w-5 text-white/40" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white/60 truncate">Unknown Item</p>
          <p className="text-xs text-white/40">Item not found</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-white">
            {stock.quantityInStock}
          </p>
          <p className="text-xs text-white/40">in stock</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 transition-all duration-200 hover:border-white/20 hover:bg-white/10">
      <div className="relative flex-shrink-0">
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/5">
          <Image
            src={stock.item.thumbnailUrl}
            alt={stock.item.name}
            width={10}
            height={10}
            className="h-8 w-8 object-contain"
            onError={handleImageError}
            loading="lazy"
          />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">
          {stock.item.name}
        </p>
        <p className="text-xs text-white/60">
          {stock.item?.category}
        </p>
      </div>

      <div className="text-right">
        <p className="text-sm font-bold text-white">
          {formatNumber(stock.quantityInStock)}
        </p>
        <p className="text-xs text-white/40">in stock</p>
      </div>
    </div>
  );
});

const StockColumn = memo(function StockColumn({
  title,
  icon,
  stocks,
  updateIntervalMinutes,
  lastUpdate,
  className,
}: StockColumnProps) {
  const t = useTranslations('stock');
  const [nextUpdateTime, setNextUpdateTime] = useState<number>(
    Date.now() + updateIntervalMinutes * 60 * 1000,
  );

  // Update the next update time when we get new data
  useEffect(() => {
    if (lastUpdate) {
      const nextUpdate = new Date(lastUpdate).getTime() + updateIntervalMinutes * 60 * 1000;
      setNextUpdateTime(nextUpdate);
    }
  }, [lastUpdate, updateIntervalMinutes]);

  const handleCountdownComplete = () => {
    if (lastUpdate) {
      setNextUpdateTime(lastUpdate + updateIntervalMinutes * 60 * 1000);
    }
  };

  const formatLastUpdate = (timestamp?: number) => {
    if (!timestamp) return t('never');

    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours > 0) return t('hoursAgo', { hours });
    if (minutes > 0) return t('minutesAgo', { minutes });
    return t('justNow');
  };

  const getUpdateStatus = () => {
    if (!lastUpdate) return { status: "unknown", color: "text-white/40" };

    const now = Date.now();
    const diff = now - lastUpdate;
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return { status: "live", color: "text-green-400" };
    if (minutes < updateIntervalMinutes) return { status: "recent", color: "text-[#9747FF]" };
    if (minutes < updateIntervalMinutes * 2) return { status: "stale", color: "text-orange-400" };
    return { status: "outdated", color: "text-red-400" };
  };

  const updateStatus = getUpdateStatus();
  // Only show items that are in stock
  const inStockItems = stocks.filter(stock => stock.quantityInStock > 0);

  if (inStockItems.length === 0) {
    return (
      <Card className={cn("h-fit", className)}>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5">
              {icon}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="text-sm text-white/60">No items available</p>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={cn("h-fit", className)}>
      <CardHeader className="pb-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse rounded-lg bg-gradient-to-r from-[#9747FF]/30 to-[#7E3BFF]/30 blur-xl"></div>
              <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-[#9747FF]/30 bg-gradient-to-r from-[#9747FF]/20 to-[#7E3BFF]/20">
                {icon}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <Badge
                  className={cn(
                    "border text-xs shadow-lg",
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
                  {t(`status.${updateStatus.status}`)}
                </Badge>
              </div>
              <p className="text-sm text-white/60">
                {inStockItems.length} items in stock
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
              <Activity className="h-3 w-3 text-white/50" />
              <span className="text-xs text-white/50">
                {t('lastUpdate')}: {lastUpdate ? formatLastUpdate(lastUpdate) : t('never')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-white/60">{t('nextUpdate')}:</span>
              <Countdown
                targetTime={nextUpdateTime}
                onComplete={handleCountdownComplete}
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-2">
          {inStockItems.map((stock) => (
            <StockItem key={stock._id} stock={stock} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

export default StockColumn;