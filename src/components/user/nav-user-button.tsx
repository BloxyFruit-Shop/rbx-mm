"use client";

import UserMenu, { UserMenuSkeleton } from "./user-menu";
import SignInButton from "../auth/sign-in";
import { LanguageSwitcher } from "../ui/language-switcher";
import { Authenticated, Unauthenticated } from "../auth/auth-requirement";
import { LogIn } from "lucide-react";

function NavUserButton({ className }: { className?: string }) {
  return (
    <div className={className ?? ""}>
      <Unauthenticated fallback={<UserMenuSkeleton />}>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <SignInButton 
            provider="roblox" 
            variant="ghost"
            size="sm"
            className="gap-2"
          >
            <LogIn className="size-4" />
            Sign In
          </SignInButton>
        </div>
      </Unauthenticated>
      <Authenticated>
        <UserMenu />
      </Authenticated>
    </div>
  );
}

export default NavUserButton;
