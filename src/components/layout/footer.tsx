"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";
import { DiscordIcon } from "~/components/icons/discord";
import { TwitterIcon } from "~/components/icons/twitter";
import LogoIcon from "~/components/ui/logo";
import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('footer');
  const tNav = useTranslations('navigation');
  return (
    <footer className="relative">
      <div className="absolute inset-x-0 h-24 -top-24 bg-gradient-to-t from-purple-950/50 to-transparent" />

      <div className="border-t border-white/10 bg-black/30">
        <div className="container px-4 pt-8 pb-4 mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
            <div className="space-y-4 md:col-span-4">
              <LogoIcon className="justify-center hover:scale-105 md:justify-start md:hover:translate-x-2" />
              <p className="max-w-sm text-base text-center text-pretty text-white/70 md:text-left">
                Level up your game with the most trusted Grow a Garden item
                trading platform. Join our trading community today!
              </p>
              <Button
                className="flex w-full items-center gap-2 bg-gradient-to-r from-[#5865F2] to-[#4752C4] transition-all duration-300 hover:from-[#4752C4] hover:to-[#3b44a8] sm:w-auto"
                size="lg"
                asChild
              >
                <Link href="https://discord.gg/example" target="_blank">
                  <DiscordIcon className="size-5" />
                  Join our Discord
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 md:col-span-8">
              <div className="space-y-4">
                <h3 className="bg-gradient-to-r from-[#5865F2] to-[#4752C4] bg-clip-text text-lg font-bold text-transparent">
                  Trading Hub
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="/trading"
                      className="flex items-center gap-2 transition-colors duration-200 text-white/70 hover:text-white"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#5865F2]" />
                      Trade Ads
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/values"
                      className="flex items-center gap-2 transition-colors duration-200 text-white/70 hover:text-white"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#5865F2]" />
                      Item Values
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/values"
                      className="flex items-center gap-2 transition-colors duration-200 text-white/70 hover:text-white"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#5865F2]" />
                      Live Stocks
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/middleman"
                      className="flex items-center gap-2 transition-colors duration-200 text-white/70 hover:text-white"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#5865F2]" />
                      Middleman Directory
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="bg-gradient-to-r from-[#5865F2] to-[#4752C4] bg-clip-text text-lg font-bold text-transparent">
                  Community
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="/vouch"
                      className="flex items-center gap-2 transition-colors duration-200 text-white/70 hover:text-white"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#5865F2]" />
                      Vouches
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/discord"
                      className="flex items-center gap-2 transition-colors duration-200 text-white/70 hover:text-white"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#5865F2]" />
                      Discord
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="bg-gradient-to-r from-[#5865F2] to-[#4752C4] bg-clip-text text-lg font-bold text-transparent">
                  Legal
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="/terms"
                      className="flex items-center gap-2 transition-colors duration-200 text-white/70 hover:text-white"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#5865F2]" />
                      {t('terms')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/privacy"
                      className="flex items-center gap-2 transition-colors duration-200 text-white/70 hover:text-white"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#5865F2]" />
                      {t('privacy')}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 pt-8 mt-16 border-t border-white/10 md:flex-row">
            <p className="text-sm text-white/60">
              © {new Date().getFullYear()} RbxMM. {t('allRightsReserved')}.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="https://discord.gg/example"
                target="_blank"
                className="flex items-center justify-center w-10 h-10 transition-colors duration-200 rounded-xl bg-white/5 hover:bg-white/10"
                aria-label="Discord"
              >
                <DiscordIcon className="size-5" />
              </Link>
              <Link
                href="https://twitter.com/example"
                target="_blank"
                className="flex items-center justify-center w-10 h-10 transition-colors duration-200 rounded-xl bg-white/5 hover:bg-white/10"
                aria-label="Twitter"
              >
                <TwitterIcon className="size-5" />
              </Link>
            </div>
          </div>

          <p className="mt-8 text-xs text-center text-white/40">
            RbxMM is a 3rd party website that is not affiliated with or endorsed
            by Roblox Corporation or Grow a Garden.
          </p>
        </div>
      </div>
    </footer>
  );
}
