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

export default crons;
