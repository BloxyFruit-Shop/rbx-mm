
"use client";

import Image from "next/image";

interface FloatingItemProps {
  imageUrl: string;
  imageAlt: string;
  price: string;
  rotate?: number;
  delay?: number;
  className?: string;
}

export function FloatingItem({
  imageUrl,
  imageAlt,
  price,
  rotate = 40,
  delay = 0,
  className = "",
}: FloatingItemProps) {
  return (
    <div className={`relative ${className}`}>
      <div 
        className="animate-fade-in-up opacity-0"
        style={{ 
          animationDelay: `${delay}s`,
          animationFillMode: 'forwards'
        }}
      >
        <div
          className="relative cursor-pointer rounded-2xl transition-all duration-300 animate-float-main hover:animate-none hover:-translate-y-2"
          style={{ 
            transform: `scale(1.1) rotate(${rotate}deg)`,
            animationDelay: `${0.2 + delay}s`
          }}
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
        className="absolute top-1/2 right-[calc(50%-100px)] animate-fade-in-right opacity-0"
        style={{ 
          animationDelay: '0.3s',
          animationFillMode: 'forwards'
        }}
      >
        <div
          className="relative animate-float-price hover:scale-110 transition-transform duration-200"
          style={{ animationDelay: '0.5s' }}
        >
          <div className="rounded-xl border border-white/10 bg-gradient-to-r from-[#5865F2] to-[#4752C4] p-3 shadow-lg shadow-[#5865F2]/20 backdrop-blur-sm">
            <div
              className="flex items-center gap-1 animate-scale-in"
              style={{ 
                animationDelay: '0.5s',
                animationFillMode: 'forwards',
                transform: 'scale(0)'
              }}
            >
              <span className="text-lg font-bold text-white">$</span>
              <span className="text-lg font-bold text-white">{price}</span>
            </div>
          </div>

          <div
            className="absolute top-1/2 -left-2 h-0 w-0 -translate-y-1/2 border-t-4 border-r-8 border-b-4 border-t-transparent border-r-[#4752C4] border-b-transparent animate-fade-in opacity-0"
            style={{ 
              animationDelay: '0.6s',
              animationFillMode: 'forwards'
            }}
          />
        </div>
      </div>
    </div>
  );
}
