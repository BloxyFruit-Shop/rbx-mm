import * as React from "react";

import { cn } from "~/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-base text-white shadow-sm transition-all duration-200 resize-y file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-white/80 placeholder:text-white/50 hover:border-white/20 hover:bg-white/10 focus-visible:border-purple-400 focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-white/5 disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
