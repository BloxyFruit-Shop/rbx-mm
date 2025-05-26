import { ArrowLeftSquare, EllipsisVertical, UserCircle2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import UserAvatar from "./user-avatar";
import Link from "next/link";
import { signOut } from "~/lib/auth-client";
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Skeleton } from '~/components/ui/skeleton';

interface UserMenuProps {
  user?: {
    name: string;
    email: string;
    image?: string | null | undefined;
  };
}

function UserMenu({ user }: UserMenuProps) {
  const qc = useQueryClient();
  const router = useRouter();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="user"
          variant="user"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#9747FF]/10 to-[#7E3BFF]/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
          <UserAvatar user={user} />
          <EllipsisVertical className="relative z-10 ml-auto size-4 text-white/80" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl border border-white/10 bg-gradient-to-b from-(--gag-bg)/60 to-(--gag-bg-light)/60 backdrop-blur-xl shadow-2xl"
        side={"bottom"}
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-3 px-3 py-3 text-sm text-left">
            <div className="relative">
              <UserAvatar user={user} />
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#9747FF]/20 to-[#7E3BFF]/20 blur-sm" />
            </div>
            <div className="grid flex-1 text-sm leading-tight text-left">
              <span className="font-semibold text-white truncate">{user?.name}</span>
              <span className="text-xs truncate text-white/60">
                {user?.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="mx-2 bg-white/10" />
        
        <DropdownMenuGroup className="p-1">
          <DropdownMenuItem asChild>
            <Link 
              href="/account"
              className="group relative overflow-hidden rounded-lg px-3 py-2.5 text-white/90 hover:text-white transition-all duration-200 hover:bg-gradient-to-r hover:from-[#9747FF]/20 hover:to-[#7E3BFF]/20 focus:bg-gradient-to-r focus:from-[#9747FF]/20 focus:to-[#7E3BFF]/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#9747FF]/10 to-[#7E3BFF]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <div className="relative z-10 flex items-center gap-3">
                <UserCircle2 className="size-4 text-[#9747FF]  transition-colors duration-200" />
                <span className="font-medium">Account Settings</span>
              </div>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator className="mx-2 bg-white/10" />
        
        <div className="p-1">
          <DropdownMenuItem
            onClick={() => {
              signOut()
                .then(() => qc.invalidateQueries())
                .then(() => router.refresh())
                .catch((error) => {
                  console.error(error);
                });
            }}
            className="group relative overflow-hidden rounded-lg px-3 py-2.5 text-red-300 hover:text-red-200 transition-all duration-200 hover:bg-gradient-to-r hover:from-red-500/20 hover:to-red-600/20 focus:bg-gradient-to-r focus:from-red-500/20 focus:to-red-600/20"
          >
            <div className="absolute inset-0 transition-opacity duration-200 opacity-0 bg-gradient-to-r from-red-500/10 to-red-600/10 group-hover:opacity-100" />
            <div className="relative z-10 flex items-center gap-3">
              <ArrowLeftSquare className="text-red-400 transition-colors duration-200 size-4 group-hover:text-red-300" />
              <span className="font-medium">Sign Out</span>
            </div>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function UserMenuSkeleton() {
  return (
    <div className="relative overflow-hidden border border-white/10 bg-gradient-to-r from-[#3A2564]/80 to-[#2A1854]/80 backdrop-blur-xl shadow-lg rounded-md px-3 py-2 flex items-center gap-2">
      <Skeleton className="w-8 h-8 rounded-full bg-white/20" />
      <Skeleton className="w-4 h-4 ml-auto bg-white/20" />
    </div>
  );
}

export default UserMenu;