"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { XIcon, ChevronDownIcon } from "lucide-react"
import { cn } from "~/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "~/components/ui/popover"

export interface Option {
  value: string
  label: string
  disable?: boolean
  /** fixed option that can't be removed. */
  fixed?: boolean
  /** Group the options by providing key. */
  [key: string]: string | boolean | undefined
}

interface MultipleSelectorProps {
  value?: Option[]
  defaultOptions?: Option[]
  /** manually controlled options */
  options?: Option[]
  placeholder?: string
  /** Empty component. */
  emptyIndicator?: React.ReactNode
  onChange?: (options: Option[]) => void
  /** Limit the maximum number of selected options. */
  maxSelected?: number
  /** When the number of selected options exceeds the limit, the onMaxSelected will be called. */
  onMaxSelected?: (maxLimit: number) => void
  /** Hide the placeholder when there are options selected. */
  hidePlaceholderWhenSelected?: boolean
  disabled?: boolean
  className?: string
  badgeClassName?: string
  /** hide the clear all button. */
  hideClearAllButton?: boolean
}

export interface MultipleSelectorRef {
  selectedValue: Option[]
  input: HTMLInputElement
  focus: () => void
  reset: () => void
}

const MultipleSelector = React.forwardRef<MultipleSelectorRef, MultipleSelectorProps>(({
  value = [],
  onChange,
  placeholder = "Select options...",
  defaultOptions = [],
  options,
  emptyIndicator,
  maxSelected = Number.MAX_SAFE_INTEGER,
  onMaxSelected,
  hidePlaceholderWhenSelected = false,
  disabled = false,
  className,
  badgeClassName,
  hideClearAllButton = false,
}, ref) => {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [open, setOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<Option[]>(value)
  const [inputValue, setInputValue] = React.useState("")

  const availableOptions = options ?? defaultOptions

  // Filter options based on search and already selected
  const filteredOptions = React.useMemo(() => {
    return availableOptions.filter(option => {
      const matchesSearch = option.label.toLowerCase().includes(inputValue.toLowerCase())
      const notSelected = !selected.find(s => s.value === option.value)
      return matchesSearch && notSelected && !option.disable
    })
  }, [availableOptions, inputValue, selected])

  const handleUnselect = React.useCallback(
    (option: Option) => {
      if (option.fixed) return
      const newOptions = selected.filter((s) => s.value !== option.value)
      setSelected(newOptions)
      onChange?.(newOptions)
    },
    [onChange, selected]
  )

  const handleSelect = (option: Option) => {
    if (selected.length >= maxSelected) {
      onMaxSelected?.(maxSelected)
      return
    }
    
    const newOptions = [...selected, option]
    setSelected(newOptions)
    onChange?.(newOptions)
    setInputValue("")
    inputRef.current?.focus()
  }

  const handleClearAll = () => {
    const fixedOptions = selected.filter(s => s.fixed)
    setSelected(fixedOptions)
    onChange?.(fixedOptions)
  }

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (inputValue === "" && selected.length > 0) {
          const lastSelectOption = selected[selected.length - 1]
          // If last item is fixed, we should not remove it.
          if (!lastSelectOption?.fixed) {
            handleUnselect(selected[selected.length - 1]!)
          }
        }
      } else if (e.key === "Escape") {
        setOpen(false)
        setInputValue("")
      } else if (e.key === "Enter" && filteredOptions.length > 0) {
        e.preventDefault()
        handleSelect(filteredOptions[0])
      }
    },
    [handleUnselect, selected, inputValue, filteredOptions]
  )

  useEffect(() => {
    setSelected(value)
  }, [value])

  React.useImperativeHandle(ref, () => ({
    selectedValue: selected,
    input: inputRef.current!,
    focus: () => inputRef.current?.focus(),
    reset: () => {
      setSelected([])
      setInputValue("")
      onChange?.([])
    }
  }))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div
        className={cn(
          "relative min-h-[40px] rounded-md border border-white/10 bg-white/5 text-sm text-white shadow-sm transition-all duration-200 outline-none hover:border-white/20 hover:bg-white/10 focus-within:border-[#9747FF] focus-within:ring-2 focus-within:ring-[#9747FF]/20 has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50",
          {
            "p-2": selected.length !== 0,
            "cursor-text": !disabled && selected.length !== 0,
          },
          !hideClearAllButton && "pe-9",
          className
        )}
        onClick={() => {
          if (disabled) return
          inputRef?.current?.focus()
          setOpen(true)
        }}
      >
        <div className="flex flex-wrap items-center gap-1">
          {selected.map((option) => {
            return (
              <div
                key={option.value}
                className={cn(
                  "animate-fadeIn relative inline-flex h-7 cursor-default items-center rounded-md border border-white/20 bg-white/10 ps-2 pe-7 pl-2 text-xs font-medium text-white transition-all duration-200 hover:border-white/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 data-fixed:pe-2",
                  badgeClassName
                )}
                data-fixed={option.fixed}
                data-disabled={disabled ?? undefined}
              >
                {option.label}
                {!option.fixed && (
                  <button
                    className="absolute -inset-y-px -end-px flex size-7 items-center justify-center rounded-e-md border border-transparent p-0 text-white/60 transition-all duration-200 hover:text-white focus-visible:border-[#9747FF] focus-visible:ring-2 focus-visible:ring-[#9747FF]/20 focus-visible:ring-offset-1 focus-visible:ring-offset-[#150a30] outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleUnselect(option)
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleUnselect(option)
                    }}
                    aria-label="Remove"
                  >
                    <XIcon size={14} aria-hidden="true" />
                  </button>
                )}
              </div>
            )
          })}
          
          <PopoverAnchor asChild>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
                if (e.target.value && !open) {
                  setOpen(true)
                }
              }}
              onFocus={() => {
                setOpen(true)
              }}
              onKeyDown={handleKeyDown}
              placeholder={
                hidePlaceholderWhenSelected && selected.length !== 0
                  ? ""
                  : placeholder
              }
              disabled={disabled}
              className={cn(
                "flex-1 bg-transparent text-white placeholder:text-white/50 outline-none disabled:cursor-not-allowed min-w-[120px]",
                {
                  "w-full": hidePlaceholderWhenSelected,
                  "px-4 py-2": selected.length === 0,
                  "ml-1 px-2 py-2": selected.length !== 0,
                }
              )}
            />
          </PopoverAnchor>

          <div className="flex items-center gap-1 pr-2">
            {!hideClearAllButton && selected.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleClearAll()
                }}
                className="p-1 transition-colors text-white/60 hover:text-white"
                disabled={disabled}
                aria-label="Clear all"
              >
                <XIcon size={14} aria-hidden="true" />
              </button>
            )}
            <ChevronDownIcon 
              size={16} 
              className={cn(
                "text-white/60 transition-transform duration-200",
                open && "rotate-180"
              )} 
            />
          </div>
        </div>
      </div>

      <PopoverContent
        className="p-2 border-white/10 rounded bg-slate-900/95 shadow-2xl max-h-[120px] w-[var(--radix-popover-trigger-width)]"
        align="start"
        sideOffset={4}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div 
          className="max-h-[100px] overflow-y-auto"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255, 255, 255, 0.3) transparent",
          }}
          onWheel={(e) => {
            // Allow wheel scrolling within the container
            e.stopPropagation();
          }}
        >
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-center text-white/60">
              {emptyIndicator ?? (inputValue ? "No options found" : "No more options")}
            </div>
          ) : (
            <div className="py-1">
              {filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className="w-full px-3 py-2 text-sm text-left text-white transition-colors rounded-md cursor-pointer hover:bg-white/10 focus:outline-none focus:bg-white/10"
                  onClick={() => {
                    handleSelect(option)
                    setOpen(false)
                  }}
                  disabled={option.disable}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
})

MultipleSelector.displayName = "MultipleSelector"
export default MultipleSelector