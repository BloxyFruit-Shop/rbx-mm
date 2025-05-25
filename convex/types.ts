import type { Doc, Id } from "./_generated/dataModel";

// Base User (from auth, extended in application's `users` table)
export type BaseUser = Doc<"users">; // This is the auth user

// Application-specific User Profile Data
export type UserProfile = Doc<"users"> & { // This refers to the `users` table in `applicationTables`
  // _id here is the same as BaseUser._id if you structure auth correctly
  // or you'd link it via a userId field if they were separate tables.
  // Given the template, authTables.users IS the user table.
  // We are extending it with robloxUserId, roles etc.
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
  // Resolved creator and item details can be added in queries
  creator?: UserProfile;
  haveItemsResolved?: (Item & { quantity: number; weightKg?: number; mutations?: string[] })[];
  wantItemsResolved?: (Item & { quantity: number; weightKg?: number; mutations?: string[] })[];
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
  user?: UserProfile; // Resolved user details
};

export type MiddlemanRequest = Doc<"middlemanRequests"> & {
  requester?: UserProfile;
  middleman?: UserProfile; // The middleman user
  tradeAd?: TradeAd;
};

export type Stock = Doc<"stocks"> & {
  item?: Item; // Resolved item details
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

// Item types and rarities can also be exported if needed for frontend dropdowns etc.
export const ITEM_TYPES = ["Seed", "Gear", "Egg", "Misc", "Pet"] as const;
export type ItemType = (typeof ITEM_TYPES)[number];

export const ITEM_RARITIES = ["Common", "Uncommon", "Rare", "Epic", "Legendary", "Mythic"] as const;
export type ItemRarity = (typeof ITEM_RARITIES)[number];

export const DEMAND_LEVELS = ["VeryLow", "Low", "Medium", "High", "VeryHigh"] as const;
export type DemandLevel = (typeof DEMAND_LEVELS)[number];

export const TRADE_AD_STATUSES = ["open", "closed", "expired", "cancelled"] as const;
export type TradeAdStatus = (typeof TRADE_AD_STATUSES)[number];

export const MIDDLEMAN_APPROVAL_STATUSES = ["pending", "approved", "rejected"] as const;
export type MiddlemanApprovalStatus = (typeof MIDDLEMAN_APPROVAL_STATUSES)[number];

export const MIDDLEMAN_REQUEST_STATUSES = ["pending", "accepted", "declined", "cancelled", "completed"] as const;
export type MiddlemanRequestStatus = (typeof MIDDLEMAN_REQUEST_STATUSES)[number];
