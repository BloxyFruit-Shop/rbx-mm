import Image from 'next/image';
import type { Doc } from "../../../convex/_generated/dataModel";

interface ItemInfoProps {
  item: Doc<"items">;
  stockInfo?: {
    quantityInStock: number;
    averageBuyPrice?: number;
  } | null;
}

export default function ItemInfo({ item, stockInfo }: ItemInfoProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#3A2564]/80 to-[#2A1854]/80 p-6 backdrop-blur-xl transition-all duration-500 hover:border-white/20 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1">
      {/* Background pattern */}
      <div className="absolute -inset-5 rounded-xl bg-[url('/images/pattern.webp')] opacity-5 transition-opacity duration-500 group-hover:opacity-10" />
      
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 transition-opacity duration-500 opacity-0 bg-gradient-to-br from-purple-500/5 to-transparent group-hover:opacity-100" />
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-500/10 to-transparent animate-shimmer-fast" />
      </div>

      <div className="relative z-10 space-y-4">
        {/* Item thumbnail */}
        {item.thumbnailUrl && (
          <div className="relative overflow-hidden rounded-xl">
            <Image
              width={300}
              height={300}
              src={item.thumbnailUrl} 
              alt={item.name} 
              className="object-cover w-full h-40 transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        )}

        {/* Item name */}
        <div>
          <h3 className="text-xl font-bold text-white transition-colors duration-300 group-hover:text-purple-100">
            {item.name}
          </h3>
          {item.description && (
            <p className="mt-1 text-sm italic transition-colors duration-300 text-white/60 group-hover:text-white/80">
              &quot;{item.description}&quot;
            </p>
          )}
        </div>

        {/* Item details grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <div>
              <p className="text-xs font-medium tracking-wide uppercase text-white/50">Type</p>
              <p className="text-sm font-semibold text-white/90">{item.type}</p>
            </div>
            <div>
              <p className="text-xs font-medium tracking-wide uppercase text-white/50">Rarity</p>
              <p className={`text-sm font-semibold ${getRarityColorClass(item.rarity)}`}>
                {item.rarity}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div>
              <p className="text-xs font-medium tracking-wide uppercase text-white/50">Value</p>
              <p className="text-sm font-semibold text-green-400">
                {item.currentValue.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium tracking-wide uppercase text-white/50">Demand</p>
              <p className="text-sm font-semibold text-white/90">{item.demand}</p>
            </div>
          </div>
        </div>

        {/* Stock information */}
        {stockInfo && (
          <div className="pt-3 border-t border-white/10">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium tracking-wide uppercase text-white/50">In Stock</p>
                <p className="text-sm font-semibold text-blue-400">
                  {stockInfo.quantityInStock.toLocaleString()}
                </p>
              </div>
              {stockInfo.averageBuyPrice && (
                <div>
                  <p className="text-xs font-medium tracking-wide uppercase text-white/50">Avg. Buy Price</p>
                  <p className="text-sm font-semibold text-orange-400">
                    {stockInfo.averageBuyPrice.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Last updated */}
        <div className="pt-2">
          <p className="text-xs text-white/40">
            Last updated: {new Date(item.valueLastUpdatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}

function getRarityColorClass(rarity: string): string {
  switch (rarity) {
    case "Common": 
      return "text-gray-400";
    case "Uncommon": 
      return "text-green-400";
    case "Rare": 
      return "text-blue-400";
    case "Epic": 
      return "text-purple-400";
    case "Legendary": 
      return "text-orange-400";
    case "Mythic": 
      return "text-red-400";
    default: 
      return "text-gray-400";
  }
}