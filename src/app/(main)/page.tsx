import Link from "next/link";
import { Button } from "~/components/ui/button";
import { StatsBar } from "~/components/layout/stats-bar";
import { FaqSection } from "~/components/layout/faq-section";
import GradientBackground from "~/components/layout/gradient-background";
import { DiscordIcon } from "~/components/icons/discord";
import { FloatingItem } from "~/components/floating/floating-item";
import { FloatingParticles } from "~/components/floating/floating-particles";
import { BetterBadge } from "~/components/ui/better-badge";
import FeaturesSection from "~/components/layout/features-section";
import { getTranslations } from 'next-intl/server';

export default async function Home() {
  const t = await getTranslations('home');
  return (
    <GradientBackground>
      <div className="mx-auto max-w-7xl px-4 pt-[72px] pb-32 sm:container">
        <div className="grid items-center py-10 md:grid-cols-7 md:py-16">
          <div className="flex max-w-2xl flex-col items-center md:col-span-3 md:items-start lg:mt-8 2xl:mt-28">
            <BetterBadge size="default" className="mb-2">
              {t('trustedBadge')}
            </BetterBadge>
            <h1 className="mb-6 text-center text-5xl font-bold tracking-tight text-pretty text-white md:text-left lg:text-6xl">
              {t('welcome')}
            </h1>
            <p className="mb-8 max-w-xl text-center leading-relaxed text-pretty text-white/70 sm:text-lg md:text-left lg:text-xl">
              {t('subtitle')}
            </p>
            <div className="flex flex-col flex-wrap gap-4 sm:flex-row">
              <Button
                size="xl"
                variant="gradient"
                gradientType="purple"
                asChild
              >
                <Link href="/trades" className="flex items-center gap-2">
                  <span>{t('getStarted')}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </Button>
              <Button
                size="xl"
                variant="outline"
                className="border-white/10 hover:bg-white/5"
                asChild
              >
                <Link href="/values">{t('features.values.title')}</Link>
              </Button>
            </div>
            <div className="flex items-center gap-6 pt-6 text-center md:text-left">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-white/20 bg-gradient-to-r from-purple-400 to-blue-400"
                  />
                ))}
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/20 bg-white/10">
                  <span className="text-xs font-bold text-white">+</span>
                </div>
              </div>
              <div className="text-sm text-white/60">
                <span className="font-semibold text-white">2,847</span> {t('weeklyTrades')}
              </div>
            </div>
          </div>
          <div className="hidden h-full w-full justify-end md:col-span-4 md:flex">
            <div className="relative inset-0 h-full w-full">
              <div className="absolute top-[25%] left-[40%] -translate-1/2 lg:top-[30%]">
                <FloatingItem
                  imageUrl="/images/blueberries.webp"
                  imageAlt="Blue Berries"
                  price="150"
                  rotate={-10}
                  variant="trending-up"
                  className="scale-105"
                />
              </div>
              <div className="absolute right-[20%] bottom-[40%] translate-1/2 lg:right-[20%] lg:bottom-[45%]">
                <FloatingItem
                  imageUrl="/images/night-owl.webp"
                  imageAlt="Night Owl"
                  delay={0.5}
                  price="999"
                  variant="trending-up"
                  rotate={10}
                  className="scale-110"
                />
              </div>
              <div className="absolute right-[50%] bottom-[20%] translate-1/2">
                <FloatingItem
                  imageUrl="/images/flower.webp"
                  imageAlt="Flower"
                  delay={0.2}
                  price="250"
                  rotate={-15}
                  variant="trending-down"
                  className="scale-100"
                />
              </div>
              <FloatingParticles particleCount={100} />
            </div>
          </div>
        </div>

        <div className="my-16 lg:my-12 xl:my-28">
          <StatsBar />
        </div>

        <div className="my-32 lg:my-24">
          <FeaturesSection />
        </div>

        <div className="my-12">
          <FaqSection />
        </div>

        <div className="relative my-20 mt-28 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-[#5865F2] to-[#4752C4] opacity-10" />
            <div className="absolute -inset-5 rounded-xl bg-[url('/images/pattern.webp')] opacity-10" />
          </div>
          <div className="relative rounded-2xl border border-white/10 p-12 text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
              <DiscordIcon className="size-5" />
              <span className="text-sm font-medium text-white/80">
                {t('discord.joinCommunity')}
              </span>
            </div>
            <h2 className="mb-4 bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-4xl font-bold text-transparent">
              {t('discord.title')}
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-xl text-white/80">
              {t('discord.description')}
            </p>
            <Button size="xl" variant="gradient" gradientType="discord" asChild>
              <Link
                href="https://discord.gg/example"
                target="_blank"
                className="flex items-center gap-2"
              >
                <DiscordIcon className="size-5" />
                {t('discord.joinButton')}
              </Link>
            </Button>
            <div className="mt-2 text-sm text-white/50">
              {t('discord.benefits')}
            </div>
          </div>
        </div>
      </div>
    </GradientBackground>
  );
}
