"use client";

import { memo } from "react";
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import {
  Package,
  Sprout,
  Egg,
  Wrench,
} from "lucide-react";
import { api } from "~convex/_generated/api";
import { useQuery } from 'convex/react';
import StockColumn from "./stock-column";

const StockClient = memo(function StockClient() {
  const t = useTranslations('stock');
  
  const stockData = useQuery(api.stocks.listStocks, {}) ?? { 
    data: [], 
    lastUpdate: 0, 
    categoryLastUpdates: { Crop: 0, Egg: 0, Gear: 0 } 
  };

  const { data: stocks, categoryLastUpdates } = stockData;

  // Separate items by category and filter out items with 0 stock
  const seedStock = stocks?.filter((stock) => stock.item?.category === "Crop" && stock.quantityInStock > 0) ?? [];
  const eggStock = stocks?.filter((stock) => stock.item?.category === "Egg" && stock.quantityInStock > 0) ?? [];
  const gearStock = stocks?.filter((stock) => stock.item?.category === "Gear" && stock.quantityInStock > 0) ?? [];

  // Calculate category stats (all items shown are in stock)
  const seedsInStock = seedStock.length;
  const eggsInStock = eggStock.length;
  const gearInStock = gearStock.length;

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

          <div className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-3">
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
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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
    </div>
  );
});

export default StockClient;