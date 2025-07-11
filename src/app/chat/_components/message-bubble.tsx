"use client";

import { CheckCheck, Shield } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { UserHoverCard } from "~/components/user/user-hover-card";
import { cn } from "~/lib/utils";
import type { PublicUserProfile } from "~convex/user";

interface MessageBubbleProps {
  message: {
    id: string;
    content?: string;
    senderId?: string;
    senderName: string;
    senderAvatar?: string;
    timestamp: number;
    isCurrentUser: boolean;
    sender?: PublicUserProfile | null;
  };
  showAvatar: boolean;
  isRead?: boolean;
  showStatus?: boolean;
  isOptimistic?: boolean;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  
  return `${displayHours}:${displayMinutes} ${ampm}`;
}

export function MessageBubble({ message, showAvatar, isRead, showStatus = false, isOptimistic = false }: MessageBubbleProps) {
  const isMiddleman = message.sender?.roles?.includes("middleman") || message.sender?.roles?.includes("admin");
  const isAdmin = message.sender?.roles?.includes("admin");

  return (
    <div className={cn(
      "flex gap-2 sm:gap-3",
      message.isCurrentUser ? "flex-row-reverse" : "flex-row"
    )}>
      <div className="flex-shrink-0">
        {showAvatar ? (
          <UserHoverCard user={message.sender} side="right" align="start">
            <Avatar className={cn(
              "size-8 sm:size-9 cursor-pointer",
              isMiddleman 
                ? "ring-2 ring-blue-400/60" 
                : "ring-1 ring-white/20"
            )}>
              <AvatarImage src={message.senderAvatar} alt={message.senderName} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-xs font-medium text-white">
                {message.senderName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </UserHoverCard>
        ) : (
          <div className="size-8 sm:size-9" />
        )}
      </div>

      <div className={cn(
        "flex max-w-[85%] sm:max-w-[70%] flex-col gap-1",
        message.isCurrentUser ? "items-end" : "items-start"
      )}>
        {showAvatar && (
          <div className={cn(
            "flex items-center gap-2 text-xs text-white/60",
            message.isCurrentUser ? "flex-row-reverse" : "flex-row"
          )}>
            <div className="flex items-center gap-1">
              <span className="font-medium">{message.senderName}</span>
              {isAdmin && (
                <Badge className="text-xs text-red-400 bg-red-500/20 border-red-500/30 px-1 py-0">
                  Admin
                </Badge>
              )}
              {isMiddleman && !isAdmin && (
                <Badge className="text-xs text-blue-400 bg-blue-500/20 border-blue-500/30 px-1 py-0">
                  <Shield className="mr-0.5 size-2" />
                  MM
                </Badge>
              )}
            </div>
            <span>{formatTime(message.timestamp)}</span>
          </div>
        )}

        <div className={cn(
          "relative rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base break-words max-w-52 sm:max-w-80 md:max-w-96",
          message.isCurrentUser
            ? "bg-purple-500 text-white rounded-br-md"
            : "bg-white/10 text-white rounded-bl-md border border-white/10",
          isOptimistic && "opacity-70"
        )}>
          <p className="leading-relaxed break-words">{message.content ?? ""}</p>
          
          {!showAvatar && (
            <div className={cn(
              "mt-1 text-xs opacity-70",
              message.isCurrentUser ? "text-white/80" : "text-white/60"
            )}>
              {formatTime(message.timestamp)}
            </div>
          )}
        </div>

        {message.isCurrentUser && showStatus && (
          <div className="flex items-center gap-1 text-xs text-white/50">
            {isOptimistic ? (
              <>
                <div className="size-1 rounded-full bg-yellow-400 animate-pulse" />
                <span>Sending...</span>
              </>
            ) : isRead ? (
              <>
                <CheckCheck className="size-4 text-blue-500"/>
                <span>Read</span>
              </>
            ) : (
              <>
                <div className="size-1 rounded-full bg-green-400" />
                <span>Delivered</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}