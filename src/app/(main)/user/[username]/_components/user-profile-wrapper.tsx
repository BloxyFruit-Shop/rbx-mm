"use client";

import { Suspense } from "react";
import UserProfileClient from "./user-profile-client";
import UserProfileSkeleton from "./user-profile-skeleton";

interface UserProfileWrapperProps {
  username: string;
}

export default function UserProfileWrapper({ username }: UserProfileWrapperProps) {
  return (
    <Suspense fallback={<UserProfileSkeleton />}>
      <UserProfileClient username={username} />
    </Suspense>
  );
}