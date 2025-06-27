"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
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
  onOptimisticMessage?: (message: ResolvedMessage) => void;
  onOptimisticError?: (tempId: string) => void;
}

export function ChatInput({ 
  chatId, 
  sessionId, 
  currentUserId, 
  currentUserName, 
  currentUserAvatar,
  onOptimisticMessage,
  onOptimisticError
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [middlemanDialogOpen, setMiddlemanDialogOpen] = useState(false);
  const [tradeOfferDialogOpen, setTradeOfferDialogOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
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

  return (
    <>
      <div className="border-t border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-3 p-3 sm:p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="size-9 flex-shrink-0 p-0 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200"
              >
                <Plus className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={handleCallMiddleman}>
                <Shield className="mr-2 size-4" />
                Call Middleman
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleCreateTradeOffer}>
                <Package className="mr-2 size-4" />
                Create Trade Offer
              </DropdownMenuItem>
              
            </DropdownMenuContent>
          </DropdownMenu>

          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
            maxLength={1000}
          />

          <Button
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            size="sm"
            className={cn(
              "size-9 flex-shrink-0 p-0 transition-all duration-200",
              message.trim() && !isLoading
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
        mode="chat"
      />
    </>
  );
}