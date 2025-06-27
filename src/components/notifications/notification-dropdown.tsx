"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { Bell, Check, Trash2, MessageSquare, Shield, TrendingUp, Star, User, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import { ScrollArea } from "~/components/ui/scroll-area";
import { api } from "~convex/_generated/api";
import type { Id } from "~convex/_generated/dataModel";
import { getSession } from "~/lib/auth-client";
import { formatTimeAgo } from "~/lib/format-number";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface NotificationDropdownProps {
  className?: string;
}

export function NotificationDropdown({ className }: NotificationDropdownProps) {
  const router = useRouter();
  const [session, setSession] = useState<{ sessionId: Id<"session"> } | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Get session on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const sessionData = await getSession();
        if (sessionData.data?.session?.id) {
          setSession({ sessionId: sessionData.data.session.id as Id<"session"> });
        }
      } catch (error) {
        console.error("Failed to load session:", error);
      }
    };

    loadSession().catch(() => console.log("failed to load session"));
  }, []);

  // Fetch notifications
  const notifications = useQuery(
    api.notifications.getUserNotifications,
    session ? { session: session.sessionId, limit: 20 } : "skip"
  );

  // Fetch unread count
  const unreadCount = useQuery(
    api.notifications.getUnreadNotificationCount,
    session ? { session: session.sessionId } : "skip"
  );

  // Mutations
  const markAsRead = useMutation(api.notifications.markNotificationAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllNotificationsAsRead);
  const clearReadNotifications = useMutation(api.notifications.clearReadNotifications);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "vouch_received":
        return <Star className="text-yellow-400 size-4" />;
      case "middleman_call":
        return <Shield className="text-purple-400 size-4" />;
      case "trade_offer":
        return <TrendingUp className="text-blue-400 size-4" />;
      case "trade_completed":
        return <Check className="text-green-400 size-4" />;
      case "trade_cancelled":
        return <X className="text-red-400 size-4" />;
      case "chat_message":
        return <MessageSquare className="text-gray-400 size-4" />;
      case "system":
        return <Bell className="text-blue-400 size-4" />;
      default:
        return <Bell className="text-gray-400 size-4" />;
    }
  };

  const handleNotificationClick = async (notification: any) => {
    // Mark as read if not already read
    if (!notification.read) {
      try {
        await markAsRead({
          notificationId: notification._id,
          session: session!.sessionId,
        });
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }

    // Navigate based on notification type
    if (notification.vouchId && notification.vouchDetails) {
      // For vouch notifications, navigate to the user's profile or show details
      if (notification.vouchDetails.fromUser) {
        router.push(`/user/${notification.vouchDetails.fromUser.robloxUsername}`);
        setIsOpen(false);
      } else {
        setIsOpen(false);
        toast.info("Vouch details not available");
      }
    } else if (notification.chatId) {
      // Navigate to chat
      router.push(`/chat/${notification.chatId}`);
      setIsOpen(false);
    } else {
      // Close dropdown for other types
      setIsOpen(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!session) return;
    
    try {
      await markAllAsRead({ session: session.sessionId });
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  const handleClearRead = async () => {
    if (!session) return;
    
    try {
      await clearReadNotifications({ session: session.sessionId });
      toast.success("Read notifications cleared");
    } catch (error) {
      console.error("Failed to clear read notifications:", error);
      toast.error("Failed to clear read notifications");
    }
  };

  if (!session) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={`relative ${className}`}
        >
          <Bell className="inline size-5 text-white/80" />
          {!!unreadCount && unreadCount > 0 && (
            <div className="absolute flex items-center justify-center text-xs font-medium text-white bg-purple-500 rounded-full size-4 -bottom-1 -right-1">
              {unreadCount > 99 ? "99+" : unreadCount}
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-80"
        align="end"
        sideOffset={8}
      >
        <div className="flex items-center justify-between p-4 pb-2">
          <h3 className="font-semibold text-white">Notifications</h3>
          {!!unreadCount && unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} unread
            </Badge>
          )}
        </div>

        {notifications && notifications.length > 0 && (
          <div className="flex gap-2 px-4 pb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs h-7 text-white/60 hover:text-white"
            >
              <Check className="mr-1 size-3" />
              Mark all read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearRead}
              className="text-xs h-7 text-white/60 hover:text-white"
            >
              <Trash2 className="mr-1 size-3" />
              Clear read
            </Button>
          </div>
        )}

        <DropdownMenuSeparator className="bg-white/10" />

        <ScrollArea className="max-h-96">
          {!notifications || notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="mb-2 size-8 text-white/40" />
              <p className="text-sm text-white/60">No notifications yet</p>
              <p className="text-xs text-white/40">You'll see notifications here when you have them</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex cursor-pointer items-start gap-3 rounded p-3 transition-colors hover:bg-white/5 ${
                    !notification.read ? "bg-white/5 hover:bg-white/10" : ""
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.read ? "text-white" : "text-white/70"}`}>
                      {notification.content}
                    </p>
                    <p className="mt-1 text-xs text-white/50">
                      {formatTimeAgo(notification.createdAt)}
                    </p>
                  </div>

                  {!notification.read && (
                    <div className="flex-shrink-0">
                      <div className="bg-purple-500 rounded-full size-2" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}