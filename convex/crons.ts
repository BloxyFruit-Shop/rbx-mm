import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "fetchSeedsStockUpdates",
  {minutes : 5},
  internal.stockUpdater.fetchStockData,
  {type: "seeds"}
);

// crons.interval(
//   "fetchSeedsStockUpdates",
//   {minutes : 5},
//   internal.stockUpdater.fetchStockData,
//   {type: "gear"}
// );

// crons.interval(
//   "fetchSeedsStockUpdates",
//   {minutes : 30},
//   internal.stockUpdater.fetchStockData,
//   {type: "eggs"}
// );

export default crons;