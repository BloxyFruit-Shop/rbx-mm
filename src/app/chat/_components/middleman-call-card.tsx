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
  Phone,
  MessageSquare,
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

export function MiddlemanCallCard({ message, showAvatar, sessionId, currentUserId }: MiddlemanCallCardProps) {
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

  const handleContact = () => {
    toast.info("Contact functionality coming soon!");
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
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-xs font-medium text-white">
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
          "border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm",
          middlemanCall.status === "pending" && "ring-1 ring-yellow-500/20",
          middlemanCall.status === "accepted" && "ring-1 ring-blue-500/20",
          middlemanCall.status === "declined" && "ring-1 ring-red-500/20",
          middlemanCall.status === "cancelled" && "ring-1 ring-red-500/20"
        )}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-2">
                  <Shield className="size-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Middleman Request</h3>
                  <p className="text-xs text-white/60">
                    {message.isCurrentUser ? "You called a middleman" : `${message.senderName} called a middleman`}
                  </p>
                </div>
              </div>

              <Badge className={cn("text-xs", statusInfo.color)}>
                <StatusIcon className="mr-1 size-2.5" />
                {statusInfo.label}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="size-4 flex-shrink-0 text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white mb-1">Reason</p>
                  <p className="text-sm text-white/70">{middlemanCall.reason}</p>
                </div>
              </div>
            </div>

            {middlemanCall.status === "pending" && (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm text-yellow-400">
                  <Clock className="size-4 animate-pulse" />
                  <span>Searching for available middleman...</span>
                </div>
                
                <div className="text-center text-xs text-white/60">
                  Estimated wait time: {middlemanCall.estimatedWaitTime}
                </div>

                <div className="flex gap-2">
                  {message.isCurrentUser ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleCancel}
                      disabled={isLoading}
                    >
                      <X className="mr-1 size-3" />
                      {isLoading ? "Cancelling..." : "Cancel Request"}
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAccept}
                        disabled={isLoading}
                        className="flex-1 border-green-500/30 text-green-400 hover:bg-green-500/10"
                      >
                        <CheckCircle2 className="mr-1 size-3" />
                        {isLoading ? "Accepting..." : "Accept"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDecline}
                        disabled={isLoading}
                        className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                      >
                        <X className="mr-1 size-3" />
                        {isLoading ? "Declining..." : "Decline"}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}

            {middlemanCall.status === "accepted" && (
              <div className="space-y-3">
                {middlemanCall.middlemanName && (
                  <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                    <Avatar className="size-8 ring-1 ring-white/20">
                      <AvatarImage src={middlemanCall.middlemanAvatar} alt={middlemanCall.middlemanName} />
                      <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500 text-xs font-medium text-white">
                        {middlemanCall.middlemanName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{middlemanCall.middlemanName}</p>
                      <p className="text-xs text-white/60">Trusted Middleman</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="size-2 rounded-full bg-green-500" />
                      <span className="text-xs text-green-400">Online</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 text-sm text-blue-400">
                  <Shield className="size-4" />
                  <span>Middleman assigned - waiting to start trade</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleContact}
                    className="flex-1"
                  >
                    <MessageSquare className="mr-1 size-3" />
                    Contact
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleContact}
                    className="flex-1"
                  >
                    <Phone className="mr-1 size-3" />
                    Call
                  </Button>
                </div>
              </div>
            )}

            {middlemanCall.status === "declined" && (
              <div className="flex items-center justify-center gap-2 text-sm text-red-400">
                <X className="size-4" />
                <span>Middleman request was declined</span>
              </div>
            )}

            {middlemanCall.status === "cancelled" && (
              <div className="flex items-center justify-center gap-2 text-sm text-red-400">
                <X className="size-4" />
                <span>Middleman request was cancelled</span>
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