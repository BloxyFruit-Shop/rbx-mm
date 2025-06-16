import * as React from "react";

import { cn } from "~/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-4 py-2 text-base text-white shadow-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-white/80 placeholder:text-white/50 hover:border-white/20 hover:bg-white/10 focus-visible:border-purple-400 focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-white/5 disabled:opacity-50 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&[type=number]]:[-moz-appearance:textfield]",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };