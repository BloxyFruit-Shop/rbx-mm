"use client";

import { Suspense } from "react";
import StockClient from "./stock-client";
import StockLoadingSkeleton from "./stock-loading-skeleton";

export default function StockWrapper() {
  return (
    <Suspense fallback={<StockLoadingSkeleton />}>
      <StockClient />
    </Suspense>
  );
}