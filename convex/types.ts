import type { Doc, Id } from "./_generated/dataModel";

// Base User (from auth, extended in application's `user` table)
export type BaseUser = Doc<"user">;

// Application-specific User Profile Data
export type UserProfile = Doc<"user"> & {
  // Extend with any frontend-only fields here
};

export type Item = Doc<"items">;

export type ItemDetails = {
  itemId: Id<"items">;
  quantity: number;
  price?: number;
  mutations?: string[];
  age?: number;
};

export type TradeAd = Doc<"tradeAds"> & {
  creator?: UserProfile;
  haveItemsResolved?: (Item & ItemDetails)[];
  wantItemsResolved?: (Item & ItemDetails)[];
};

export type Vouch = Doc<"vouches"> & {
  fromUser?: UserProfile;
  toUser?: UserProfile;
  tradeAd?: TradeAd;
};

export type SocialLink = {
  type: "discord" | "twitter" | "roblox" | "youtube" | "twitch";
  url: string;
};

export type Middleman = Doc<"middlemen"> & {
  user?: UserProfile;
};

export type MiddlemanRequest = Doc<"middlemanRequests"> & {
  requester?: UserProfile;
  middleman?: UserProfile;
  tradeAd?: TradeAd;
};

export type Stock = Doc<"stocks">;

export type UserSettings = Doc<"userSettings">;

// Role definitions
export const ROLES = {
  USER: "user",
  MIDDLEMAN: "middleman",
  ADMIN: "admin",
} as const;
export type Role = (typeof ROLES)[keyof typeof ROLES];

// Item types must match schema.ts
export const ITEM_TYPES = [
  "Crop",
  "Pet",
  "Gear",
  "Egg",
  "Crate",
  "Cosmetic",
] as const;
export type ItemType = (typeof ITEM_TYPES)[number];

// Item rarities must match schema.ts
export const ITEM_RARITIES = [
  "Common",
  "Uncommon",
  "Rare",
  "Epic",
  "Legendary",
  "Mythical",
  "Divine",
  "Prismatic",
] as const;
export type ItemRarity = (typeof ITEM_RARITIES)[number];

// Demand levels updated per schema.ts (added "Unknown")
export const DEMAND_LEVELS = [
  "VeryLow",
  "Low",
  "Medium",
  "High",
  "VeryHigh",
  "Unknown",
] as const;
export type DemandLevel = (typeof DEMAND_LEVELS)[number];

// Trade ad statuses
export const TRADE_AD_STATUSES = [
  "open",
  "closed",
  "expired",
  "cancelled",
] as const;
export type TradeAdStatus = (typeof TRADE_AD_STATUSES)[number];

// Middleman approval statuses
export const MIDDLEMAN_APPROVAL_STATUSES = [
  "pending",
  "approved",
  "rejected",
] as const;
export type MiddlemanApprovalStatus =
  (typeof MIDDLEMAN_APPROVAL_STATUSES)[number];

// Middleman request statuses
export const MIDDLEMAN_REQUEST_STATUSES = [
  "pending",
  "accepted",
  "declined",
  "cancelled",
  "completed",
] as const;
export type MiddlemanRequestStatus =
  (typeof MIDDLEMAN_REQUEST_STATUSES)[number];

export const RARITY_SORT_ORDER: Record<string, number> = {
  "N/A": 10,
  Common: 1,
  Uncommon: 2,
  Rare: 3,
  Epic: 4,
  Legendary: 5,
  Mythical: 6,
  Divine: 7,
  Prismatic: 8,
};

export type AttributedItem = Doc<"items">;

// Updated to reflect new stock structure without item reference
export type ResolvedStock = Doc<"stocks">;

// Game-specific item type mappings
export const GAME_ITEM_TYPES = {
  GrowAGarden: ["Crop", "Pet", "Egg", "Gear", "Crate", "Cosmetic"] as const,
} as const;

export type GameTag = keyof typeof GAME_ITEM_TYPES;
export type GameItemType<T extends GameTag> =
  (typeof GAME_ITEM_TYPES)[T][number];

// Type helpers for game-specific item types
export type GrowAGardenItemType = GameItemType<"GrowAGarden">;

// Future games can be added like:
// export type SomeOtherGameItemType = GameItemType<"SomeOtherGame">;


// Demand level colors for UI components
export const DEMAND_COLORS = {
  VeryLow: "text-red-400 bg-red-500/10 border-red-500/20",
  Low: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  Medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  High: "text-green-400 bg-green-500/10 border-green-500/20",
  VeryHigh: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Unknown: "text-white/60 bg-white/5 border-white/10",
} as const;

