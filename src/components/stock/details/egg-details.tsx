import { formatNumber } from "~/lib/format-number";
import type { EggType, SimplifiedItemType, ItemDetailsProps } from "~convex/types";

type EggDetailsProps = ItemDetailsProps<EggType | SimplifiedItemType>;

export default function EggDetails({ type }: EggDetailsProps) {
  // Type guard to check if this is a full EggType
  const isFullEggType = (t: EggType | SimplifiedItemType): t is EggType => {
    return 'incubationTime' in t;
  };

  const fullType = isFullEggType(type) ? type : null;

  return (
    <div className="flex flex-1 flex-col justify-end space-y-2">
      {type.buyPrice && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/60">Buy Price</span>
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-white">
              ${formatNumber(type.buyPrice)}
            </span>
          </div>
        </div>
      )}

      {fullType?.incubationTime && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/60">Incubation Time</span>
          <div className="flex items-center gap-1">
            <span className="text-sm text-white/80">
              {fullType.incubationTime / 60}min
            </span>
          </div>
        </div>
      )}

      {fullType?.shopAppearanceChance && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/60">Shop Chance</span>
          <div className="flex items-center gap-1">
            <span className="text-sm text-white/80">
              {formatNumber(fullType.shopAppearanceChance)}%
            </span>
          </div>
        </div>
      )}

      {type.sellValue && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/60">Current Value</span>
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-white">
              ${formatNumber(type.sellValue)}
            </span>
          </div>
        </div>
      )}

      {!type.sellValue && !type.buyPrice && (
        <div className="py-2 text-center @[20rem]:text-left">
          <span className="text-xs text-white/40">
            No pricing data available
          </span>
        </div>
      )}
    </div>
  );
}
