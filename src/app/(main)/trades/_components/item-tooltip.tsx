import { Badge } from "~/components/ui/badge";
import Image from "next/image";
import type { Doc } from "~convex/_generated/dataModel";

interface ItemTooltipProps {
  item: Doc<"items"> & {
    quantity: number;
    price?: number;
    mutations?: string[];
    age?: number;
  };
}

export default function ItemTooltip({ item }: ItemTooltipProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative overflow-hidden border rounded size-12 border-white/20 bg-white/10">
          <Image
            src={item.thumbnailUrl}
            alt={item.name}
            fill
            className="object-contain p-1"
            sizes="48px"
          />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-white">{item.name}</h4>
          <p className="text-sm text-white/60">Quantity: {item.quantity}</p>
        </div>
      </div>

      {item.description && (
        <p className="text-sm text-white/70">{item.description}</p>
      )}

      {(item.price ?? item.age) && (
        <div className="flex flex-wrap gap-2">
          {item.price && (
            <Badge variant="outline" className="text-xs text-green-300 border-green-500/30 bg-green-500/20">
              ${item.price}
            </Badge>
          )}
          {item.age && (
            <Badge variant="outline" className="text-xs text-blue-300 border-blue-500/30 bg-blue-500/20">
              {item.age} age
            </Badge>
          )}
        </div>
      )}

      {item.mutations && item.mutations.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-white/80">Mutations:</p>
          <div className="flex flex-wrap gap-1">
            {item.mutations.map((mutation, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs text-purple-300 border-purple-500/30 bg-purple-500/20"
              >
                {mutation}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
