"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useQuery } from "convex/react";
import { Search, X, Star, Shield, User, Crown } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "~/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { api } from "~convex/_generated/api";
import type { PublicUserProfile } from "~convex/user";
import { cn } from "~/lib/utils";
import Link from "next/link";

interface UserSearchProps {
  isExpanded: boolean;
  onToggle: () => void;
  className?: string;
  placeholder?: string;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function UserSearch({
  isExpanded,
  onToggle,
  className,
  placeholder = "Search users...",
}: UserSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchPopoverOpen, setSearchPopoverOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Search for users
  const searchResults = useQuery(
    api.user.searchUsers,
    debouncedSearchTerm.length >= 2 ? { query: debouncedSearchTerm, limit: 5 } : "skip"
  );

  const filteredUsers = useMemo(() => {
    if (!searchResults) return [];
    return searchResults;
  }, [searchResults]);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  // Close search when clicking outside or pressing escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchTerm("");
        setSearchPopoverOpen(false);
        onToggle();
      }
    };

    if (isExpanded) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isExpanded, onToggle]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value && !searchPopoverOpen) {
      setSearchPopoverOpen(true);
    }
    if (!value) {
      setSearchPopoverOpen(false);
    }
  }, [searchPopoverOpen]);

  const handleClear = useCallback(() => {
    setSearchTerm("");
    setSearchPopoverOpen(false);
    onToggle();
  }, [onToggle]);

  const handleUserClick = useCallback(() => {
    setSearchTerm("");
    setSearchPopoverOpen(false);
    onToggle();
  }, [onToggle]);

  const getRoleIcon = (roles: string[]) => {
    if (roles?.includes("admin")) return <Crown className="size-3 text-yellow-400" />;
    if (roles?.includes("middleman")) return <Shield className="size-3 text-purple-400" />;
    return <User className="size-3 text-blue-400" />;
  };

  const getRoleBadge = (roles: string[]) => {
    if (roles?.includes("admin")) return "Admin";
    if (roles?.includes("middleman")) return "MM";
    return "User";
  };

  const getRoleBadgeColor = (roles: string[]) => {
    if (roles?.includes("admin")) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    if (roles?.includes("middleman")) return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  };

  return (
    <div className={cn("relative", className)}>
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        // Desktop: expand leftward, Mobile: full width
        isExpanded ? "w-96 lg:-ml-80" : "w-10",
        // On mobile, always take full width when expanded
        className?.includes("w-full") && isExpanded ? "!w-full !ml-0" : ""
      )}>
        {!isExpanded ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-10 w-10 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-200"
            aria-label="Search users"
          >
            <Search className="size-5 text-white/80" />
          </Button>
        ) : (
          <Popover open={searchPopoverOpen} onOpenChange={setSearchPopoverOpen}>
            <div className="relative flex items-center">
              <Search className="absolute left-3 size-4 text-white/50 z-10" />
              <PopoverAnchor asChild>
                <Input
                  ref={inputRef}
                  placeholder={placeholder}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => {
                    if (searchTerm) {
                      setSearchPopoverOpen(true);
                    }
                  }}
                  className={cn(
                    "pl-10 pr-10 h-10 w-full bg-white/10 backdrop-blur-lg border-white/20 text-white placeholder:text-white/50",
                    "focus:bg-white/15 focus:border-white/30 transition-all duration-200"
                  )}
                />
              </PopoverAnchor>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClear}
                className="absolute right-1 h-8 w-8 rounded-full hover:bg-white/10 z-10"
                aria-label="Close search"
              >
                <X className="size-4 text-white/60" />
              </Button>
            </div>

          <PopoverContent
            className="p-0 border-white/20 bg-[#150a30]/95 backdrop-blur-sm max-h-80 w-96"
            align="start"
            sideOffset={4}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <div className="p-2">
              <div
                className="overflow-y-auto max-h-72"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(255, 255, 255, 0.3) transparent",
                }}
                onWheel={(e) => {
                  e.stopPropagation();
                }}
              >
                {debouncedSearchTerm ? (
                  filteredUsers.length === 0 ? (
                    <div className="flex items-center justify-center py-6">
                      <div className="text-center">
                        <User className="mx-auto mb-2 size-6 text-white/40" />
                        <p className="text-sm text-white/60">
                          {debouncedSearchTerm.length < 2 
                            ? "Type at least 2 characters to search"
                            : "No users found"
                          }
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredUsers.map((user) => (
                        <Link
                          key={user._id}
                          href={`/user/${user.robloxUsername}`}
                          onClick={handleUserClick}
                          className="flex items-center w-full gap-3 p-3 text-left transition-all duration-200 border rounded-md cursor-pointer border-white/10 bg-white/5 hover:border-blue-500/30 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        >
                          <Avatar className="size-10 flex-shrink-0">
                            <AvatarImage src={user.robloxAvatarUrl ?? undefined} />
                            <AvatarFallback className="text-sm">
                              {user.name?.charAt(0) ?? user.robloxUsername?.charAt(0) ?? "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-white truncate">
                                {user.name ?? user.robloxUsername}
                              </p>
                              <Badge 
                                variant="outline" 
                                className={cn("text-xs border", getRoleBadgeColor(user.roles))}
                              >
                                {getRoleIcon(user.roles)}
                                <span className="ml-1">{getRoleBadge(user.roles)}</span>
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-white/60">
                              {user.robloxUsername && (
                                <span>@{user.robloxUsername}</span>
                              )}
                              {user.averageRating && (
                                <div className="flex items-center gap-1">
                                  <Star className="size-3 fill-yellow-400 text-yellow-400" />
                                  <span>{user.averageRating.toFixed(1)}</span>
                                  <span>({user.vouchCount})</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <User className="flex-shrink-0 size-4 text-white/60" />
                        </Link>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="flex items-center justify-center py-6">
                    <div className="text-center">
                      <Search className="mx-auto mb-2 size-6 text-white/40" />
                      <p className="text-sm text-white/60">
                        Start typing to search for users
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
    </div>
  );
}