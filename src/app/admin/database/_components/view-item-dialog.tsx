"use client";

import { Badge } from "~/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { 
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
  Tag,
  Calendar,
  Hash,
  ExternalLink,
  Image as ImageIcon,
  Percent,
} from "lucide-react";
import type { Doc } from "~convex/_generated/dataModel";

interface ViewItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Doc<"items">;
  game?: Doc<"games">;
}

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case "Common":
      return "from-gray-500/20 to-slate-500/20 border-gray-500/30 text-gray-300";
    case "Uncommon":
      return "from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-300";
    case "Rare":
      return "from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-300";
    case "Epic":
      return "from-purple-500/20 to-violet-500/20 border-purple-500/30 text-purple-300";
    case "Legendary":
      return "from-orange-500/20 to-amber-500/20 border-orange-500/30 text-orange-300";
    case "Mythical":
      return "from-red-500/20 to-pink-500/20 border-red-500/30 text-red-300";
    case "Divine":
      return "from-yellow-500/20 to-gold-500/20 border-yellow-500/30 text-yellow-300";
    case "Prismatic":
      return "from-rainbow-500/20 to-rainbow-600/20 border-rainbow-500/30 text-rainbow-300";
    default:
      return "from-gray-500/20 to-slate-500/20 border-gray-500/30 text-gray-300";
  }
};

const getDemandIcon = (demand: string) => {
  switch (demand) {
    case "VeryHigh":
      return <TrendingUp className="text-red-400 size-4" />;
    case "High":
      return <TrendingUp className="text-orange-400 size-4" />;
    case "Medium":
      return <Minus className="text-yellow-400 size-4" />;
    case "Low":
      return <TrendingDown className="text-blue-400 size-4" />;
    case "VeryLow":
      return <TrendingDown className="text-gray-400 size-4" />;
    default:
      return <Minus className="text-gray-400 size-4" />;
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Pet":
      return "🐾";
    case "Crop":
      return "🌱";
    case "Egg":
      return "🥚";
    case "Gear":
      return "⚙️";
    default:
      return "📦";
  }
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ViewItemDialog({ open, onOpenChange, item, game }: ViewItemDialogProps) {
  const renderAttribute = (attr: any, index: number) => {
    switch (attr.type) {
      case "key-value":
        return (
          <div key={index} className="p-3 border rounded-lg border-white/10 bg-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="text-blue-400 size-4" />
              <span className="font-medium text-white">{attr.title}</span>
            </div>
            <p className="text-sm text-white/70">{attr.content}</p>
          </div>
        );
      
      case "percentile":
        return (
          <div key={index} className="p-3 border rounded-lg border-white/10 bg-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="text-green-400 size-4" />
              <span className="font-medium text-white">{attr.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full bg-white/10">
                <div 
                  className="h-2 transition-all duration-300 rounded-full bg-gradient-to-r from-green-500 to-blue-500"
                  style={{ width: `${Math.min(100, Math.max(0, attr.content))}%` }}
                />
              </div>
              <span className="text-sm font-medium text-white">{attr.content}%</span>
            </div>
          </div>
        );
      
      case "image-link":
        return (
          <div key={index} className="p-3 border rounded-lg border-white/10 bg-white/5">
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon className="text-purple-400 size-4" />
              <span className="font-medium text-white">{attr.title}</span>
            </div>
            <div className="space-y-2">
              {attr.imageUrl && (
                <img
                  src={attr.imageUrl}
                  alt={attr.title}
                  className="object-cover w-full h-32 rounded-md"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              )}
              {attr.content && (
                <span className="text-sm font-medium text-white">{attr.content}</span>
              )}
              {attr.link && (
                <a
                  href={attr.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
                >
                  <ExternalLink className="size-3" />
                  View Link
                </a>
              )}
            </div>
          </div>
        );
      
      case "tag":
        return (
          <div key={index} className="inline-flex items-center gap-1 px-2 py-1 text-xs text-purple-300 border rounded-md bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30">
            <Tag className="size-3" />
            <span>{attr.title}</span>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-white/10 bg-gradient-to-b from-[#0f051d] to-[#1a0b2e]">
        <DialogHeader>
          <DialogTitle className="text-white">Item Details</DialogTitle>
          <DialogDescription className="text-white/70">
            View detailed information about this item.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-shrink-0">
              <img
                src={item.thumbnailUrl}
                alt={item.name}
                className="object-cover w-32 h-32 rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/placeholder-item.png";
                }}
              />
            </div>
            
            <div className="flex-1 space-y-3">
              <div>
                <h2 className="text-2xl font-bold text-white">{item.name}</h2>
                <p className="text-white/60">{game?.name ?? "Unknown Game"}</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge className={`bg-gradient-to-r ${getRarityColor(item.rarity)} backdrop-blur-sm`}>
                  {item.rarity}
                </Badge>
                <Badge variant="outline" className="border-white/20 text-white/70">
                  <span className="mr-1">{getCategoryIcon(item.category)}</span>
                  {item.category}
                </Badge>
                {item.isObtainable !== undefined && (
                  <Badge 
                    variant="outline" 
                    className={`border-white/20 ${item.isObtainable ? "text-green-400" : "text-red-400"}`}
                  >
                    {item.isObtainable ? "Obtainable" : "Unobtainable"}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {item.description && (
            <div className="p-4 border rounded-lg border-white/10 bg-white/5">
              <h3 className="mb-2 font-semibold text-white">Description</h3>
              <p className="text-sm leading-relaxed text-white/70">{item.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border rounded-lg border-white/10 bg-white/5">
              <div className="flex items-center gap-2 mb-2">
                {getDemandIcon(item.demand)}
                <span className="font-medium text-white">Demand</span>
              </div>
              <p className="text-sm text-white/70">{item.demand}</p>
            </div>

            {item.sellValue !== undefined && (
              <div className="p-4 border rounded-lg border-white/10 bg-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="text-green-400 size-4" />
                  <span className="font-medium text-white">Sell Value</span>
                </div>
                <p className="text-sm text-white/70">{item.sellValue.toLocaleString()}</p>
              </div>
            )}

            {item.buyPrice !== undefined && (
              <div className="p-4 border rounded-lg border-white/10 bg-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="text-blue-400 size-4" />
                  <span className="font-medium text-white">Buy Price</span>
                </div>
                <p className="text-sm text-white/70">{item.buyPrice.toLocaleString()}</p>
              </div>
            )}
          </div>

          <div className="p-4 border rounded-lg border-white/10 bg-white/5">
            <h3 className="mb-3 font-semibold text-white">Metadata</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-sm">
                <Hash className="text-white/50 size-4" />
                <span className="text-white/70">ID:</span>
                <code className="px-1 py-0.5 text-xs rounded bg-white/10 text-white/80 font-mono">
                  {item._id}
                </code>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="text-white/50 size-4" />
                <span className="text-white/70">Created:</span>
                <span className="text-white/80">{formatDate(item._creationTime)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Package className="text-white/50 size-4" />
                <span className="text-white/70">Rarity Order:</span>
                <span className="text-white/80">{item.rarityOrder}</span>
              </div>
            </div>
          </div>

          {item.attributes && item.attributes.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-white">Attributes</h3>
              
              <div className="flex flex-wrap gap-2">
                {item.attributes
                  .filter(attr => attr.type === "tag")
                  .map((attr, index) => renderAttribute(attr, index))}
              </div>
              
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {item.attributes
                  .filter(attr => attr.type !== "tag")
                  .map((attr, index) => renderAttribute(attr, index))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}