"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Skeleton } from "~/components/ui/skeleton";
import ItemInfoSkeleton from "./item-info-skeleton";
import { cn } from '~/lib/utils';
import { TrendingUp } from "lucide-react";

interface ItemGridSkeletonProps {
  className?: string;
  viewMode?: "grid" | "list";
}

const itemTypes = [
  { value: "Crop", label: "Crops" },
  { value: "Egg", label: "Eggs" },
  { value: "Pet", label: "Pets" },
  { value: "Gear", label: "Gear" },
];

export default function ItemGridSkeleton({ className, viewMode = "grid" }: ItemGridSkeletonProps) {
  return (
    <div className={className}>
      <Tabs defaultValue="Crop" className="w-full">
        <div className="flex flex-col mb-6 space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
                <TrendingUp className="size-6 text-[#2663ff]" />
                Item Values
              </h1>
              <div className="items-center hidden gap-2 lg:flex">
                <Skeleton className="h-9 w-9 bg-white/10" />
                <Skeleton className="h-9 w-9 bg-white/10" />
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Skeleton className="w-full h-10 sm:w-64 bg-white/10" />
              <div className="flex gap-2">
                <Skeleton className="w-full h-10 sm:w-40 bg-white/10" />
                <Skeleton className="size-10 bg-white/10" />
              </div>
              <Skeleton className="w-full h-10 sm:w-40 bg-white/10" />
            </div>
          </div>

          <TabsList className="grid w-full h-12 grid-cols-4">
            {itemTypes.map((type) => (
              <TabsTrigger 
                key={type.value} 
                value={type.value} 
                className="size-full"
                disabled
              >
                <span className="mr-1 font-medium">{type.label}</span>
                <Skeleton className="inline-block w-6 h-3 ml-1 bg-white/10" />
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {itemTypes.map((type) => (
          <TabsContent key={type.value} value={type.value} className="mt-6">
            <div className={cn(
              "grid gap-4",
              viewMode === "grid" 
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6" 
                : "grid-cols-1"
            )}>
              {Array.from({ length: 12 }).map((_, index) => (
                <ItemInfoSkeleton key={index} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}