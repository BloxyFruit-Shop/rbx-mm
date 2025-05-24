
import Image from 'next/image';
import Link from 'next/link';
import { Button } from "~/components/ui/button";
import { DiscordIcon } from '~/components/icons/discord';
import { TwitterIcon } from '~/components/icons/twitter';

export function Footer() {
  return (
    <footer className="relative">
      <div className="absolute inset-x-0 -top-24 h-24 bg-gradient-to-t from-purple-950/50 to-transparent" />
      
      <div className="border-t border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="container max-w-7xl mx-auto pt-8 pb-4 px-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-4 space-y-6">
              <Link href="/" className="group flex items-center gap-3 hover:scale-105 hover:translate-x-2 transition-all">
                <Image src="/images/logo.webp" width={140} height={54} alt="RbxMM Logo" />
              </Link>
              <p className="text-base text-white/70 max-w-sm">
                Level up your game with the most trusted Grow a Garden item trading platform. 
                Join our trading community today!
              </p>
              <Button
                className="w-full sm:w-auto flex items-center gap-2 bg-gradient-to-r from-[#5865F2] to-[#4752C4] hover:from-[#4752C4] hover:to-[#3b44a8] transition-all duration-300"
                size="lg"
                asChild
              >
                <Link href="https://discord.gg/example" target="_blank">
                  <DiscordIcon className="size-5" />
                  Join our Discord
                </Link>
              </Button>
            </div>

            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="space-y-4">
                <h3 className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-[#5865F2] to-[#4752C4]">
                  Trading Hub
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/trading" className="text-white/70 hover:text-white transition-colors duration-200 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5865F2]" />
                      Trade Ads
                    </Link>
                  </li>
                  <li>
                    <Link href="/values" className="text-white/70 hover:text-white transition-colors duration-200 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5865F2]" />
                      Item Values
                    </Link>
                  </li>
                  <li>
                    <Link href="/stocks" className="text-white/70 hover:text-white transition-colors duration-200 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5865F2]" />
                      Live Stocks
                    </Link>
                  </li>
                  <li>
                    <Link href="/middleman" className="text-white/70 hover:text-white transition-colors duration-200 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5865F2]" />
                      Middleman Directory
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-[#5865F2] to-[#4752C4]">
                  Community
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/vouch" className="text-white/70 hover:text-white transition-colors duration-200 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5865F2]" />
                      Vouches
                    </Link>
                  </li>
                  <li>
                    <Link href="/discord" className="text-white/70 hover:text-white transition-colors duration-200 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5865F2]" />
                      Discord
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-[#5865F2] to-[#4752C4]">
                  Legal
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/terms-of-service" className="text-white/70 hover:text-white transition-colors duration-200 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5865F2]" />
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy-policy" className="text-white/70 hover:text-white transition-colors duration-200 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5865F2]" />
                      Privacy Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/60">
              © {new Date().getFullYear()} RbxMM. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="https://discord.gg/example"
                target="_blank"
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors duration-200"
                aria-label="Discord"
              >
                <DiscordIcon className="size-5" />
              </Link>
              <Link
                href="https://twitter.com/example"
                target="_blank"
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors duration-200"
                aria-label="Twitter"
              >
                <TwitterIcon className="size-5" />
              </Link>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-white/40">
            RbxMM is a 3rd party website that is not affiliated with or endorsed by Roblox Corporation or Grow a Garden.
          </p>
        </div>
      </div>
    </footer>
  );
}
