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

export default async function Home() {
  return (
    <GradientBackground>
      <div className="mx-auto max-w-7xl px-4 pt-[72px] pb-32 sm:container">
        <div className="grid items-center py-10 md:grid-cols-7 md:py-16">
          <div className="flex flex-col items-center max-w-2xl md:col-span-3 md:items-start lg:mt-8 2xl:mt-28">
            <BetterBadge size="default" className="mb-2">
              Trusted by 50,000+ traders worldwide
            </BetterBadge>
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-center text-white text-pretty md:text-left lg:text-6xl">
              <span className="font-normal text-transparent font-poet text-brand bg-clip-text">
                #1 Trusted
              </span>{" "}
              Trading Hub for Grow a Garden
            </h1>
            <p className="max-w-xl mb-8 leading-relaxed text-center text-pretty text-white/70 sm:text-lg md:text-left lg:text-xl">
              Trade rare items, get fair prices, and connect with the largest
              community of Grow a Garden players.
              <span className="font-medium text-white">
                {" "}
                100% secure transactions guaranteed.
              </span>
            </p>
            <div className="flex flex-col flex-wrap gap-4 sm:flex-row">
              <Button
                size="xl"
                variant="gradient"
                gradientType="purple"
                asChild
              >
                <Link href="/" className="flex items-center gap-2">
                  <span>Start Trading</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
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
                <Link href="/">View Item Values</Link>
              </Button>
            </div>
            <div className="flex items-center gap-6 pt-6 text-center md:text-left">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 border-2 rounded-full border-white/20 bg-gradient-to-r from-purple-400 to-blue-400"
                  />
                ))}
                <div className="flex items-center justify-center w-8 h-8 border-2 rounded-full border-white/20 bg-white/10">
                  <span className="text-xs font-bold text-white">+</span>
                </div>
              </div>
              <div className="text-sm text-white/60">
                <span className="font-semibold text-white">2,847</span> trades
                completed this week
              </div>
            </div>
          </div>
          <div className="justify-end hidden w-full h-full md:col-span-4 md:flex">
            <div className="relative inset-0 w-full h-full">
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

        <div className="relative my-20 overflow-hidden mt-28">
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-[#5865F2] to-[#4752C4] opacity-10" />
            <div className="absolute -inset-5 rounded-xl bg-[url('/images/pattern.webp')] opacity-10" />
          </div>
          <div className="relative p-12 text-center border rounded-2xl border-white/10">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 border rounded-full border-white/10 bg-white/5 backdrop-blur-sm">
              <DiscordIcon className="size-5" />
              <span className="text-sm font-medium text-white/80">
                Join 50,000+ traders
              </span>
            </div>
            <h2 className="mb-4 text-4xl font-bold text-transparent bg-gradient-to-r from-white via-white to-white/70 bg-clip-text">
              Join Our Discord Community
            </h2>
            <p className="max-w-2xl mx-auto mb-8 text-xl text-white/80">
              Connect with thousands of Grow a Garden traders, get item value
              updates, and participate in exclusive giveaways!
            </p>
            <Button size="xl" variant="gradient" gradientType="discord" asChild>
              <Link
                href="https://discord.gg/example"
                target="_blank"
                className="flex items-center gap-2"
              >
                <DiscordIcon className="size-5" />
                Join Discord
              </Link>
            </Button>
            <div className="mt-2 text-sm text-white/50">
              Free to join • Instant access • 24/7 support
            </div>
          </div>
        </div>
      </div>
    </GradientBackground>
  );
}
