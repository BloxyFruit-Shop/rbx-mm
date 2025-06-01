import { type ReactNode } from "react";
import Link from "next/link";
import { cn } from "~/lib/utils";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  href: string;
  variant?: "tall" | "short";
  className?: string;
}

export function FeatureCard({
  title,
  description,
  icon,
  variant = "tall",
  className,
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/10 bg-(--gag-bg)/50 transition-all duration-500",
        "bg-(--gag-bg)/60 hover:-translate-y-2 hover:border-white/20 hover:shadow-2xl hover:shadow-purple-500/10",
        variant === "tall"
          ? "min-h-[280px] self-center lg:min-h-[320px] lg:self-auto"
          : "min-h-[280px] self-center",
        className,
      )}
    >
      <div className="absolute -inset-5 rounded-xl bg-[url('/images/pattern.webp')] mask-b-to-60% opacity-5 transition-opacity duration-500 group-hover:opacity-10" />

      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="animate-shimmer-fast absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent" />
      </div>

      <div
        className={cn(
          "relative flex h-full flex-col items-center p-8 text-center",
          variant === "tall" ? "justify-center py-6" : "justify-center py-6",
        )}
      >
        <div className="mb-6 flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/20 to-purple-600/30 shadow-lg shadow-purple-500/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-purple-500/40">
          <div className="text-3xl text-purple-400 transition-colors duration-300 group-hover:text-purple-300">
            {icon}
          </div>
        </div>

        <h3 className="mb-4 text-xl font-semibold text-white transition-all duration-300 group-hover:translate-y-[-2px] group-hover:text-purple-100">
          {title}
        </h3>

        <p
          className={cn(
            "flex-grow leading-relaxed text-pretty text-white/70 transition-colors duration-300 group-hover:text-white/90",
            variant === "tall"
              ? "mb-4 text-sm lg:mb-6 lg:text-base"
              : "mb-4 text-sm",
          )}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
