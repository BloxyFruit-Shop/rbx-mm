"use client";

import { memo } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";
import { formatNumber } from "~/lib/format-number";
import { Package, AlertCircle } from "lucide-react";
import Image from "next/image";
import type { Doc } from "~convex/_generated/dataModel";

interface StockGridProps {
  className?: string;
  stocks?:
    | (Doc<"stocks"> & {
        item?: Doc<"items"> | null;
      })[]
    | undefined;
}

interface StockItemProps {
  stock: Doc<"stocks"> & { item?: Doc<"items"> | null };
  className?: string;
}

const StockItem = memo(function StockItem({
  stock,
  className,
}: StockItemProps) {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = "/images/placeholder-item.png";
  };

  if (!stock.item) {
    return (
      <Card className={cn("h-full opacity-50", className)}>
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/5">
            <AlertCircle className="h-6 w-6 text-white/40" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white/60">Unknown Item</p>
            <p className="text-xs text-white/40">Item not found</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-white">
              {stock.quantityInStock}
            </p>
            <p className="text-xs text-white/40">in stock</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isOutOfStock = stock.quantityInStock === 0;

  return (
    <Card
      className={cn(
        "@container h-full transition-all duration-200 hover:border-white/20",
        isOutOfStock && "opacity-60",
        className,
      )}
    >
      <CardContent className="flex flex-col items-center gap-3 p-4 text-center @min-3xs:flex-row @min-3xs:text-left">
        <div className="relative flex-shrink-0">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/5">
            <Image
              src="https://wy3uj47wg4.ufs.sh/f/Wz3VjHcczjKUUZxsHI3Aw0T9bB7uNlLpzXfMVeUYg6djh8GS"
              alt={stock.item.name}
              width={12}
              height={12}
              className="h-10 w-10 object-contain"
              onError={handleImageError}
              loading="lazy"
            />
          </div>
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
              <span className="text-xs font-medium text-red-400">OUT</span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">
            {stock.item.name}
          </p>
          <p className="text-xs text-white/60">{stock.item.type}</p>
        </div>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1">
            <span
              className={cn(
                "text-sm font-bold",
                isOutOfStock ? "text-red-400" : "text-white",
              )}
            >
              {formatNumber(stock.quantityInStock)}
            </span>
            <Package className="h-3 w-3 text-white/40" />
          </div>
          <p className="text-xs text-white/40">in stock</p>
          {stock.averageBuyPrice && stock.averageBuyPrice > 0 && (
            <p className="text-xs text-white/60">
              ${formatNumber(stock.averageBuyPrice)} avg
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

const StockGridSkeleton = memo(function StockGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 12 }).map((_, index) => (
        <Card key={index} className="h-full">
          <CardContent className="flex items-center gap-3 p-4">
            <Skeleton className="h-12 w-12 rounded-lg bg-white/10" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 bg-white/10" />
              <Skeleton className="h-3 w-16 bg-white/10" />
            </div>
            <div className="space-y-1 text-right">
              <Skeleton className="ml-auto h-4 w-8 bg-white/10" />
              <Skeleton className="ml-auto h-3 w-12 bg-white/10" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});

const StockGrid = function StockGrid({ className, stocks }: StockGridProps) {
  if (stocks === undefined) {
    return <StockGridSkeleton />;
  }

  if (stocks.length === 0) {
    return (
      <div className="py-12 text-center">
        <Package className="mx-auto mb-4 h-12 w-12 text-white" />
        <h3 className="mb-2 text-lg font-semibold text-white/60">
          No Stock Data
        </h3>
        <p className="text-white/50">
          Stock information will appear here once available
        </p>
      </div>
    );
  }

  // Separate in-stock and out-of-stock items
  const inStockItems = stocks.filter((stock) => stock.quantityInStock > 0);

  return (
    <div className={cn("space-y-6", className)}>
      {inStockItems.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {inStockItems.map((stock) => (
            <StockItem key={stock._id} stock={stock} />
          ))}
        </div>
      )}
    </div>
  );
};

export default StockGrid;
