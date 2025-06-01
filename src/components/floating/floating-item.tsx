"use client";

import Image from "next/image";
import { TrendingUp, TrendingDown } from "lucide-react";

interface FloatingItemProps {
  imageUrl: string;
  imageAlt: string;
  price: string;
  rotate?: number;
  delay?: number;
  className?: string;
  variant?: "default" | "trending-up" | "trending-down";
}

export function FloatingItem({
  imageUrl,
  imageAlt,
  price,
  rotate = 40,
  delay = 0,
  className = "",
  variant = "default",
}: FloatingItemProps) {
  const getTrendAccent = () => {
    switch (variant) {
      case "trending-up":
        return {
          iconColor: "text-green-400",
          accentDot: "bg-green-400",
          glowColor: "shadow-green-400/20",
        };
      case "trending-down":
        return {
          iconColor: "text-red-400",
          accentDot: "bg-red-400",
          glowColor: "shadow-red-400/20",
        };
      default:
        return {
          iconColor: "text-white",
          accentDot: "bg-white/20",
          glowColor: "",
        };
    }
  };

  const accent = getTrendAccent();

  const renderIcon = () => {
    if (variant === "trending-up") {
      return (
        <TrendingUp className={`size-6 ${accent.iconColor} drop-shadow-sm`} />
      );
    }
    if (variant === "trending-down") {
      return (
        <TrendingDown className={`size-6 ${accent.iconColor} drop-shadow-sm`} />
      );
    }
    return null;
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className="animate-fade-in-up opacity-0"
        style={{
          animationDelay: `${delay}s`,
          animationFillMode: "forwards",
        }}
      >
        <div
          className="animate-float-main relative cursor-pointer rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:animate-none"
          style={
            {
              "--rotate": `${rotate}deg`,
              animationDelay: `${0.2 + delay}s`,
            } as React.CSSProperties
          }
        >
          <div className="relative size-72 transition-transform duration-200 hover:scale-105">
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              className="object-contain drop-shadow-lg"
            />
          </div>
        </div>
      </div>

      <div
        className="animate-fade-in-right absolute top-1/2 right-[calc(50%-150px)] opacity-0"
        style={{
          animationDelay: "0.3s",
          animationFillMode: "forwards",
        }}
      >
        <div
          className="animate-float-price relative transition-transform duration-200 hover:scale-110"
          style={{ animationDelay: "0.5s" }}
        >
          <div
            className={`rounded-xl border-2 border-white/20 bg-gradient-to-r from-[#5865F2] to-[#4752C4] p-3 shadow-lg shadow-[#5865F2]/20 ${accent.glowColor && `shadow-lg ${accent.glowColor}`}`}
          >
            <div
              className="animate-scale-in flex items-center gap-2"
              style={{
                animationDelay: "0.5s",
                animationFillMode: "forwards",
                transform: "scale(0)",
              }}
            >
              {renderIcon()}
              <span className="text-lg font-bold text-white">{price}</span>
              {variant !== "default" && (
                <div
                  className={`size-2 rounded-full ${accent.accentDot} animate-pulse`}
                />
              )}
            </div>
          </div>

          <div
            className="animate-fade-in absolute top-1/2 -left-2 h-0 w-0 -translate-y-1/2 border-t-4 border-r-8 border-b-4 border-t-transparent border-r-[#6d74c5] border-b-transparent opacity-0"
            style={{
              animationDelay: "0.6s",
              animationFillMode: "forwards",
            }}
          />
        </div>
      </div>
    </div>
  );
}
