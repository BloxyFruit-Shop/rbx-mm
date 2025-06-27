"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { api } from "~convex/_generated/api";
import type { Id } from "~convex/_generated/dataModel";
import { toast } from "sonner";

interface MiddlemanCallCardProps {
  message: {
    id: string;
    senderId?: string;
    senderName: string;
    senderAvatar?: string;
    timestamp: number;
    isCurrentUser: boolean;
    middlemanCall?: {
      _id: string;
      status: "pending" | "accepted" | "declined" | "cancelled";
      reason: string;
      estimatedWaitTime: string;
      middlemanName?: string;
      middlemanAvatar?: string;
    } | null;
  };
  showAvatar: boolean;
  sessionId: Id<"session">;
  currentUserId: Id<"user">;
  isMiddleman: boolean;
}

const statusConfig = {
  pending: {
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    label: "Waiting",
    icon: Clock,
  },
  accepted: {
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    label: "Middleman Assigned",
    icon: Shield,
  },
  declined: {
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    label: "Declined",
    icon: X,
  },
  cancelled: {
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    label: "Cancelled",
    icon: X,
  },
};

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

export function MiddlemanCallCard({ message, showAvatar, sessionId, currentUserId, isMiddleman }: MiddlemanCallCardProps) {
  const { middlemanCall } = message;
  const [isLoading, setIsLoading] = useState(false);
  
  const updateMiddlemanCallStatus = useMutation(api.middlemanCalls.updateMiddlemanCallStatus);
  
  if (!middlemanCall) {
    return (
      <div className="flex items-center justify-center p-4 text-white/60">
        <span>Middleman call data not available</span>
      </div>
    );
  }
  
  const statusInfo = statusConfig[middlemanCall.status];
  const StatusIcon = statusInfo.icon;

  const handleCancel = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await updateMiddlemanCallStatus({
        middlemanCallId: middlemanCall._id as Id<"middleman_calls">,
        status: "cancelled",
        session: sessionId,
      });
      toast.success("Middleman call cancelled successfully.");
    } catch (error) {
      console.error("Failed to cancel middleman call:", error);
      toast.error(error instanceof Error ? error.message : "Failed to cancel middleman call.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await updateMiddlemanCallStatus({
        middlemanCallId: middlemanCall._id as Id<"middleman_calls">,
        status: "accepted",
        session: sessionId,
      });
      toast.success("Middleman call accepted successfully.");
    } catch (error) {
      console.error("Failed to accept middleman call:", error);
      toast.error(error instanceof Error ? error.message : "Failed to accept middleman call.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await updateMiddlemanCallStatus({
        middlemanCallId: middlemanCall._id as Id<"middleman_calls">,
        status: "declined",
        session: sessionId,
      });
      toast.success("Middleman call declined.");
    } catch (error) {
      console.error("Failed to decline middleman call:", error);
      toast.error(error instanceof Error ? error.message : "Failed to decline middleman call.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn(
      "flex gap-2 sm:gap-3",
      message.isCurrentUser ? "flex-row-reverse" : "flex-row"
    )}>
      <div className="flex-shrink-0">
        {showAvatar ? (
          <Avatar className="size-8 sm:size-9 ring-1 ring-white/20">
            <AvatarImage src={message.senderAvatar} alt={message.senderName} />
            <AvatarFallback className="text-xs font-medium text-white bg-gradient-to-br from-purple-500 to-blue-500">
              {message.senderName.charAt(0)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="size-8 sm:size-9" />
        )}
      </div>

      <div className={cn(
        "flex max-w-[90%] sm:max-w-[80%] flex-col gap-1",
        message.isCurrentUser ? "items-end" : "items-start"
      )}>
        {showAvatar && (
          <div className={cn(
            "flex items-center gap-2 text-xs text-white/60",
            message.isCurrentUser ? "flex-row-reverse" : "flex-row"
          )}>
            <span className="font-medium">{message.senderName}</span>
            <span>{formatTime(message.timestamp)}</span>
          </div>
        )}

        <Card className={cn(
          "border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm w-full min-w-0",
          middlemanCall.status === "pending" && "ring-1 ring-yellow-500/20",
          middlemanCall.status === "accepted" && "ring-1 ring-blue-500/20",
          middlemanCall.status === "declined" && "ring-1 ring-red-500/20",
          middlemanCall.status === "cancelled" && "ring-1 ring-red-500/20"
        )}>
          <CardHeader className="p-3 pb-2 sm:pb-3 sm:p-6">
            <div className="flex items-start justify-between gap-2 sm:gap-4">
              <div className="flex items-center flex-1 min-w-0 gap-2">
                <div className="rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-1.5 sm:p-2 flex-shrink-0">
                  <Shield className="text-white size-3 sm:size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-semibold text-white truncate sm:text-sm">Middleman Request</h3>
                  <p className="text-xs truncate text-white/60">
                    {message.isCurrentUser ? "You called a middleman" : `${message.senderName} called a middleman`}
                  </p>
                </div>
              </div>

              <Badge className={cn("text-xs flex-shrink-0", statusInfo.color)}>
                <StatusIcon className="mr-1 size-2 sm:size-2.5" />
                <span className="hidden xs:inline">{statusInfo.label}</span>
                <span className="xs:hidden">
                  {statusInfo.label === "Middleman Assigned" ? "Assigned" : statusInfo.label}
                </span>
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-3 pt-0 space-y-3 sm:space-y-4 sm:p-6">
            <div className="p-2 border rounded-lg border-white/10 bg-white/5 sm:p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="size-3 sm:size-4 flex-shrink-0 text-yellow-400 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="mb-1 text-xs font-medium text-white sm:text-sm">Reason</p>
                  <p className="text-xs break-words sm:text-sm text-white/70">{middlemanCall.reason}</p>
                </div>
              </div>
            </div>

            {middlemanCall.status === "pending" && (
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-center gap-2 text-xs text-yellow-400 sm:text-sm">
                  <Clock className="size-3 sm:size-4 animate-pulse" />
                  <span className="text-center">Searching for available middleman...</span>
                </div>
                
                <div className="text-xs text-center text-white/60">
                  Estimated wait time: {middlemanCall.estimatedWaitTime}
                </div>

                <div className="flex gap-1.5 sm:gap-2">
                  {message.isCurrentUser ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleCancel}
                      disabled={isLoading}
                      className="w-full h-8 text-xs sm:text-sm sm:h-9"
                    >
                      <X className="mr-1 size-3" />
                      <span className="hidden xs:inline">{isLoading ? "Cancelling..." : "Cancel Request"}</span>
                      <span className="xs:hidden">{isLoading ? "Cancelling..." : "Cancel"}</span>
                    </Button>
                  ) : isMiddleman ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAccept}
                        disabled={isLoading}
                        className="flex-1 h-8 text-xs text-green-400 border-green-500/30 hover:bg-green-500/10 sm:text-sm sm:h-9"
                      >
                        <CheckCircle2 className="mr-1 size-3" />
                        <span className="hidden xs:inline">{isLoading ? "Accepting..." : "Accept"}</span>
                        <span className="xs:hidden">{isLoading ? "..." : "Accept"}</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDecline}
                        disabled={isLoading}
                        className="flex-1 h-8 text-xs text-red-400 border-red-500/30 hover:bg-red-500/10 sm:text-sm sm:h-9"
                      >
                        <X className="mr-1 size-3" />
                        <span className="hidden xs:inline">{isLoading ? "Declining..." : "Decline"}</span>
                        <span className="xs:hidden">{isLoading ? "..." : "Deny"}</span>
                      </Button>
                    </>
                  ) : (
                    <div className="flex items-center justify-center w-full py-2 text-xs sm:text-sm text-white/60">
                      Waiting for response...
                    </div>
                  )}
                </div>
              </div>
            )}

            {middlemanCall.status === "accepted" && (
              <div className="space-y-2 sm:space-y-3">
                {middlemanCall.middlemanName && (
                  <div className="flex items-center gap-2 p-2 border rounded-lg sm:gap-3 border-white/10 bg-white/5 sm:p-3">
                    <Avatar className="flex-shrink-0 size-8 sm:size-10 ring-1 ring-white/20">
                      <AvatarImage src={middlemanCall.middlemanAvatar} alt={middlemanCall.middlemanName} />
                      <AvatarFallback className="text-xs font-medium text-white bg-gradient-to-br from-green-500 to-blue-500 sm:text-sm">
                        {middlemanCall.middlemanName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate sm:text-sm">{middlemanCall.middlemanName}</p>
                      <p className="text-xs text-white/60">Trusted Middleman</p>
                      <div className="flex items-center gap-1 mt-0.5 sm:mt-1">
                        <div className="size-1.5 sm:size-2 rounded-full bg-green-500" />
                        <span className="text-xs text-green-400">Available</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 sm:gap-1 flex-shrink-0">
                      <Badge className="text-xs text-green-400 bg-green-500/20 border-green-500/30">
                        <Shield className="mr-0.5 sm:mr-1 size-2 sm:size-2.5" />
                        <span className="hidden xs:inline">Verified</span>
                        <span className="xs:hidden">✓</span>
                      </Badge>
                      <span className="text-xs text-white/50">⭐ 4.9</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 text-xs text-blue-400 sm:text-sm">
                  <Shield className="size-3 sm:size-4" />
                  <span className="text-center">Middleman assigned - ready to facilitate trade</span>
                </div>
              </div>
            )}

            {middlemanCall.status === "declined" && (
              <div className="flex items-center justify-center gap-2 text-xs text-red-400 sm:text-sm">
                <X className="size-3 sm:size-4" />
                <span className="text-center">Middleman request was declined</span>
              </div>
            )}

            {middlemanCall.status === "cancelled" && (
              <div className="flex items-center justify-center gap-2 text-xs text-red-400 sm:text-sm">
                <X className="size-3 sm:size-4" />
                <span className="text-center">Middleman request was cancelled</span>
              </div>
            )}
          </CardContent>
        </Card>

        {!showAvatar && (
          <div className="text-xs text-white/50">
            {formatTime(message.timestamp)}
          </div>
        )}
      </div>
    </div>
  );
}