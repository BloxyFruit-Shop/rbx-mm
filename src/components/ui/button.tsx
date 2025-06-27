import * as React from "react";
import { Slot as SlotPrimitive } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default: "text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-red-500/20 shadow-sm border-red-500/30 text-red-400 hover:bg-red-500/10 w-full",
        outline:
          "border border-white/10 bg-white/5 text-white  shadow-sm hover:bg-white/10 hover:border-white/20",
        user: "border border-white/10 bg-white/5 text-white  shadow-sm hover:bg-white/10 hover:border-white/20 rounded-lg",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "text-white/80 hover:bg-white/10 hover:text-white",
        link: "text-primary underline-offset-4 hover:underline",
        gradient:
          "relative overflow-hidden text-white border-1 border-white/5 shadow-lg",
      },
      gradientType: {
        none: "",
        blue: "bg-gradient-to-r from-indigo-600 to-indigo-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]",
        discord:
          "bg-gradient-to-r from-[#5865F2] to-[#4752C4] hover:shadow-[0_0_20px_rgba(88,101,242,0.4)]",
        pink: "bg-gradient-to-r from-pink-600 to-pink-500 hover:shadow-[0_0_20px_rgba(236,72,153,0.4)]",
        purple:
          "bg-gradient-to-r from-[#9747FF] to-[#7E3BFF] shadow-[#9747FF]/20 hover:from-[#7E3BFF] hover:to-[#6B32CC] hover:shadow-[#9747FF]/30",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-2 text-xs",
        lg: "h-10 rounded-md px-8",
        xl: "h-12 rounded-md px-10 text-lg font-semibold",
        user: "h-10 px-3 py-3 rounded-sm",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      gradientType: "none",
    },
    compoundVariants: [
      {
        variant: "gradient",
        gradientType: "none",
        className: "bg-gradient-to-tl from-blue-700 to-blue-500",
      },
    ],
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, gradientType, asChild = false, ...props },
    ref,
  ) => {
    const Comp = asChild ? SlotPrimitive.Slot : "button";
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, gradientType, className }),
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
