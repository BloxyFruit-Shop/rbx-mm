"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"

import { cn } from "~/lib/utils"

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 6,
  showArrow = false,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content> & {
  showArrow?: boolean
}) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "relative z-50 w-72 rounded-lg border border-white/10 bg-[#150a30]/95 p-4 text-white shadow-2xl backdrop-blur-md outline-none",
          "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-white/5 before:to-transparent before:pointer-events-none",
          "after:absolute after:inset-0 after:rounded-lg after:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] after:pointer-events-none",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      >
        <div className="relative z-10">
          {props.children}
        </div>
        {showArrow && (
          <PopoverPrimitive.Arrow className="fill-[#150a30] -my-px drop-shadow-[0_1px_0_rgba(255,255,255,0.1)]" />
        )}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger }
