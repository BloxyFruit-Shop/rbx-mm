import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "fetchSeedsStockUpdates",
  { minutes: 5 },
  internal.stockUpdater.fetchStockData,
  { type: "seeds" },
);

crons.interval(
  "fetchGearStockUpdates",
  {minutes : 5},
  internal.stockUpdater.fetchStockData,
  {type: "gears"}
);

crons.interval(
  "fetchEggsStockUpdates",
  {minutes : 30},
  internal.stockUpdater.fetchStockData,
  {type: "eggs"}
);

crons.interval(
  "fetchEventShopStockUpdates",
  { minutes: 60 },
  internal.stockUpdater.fetchStockData,
  { type: "event-shop-stock" },
);

crons.interval(
  "fetchCosmeticsStockUpdates",
  { minutes: 30 },
  internal.stockUpdater.fetchStockData,
  { type: "cosmetics" },
);

crons.interval(
  "fetchWeatherUpdates",
  { minutes: 5 },
  internal.stockUpdater.fetchStockData,
  { type: "weather" },
);

export default crons;