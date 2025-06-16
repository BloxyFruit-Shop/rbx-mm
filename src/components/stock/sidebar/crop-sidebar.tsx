import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import { formatNumber } from "~/lib/format-number";
import { Activity, Sparkles } from "lucide-react";
import { type CropType, type ItemSidebarProps, DEMAND_COLORS } from "~convex/types";

type CropSidebarProps = ItemSidebarProps<CropType>

export default function CropSidebar({ type, demand }: CropSidebarProps) {
  const formattedSellValue = formatNumber(type.sellValue);
  const formattedBuyPrice = type.buyPrice ? formatNumber(type.buyPrice) : null;

  return (
    <>
      {type.isMultiHarvest && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className="cursor-help border-[#23c770]/30 bg-[#23c770]/20 text-xs text-[#23c770] shadow-lg">
              <Sparkles className="w-3 h-3 mr-1" />
              Multi-Harvest
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Can be harvested multiple times</p>
          </TooltipContent>
        </Tooltip>
      )}

      <div className="relative rounded-xl border border-[#9747FF]/20 bg-gradient-to-r from-[#9747FF]/10 to-[#7E3BFF]/10 p-6 text-center">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#9747FF]/5 to-[#7E3BFF]/5 blur-xl"></div>
        <div className="relative">
          <div className="flex items-end justify-center mb-1">
            <span className="text-3xl font-bold text-[#9747FF]">
              ${formattedSellValue}
            </span>
            <span className="mb-0.5 text-sm text-white/60">/each</span>
          </div>
          <div className="text-sm text-white/60">Current Market Value</div>
          <div className="text-xs text-white/40">without modifiers</div>
        </div>
      </div>

      <Separator className="bg-white/10" />

      <div>
        <h4 className="flex items-center gap-2 mb-4 font-semibold text-white">
          <Activity className="h-4 w-4 text-[#9747FF]" />
          Market Data
        </h4>
        <div className="space-y-3">
          {formattedBuyPrice && (
            <div className="flex items-center justify-between p-4 transition-colors duration-200 border rounded-lg border-white/10 bg-white/5 hover:bg-white/10">
              <span className="text-sm text-white/60">Buy Price</span>
              <div className="text-right">
                <div className="flex items-end">
                  <span className="font-semibold text-white">
                    ${formattedBuyPrice}
                  </span>
                  <span className="mb-0.5 text-xs text-white/40">/each</span>
                </div>
              </div>
            </div>
          )}

          {demand !== "Unknown" && (
            <div className="flex items-center justify-between p-4 transition-colors duration-200 border rounded-lg border-white/10 bg-white/5 hover:bg-white/10">
              <span className="text-sm text-white/60">Demand Level</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    className={cn(
                      "cursor-help border text-xs shadow-lg",
                      DEMAND_COLORS[demand as keyof typeof DEMAND_COLORS],
                    )}
                  >
                    {demand}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Current market demand for this item</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}

          {type.shopAmountRange &&
            type.shopAmountRange.toLowerCase() !== "n/a" &&
            type.shopAmountRange.toLowerCase() !== "unknown" && (
              <div className="flex items-center justify-between p-4 transition-colors duration-200 border rounded-lg border-white/10 bg-white/5 hover:bg-white/10">
                <span className="text-sm text-white/60">Shop Amount</span>
                <span className="font-semibold text-white">
                  {type.shopAmountRange}
                </span>
              </div>
            )}
        </div>
      </div>
    </>
  );
}