import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import GradientBackground from "~/components/layout/gradient-background";

export default function UserNotFound() {
  return (
    <GradientBackground still>
      <div className="min-h-screen pt-[72px]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-pulse-slow absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-gradient-to-r from-[#9747FF]/10 to-[#7E3BFF]/10 blur-3xl" />
          <div
            className="animate-pulse-slow absolute right-1/4 bottom-1/4 h-80 w-80 rounded-full bg-gradient-to-r from-[#7E3BFF]/10 to-[#9747FF]/10 blur-3xl"
            style={{ animationDelay: "2s" }}
          />
        </div>

        <div className="relative z-10 h-full">
          <div className="container mx-auto h-full max-w-7xl px-4 py-16">
            <Card className="mx-auto max-w-md">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
                  <User className="h-8 w-8 text-white/60" />
                </div>
                <h1 className="mb-2 text-2xl font-bold text-white">
                  User Not Found
                </h1>
                <p className="mb-6 text-white/60">
                  The user you're looking for doesn't exist or may have changed their username.
                </p>
                <Button asChild variant="outline">
                  <Link href="/trades" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Trades
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </GradientBackground>
  );
}