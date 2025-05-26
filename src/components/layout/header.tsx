"use client";

import { cn } from "~/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import Image from "next/image";
import { DiscordIcon } from "../icons/discord";
import { TrendingUp, Shield, Users, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { sessionQueryOptions } from "~/lib/auth-client";
import { UserMenuSkeleton } from "~/components/user/user-menu";
import NavUserButton from '~/components/user/nav-user-button';

export function Header() {
  const { data: session, isLoading } = useQuery(sessionQueryOptions);
  const [isScrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const handleScroll = () => {
    if (window.pageYOffset > 1) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navigationItems = [
    { href: "/", label: "Trade Ads", icon: TrendingUp },
    { href: "/", label: "Item Values", icon: Star },
    { href: "/", label: "Middleman Directory", icon: Shield },
    { href: "/", label: "Vouches", icon: Users },
  ];

  return (
    <>
      <header
        className={cn(
          "fixed top-0 right-0 left-0 z-50 mx-auto max-w-screen-lg transition-all",
          isScrolled ? "md:px-4 md:py-6" : "",
        )}
      >
        <div className="mx-auto max-w-7xl">
          <div
            className={cn(
              "relative flex items-center justify-between border-white/10 px-6 py-4 transition-all md:rounded-2xl",
              isScrolled ? "border-b bg-(--gag-bg)/[.98] sm:border" : "",
            )}
          >
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#5865F2] to-transparent opacity-50" />

            <Link
              href="/"
              className="flex items-center gap-3 transition-all group hover:scale-105"
            >
              <Image
                src="/images/logo.webp"
                width={140}
                height={54}
                alt="RbxMM Logo"
              />
            </Link>

            <nav className="items-center hidden gap-8 lg:flex">
              {navigationItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="relative group"
                >
                  <span className="text-sm font-medium transition-colors text-white/80 group-hover:text-white">
                    {item.label}
                  </span>
                  <span className="absolute inset-x-0 -bottom-1 h-px scale-x-0 transform bg-gradient-to-r from-[#5865F2] to-[#4752C4] transition-transform duration-200 group-hover:scale-x-100" />
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <Button asChild variant="gradient" gradientType="discord">
                <Link
                  href="https://discord.gg/example"
                  target="_blank"
                  className="flex items-center gap-2"
                >
                  <DiscordIcon className="size-5" />
                  <span className="font-medium">Join</span>
                </Link>
              </Button>

              {isLoading ? (
                <UserMenuSkeleton />
              ) : (
                <NavUserButton user={session?.user} />
              )}

              <button
                onClick={toggleMobileMenu}
                className="p-2 transition-colors rounded-lg bg-white/5 hover:bg-white/10 lg:hidden"
                aria-label="Toggle mobile menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={cn(
                    "h-6 w-6 transition-transform duration-200",
                    isMobileMenuOpen ? "rotate-90" : "",
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      <div
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw] transform bg-black/80 transition-transform duration-300 ease-in-out lg:hidden",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20" />
        <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-[#5865F2] to-transparent" />

        <div className="relative flex flex-col h-full">
          <div className="flex items-center justify-end p-6 border-b border-white/10">
            <button
              onClick={closeMobileMenu}
              className="p-2 transition-colors rounded-lg bg-white/5 hover:bg-white/10"
              aria-label="Close mobile menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <nav className="flex-1 px-6 py-8">
            <div className="space-y-8">
              {navigationItems.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className="relative block group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-3 py-2">
                      <IconComponent className="h-5 w-5 text-white/60 transition-colors group-hover:text-[#5865F2]" />
                      <span className="text-lg font-medium transition-colors text-white/80 group-hover:text-white">
                        {item.label}
                      </span>
                    </div>
                    <span className="absolute inset-x-0 -bottom-1 h-px scale-x-0 transform bg-gradient-to-r from-[#5865F2] to-[#4752C4] transition-transform duration-200 group-hover:scale-x-100" />
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="p-6 border-t border-white/10">
            <Button asChild variant="gradient" gradientType="discord">
              <Link
                href="https://discord.gg/example"
                target="_blank"
                onClick={closeMobileMenu}
                className="flex items-center justify-center gap-2"
              >
                <DiscordIcon className="size-5" />
                <span className="font-medium">Join Discord</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
