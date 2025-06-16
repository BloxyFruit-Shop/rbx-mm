import { Badge } from "~/components/ui/badge";
import { formatNumber } from "~/lib/format-number";
import type { CropType, ItemDetailsProps } from "~convex/types";

type CropDetailsProps = ItemDetailsProps<CropType>

export default function CropDetails({ type }: CropDetailsProps) {
  return (
    <>
      {type.isMultiHarvest && (
        <div className="absolute top-10 right-3 z-10 @[20rem]:top-3 @[20rem]:right-20">
          <Badge className="border-[#23c770]/30 bg-[#23c770]/20 text-xs text-[#23c770]">
            Multi
          </Badge>
        </div>
      )}

      <div className="flex flex-col justify-end flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/60">Current Value</span>
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-white">
              ${formatNumber(type.sellValue)}
            </span>
          </div>
        </div>

        {type.buyPrice && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60">Buy Price</span>
            <div className="flex items-center gap-1">
              <span className="text-sm text-white/80">
                ${formatNumber(type.buyPrice)}
              </span>
            </div>
          </div>
        )}

        {type.shopAmountRange &&
          type.shopAmountRange.toLowerCase() !== "n/a" &&
          type.shopAmountRange.toLowerCase() !== "unknown" && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">Shop Amount</span>
              <span className="text-sm text-white/80">
                {type.shopAmountRange}
              </span>
            </div>
          )}
      </div>
    </>
  );
}
