"use client";

import { Suspense } from 'react';
import ItemsClient from './items-client';
import ItemGridSkeleton from '~/components/stock/item-grid-skeleton';
import { Skeleton } from '~/components/ui/skeleton';

export default function ItemsWrapper() {
  return (
    <Suspense 
      fallback={
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row lg:flex-col xl:flex-row">
            <Skeleton className="ml-auto h-11 w-36 bg-white/10 lg:mr-6" />
          </div>
          
          <ItemGridSkeleton />
        </div>
      }
    >
      <ItemsClient />
    </Suspense>
  );
}