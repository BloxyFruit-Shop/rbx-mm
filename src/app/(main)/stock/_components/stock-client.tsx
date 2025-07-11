"use client";

import { memo } from "react";
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  Package,
  Sprout,
  Egg,
  Wrench,
  Calendar,
  Palette,
  Cloud,
} from "lucide-react";
import { api } from "~convex/_generated/api";
import { useQuery } from 'convex/react';
import StockColumn from "./stock-column";
import { cn } from "~/lib/utils";

// Color mapping for weather badges
const WEATHER_COLOR_STYLES: Record<string, string> = {
  "red": "border-red-500/50 bg-red-500/20 text-red-300",
  "green": "border-green-500/50 bg-green-500/20 text-green-300",
  "blue": "border-blue-500/50 bg-blue-500/20 text-blue-300",
  "yellow": "border-yellow-500/50 bg-yellow-500/20 text-yellow-300",
  "purple": "border-purple-500/50 bg-purple-500/20 text-purple-300",
  "orange": "border-orange-500/50 bg-orange-500/20 text-orange-300",
  "pink": "border-pink-500/50 bg-pink-500/20 text-pink-300",
  "gray": "border-gray-500/50 bg-gray-500/20 text-gray-300",
  "black": "border-gray-700/50 bg-gray-700/20 text-gray-300",
  "white": "border-white/50 bg-white/20 text-white",
  "cyan": "border-cyan-500/50 bg-cyan-500/20 text-cyan-300",
  "teal": "border-teal-500/50 bg-teal-500/20 text-teal-300",
  "brown": "border-amber-700/50 bg-amber-700/20 text-amber-300",
  "indigo": "border-indigo-500/50 bg-indigo-500/20 text-indigo-300",
  "lime": "border-lime-500/50 bg-lime-500/20 text-lime-300",
  "violet": "border-violet-500/50 bg-violet-500/20 text-violet-300",
  "amber": "border-amber-500/50 bg-amber-500/20 text-amber-300",
  "emerald": "border-emerald-500/50 bg-emerald-500/20 text-emerald-300",
};

const StockClient = memo(function StockClient() {
  const t = useTranslations('stock');
  
  const stockData = useQuery(api.stocks.listStocks, {}) ?? { 
    data: [], 
    lastUpdate: 0, 
    categoryLastUpdates: { Crop: 0, Egg: 0, Gear: 0, Event: 0, Cosmetic: 0, Weather: 0 } 
  };

  const { data: stocks, categoryLastUpdates } = stockData;

  // Separate items by category and filter out items with 0 stock (except weather)
  const seedStock = stocks?.filter((stock) => stock.category === "Crop" && stock.quantityInStock > 0) ?? [];
  const eggStock = stocks?.filter((stock) => stock.category === "Egg" && stock.quantityInStock > 0) ?? [];
  const gearStock = stocks?.filter((stock) => stock.category === "Gear" && stock.quantityInStock > 0) ?? [];
  const eventStock = stocks?.filter((stock) => stock.category === "Event" && stock.quantityInStock > 0) ?? [];
  const cosmeticStock = stocks?.filter((stock) => stock.category === "Cosmetic" && stock.quantityInStock > 0) ?? [];
  
  // Weather effects - show active ones (quantity > 0)
  const activeWeather = stocks?.filter((stock) => stock.category === "Weather" && stock.quantityInStock > 0) ?? [];

  // Calculate category stats (all items shown are in stock)
  const seedsInStock = seedStock.length;
  const eggsInStock = eggStock.length;
  const gearInStock = gearStock.length;
  const eventInStock = eventStock.length;
  const cosmeticsInStock = cosmeticStock.length;

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse rounded-xl bg-gradient-to-r from-[#9747FF]/30 to-[#7E3BFF]/30 blur-xl"></div>
              <div className="relative flex h-14 w-14 items-center justify-center rounded-xl border border-[#9747FF]/30 bg-gradient-to-r from-[#9747FF]/20 to-[#7E3BFF]/20">
                <Package className="h-7 w-7 text-[#9747FF]" />
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white">
                {t('marketInventory')}
              </h2>
              <p className="text-sm text-white/60">
                {t('realTimeTracking')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="p-4 border rounded-lg border-green-500/20 bg-green-500/10">
              <div className="flex items-center gap-2">
                <Sprout className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400/80">{t('seeds')}</span>
              </div>
              <p className="text-2xl font-bold text-green-400">
                {seedsInStock}
              </p>
              <p className="text-xs text-green-400/60">items in stock</p>
            </div>
            
            <div className="p-4 border rounded-lg border-orange-500/20 bg-orange-500/10">
              <div className="flex items-center gap-2">
                <Egg className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-orange-400/80">{t('eggs')}</span>
              </div>
              <p className="text-2xl font-bold text-orange-400">
                {eggsInStock}
              </p>
              <p className="text-xs text-orange-400/60">items in stock</p>
            </div>
            
            <div className="p-4 border rounded-lg border-blue-500/20 bg-blue-500/10">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-400/80">{t('gear')}</span>
              </div>
              <p className="text-2xl font-bold text-blue-400">
                {gearInStock}
              </p>
              <p className="text-xs text-blue-400/60">items in stock</p>
            </div>

            <div className="p-4 border rounded-lg border-purple-500/20 bg-purple-500/10">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-400/80">Events</span>
              </div>
              <p className="text-2xl font-bold text-purple-400">
                {eventInStock}
              </p>
              <p className="text-xs text-purple-400/60">items in stock</p>
            </div>

            <div className="p-4 border rounded-lg border-pink-500/20 bg-pink-500/10">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-pink-400" />
                <span className="text-sm text-pink-400/80">Cosmetics</span>
              </div>
              <p className="text-2xl font-bold text-pink-400">
                {cosmeticsInStock}
              </p>
              <p className="text-xs text-pink-400/60">items in stock</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse rounded-xl bg-gradient-to-r from-cyan-500/30 to-blue-500/30 blur-xl"></div>
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/20 to-blue-500/20">
                <Cloud className="h-6 w-6 text-cyan-400" />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">
                Current Weather Effects
              </h3>
              <p className="text-sm text-white/60">
                Active weather conditions in the game
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {activeWeather.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {activeWeather.map((weather) => (
                <Badge
                  key={weather._id}
                  className={cn(
                    "border text-sm shadow-lg transition-all duration-200 hover:scale-105",
                    WEATHER_COLOR_STYLES[weather.color] ?? "border-white/50 bg-white/20 text-white"
                  )}
                >
                  {weather.title}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-center">
              <div className="space-y-2">
                <Cloud className="h-8 w-8 text-white/40 mx-auto" />
                <p className="text-white/60">No active weather effects</p>
                <p className="text-xs text-white/40">Weather conditions will appear here when active</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StockColumn
          title={t('seeds')}
          icon={<Sprout className="w-5 h-5 text-green-400" />}
          stocks={seedStock}
          updateIntervalMinutes={5}
          lastUpdate={categoryLastUpdates.Crop}
        />
        
        <StockColumn
          title={t('eggs')}
          icon={<Egg className="w-5 h-5 text-orange-400" />}
          stocks={eggStock}
          updateIntervalMinutes={30}
          lastUpdate={categoryLastUpdates.Egg}
        />

        <StockColumn
          title={t('gear')}
          icon={<Wrench className="w-5 h-5 text-blue-400" />}
          stocks={gearStock}
          updateIntervalMinutes={5}
          lastUpdate={categoryLastUpdates.Gear}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StockColumn
          title="Cosmetics"
          icon={<Palette className="w-5 h-5 text-pink-400" />}
          stocks={cosmeticStock}
          updateIntervalMinutes={240}
          lastUpdate={categoryLastUpdates.Cosmetic}
        />

        <StockColumn
          title="Event Shop"
          icon={<Calendar className="w-5 h-5 text-purple-400" />}
          stocks={eventStock}
          updateIntervalMinutes={60}
          lastUpdate={categoryLastUpdates.Event}
          hideCountdown={true}
        />
      </div>
    </div>
  );
});

export default StockClient;