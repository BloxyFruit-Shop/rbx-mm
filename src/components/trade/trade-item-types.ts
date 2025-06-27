import type { Id } from "~convex/_generated/dataModel";

// Type for items returned from search API (new schema)
export type SearchResultItem = {
  _id: Id<"items">;
  _creationTime: number;
  name: string;
  gameId: Id<"games">;
  thumbnailUrl: string;
  category: string;
  rarity: string;
  sellValue?: number;
  buyPrice?: number;
  attributes: Array<{
    type: "key-value" | "percentile" | "image-link" | "tag";
    title: string;
    content?: string | number;
    imageUrl?: string;
    link?: string;
  }>;
};

export interface TradeItem {
  itemId: Id<"items">;
  item: SearchResultItem;
  quantity: number;
  price?: number; // Price in dollars for crops
  mutations: string[];
  age?: number; // Age for pets
}

export const availableMutations = [
  { value: "Gold", label: "Gold" },
  { value: "Rainbow", label: "Rainbow" },
  { value: "Wet", label: "Wet" },
  { value: "Shocked", label: "Shocked" },
  { value: "Chilled", label: "Chilled" },
  { value: "Frozen", label: "Frozen" },
  { value: "Moonlit", label: "Moonlit" },
  { value: "Bloodlit", label: "Bloodlit" },
  { value: "Celestial", label: "Celestial" },
  { value: "Zombified", label: "Zombified" },
  { value: "Disco", label: "Disco" },
  { value: "Pollinated", label: "Pollinated" },
  { value: "HoneyGlazed", label: "HoneyGlazed" },
  { value: "Voidtouched", label: "Voidtouched" },
  { value: "Twisted", label: "Twisted" },
  { value: "Plasma", label: "Plasma" },
  { value: "Heavenly", label: "Heavenly" },
  { value: "Choc", label: "Choc" },
  { value: "Meteoric", label: "Meteoric" },
  { value: "Burnt", label: "Burnt" },
  { value: "Cooked", label: "Cooked" },
  { value: "Molten", label: "Molten" },
  { value: "Dawnbound", label: "Dawnbound" },
  { value: "Alienlike", label: "Alienlike" },
  { value: "Galactic", label: "Galactic" },
  { value: "Verdant", label: "Verdant" },
  { value: "Paradisal", label: "Paradisal" },
  { value: "Sundried", label: "Sundried" },
  { value: "Windstruck", label: "Windstruck" },
  { value: "Drenched", label: "Drenched" },
  { value: "Wilt", label: "Wilt" },
  { value: "Wiltproof", label: "Wiltproof" },
  { value: "Aurora", label: "Aurora" },
  { value: "Fried", label: "Fried" },
  { value: "Cloudtouched", label: "Cloudtouched" },
];