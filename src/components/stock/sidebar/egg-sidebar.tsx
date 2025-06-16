import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import { formatNumber } from "~/lib/format-number";
import { Activity } from "lucide-react";
import {
  type EggType,
  type ItemSidebarProps,
  DEMAND_COLORS,
} from "~convex/types";

type EggSidebarProps = ItemSidebarProps<EggType>;

export default function EggSidebar({ type, demand }: EggSidebarProps) {
  const formattedSellValue = type.sellValue
    ? formatNumber(type.sellValue)
    : null;
  const formattedBuyPrice = type.buyPrice ? formatNumber(type.buyPrice) : null;

  return (
    <>
      {type.sellValue && (
        <>
          <div className="relative rounded-xl border border-[#9747FF]/20 bg-gradient-to-r from-[#9747FF]/10 to-[#7E3BFF]/10 p-6 text-center">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#9747FF]/5 to-[#7E3BFF]/5 blur-xl"></div>
            <div className="relative">
              <div className="mb-1 flex items-end justify-center">
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
        </>
      )}

      <div>
        <h4 className="mb-4 flex items-center gap-2 font-semibold text-white">
          <Activity className="h-4 w-4 text-[#9747FF]" />
          Egg Data
        </h4>
        <div className="space-y-3">
          {type.incubationTime && (
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4 transition-colors duration-200 hover:bg-white/10">
              <span className="text-sm text-white/60">Incubation Time</span>
              <div className="text-right">
                <span className="font-semibold text-white">
                  {type.incubationTime / 60}min
                </span>
              </div>
            </div>
          )}

          {type.shopAppearanceChance && (
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4 transition-colors duration-200 hover:bg-white/10">
              <span className="text-sm text-white/60">Shop Chance</span>
              <div className="text-right">
                <span className="font-semibold text-white">
                  {formatNumber(type.shopAppearanceChance)}%
                </span>
              </div>
            </div>
          )}

          {formattedBuyPrice && (
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4 transition-colors duration-200 hover:bg-white/10">
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
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4 transition-colors duration-200 hover:bg-white/10">
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
        </div>
      </div>
    </>
  );
}
