import { ArrowLeftSquare, EllipsisVertical, Languages, Check, User } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import UserAvatar from "./user-avatar";
import { sessionQueryOptions, signOut } from "~/lib/auth-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Skeleton } from "~/components/ui/skeleton";
import { useLocale } from 'next-intl';
import { cn } from "~/lib/utils";

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

function UserMenu() {
  const { data: session } = useQuery(sessionQueryOptions);
  const qc = useQueryClient();
  const router = useRouter();
  const locale = useLocale();

  const user = {
    name: session?.user.name ?? "",
    email: session?.user.email ?? "",
    image: session?.user.image,
  };

  const switchLanguage = (newLocale: string) => {
    // Set the locale cookie with proper settings
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=lax`;
    
    // Force a hard refresh to apply the new locale
    window.location.reload();
  };

  const currentLanguage = languages.find(lang => lang.code === locale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="user" variant="user" className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#9747FF]/10 to-[#7E3BFF]/10 opacity-0 transition-opacity duration-300 hover:opacity-100" />
          <UserAvatar user={user} />
          <EllipsisVertical className="relative z-10 ml-auto size-4 text-white/80" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl border border-white/10 bg-gradient-to-b from-(--gag-bg)/60 to-(--gag-bg-light)/80 shadow-2xl backdrop-blur-sm"
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
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="group relative overflow-hidden rounded px-3 py-2.5 text-white/90 transition-all duration-150 hover:bg-white/8 hover:text-white focus:bg-white/8 data-[state=open]:bg-white/10">
              <div className="relative z-10 flex items-center gap-3">
                <Languages className="size-4 text-white/70 transition-all duration-150 group-hover:text-white group-data-[state=open]:text-white" />
                <span className="font-medium">Language</span>
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs transition-colors duration-150 text-white/60 group-hover:text-white/80">
                    {currentLanguage?.flag}
                  </span>
                  <span className="text-xs transition-colors duration-150 text-white/50 group-hover:text-white/70">
                    {currentLanguage?.code.toUpperCase()}
                  </span>
                </div>
              </div>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-48">
              <div className="space-y-0.5">
                {languages.map((language, index) => (
                  <DropdownMenuItem
                    key={language.code}
                    onClick={() => switchLanguage(language.code)}
                    className={cn(
                      "group relative overflow-hidden rounded px-3 py-1.5 text-white/90 transition-all duration-150 hover:bg-white/10 hover:text-white focus:bg-white/10 cursor-pointer",
                      locale === language.code && "bg-white/8 text-white"
                    )}
                    style={{ 
                      animationDelay: `${index * 30}ms`,
                      animation: 'fadeInUp 0.2s ease-out forwards'
                    }}
                  >
                    <div className="relative z-10 flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                      <span className="text-lg transition-transform duration-150">
                        {language.flag}
                      </span>
                      <div className="flex-1">
                        <span className="font-medium transition-colors duration-150">
                          {language.name}
                        </span>
                        <div className="text-xs transition-colors duration-150 text-white/50 group-hover:text-white/70">
                          {language.code.toUpperCase()}
                        </div>
                      </div>
                      </div>
                      {locale === language.code && (
                        <div className="bg-purple-500 rounded-full size-2 animate-pulse" />
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="mx-2 bg-white/10" />

        <div className="p-1">
          <DropdownMenuItem
            onClick={() => {
              router.push(`/user/${encodeURIComponent(user.email)}`);
            }}
            className="group relative overflow-hidden rounded px-3 py-2.5 text-white/90 transition-all duration-200 hover:bg-white/8 hover:text-white focus:bg-white/8"
          >
            <div className="relative z-10 flex items-center gap-3">
              <User className="text-white/70 transition-colors duration-200 size-4 group-hover:text-white" />
              <span className="font-medium">Profile</span>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem
            onClick={() => {
              router.push("/")
              signOut()
                .then(() => qc.invalidateQueries())
                .then(() => router.refresh())
                .catch((error) => {
                  console.error(error);
                });
            }}
            className="group relative overflow-hidden rounded px-3 py-2.5 text-red-300 transition-all duration-200 hover:bg-gradient-to-r hover:from-red-500/20 hover:to-red-600/20 hover:text-red-200 focus:bg-gradient-to-r focus:from-red-500/20 focus:to-red-600/20"
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
    <div className="relative flex items-center gap-2 overflow-hidden rounded-md border border-white/10 bg-gradient-to-r from-[#3A2564]/80 to-[#2A1854]/80 px-3 py-2 shadow-lg">
      <Skeleton className="w-8 h-8 rounded-full bg-white/20" />
      <Skeleton className="w-4 h-4 ml-auto bg-white/20" />
    </div>
  );
}

export default UserMenu;
