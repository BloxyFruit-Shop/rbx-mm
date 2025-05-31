"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "~/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "relative inline-flex h-10 items-center justify-center rounded-md p-2 bg-[#150a30]/20 backdrop-blur-md border border-white/20 text-white/70 shadow-lg transition-all duration-300 hover:bg-[#28184f]/30 hover:border-white/30 hover:shadow-xl gap-1",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "relative inline-flex items-center justify-center rounded-sm py-2 text-sm font-medium whitespace-nowrap transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a855f7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#150a30] disabled:pointer-events-none disabled:opacity-50 overflow-hidden group",
      // Default state
      "text-white/70 hover:text-white/90",
      // Hover effects
      "hover:bg-white/10 hover:shadow-md",
      // Active state
      "data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#a855f7] data-[state=active]:to-[#a855f7] data-[state=active]:text-white",
      className,
    )}
    {...props}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
    
    <span className="relative z-10">
      {props.children}
    </span>
    
    <div className="absolute bottom-0 left-1/2 h-0.5 w-0 bg-white/80 transition-all duration-300 ease-out data-[state=active]:w-3/4 data-[state=active]:-translate-x-1/2 group-data-[state=active]:shadow-sm group-data-[state=active]:shadow-white/50" />
  </TabsPrimitive.Trigger>
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a855f7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#150a30]",
      // Animation for content appearance
      "animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ease-out",
      // Content styling
      "rounded-md bg-white/5 backdrop-blur-sm border border-white/10 p-4 shadow-lg",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };