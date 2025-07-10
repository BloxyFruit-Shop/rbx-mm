"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Shield, Clock, CheckCircle2, AlertTriangle, X } from "lucide-react";
import { cn } from "~/lib/utils";
import { api } from "~convex/_generated/api";
import type { Id } from "~convex/_generated/dataModel";
import type { ResolvedMiddlemanCall } from "~convex/middlemanCalls";
import { toast } from "sonner";
import { UserHoverCard } from "~/components/user/user-hover-card";
import type { PublicUserProfile } from "~convex/user";

interface MiddlemanCallCardProps {
  message: {
    id: string;
    senderId?: string;
    senderName: string;
    senderAvatar?: string;
    timestamp: number;
    isCurrentUser: boolean;
    sender?: PublicUserProfile | null;
    middlemanCall?: ResolvedMiddlemanCall | null;
  };
  showAvatar: boolean;
  sessionId: Id<"session">;
  currentUserId: Id<"user">;
  isMiddleman: boolean;
}

const statusConfig = {
  confirmation: {
    color: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    label: "Awaiting Confirmation",
    icon: AlertTriangle,
  },
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
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MiddlemanCallCard({
  message,
  showAvatar,
  sessionId,
  currentUserId,
  isMiddleman,
}: MiddlemanCallCardProps) {
  const { middlemanCall } = message;
  const [isLoading, setIsLoading] = useState(false);

  const updateMiddlemanCallStatus = useMutation(
    api.middlemanCalls.updateMiddlemanCallStatus,
  );

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
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to cancel middleman call.",
      );
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
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to accept middleman call.",
      );
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
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to decline middleman call.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await updateMiddlemanCallStatus({
        middlemanCallId: middlemanCall._id as Id<"middleman_calls">,
        status: "pending",
        session: sessionId,
      });
      toast.success("Middleman call confirmed and sent to middlemen.");
    } catch (error) {
      console.error("Failed to confirm middleman call:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to confirm middleman call.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "flex gap-2 sm:gap-3",
        message.isCurrentUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      <div className="flex-shrink-0">
        {showAvatar ? (
          <UserHoverCard user={message.sender} side="right" align="start">
            <Avatar className="size-8 ring-1 ring-white/20 sm:size-9 cursor-pointer">
              <AvatarImage src={message.senderAvatar} alt={message.senderName} />
              <AvatarFallback className="text-xs font-medium text-white bg-gradient-to-br from-purple-500 to-blue-500">
                {message.senderName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </UserHoverCard>
        ) : (
          <div className="size-8 sm:size-9" />
        )}
      </div>

      <div
        className={cn(
          "flex max-w-[90%] flex-col gap-1 sm:max-w-[80%]",
          message.isCurrentUser ? "items-end" : "items-start",
        )}
      >
        {showAvatar && (
          <div
            className={cn(
              "flex items-center gap-2 text-xs text-white/60",
              message.isCurrentUser ? "flex-row-reverse" : "flex-row",
            )}
          >
            <span className="font-medium">{message.senderName}</span>
            <span>{formatTime(message.timestamp)}</span>
          </div>
        )}

        <Card
          className={cn(
            "w-full min-w-0 border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm",
            middlemanCall.status === "confirmation" && "ring-1 ring-orange-500/20",
            middlemanCall.status === "pending" && "ring-1 ring-yellow-500/20",
            middlemanCall.status === "accepted" && "ring-1 ring-blue-500/20",
            middlemanCall.status === "declined" && "ring-1 ring-red-500/20",
            middlemanCall.status === "cancelled" && "ring-1 ring-red-500/20",
          )}
        >
          <CardHeader className="p-3 pb-2 sm:p-6 sm:pb-3">
            <div className="flex items-start justify-between gap-2 sm:gap-4">
              <div className="flex items-center flex-1 min-w-0 gap-2">
                <div className="flex-shrink-0 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-1.5 sm:p-2">
                  <Shield className="text-white size-3 sm:size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-semibold text-white truncate sm:text-sm">
                    Middleman Request
                  </h3>
                  <p className="text-xs truncate text-white/60">
                    {message.isCurrentUser
                      ? "You called a middleman"
                      : `${message.senderName} called a middleman`}
                  </p>
                </div>
              </div>

              <Badge className={cn("flex-shrink-0 text-xs", statusInfo.color)}>
                <StatusIcon className="mr-1 size-2 sm:size-2.5" />
                <span className="hidden xs:inline">{statusInfo.label}</span>
                <span className="xs:hidden">
                  {statusInfo.label === "Middleman Assigned"
                    ? "Assigned"
                    : statusInfo.label === "Awaiting Confirmation"
                    ? "Confirm"
                    : statusInfo.label}
                </span>
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-3 pt-0 mt-0 space-y-3 sm:mt-0 sm:space-y-4 sm:p-6 sm:pt-0">
            <div className="p-2 border rounded-lg border-white/10 bg-white/5 sm:p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 size-3 flex-shrink-0 text-yellow-400 sm:size-4" />
                <div className="flex-1 min-w-0">
                  <p className="mb-1 text-xs font-medium text-white sm:text-sm">
                    Reason
                  </p>
                  <p className="text-xs break-words text-white/70 sm:text-sm">
                    {middlemanCall.reason}
                  </p>
                </div>
              </div>
            </div>

            {middlemanCall.desiredMiddlemanProfile && (
              <div className="p-2 border rounded-lg border-purple-500/20 bg-purple-500/5 sm:p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="text-purple-400 size-3 sm:size-4" />
                  <p className="text-xs font-medium text-purple-400 sm:text-sm">
                    Requested Middleman
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Avatar className="size-6 border-white/20 sm:size-8">
                    <AvatarImage
                      src={
                        middlemanCall.desiredMiddlemanProfile.robloxAvatarUrl ??
                        undefined
                      }
                    />
                    <AvatarFallback className="text-xs font-medium text-white bg-gradient-to-br from-purple-500 to-blue-500">
                      {middlemanCall.desiredMiddlemanProfile.name?.charAt(0) ??
                        "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate cursor-pointer sm:text-sm">
                      {middlemanCall.desiredMiddlemanProfile.name ??
                        middlemanCall.desiredMiddlemanProfile.robloxUsername}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <Shield className="size-2" />
                      <span>Middleman</span>
                      {middlemanCall.desiredMiddlemanProfile.averageRating && (
                        <>
                          <span>•</span>
                          <span>
                            ⭐{" "}
                            {middlemanCall.desiredMiddlemanProfile.averageRating.toFixed(
                              1,
                            )}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {middlemanCall.status === "confirmation" && (
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-center gap-2 text-xs text-orange-400 sm:text-sm">
                  <AlertTriangle className="size-3 animate-pulse sm:size-4" />
                  <span className="text-center">
                    {message.isCurrentUser
                      ? "Waiting for the other user to confirm"
                      : "Please confirm this middleman request"}
                  </span>
                </div>

                <div className="flex gap-1.5 sm:gap-2">
                  {message.isCurrentUser ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleCancel}
                      disabled={isLoading}
                      className="w-full h-8 text-xs sm:h-9 sm:text-sm"
                    >
                      <X className="mr-1 size-3" />
                      <span className="hidden xs:inline">
                        {isLoading ? "Cancelling..." : "Cancel Request"}
                      </span>
                      <span className="xs:hidden">
                        {isLoading ? "Cancelling..." : "Cancel"}
                      </span>
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="flex-1 h-8 text-xs text-green-400 border-green-500/30 hover:bg-green-500/10 sm:h-9 sm:text-sm"
                      >
                        <CheckCircle2 className="mr-1 size-3" />
                        <span className="hidden xs:inline">
                          {isLoading ? "Confirming..." : "Confirm"}
                        </span>
                        <span className="xs:hidden">
                          {isLoading ? "..." : "Confirm"}
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="flex-1 h-8 text-xs text-red-400 border-red-500/30 hover:bg-red-500/10 sm:h-9 sm:text-sm"
                      >
                        <X className="mr-1 size-3" />
                        <span className="hidden xs:inline">
                          {isLoading ? "Declining..." : "Decline"}
                        </span>
                        <span className="xs:hidden">
                          {isLoading ? "..." : "Decline"}
                        </span>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}

            {middlemanCall.status === "pending" && (
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-center gap-2 text-xs text-yellow-400 sm:text-sm">
                  <Clock className="size-3 animate-pulse sm:size-4" />
                  <span className="text-center">
                    Searching for available middleman...
                  </span>
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
                      className="w-full h-8 text-xs sm:h-9 sm:text-sm"
                    >
                      <X className="mr-1 size-3" />
                      <span className="hidden xs:inline">
                        {isLoading ? "Cancelling..." : "Cancel Request"}
                      </span>
                      <span className="xs:hidden">
                        {isLoading ? "Cancelling..." : "Cancel"}
                      </span>
                    </Button>
                  ) : isMiddleman ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAccept}
                        disabled={isLoading}
                        className="flex-1 h-8 text-xs text-green-400 border-green-500/30 hover:bg-green-500/10 sm:h-9 sm:text-sm"
                      >
                        <CheckCircle2 className="mr-1 size-3" />
                        <span className="hidden xs:inline">
                          {isLoading ? "Accepting..." : "Accept"}
                        </span>
                        <span className="xs:hidden">
                          {isLoading ? "..." : "Accept"}
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDecline}
                        disabled={isLoading}
                        className="flex-1 h-8 text-xs text-red-400 border-red-500/30 hover:bg-red-500/10 sm:h-9 sm:text-sm"
                      >
                        <X className="mr-1 size-3" />
                        <span className="hidden xs:inline">
                          {isLoading ? "Declining..." : "Decline"}
                        </span>
                        <span className="xs:hidden">
                          {isLoading ? "..." : "Deny"}
                        </span>
                      </Button>
                    </>
                  ) : (
                    <div className="flex items-center justify-center w-full py-2 text-xs text-white/60 sm:text-sm">
                      Waiting for response...
                    </div>
                  )}
                </div>
              </div>
            )}

            {middlemanCall.status === "accepted" && (
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-center gap-2 text-xs text-blue-400 sm:text-sm">
                  <Shield className="size-3 sm:size-4" />
                  <span className="text-center">
                    Middleman assigned - ready to facilitate trade
                  </span>
                </div>
              </div>
            )}

            {middlemanCall.status === "declined" && (
              <div className="flex items-center justify-center gap-2 text-xs text-red-400 sm:text-sm">
                <X className="size-3 sm:size-4" />
                <span className="text-center">
                  Middleman request was declined
                </span>
              </div>
            )}

            {middlemanCall.status === "cancelled" && (
              <div className="flex items-center justify-center gap-2 text-xs text-red-400 sm:text-sm">
                <X className="size-3 sm:size-4" />
                <span className="text-center">
                  Middleman request was cancelled
                </span>
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