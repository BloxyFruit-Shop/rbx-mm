"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { Search, X, Star, Shield, UserCheck } from "lucide-react";
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
import type { Id } from "~convex/_generated/dataModel";
import type { PublicUserProfile } from "~convex/user";

interface MiddlemanSearchProps {
  value?: Id<"user">;
  onValueChange: (value: Id<"user"> | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  compact?: boolean;
}

export function MiddlemanSearch({
  value,
  onValueChange,
  placeholder = "Search for a preferred middleman (optional)...",
  disabled = false,
  compact = false,
}: MiddlemanSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchPopoverOpen, setSearchPopoverOpen] = useState(false);

  // Search for middlemen
  const searchResults = useQuery(
    api.user.searchMiddlemen,
    searchTerm.length >= 2 ? { query: searchTerm, limit: 10 } : "skip"
  );

  // Get selected middleman details
  const selectedMiddleman = useQuery(
    api.user.getPublicUserProfile,
    value ? { userId: value } : "skip"
  );

  const filteredMiddlemen = useMemo(() => {
    if (!searchResults) return [];
    return searchResults;
  }, [searchResults]);

  const handleSelect = (middleman: PublicUserProfile) => {
    onValueChange(middleman._id);
    setSearchTerm("");
    setSearchPopoverOpen(false);
  };

  const handleClear = () => {
    onValueChange(undefined);
    setSearchTerm("");
  };

  return (
    <div className="space-y-3">
      {selectedMiddleman && (
        <div className="p-3 border rounded-lg border-white/20 bg-gradient-to-br from-purple-500/10 to-blue-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="size-8">
                <AvatarImage src={selectedMiddleman.robloxAvatarUrl ?? undefined} />
                <AvatarFallback className="text-sm">
                  {selectedMiddleman.name?.charAt(0) ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">
                    {selectedMiddleman.name ?? selectedMiddleman.robloxUsername}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    <Shield className="size-3 mr-1" />
                    Middleman
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-white/60">
                  {selectedMiddleman.robloxUsername && (
                    <span>@{selectedMiddleman.robloxUsername}</span>
                  )}
                  {selectedMiddleman.averageRating && (
                    <div className="flex items-center gap-1">
                      <Star className="size-3 fill-yellow-400 text-yellow-400" />
                      <span>{selectedMiddleman.averageRating.toFixed(1)}</span>
                      <span>({selectedMiddleman.vouchCount} vouches)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={disabled}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <Popover open={searchPopoverOpen} onOpenChange={setSearchPopoverOpen}>
        <div className="relative">
          <Search className="absolute -translate-y-1/2 top-1/2 left-3 size-4 text-white/50" />
          <PopoverAnchor asChild>
            <Input
              placeholder={selectedMiddleman ? "Search for a different preferred middleman..." : placeholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (e.target.value && !searchPopoverOpen) {
                  setSearchPopoverOpen(true);
                }
                if (!e.target.value) {
                  setSearchPopoverOpen(false);
                }
              }}
              onFocus={() => {
                if (searchTerm) {
                  setSearchPopoverOpen(true);
                }
              }}
              disabled={disabled}
              className="pl-10"
            />
          </PopoverAnchor>
        </div>

        <PopoverContent
          className={`p-0 border-white/20 bg-black/95 backdrop-blur-sm ${
            compact ? 'max-h-60 w-80' : 'max-h-80 w-96'
          }`}
          align="start"
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div className="p-2">
            <div
              className={`overflow-y-auto ${compact ? 'max-h-52' : 'max-h-72'}`}
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(255, 255, 255, 0.3) transparent",
              }}
              onWheel={(e) => {
                e.stopPropagation();
              }}
            >
              {searchTerm ? (
                filteredMiddlemen.length === 0 ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="text-center">
                      <UserCheck className="mx-auto mb-2 size-6 text-white/40" />
                      <p className="text-sm text-white/60">
                        {searchTerm.length < 2 
                          ? "Type at least 2 characters to search"
                          : "No middlemen found"
                        }
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredMiddlemen.map((middleman) => (
                      <button
                        key={middleman._id}
                        type="button"
                        className="flex items-center w-full gap-3 p-3 text-left transition-all duration-200 border rounded-md cursor-pointer border-white/10 bg-white/5 hover:border-purple-500/30 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        onClick={() => handleSelect(middleman)}
                      >
                        <Avatar className="size-10 flex-shrink-0">
                          <AvatarImage src={middleman.robloxAvatarUrl ?? undefined} />
                          <AvatarFallback className="text-sm">
                            {middleman.name?.charAt(0) ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-white truncate">
                              {middleman.name ?? middleman.robloxUsername}
                            </p>
                            <Badge variant="secondary" className="text-xs">
                              <Shield className="size-2 mr-1" />
                              MM
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-white/60">
                            {middleman.robloxUsername && (
                              <span>@{middleman.robloxUsername}</span>
                            )}
                            {middleman.averageRating && (
                              <div className="flex items-center gap-1">
                                <Star className="size-3 fill-yellow-400 text-yellow-400" />
                                <span>{middleman.averageRating.toFixed(1)}</span>
                                <span>({middleman.vouchCount})</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <UserCheck className="flex-shrink-0 size-4 text-white/60" />
                      </button>
                    ))}
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center py-6">
                  <div className="text-center">
                    <Search className="mx-auto mb-2 size-6 text-white/40" />
                    <p className="text-sm text-white/60">
                      Start typing to search for a preferred middleman (optional)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>

          </div>
  );
}