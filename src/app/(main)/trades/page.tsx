import GradientBackground from "~/components/layout/gradient-background";
import { BetterBadge } from "~/components/ui/better-badge";
import TradesClient from "./_components/trades-client";
import { getTranslations } from 'next-intl/server';

export const metadata = {
  title: "Trade Hub - Secure Grow a Garden Item Trading | RBXMM",
  description:
    "Trade Grow a Garden items safely with verified players. Browse active trade ads, create listings, and find rare pets, crops, and gear. Join 50,000+ trusted traders on RBXMM.",
  keywords: "grow a garden trading, roblox trading, pet trading, crop trading, secure trades, rbxmm",
  openGraph: {
    title: "Trade Hub - Secure Grow a Garden Trading",
    description: "Trade Grow a Garden items safely with verified players. Browse active trade ads and find rare items.",
    type: "website",
  },
};

async function TradesPage() {
  const t = await getTranslations('trades');
  return (
    <GradientBackground still>
      <div className="min-h-screen pt-[72px]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="animate-pulse-slow absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-gradient-to-r from-[#9747FF]/10 to-[#7E3BFF]/10 blur-3xl" />
          <div
            className="animate-pulse-slow absolute right-1/4 bottom-1/4 h-80 w-80 rounded-full bg-gradient-to-r from-[#7E3BFF]/10 to-[#9747FF]/10 blur-3xl"
            style={{ animationDelay: "2s" }}
          />
        </div>

        <div className="relative z-10 h-full">
          <div className="container h-full px-4 py-16 mx-auto max-w-7xl">
            <div className="relative mb-12">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#9747FF]/5 to-[#7E3BFF]/5 blur-3xl"></div>
              <div className="relative">
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <BetterBadge variant="success" size="default">
                      <span className="flex items-center gap-2">
                        {t('liveTrades')}
                      </span>
                    </BetterBadge>
                  </div>

                  <div>
                    <h1 className="mb-4 text-4xl font-bold text-white lg:text-6xl">
                      <span className="bg-gradient-to-r from-[#9747FF] to-[#7E3BFF] bg-clip-text text-transparent">
                        {t('title')}
                      </span>{" "}
                      - {t('secureTrading')}
                    </h1>
                    <p className="max-w-3xl text-lg leading-relaxed text-white/70 lg:text-xl">
                      {t('description')}
                      <span className="font-medium text-white">
                        {" "}
                        {t('descriptionHighlight')}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <TradesClient />
          </div>
        </div>
      </div>
    </GradientBackground>
  );
}

export default TradesPage;