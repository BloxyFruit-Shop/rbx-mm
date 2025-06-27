"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {

  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "group flex gap-2 items-center py-4 px-3 text-sm toast group-[.toaster]:bg-slate-900 group-[.toaster]:text-white group-[.toaster]:border group-[.toaster]:border-white/20 group-[.toaster]:shadow-2xl group-[.toaster]:shadow-black/50 group-[.toaster]:rounded group-[.toaster]:relative group-[.toaster]:overflow-hidden before:group-[.toaster]:absolute before:group-[.toaster]:inset-0 before:group-[.toaster]:bg-gradient-to-r before:group-[.toaster]:from-[#9747FF]/5 before:group-[.toaster]:to-[#7E3BFF]/5 before:group-[.toaster]:blur-xl before:group-[.toaster]:pointer-events-none",
          description: "group-[.toast]:text-white/80 group-[.toast]:relative group-[.toast]:z-10",
          actionButton:
            "group-[.toast]:bg-gradient-to-r group-[.toast]:from-[#9747FF] group-[.toast]:to-[#7E3BFF] group-[.toast]:text-white group-[.toast]:border-none group-[.toast]:rounded-lg group-[.toast]:hover:from-[#7E3BFF] group-[.toast]:hover:to-[#6B32CC] group-[.toast]:transition-all group-[.toast]:duration-200 group-[.toast]:shadow-lg group-[.toast]:shadow-[#9747FF]/25 group-[.toast]:relative group-[.toast]:z-10 group-[.toast]:font-medium",
          cancelButton:
            "group-[.toast]:bg-white/10 group-[.toast]:text-white/90 group-[.toast]:border group-[.toast]:border-white/30 group-[.toast]:rounded-lg group-[.toast]:hover:bg-white/20 group-[.toast]:hover:border-white/40 group-[.toast]:transition-all group-[.toast]:duration-200 group-[.toast]:backdrop-blur-sm group-[.toast]:relative group-[.toast]:z-10",
          title: "group-[.toast]:text-white group-[.toast]:font-semibold group-[.toast]:relative group-[.toast]:z-10",
          icon: "group-[.toast]:relative group-[.toast]:z-10",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
