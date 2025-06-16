import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-3 py-1 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#150a30]",
  {
    variants: {
      variant: {
        default:
          "text-blue-300 bg-blue-500/10 border-blue-500/30 shadow-sm focus:ring-[#2663ff]/50",
        secondary:
          "border-purple-400/30 bg-purple-400/20 text-purple-300 shadow-sm focus:ring-purple-400/50",
        success:
          "border-green-400/30 bg-green-400/20 text-green-300 shadow-sm focus:ring-green-400/50",
        warning:
          "border-yellow-400/30 bg-yellow-400/20 text-yellow-300 shadow-sm focus:ring-yellow-400/50",
        destructive:
          "border-red-400/30 bg-red-400/20 text-red-300 shadow-sm focus:ring-red-400/50",
        outline:
          "border-white/20 bg-white/5 text-white/80 shadow-sm focus:ring-white/30",
        ghost:
          "border-transparent bg-transparent text-white/70 focus:ring-white/30",
        premium:
          "border-gradient-to-r from-yellow-400/30 to-orange-400/30 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 text-yellow-300 shadow-sm focus:ring-yellow-400/50",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-3 py-1 text-xs",
        lg: "px-4 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
