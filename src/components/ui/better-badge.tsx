import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const betterBadgeVariants = cva(
  "inline-flex items-center gap-3 rounded-full border  font-semibold transition-all duration-300",
  {
    variants: {
      variant: {
        default: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
        success: "border-green-400/20 bg-green-400/10 text-green-300",
        info: "border-blue-400/20 bg-blue-400/10 text-blue-300",
        warning: "border-yellow-400/20 bg-yellow-400/10 text-yellow-300",
        purple: "border-purple-400/20 bg-purple-400/10 text-purple-300",
        pink: "border-pink-400/20 bg-pink-400/10 text-pink-300",
        discord: "border-[#5865F2]/20 bg-[#5865F2]/10 text-[#5865F2]",
        premium:
          "border-yellow-400/30 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 text-yellow-300",
      },
      size: {
        sm: "px-3 py-2 text-xs",
        default: "px-4 py-2 text-sm",
        lg: "px-6 py-4 text-base",
        xl: "px-8 py-5 text-lg",
      },
      pulse: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      pulse: true,
    },
  },
);

const pulseVariants = cva("rounded-full", {
  variants: {
    variant: {
      default: "bg-emerald-400",
      success: "bg-green-400",
      info: "bg-blue-400",
      warning: "bg-yellow-400",
      purple: "bg-purple-400",
      pink: "bg-pink-400",
      discord: "bg-[#5865F2]",
      premium: "bg-gradient-to-r from-yellow-400 to-orange-400",
    },
    size: {
      sm: "h-1.5 w-1.5",
      default: "h-2 w-2",
      lg: "h-2.5 w-2.5",
      xl: "h-3 w-3",
    },
    pulse: {
      true: "animate-pulse",
      false: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
    pulse: true,
  },
});

export interface BetterBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof betterBadgeVariants> {
  children: React.ReactNode;
  showPulse?: boolean;
  pulseClassName?: string;
}

const BetterBadge = React.forwardRef<HTMLDivElement, BetterBadgeProps>(
  (
    {
      className,
      variant,
      size,
      pulse = true,
      showPulse = true,
      pulseClassName,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        className={cn(betterBadgeVariants({ variant, size, pulse, className }))}
        ref={ref}
        {...props}
      >
        {showPulse && (
          <div
            className={cn(
              pulseVariants({ variant, size, pulse }),
              pulseClassName,
            )}
          />
        )}
        <span>{children}</span>
      </div>
    );
  },
);

BetterBadge.displayName = "BetterBadge";

export { BetterBadge, betterBadgeVariants };
