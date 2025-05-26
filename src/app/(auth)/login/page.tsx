
import LogoIcon from "~/components/ui/logo";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import GradientBackground from "~/components/layout/gradient-background";
import BackButton from "~/components/ui/back-button";
import SignInButton from '~/components/auth/sign-in';
import { RobloxIcon } from '~/components/icons/roblox';

export default function LoginPage() {
  return (
    <GradientBackground>
      <section className="flex min-h-screen px-4 py-16 pt-28">
        <div className="w-full max-w-md m-auto">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="animate-pulse-slow absolute top-20 left-10 h-32 w-32 rounded-full bg-gradient-to-br from-[#9747FF]/10 to-transparent blur-xl" />
            <div 
              className="animate-pulse-slow absolute right-10 bottom-20 h-40 w-40 rounded-full bg-gradient-to-br from-[#7E3BFF]/10 to-transparent blur-xl"
              style={{ animationDelay: "1s" }}
            />
          </div>

          <div className="relative">
            <BackButton className="transition-all duration-200 text-white/70 hover:text-white" />
          </div>

          <div className="relative">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#3A2564]/80 to-[#2A1854]/80 p-8 shadow-2xl backdrop-blur-xl">
              <div className="text-center">
                <LogoIcon className="justify-center mb-6 hover:scale-105" />
                <h1 className="mb-3 text-2xl font-bold text-white">
                  Sign In to RbxMM
                </h1>
                <p className="mb-8 text-white/70">Welcome back!<br/><br/>Sign in with your Roblox account to continue</p>
              </div>

              <div className="space-y-4">
                <SignInButton size="lg" provider="roblox" className="w-full">
                  <RobloxIcon className="w-5 h-5 text-white" />
                  <span>Continue with Roblox</span>
                </SignInButton>
              </div>

              <div className="mt-8 text-center">
                <p className="text-xs text-white/50">
                  By signing in, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-white/70">
                Don&apos;t have an account? Don&apos;t worry!<br/>One will be created for you automatically.
              </p>
            </div>
          </div>
        </div>
      </section>
    </GradientBackground>
  );
}
