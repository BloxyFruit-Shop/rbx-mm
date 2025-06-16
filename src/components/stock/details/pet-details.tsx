import { formatNumber } from "~/lib/format-number";
import type { PetType, ItemDetailsProps } from "~convex/types";

type PetDetailsProps = ItemDetailsProps<PetType>;

export default function PetDetails({ type }: PetDetailsProps) {
  return (
    <div className="flex flex-1 flex-col justify-end space-y-2">
      {type.spawnChance && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/60">Spawn Chance</span>
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-white">
              {type.spawnChance * 100}%
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

      {type.comesFromEggId && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/60">From Egg</span>
          <span className="text-sm text-white/80">Yes</span>
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
