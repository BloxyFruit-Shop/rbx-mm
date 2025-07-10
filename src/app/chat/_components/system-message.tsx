"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { 
  CheckCircle2,
  Info,
  UserPlus,
  UserMinus,
  Shield,
  MessageCircle,
  ThumbsUp,
  Check,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { VouchDialog } from "~/components/vouch/vouch-dialog";
import { api } from "~convex/_generated/api";
import type { Id } from "~convex/_generated/dataModel";

interface SystemMessageProps {
  message: {
    id: string;
    content?: string;
    timestamp: number;
    systemType?: "typing" | "trade_completed" | "user_joined" | "user_left" | "middleman_joined" | "trade_cancelled" | "info";
  };
  // Additional props for vouching functionality
  currentUserId?: Id<"user">;
  middlemanId?: Id<"user">;
  participants?: Array<{ _id: Id<"user">; name?: string | null } | null>;
  tradeAdId?: Id<"tradeAds">;
  sessionId?: Id<"session">;
}

const systemTypeConfig = {
  typing: {
    icon: MessageCircle,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    animate: true,
  },
  trade_completed: {
    icon: CheckCircle2,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    animate: false,
  },
  user_joined: {
    icon: UserPlus,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    animate: false,
  },
  user_left: {
    icon: UserMinus,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    animate: false,
  },
  middleman_joined: {
    icon: Shield,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    animate: false,
  },
  trade_cancelled: {
    icon: Info,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    animate: false,
  },
  info: {
    icon: Info,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    animate: false,
  },
};

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

export function SystemMessage({ 
  message, 
  currentUserId,
  participants,
  tradeAdId,
  middlemanId,
  sessionId,
}: SystemMessageProps) {
  const [vouchDialogOpen, setVouchDialogOpen] = useState(false);
  
  const systemType = message.systemType ?? "info";
  const config = systemTypeConfig[systemType];
  const Icon = config.icon;

  // Show vouch button for trade completion if:
  // 1. It's a trade_completed message with "completed by middleman" content (not just "accepted")
  // 2. Current user is actually a participant in the chat (not just a middleman/admin viewing)
  // 3. We have all required data for vouching
  // 4. There is another participant to vouch for
  const isActualTradeCompletion = 
    systemType === "trade_completed" && 
    message.content?.includes("completed by middleman");
  
  const isCurrentUserParticipant = participants?.some(p => p && p._id === currentUserId && p._id !== middlemanId);
  
  // Check if user has already vouched for this trade
  const hasAlreadyVouched = useQuery(
    api.vouches.hasUserVouchedForTrade,
    currentUserId && middlemanId && sessionId && tradeAdId ? {
      fromUserId: currentUserId,
      toUserId: middlemanId,
      tradeAdId: tradeAdId,
      session: sessionId,
    } : "skip"
  );
  
  const canVouch = 
    isActualTradeCompletion &&
    currentUserId &&
    tradeAdId &&
    sessionId &&
    isCurrentUserParticipant &&
    middlemanId;
  
  console.log('SystemMessage:', {
    message,
    currentUserId,
    middlemanId,
    participants,
    tradeAdId,
    sessionId,
    isActualTradeCompletion,
    isCurrentUserParticipant,
    hasAlreadyVouched,
    canVouch,
  })

  const showVouchButton = canVouch && hasAlreadyVouched === false;
  const showAlreadyVouched = canVouch && hasAlreadyVouched === true;

  // Allow current user to vouch for the other participant
  const vouchTargetId = showVouchButton ? middlemanId : undefined;

  return (
    <>
      <div className="flex justify-center py-2">
        <div className={cn(
          "flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs",
          config.bgColor,
          config.color
        )}>
          <Icon className={cn(
            "size-3",
            config.animate && "animate-pulse"
          )} />
          <span className="font-medium">{message.content ?? "System message"}</span>
          <span className="text-white/40">•</span>
          <span className="text-white/40">{formatTime(message.timestamp)}</span>
          
          {showVouchButton && (
            <>
              <span className="text-white/40">•</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-auto p-1 text-xs text-green-400 hover:text-green-300 hover:bg-green-500/10"
                onClick={() => setVouchDialogOpen(true)}
              >
                <ThumbsUp className="mr-1 size-3" />
                Vouch
              </Button>
            </>
          )}
          
          {showAlreadyVouched && (
            <>
              <span className="text-white/40">•</span>
              <div className="flex items-center gap-1 text-xs text-blue-400">
                <Check className="size-3" />
                <span>Vouched</span>
              </div>
            </>
          )}
        </div>
      </div>

      {showVouchButton && vouchTargetId && sessionId && tradeAdId && (
        <VouchDialog
          open={vouchDialogOpen}
          onOpenChange={setVouchDialogOpen}
          toUserId={middlemanId}
          tradeAdId={tradeAdId}
          sessionId={sessionId}
        />
      )}
    </>
  );
}