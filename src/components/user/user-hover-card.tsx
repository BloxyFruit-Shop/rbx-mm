"use client";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";
import { Star, Shield, User, ExternalLink } from "lucide-react";
import { cn } from "~/lib/utils";
import type { PublicUserProfile } from "~convex/user";
import Link from "next/link";

interface UserHoverCardProps {
  user: PublicUserProfile | null | undefined;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

export function UserHoverCard({ 
  user, 
  children, 
  side = "top",
  align = "center" 
}: UserHoverCardProps) {
  if (!user) {
    return <>{children}</>;
  }

  const isMiddleman = user.roles?.includes("middleman") || user.roles?.includes("admin");
  const isAdmin = user.roles?.includes("admin");

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent 
        side={side} 
        align={align}
        className="w-80 p-0 border-white/10 bg-slate-900/80 backdrop-blur-sm"
      >
        <div className="p-4 space-y-4">
          <div className="flex items-start gap-3">
            <div className="relative">
              <Avatar className="size-16 ring-2 ring-white/20">
                <AvatarImage 
                  src={user.robloxAvatarUrl ?? undefined} 
                  alt={user.name ?? "User"} 
                />
                <AvatarFallback className="text-lg font-semibold text-white bg-gradient-to-br from-purple-500 to-blue-500">
                  {(user.name ?? user.robloxUsername ?? "?").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isMiddleman && (
                <div className="absolute p-1 rounded-full -right-1 -bottom-1 bg-white/10 backdrop-blur-sm">
                  <Shield className="text-blue-400 size-3" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 gap-y-0.5 mb-1 flex-wrap">
                <Link 
                  href={`/user/${encodeURIComponent(user.robloxUsername ?? user.name ?? "")}`}
                  className="hover:text-white/80 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-white truncate">
                    {user.name ?? "Unknown User"}
                  </h3>
                </Link>
                {isAdmin && (
                  <Badge className="text-xs text-red-400 bg-red-500/20 border-red-500/30">
                    Admin
                  </Badge>
                )}
                {isMiddleman && !isAdmin && (
                  <Badge className="text-xs text-blue-400 bg-blue-500/20 border-blue-500/30">
                    <Shield className="mr-1 size-2.5" />
                    Middleman
                  </Badge>
                )}
              </div>
              
              {user.robloxUsername && (
                <p className="text-sm text-white/60 truncate">
                  @{user.robloxUsername}
                </p>
              )}
              
              <div className="flex items-center gap-2 mt-2">
                <User className="text-white/40 size-3" />
                <span className="text-xs text-white/60">
                  Member since {new Date(user._creationTime).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {isMiddleman && (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 text-center border rounded-lg bg-white/5 border-white/10">
                <div className="flex items-center justify-center mb-1">
                  <Star className="text-yellow-400 size-4 fill-current" />
                </div>
                <div className="text-sm font-medium text-white">
                  {user.averageRating ? user.averageRating.toFixed(1) : "N/A"}
                </div>
                <div className="text-xs text-white/60">Rating</div>
              </div>
              
              <div className="p-3 text-center border rounded-lg bg-white/5 border-white/10">
                <div className="flex items-center justify-center mb-1">
                  <div className="w-4 h-4 rounded bg-gradient-to-r from-green-400 to-blue-500" />
                </div>
                <div className="text-sm font-medium text-white">
                  {user.vouchCount}
                </div>
                <div className="text-xs text-white/60">Vouches</div>
              </div>
            </div>
          )}

          {user.badges && user.badges.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-white/80">Badges</div>
              <div className="flex flex-wrap gap-1">
                {user.badges.map((badge, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="text-xs text-purple-400 bg-purple-500/10 border-purple-500/30"
                  >
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {isMiddleman && (
            <div className="p-3 border rounded-lg border-blue-500/20 bg-blue-500/5">
              <div className="flex items-center gap-2 text-blue-400">
                <Shield className="size-4" />
                <span className="text-sm font-medium">
                  {isAdmin ? "Trusted Administrator" : "Verified Middleman"}
                </span>
              </div>
              <p className="mt-1 text-xs text-blue-400/70">
                {isAdmin 
                  ? "This user is a trusted administrator with full platform access."
                  : "This user is verified to safely facilitate trades between users."
                }
              </p>
            </div>
          )}

          <Link 
            href={`/user/${encodeURIComponent(user.robloxUsername ?? user.name ?? "")}`}
            className="block w-full"
          >
            <div className="flex items-center justify-center gap-2 p-3 border rounded-lg transition-colors border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10">
              <ExternalLink className="size-4 text-white/60" />
              <span className="text-sm font-medium text-white">View Profile</span>
            </div>
          </Link>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}