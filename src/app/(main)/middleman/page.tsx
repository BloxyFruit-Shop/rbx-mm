import GradientBackground from "~/components/layout/gradient-background";
import { BetterBadge } from "~/components/ui/better-badge";
import MiddlemanDirectory from "./_components/middleman-directory";
import ServiceOverview from "./_components/service-overview";
import { getTranslations } from 'next-intl/server';

export const metadata = {
  title: "Trusted Middleman Service - 100% Secure Trading | RBXMM",
  description:
    "Trade safely with our verified middleman service. Expert middlemen with 1000+ trades, 24/7 support, and 100% security guarantee. Join 50,000+ traders using RBXMM.",
  keywords: "middleman service, secure trading, roblox middleman, grow a garden trading, verified middlemen, safe trades",
  openGraph: {
    title: "Trusted Middleman Service - 100% Secure Trading",
    description: "Trade safely with our verified middleman service. Expert middlemen with 1000+ trades and 100% security guarantee.",
    type: "website",
  },
};

async function MiddlemanPage() {
  const t = await getTranslations('middleman');
  
  return (
    <GradientBackground still>
      <div className="min-h-screen pt-[72px]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="animate-pulse-slow absolute top-[10%] right-[10%] h-64 w-64 rounded-full bg-gradient-to-r from-emerald-500/8 to-green-400/8 blur-2xl" />
          <div
            className="animate-pulse-slow absolute bottom-[20%] left-[15%] h-80 w-80 rounded-full bg-gradient-to-r from-blue-500/8 to-indigo-400/8 blur-2xl"
            style={{ animationDelay: "4s" }}
          />
        </div>

        <div className="relative z-10">
          <div className="container px-4 mx-auto max-w-7xl">
            <div className="py-8 border-b border-white/10">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <BetterBadge variant="success" size="sm">
                      {t('verifiedService')}
                    </BetterBadge>
                    <BetterBadge variant="info" size="sm">
                      {t('available247')}
                    </BetterBadge>
                  </div>
                  <h1 className="mb-2 text-3xl font-bold text-white lg:text-4xl">
                    {t('title')}
                  </h1>
                  <p className="max-w-2xl text-white/70">
                    {t('subtitle')}
                  </p>
                </div>
                
                <ServiceOverview />
              </div>
            </div>

            <div className="py-8">
              <MiddlemanDirectory />
            </div>
          </div>
        </div>
      </div>
    </GradientBackground>
  );
}

export default MiddlemanPage;