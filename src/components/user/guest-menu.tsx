import { HelpCircle, EllipsisVertical, Languages, Check, LogIn } from "lucide-react";
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
import Link from "next/link";
import { Skeleton } from "~/components/ui/skeleton";
import { useLocale } from 'next-intl';
import { cn } from "~/lib/utils";

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

function GuestMenu() {
  const locale = useLocale();

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
          <div className="flex items-center justify-center border rounded-lg size-8 bg-white/10 border-white/20">
            <p className="text-xl text-white/80">?</p>
          </div>
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
              <div className="flex items-center justify-center border rounded-lg size-8 bg-white/10 border-white/20">
                <p className="text-xl text-white/80">?</p>
              </div>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#9747FF]/20 to-[#7E3BFF]/20 blur-sm" />
            </div>
            <div className="grid flex-1 text-sm leading-tight text-left">
              <span className="font-semibold text-white truncate">
                Guest User
              </span>
              <span className="text-xs truncate text-white/60">
                Not signed in
              </span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="mx-2 bg-white/10" />

        <DropdownMenuGroup className="p-1">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="group relative overflow-hidden rounded-lg px-3 py-2.5 text-white/90 transition-all duration-150 hover:bg-white/8 hover:text-white focus:bg-white/8 data-[state=open]:bg-white/10">
              <div className="relative z-10 flex items-center gap-3">
                <Languages className="size-4 text-white/70 transition-all duration-150 group-hover:text-white group-data-[state=open]:text-white" />
                <span className="font-medium">Language</span>
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs transition-colors duration-150 text-white/60 group-hover:text-white/80">
                    {currentLanguage?.flag}
                  </span>
                  <span className="text-xs transition-colors duration-150 text-white/50 group-hover:text-white/70">
                    {currentLanguage?.name}
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
                      "group relative overflow-hidden rounded-lg px-3 py-2.5 text-white/90 transition-all duration-150 hover:bg-white/10 hover:text-white focus:bg-white/10 cursor-pointer",
                      locale === language.code && "bg-white/8 text-white"
                    )}
                    style={{ 
                      animationDelay: `${index * 30}ms`,
                      animation: 'fadeInUp 0.2s ease-out forwards'
                    }}
                  >
                    <div className="relative z-10 flex items-center gap-3">
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
                      {locale === language.code && (
                        <Check className="size-4 text-white/80" />
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
          <DropdownMenuItem asChild>
            <Link
              href="/login"
              className="group relative overflow-hidden rounded-lg px-3 py-2.5 text-white/90 transition-all duration-200 hover:bg-gradient-to-r hover:from-[#9747FF]/20 hover:to-[#7E3BFF]/20 hover:text-white focus:bg-gradient-to-r focus:from-[#9747FF]/20 focus:to-[#7E3BFF]/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#9747FF]/10 to-[#7E3BFF]/5 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              <div className="relative z-10 flex items-center gap-3">
                <LogIn className="size-4 text-[#9747FF] transition-colors duration-200" />
                <span className="font-medium">Sign In</span>
              </div>
            </Link>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function GuestMenuSkeleton() {
  return (
    <div className="relative flex items-center gap-2 overflow-hidden rounded-md border border-white/10 bg-gradient-to-r from-[#3A2564]/80 to-[#2A1854]/80 px-3 py-2 shadow-lg">
      <Skeleton className="w-8 h-8 rounded-lg bg-white/20" />
      <Skeleton className="w-4 h-4 ml-auto bg-white/20" />
    </div>
  );
}

export default GuestMenu;