"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { useTranslations } from 'next-intl';
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Send, Plus, Shield, Package } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { MiddlemanCallDialog } from "./middleman-call-dialog";
import { TradeOfferDialog } from "~/components/trade/trade-offer-dialog";
import { cn } from "~/lib/utils";
import { api } from "~convex/_generated/api";
import type { Id } from "~convex/_generated/dataModel";
import { toast } from 'sonner';
import type { ResolvedMessage } from '~convex/chats';

interface ChatInputProps {
  chatId: string;
  sessionId: Id<"session">;
  currentUserId: Id<"user">;
  currentUserName: string;
  currentUserAvatar?: string;
  tradeStatus: string;
  isMiddleman: boolean;
  tradeAdCreatorId?: Id<"user">;
  tradeAdData?: {
    id: Id<"tradeAds">;
    wantItems: Array<{
      id: string;
      name: string;
      thumbnailUrl: string;
      quantity: number;
      rarity: string;
    }>;
  };
  chatType: "trade" | "direct_message";
  onOptimisticMessage?: (message: ResolvedMessage) => void;
  onOptimisticError?: (tempId: string) => void;
}

export function ChatInput({ 
  chatId, 
  sessionId, 
  currentUserId, 
  currentUserName, 
  currentUserAvatar,
  tradeStatus,
  isMiddleman,
  tradeAdCreatorId,
  tradeAdData,
  chatType,
  onOptimisticMessage,
  onOptimisticError
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [middlemanDialogOpen, setMiddlemanDialogOpen] = useState(false);
  const [tradeOfferDialogOpen, setTradeOfferDialogOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const t = useTranslations('chat');
  const sendMessage = useMutation(api.messages.sendMessage);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const messageContent = message.trim();
    const tempId = `temp-${Date.now()}`;
    
    // Reset form immediately for better UX
    setMessage("");
    setIsLoading(true);

    // Create optimistic message
    const optimisticMessage = {
      _id: tempId as Id<"messages">,
      _creationTime: Date.now(),
      chatId: chatId as Id<"chats">,
      senderId: currentUserId,
      type: "message" as const,
      content: messageContent,
      timestamp: Date.now(),
      sender: {
        _id: currentUserId,
        _creationTime: Date.now(),
        name: currentUserName,
        robloxUsername: null,
        robloxAvatarUrl: currentUserAvatar ?? null,
        roles: [],
        badges: [],
        averageRating: null,
        vouchCount: 0,
      },
      tradeOffer: null,
      middlemanCall: null,
      isOptimistic: true,
    };

    // Add optimistic message to UI
    onOptimisticMessage?.(optimisticMessage);

    try {
      await sendMessage({
        chatId: chatId as Id<"chats">,
        content: messageContent,
        session: sessionId,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message. Please try again.");
      
      // Remove optimistic message on error
      onOptimisticError?.(tempId);
      
      // Restore the message content
      setMessage(messageContent);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend().catch(() => {
        toast.error("Failed to send message. Please try again.");
      });
    }
  };

  const handleCallMiddleman = () => {
    setMiddlemanDialogOpen(true);
  };

  const handleCreateTradeOffer = () => {
    setTradeOfferDialogOpen(true);
  };

  // Determine if chat is active (not completed or cancelled for trade chats, always active for DMs)
  const isChatActive = chatType === "direct_message" || (tradeStatus !== 'completed' && tradeStatus !== 'cancelled');
  
  // Determine if new trade offers can be created (only for trade chats when no active trade and user is not the trade ad creator)
  const canCreateTradeOffer = chatType === "trade" && tradeStatus === 'none' && !isMiddleman && tradeAdCreatorId !== currentUserId;
  
  // Determine if middleman call can be made (only for trade chats when trade is accepted and user is not middleman)
  const canCallMiddleman = chatType === "trade" && tradeStatus === 'accepted' && !isMiddleman && isChatActive;

  return (
    <>
      <div className="border-t border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-3 p-3 sm:p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                disabled={!isChatActive}
                className="size-9 flex-shrink-0 p-0 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 disabled:opacity-50"
              >
                <Plus className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {chatType === "trade" && !isMiddleman && (
                <>
                  <DropdownMenuItem onClick={handleCallMiddleman} disabled={!canCallMiddleman}>
                    <Shield className="mr-2 size-4" />
                    Call Middleman
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={handleCreateTradeOffer} disabled={!canCreateTradeOffer}>
                    <Package className="mr-2 size-4" />
                    Create Trade Offer
                  </DropdownMenuItem>
                </>
              )}
              
              {chatType === "trade" && isMiddleman && (
                <div className="p-2 text-center text-xs text-white/60">
                  Use middleman controls in header
                </div>
              )}

              {chatType === "direct_message" && (
                <div className="p-2 text-center text-xs text-white/60">
                  {t('input.directMessageMode')}
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isChatActive ? "Type a message..." : "Chat is closed"}
            className="flex-1"
            maxLength={1000}
            disabled={!isChatActive}
          />

          <Button
            onClick={handleSend}
            disabled={!message.trim() || isLoading || !isChatActive}
            size="sm"
            className={cn(
              "size-9 flex-shrink-0 p-0 transition-all duration-200",
              message.trim() && !isLoading && isChatActive
                ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                : "bg-white/10 hover:bg-white/20"
            )}
          >
            <Send className={cn("size-4", isLoading && "animate-pulse")} />
          </Button>
        </div>

        {message.length > 800 && (
          <div className="px-4 pb-2">
            <div className={cn(
              "text-xs",
              message.length > 950 ? "text-red-400" : "text-white/50"
            )}>
              {message.length}/1000
            </div>
          </div>
        )}
      </div>

      <MiddlemanCallDialog
        open={middlemanDialogOpen}
        onOpenChange={setMiddlemanDialogOpen}
        chatId={chatId}
        sessionId={sessionId}
      />

      <TradeOfferDialog
        open={tradeOfferDialogOpen}
        onOpenChange={setTradeOfferDialogOpen}
        chatId={chatId}
        tradeAdData={tradeAdData}
      />
    </>
  );
}