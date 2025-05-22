import { type ReactNode } from "react";
import Link from "next/link";
import { cn } from "~/lib/utils";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  href: string;
  color: "pink" | "blue" | "green" | "yellow";
  className?: string;
}

export function FeatureCard({
  title,
  description,
  icon,
  href,
  color,
  className,
}: FeatureCardProps) {
  const colorClasses = {
    pink: "pink-card",
    blue: "blue-card",
    green: "green-card",
    yellow: "yellow-card",
  };

  return (
    <Link
      href={href}
      className={cn(colorClasses[color], "flex h-full flex-col p-6 gag-card items-center gap-2", className)}
    >
      <h3 className="text-3xl font-bold tracking-tight text-center">{title}</h3>
      <div>{icon}</div>
      <p className="text-lg text-white text-center">{description}</p>
    </Link>
  );
}
