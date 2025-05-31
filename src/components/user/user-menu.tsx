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
} from "~/components/ui/dropdown-menu";
import UserAvatar from "./user-avatar";
import Link from "next/link";
import { sessionQueryOptions, signOut } from "~/lib/auth-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Skeleton } from "~/components/ui/skeleton";

function UserMenu() {
  const { data: session } = useQuery(sessionQueryOptions);
  const qc = useQueryClient();
  const router = useRouter();

  const user = {
    name: session?.user.name ?? "",
    email: session?.user.email ?? "",
    image: session?.user.image,
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="user" variant="user">
          <div className="absolute inset-0 bg-gradient-to-r from-[#9747FF]/10 to-[#7E3BFF]/10 opacity-0 transition-opacity duration-300 hover:opacity-100" />
          <UserAvatar user={user} />
          <EllipsisVertical className="relative z-10 ml-auto size-4 text-white/80" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl border border-white/10 bg-gradient-to-b from-(--gag-bg)/60 to-(--gag-bg-light)/60 shadow-2xl backdrop-blur-xl"
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
              <span className="font-semibold text-white truncate">
                {user?.name}
              </span>
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
              className="group relative overflow-hidden rounded-lg px-3 py-2.5 text-white/90 transition-all duration-200 hover:bg-gradient-to-r hover:from-[#9747FF]/20 hover:to-[#7E3BFF]/20 hover:text-white focus:bg-gradient-to-r focus:from-[#9747FF]/20 focus:to-[#7E3BFF]/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#9747FF]/10 to-[#7E3BFF]/5 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              <div className="relative z-10 flex items-center gap-3">
                <UserCircle2 className="size-4 text-[#9747FF] transition-colors duration-200" />
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
            className="group relative overflow-hidden rounded-lg px-3 py-2.5 text-red-300 transition-all duration-200 hover:bg-gradient-to-r hover:from-red-500/20 hover:to-red-600/20 hover:text-red-200 focus:bg-gradient-to-r focus:from-red-500/20 focus:to-red-600/20"
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
    <div className="relative flex items-center gap-2 overflow-hidden rounded-md border border-white/10 bg-gradient-to-r from-[#3A2564]/80 to-[#2A1854]/80 px-3 py-2 shadow-lg backdrop-blur-xl">
      <Skeleton className="w-8 h-8 rounded-full bg-white/20" />
      <Skeleton className="w-4 h-4 ml-auto bg-white/20" />
    </div>
  );
}

export default UserMenu;
