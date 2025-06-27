"use client";

import type { Doc } from "~convex/_generated/dataModel";
import type { PublicUserProfile } from "~convex/user";
import MiddlemanCard from './middleman-card';
import MiddlemanListItem from './middleman-list-item';

type MiddlemanWithProfile = Doc<"middlemen"> & {
  userProfile?: PublicUserProfile | null;
};

interface MiddlemanGridProps {
  middlemen: MiddlemanWithProfile[];
  viewMode: 'grid' | 'list';
}

export default function MiddlemanGrid({ middlemen, viewMode }: MiddlemanGridProps) {
  if (viewMode === 'list') {
    return (
      <div className="space-y-3">
        {middlemen.map((middleman) => (
          <MiddlemanListItem key={middleman._id} middleman={middleman} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {middlemen.map((middleman) => (
        <MiddlemanCard key={middleman._id} middleman={middleman} />
      ))}
    </div>
  );
}