import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "fetchStockUpdates",
  {minutes : 5},
  internal.stockUpdater.fetchStockData,
  {}
);

export default crons;