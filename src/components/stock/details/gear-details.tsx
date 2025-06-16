import { formatNumber } from "~/lib/format-number";
import type { GearType, SimplifiedItemType, ItemDetailsProps } from "~convex/types";

type GearDetailsProps = ItemDetailsProps<GearType | SimplifiedItemType>;

export default function GearDetails({ type }: GearDetailsProps) {
  // Type guard to check if this is a full GearType
  const isFullGearType = (t: GearType | SimplifiedItemType): t is GearType => {
    return 'powerLevel' in t;
  };

  const fullType = isFullGearType(type) ? type : null;

  return (
    <div className="flex flex-1 flex-col justify-end space-y-2">
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

      {fullType?.powerLevel && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/60">Power Level</span>
          <div className="flex items-center gap-1">
            <span className="text-sm text-white/80">
              {fullType.powerLevel}
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
