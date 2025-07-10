"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useTranslations } from 'next-intl';
import { formatTimeAgo } from "~/lib/format-number";
import { api } from "~convex/_generated/api";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Ban,
  Clock,
  User,
  MessageSquare,
  MoreVertical,
  ExternalLink,
  Timer,
  Shield,
  Star,
  UserCheck,
} from "lucide-react";
import type { ResolvedMiddlemanCall } from "~convex/middlemanCalls";
import type { Id } from "~convex/_generated/dataModel";

interface MiddlemanCallCardProps {
  call: ResolvedMiddlemanCall;
  session: { sessionId: Id<"session"> };
  isPriority?: boolean;
}

export default function MiddlemanCallCard({ call, session, isPriority = false }: MiddlemanCallCardProps) {
  const t = useTranslations('middleman.panel');
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const updateStatus = useMutation(api.middlemanCalls.updateMiddlemanCallStatus);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmation":
        return <AlertTriangle className="text-orange-400 size-4" />;
      case "pending":
        return <AlertTriangle className="text-yellow-400 size-4" />;
      case "accepted":
        return <CheckCircle className="text-green-400 size-4" />;
      case "declined":
        return <XCircle className="text-red-400 size-4" />;
      case "cancelled":
        return <Ban className="text-gray-400 size-4" />;
      default:
        return <Clock className="text-blue-400 size-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmation":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "accepted":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "declined":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "cancelled":
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
      default:
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }
  };

  const getPriorityLevel = (status: string, createdAt: number) => {
    if (status !== "pending") return "normal";
    
    const hoursSinceCreated = (Date.now() - createdAt) / (1000 * 60 * 60);
    
    if (hoursSinceCreated > 2) return "high";
    if (hoursSinceCreated > 1) return "medium";
    return "normal";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "medium":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      default:
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }
  };

  const handleStatusUpdate = async (newStatus: "accepted" | "declined" | "cancelled") => {
    setIsUpdating(true);
    try {
      await updateStatus({
        middlemanCallId: call._id,
        status: newStatus,
        session: session.sessionId,
      });
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const priority = getPriorityLevel(call.status, call.createdAt);
  const timeAgo = formatTimeAgo(call.createdAt);
  const responseTime = call.updatedAt > call.createdAt 
    ? Math.round((call.updatedAt - call.createdAt) / (1000 * 60)) 
    : null;

  return (
    <>
      <Card className={`transition-all duration-200 border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15 hover:border-white/20 ${
        isPriority ? 'ring-1 ring-purple-500/30' : ''
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="size-10 border-white/20">
                <AvatarImage src={call.creator?.robloxAvatarUrl ?? undefined} />
                <AvatarFallback className="text-sm font-semibold text-white bg-gradient-to-br from-purple-500 to-blue-500">
                  {call.creator?.name?.charAt(0) ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm font-medium text-white truncate">
                  {call.creator?.name ?? "Unknown User"}
                </CardTitle>
                <CardDescription className="text-xs text-white/60">
                  {timeAgo}
                </CardDescription>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setShowDetailsDialog(true)}>
                  <MessageSquare className="mr-2 size-4" />
                  {t('actions.viewDetails')}
                </DropdownMenuItem>
                {call.chat && (
                  <DropdownMenuItem asChild>
                    <a href={`/chat/${call.chat._id}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 size-4" />
                      {t('actions.openChat')}
                    </a>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {call.status === "pending" && (
                  <>
                    <DropdownMenuItem 
                      onClick={() => handleStatusUpdate("accepted")}
                      disabled={isUpdating}
                      className="text-green-400"
                    >
                      <CheckCircle className="mr-2 size-4" />
                      {t('actions.acceptCall')}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleStatusUpdate("declined")}
                      disabled={isUpdating}
                      className="text-red-400"
                    >
                      <XCircle className="mr-2 size-4" />
                      {t('actions.declineCall')}
                    </DropdownMenuItem>
                  </>
                )}
                {(call.status === "pending" || call.status === "accepted") && (
                  <DropdownMenuItem 
                    onClick={() => handleStatusUpdate("cancelled")}
                    disabled={isUpdating}
                    className="text-gray-400"
                  >
                    <Ban className="mr-2 size-4" />
                    {t('actions.cancelCall')}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            <Badge className={getStatusColor(call.status)}>
              {getStatusIcon(call.status)}
              <span className="ml-1 capitalize">{t(`status.${call.status}`)}</span>
            </Badge>
            
            {isPriority && (
              <Badge className="text-purple-400 bg-purple-500/10 border-purple-500/20">
                <UserCheck className="size-3" />
                <span className="ml-1">Priority</span>
              </Badge>
            )}
            
            {priority !== "normal" && call.status === "pending" && (
              <Badge className={getPriorityColor(priority)}>
                <AlertTriangle className="size-3" />
                <span className="ml-1">{t(`priority.${priority}`)}</span>
              </Badge>
            )}
            
            {responseTime && call.status !== "pending" && call.status !== "confirmation" && (
              <Badge className="text-purple-400 bg-purple-500/10 border-purple-500/20">
                <Timer className="size-3" />
                <span className="ml-1">{responseTime}m response</span>
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <div className="space-y-3">
            <div>
              <p className="mb-1 text-xs font-medium text-white/80">{t('details.reason')}</p>
              <p className="text-sm text-white/90 line-clamp-2">
                {call.reason}
              </p>
            </div>
            
            <div>
              <p className="mb-1 text-xs font-medium text-white/80">{t('details.estimatedWait')}</p>
              <p className="text-sm text-white/70">
                {call.estimatedWaitTime}
              </p>
            </div>

            {call.desiredMiddlemanProfile && (
              <div>
                <p className="mb-2 text-xs font-medium text-white/80">Requested Middleman</p>
                <div className="flex items-center gap-2 p-2 border rounded-lg border-white/10 bg-white/5">
                  <Avatar className="size-6 border-white/20">
                    <AvatarImage src={call.desiredMiddlemanProfile.robloxAvatarUrl ?? undefined} />
                    <AvatarFallback className="text-xs font-semibold text-white bg-gradient-to-br from-purple-500 to-blue-500">
                      {call.desiredMiddlemanProfile.name?.charAt(0) ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">
                      {call.desiredMiddlemanProfile.name ?? call.desiredMiddlemanProfile.robloxUsername}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <Shield className="size-2" />
                      <span>Middleman</span>
                      {call.desiredMiddlemanProfile.averageRating && (
                        <>
                          <Star className="size-2 fill-yellow-400 text-yellow-400" />
                          <span>{call.desiredMiddlemanProfile.averageRating.toFixed(1)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-3 border-t border-white/10">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <User className="size-3" />
              <span>{t('details.callId')}: {call._id.slice(-8)}</span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetailsDialog(true)}
              className="px-3 text-xs h-7"
            >
              {t('actions.viewDetails')}
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl border-white/10 bg-gradient-to-b from-[#0f051d] to-[#1a0b2e]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {getStatusIcon(call.status)}
              <span>{t('details.title')}</span>
              {isPriority && (
                <Badge className="text-purple-400 bg-purple-500/10 border-purple-500/20">
                  <UserCheck className="size-3" />
                  <span className="ml-1">Priority Call</span>
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {t('details.createdBy', { 
                timeAgo, 
                creator: call.creator?.name ?? "Unknown User" 
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="mb-2 text-sm font-medium text-white/80">{t('details.status')}</p>
                <Badge className={getStatusColor(call.status)}>
                  {getStatusIcon(call.status)}
                  <span className="ml-2 capitalize">{t(`status.${call.status}`)}</span>
                </Badge>
              </div>
              
              <div>
                <p className="mb-2 text-sm font-medium text-white/80">{t('details.priority')}</p>
                <Badge className={getPriorityColor(priority)}>
                  <AlertTriangle className="size-3" />
                  <span className="ml-1">{t(`priority.${priority}`)}</span>
                </Badge>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-white/80">{t('details.reason')}</p>
              <div className="p-3 border rounded-lg bg-white/5 border-white/10">
                <p className="text-sm text-white/90">{call.reason}</p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-white/80">{t('details.estimatedWait')}</p>
              <div className="p-3 border rounded-lg bg-white/5 border-white/10">
                <p className="text-sm text-white/90">{call.estimatedWaitTime}</p>
              </div>
            </div>

            {call.desiredMiddlemanProfile && (
              <div>
                <p className="mb-2 text-sm font-medium text-white/80">Requested Middleman</p>
                <div className="flex items-center gap-3 p-3 border rounded-lg border-white/10 bg-white/5">
                  <Avatar className="size-10 border-white/20">
                    <AvatarImage src={call.desiredMiddlemanProfile.robloxAvatarUrl ?? undefined} />
                    <AvatarFallback className="text-sm font-semibold text-white bg-gradient-to-br from-purple-500 to-blue-500">
                      {call.desiredMiddlemanProfile.name?.charAt(0) ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      {call.desiredMiddlemanProfile.name ?? call.desiredMiddlemanProfile.robloxUsername}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-white/60">
                      {call.desiredMiddlemanProfile.robloxUsername && (
                        <span>@{call.desiredMiddlemanProfile.robloxUsername}</span>
                      )}
                      {call.desiredMiddlemanProfile.averageRating && (
                        <div className="flex items-center gap-1">
                          <Star className="size-3 fill-yellow-400 text-yellow-400" />
                          <span>{call.desiredMiddlemanProfile.averageRating.toFixed(1)}</span>
                          <span>({call.desiredMiddlemanProfile.vouchCount} vouches)</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge className="text-purple-400 bg-purple-500/10 border-purple-500/20">
                    <Shield className="size-3" />
                    <span className="ml-1">Middleman</span>
                  </Badge>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="mb-2 text-sm font-medium text-white/80">{t('details.created')}</p>
                <p className="text-sm text-white/70">
                  {new Date(call.createdAt).toLocaleString()}
                </p>
              </div>
              
              <div>
                <p className="mb-2 text-sm font-medium text-white/80">{t('details.lastUpdated')}</p>
                <p className="text-sm text-white/70">
                  {new Date(call.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>

            {responseTime && (
              <div>
                <p className="mb-2 text-sm font-medium text-white/80">{t('details.responseTime')}</p>
                <p className="text-sm text-white/70">{responseTime} {t('details.minutes')}</p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            {call.chat && (
              <Button variant="outline" asChild>
                <a href={`/chat/${call.chat._id}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 size-4" />
                  {t('actions.openChat')}
                </a>
              </Button>
            )}
            
            {call.status === "pending" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleStatusUpdate("declined")}
                  disabled={isUpdating}
                  className="text-red-400 border-red-500/20 hover:bg-red-500/10"
                >
                  <XCircle className="mr-2 size-4" />
                  {t('actions.decline')}
                </Button>
                <Button
                  onClick={() => handleStatusUpdate("accepted")}
                  disabled={isUpdating}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="mr-2 size-4" />
                  {t('actions.accept')}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}