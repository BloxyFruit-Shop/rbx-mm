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
  weightKg?: number;
  mutations: string[];
}

export const availableMutations = [
  { value: "Shiny", label: "Shiny" },
  { value: "Large", label: "Large" },
  { value: "Small", label: "Small" },
  { value: "Golden", label: "Golden" },
  { value: "Rainbow", label: "Rainbow" },
  { value: "Glowing", label: "Glowing" },
  { value: "Crystalline", label: "Crystalline" },
  { value: "Ethereal", label: "Ethereal" },
];