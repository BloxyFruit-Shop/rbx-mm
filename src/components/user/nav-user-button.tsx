"use client";

import UserMenu, { UserMenuSkeleton } from "./user-menu";
import GuestMenu, { GuestMenuSkeleton } from "./guest-menu";
import { Authenticated, Unauthenticated } from "../auth/auth-requirement";

function NavUserButton({ className }: { className?: string }) {
  return (
    <div className={className ?? ""}>
      <Unauthenticated fallback={<UserMenuSkeleton />}>
        <GuestMenu />
      </Unauthenticated>
      <Authenticated>
        <UserMenu />
      </Authenticated>
    </div>
  );
}

export default NavUserButton;
