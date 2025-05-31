"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";
import UserMenu, { UserMenuSkeleton } from "./user-menu";
import { Authenticated, Unauthenticated } from "../auth/auth-requirement";

function NavUserButton({className} : { className?: string }) {
  return (
    <div className={className ?? ""}>
      <Unauthenticated fallback={<UserMenuSkeleton />}>
        <Button variant="ghost" size="user" asChild>
          <Link href="/login" className="flex items-center gap-2">
            Login
          </Link>
        </Button>
      </Unauthenticated>
      <Authenticated>
        <UserMenu />
      </Authenticated>
    </div>
  );
}

export default NavUserButton;
