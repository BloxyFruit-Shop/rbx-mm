import type { Doc, Id } from "./_generated/dataModel";

// Base User (from auth, extended in application's `user` table)
export type BaseUser = Doc<"user">;

// Application-specific User Profile Data
export type UserProfile = Doc<"user"> & {
  // Extend with any frontend-only fields here
};

export type Item = Doc<"items">;
export type ItemValueHistory = Doc<"itemValueHistory">;

export type ItemDetails = {
  itemId: Id<"items">;
  quantity: number;
  weightKg?: number;
  mutations?: string[];
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

export type Stock = Doc<"stocks"> & {
  item?: Item;
};

export type StockHistory = Doc<"stockHistory">;
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
  "Sprinkler",
  "Fruit",
  "Egg",
  "Tool",
  "Material",
  "Misc",
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
  "Prismatic"
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
export type MiddlemanApprovalStatus = (typeof MIDDLEMAN_APPROVAL_STATUSES)[number];

// Middleman request statuses
export const MIDDLEMAN_REQUEST_STATUSES = [
  "pending",
  "accepted",
  "declined",
  "cancelled",
  "completed",
] as const;
export type MiddlemanRequestStatus = (typeof MIDDLEMAN_REQUEST_STATUSES)[number];