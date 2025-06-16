import React from "react";
import { cn } from "~/lib/utils";

interface FloatingParticlesProps {
  className?: string;
  particleCount?: number;
  particleColor?: string;
  particleSize?: "sm" | "md" | "lg";
  animationDuration?: "slow" | "normal" | "fast";
}

export function FloatingParticles({
  className,
  particleCount = 25,
  particleColor = "bg-violet-100/10",
  particleSize = "sm",
  animationDuration = "normal",
}: FloatingParticlesProps) {
  const particles = Array.from({ length: particleCount }, (_, i) => i);

  const sizeClasses = {
    sm: "w-1 h-1",
    md: "w-2 h-2",
    lg: "w-3 h-3",
  };

  const durationClasses = {
    slow: "animate-[float_8s_ease-in-out_infinite]",
    normal: "animate-[float_6s_ease-in-out_infinite]",
    fast: "animate-[float_4s_ease-in-out_infinite]",
  };

  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_40%_at_50%_50%,hsl(var(--gag-purple-hsl),0.1)_0%,transparent_100%)]" />
      <div
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden",
          className,
        )}
      >
        {particles.map((particle) => {
          const animationType = Math.floor(Math.random() * 4);
          const delay = Math.random() * 5;
          const left = Math.random() * 100;
          const top = Math.random() * 100;

          const animationClass = [
            durationClasses[animationDuration],
            "animate-[drift_10s_ease-in-out_infinite]",
            "animate-[pulse_3s_ease-in-out_infinite]",
            "animate-[spiral_12s_linear_infinite]",
          ][animationType];

          return (
            <div
              key={particle}
              className={cn(
                "absolute rounded-full blur-[1px]",
                sizeClasses[particleSize],
                particleColor,
                animationClass,
              )}
              style={{
                left: `${left}%`,
                top: `${top}%`,
                animationDelay: `${delay}s`,
              }}
            />
          );
        })}

        <div className="animation-delay-1000 absolute top-1/4 left-1/4 h-2 w-2 animate-[float_7s_ease-in-out_infinite] rounded-full bg-purple-400/30" />
        <div className="animation-delay-2000 absolute top-3/4 right-1/4 h-1 w-1 animate-[pulse_4s_ease-in-out_infinite] rounded-full bg-blue-400/40" />
        <div className="animation-delay-3000 absolute top-1/2 left-3/4 h-3 w-3 animate-[spiral_15s_linear_infinite] rounded-full bg-pink-400/20" />
        <div className="animation-delay-4000 absolute bottom-1/4 left-1/2 h-1.5 w-1.5 animate-[drift_9s_ease-in-out_infinite] rounded-full bg-cyan-400/35" />

        <div className="animation-delay-1500 absolute right-0 bottom-0 h-6 w-6 animate-[spiral_20s_linear_infinite] rounded-full bg-gradient-to-r from-blue-500/15 to-cyan-500/15 blur-md" />
        <div className="animation-delay-2500 absolute top-1/3 right-1/3 h-2 w-2 animate-[pulse_5s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-yellow-500/25 to-orange-500/25" />
      </div>
    </>
  );
}
