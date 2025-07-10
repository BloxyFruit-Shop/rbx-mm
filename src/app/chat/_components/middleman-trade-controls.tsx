"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { Button } from "~/components/ui/button";
import { CheckCircle2, X } from "lucide-react";
import { api } from "~convex/_generated/api";
import type { Id } from "~convex/_generated/dataModel";
import { toast } from "sonner";

interface MiddlemanTradeControlsProps {
  chatId: string;
  sessionId: Id<"session">;
}

export function MiddlemanTradeControls({ chatId, sessionId }: MiddlemanTradeControlsProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const updateTradeStatusByMiddleman = useMutation(api.chats.updateTradeStatusByMiddleman);

  const handleCompleteTrade = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await updateTradeStatusByMiddleman({
        chatId: chatId as Id<"chats">,
        session: sessionId,
        newStatus: "completed",
      });
      toast.success("Trade marked as completed successfully.");
    } catch (error) {
      console.error("Failed to complete trade:", error);
      toast.error(error instanceof Error ? error.message : "Failed to complete trade.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelTrade = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await updateTradeStatusByMiddleman({
        chatId: chatId as Id<"chats">,
        session: sessionId,
        newStatus: "cancelled",
      });
      toast.success("Trade marked as cancelled successfully.");
    } catch (error) {
      console.error("Failed to cancel trade:", error);
      toast.error(error instanceof Error ? error.message : "Failed to cancel trade.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCompleteTrade}
        disabled={isLoading}
        className="px-2 text-xs text-green-400 border-green-500/30 hover:bg-green-500/10 h-7 sm:h-8 sm:px-3 sm:text-sm"
      >
        <CheckCircle2 className="size-2.5 sm:size-3 sm:mr-1" />
        <span className="hidden sm:inline sm:ml-1">
          {isLoading ? "Completing..." : "Complete"}
        </span>
        <span className="md:hidden">
          {isLoading ? "..." : "✓"}
        </span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCancelTrade}
        disabled={isLoading}
        className="px-2 text-xs text-red-400 border-red-500/30 hover:bg-red-500/10 h-7 sm:h-8 sm:px-3 sm:text-sm"
      >
        <X className="size-2.5 sm:size-3 sm:mr-1" />
        <span className="hidden sm:inline sm:ml-1">
          {isLoading ? "Cancelling..." : "Cancel"}
        </span>
        <span className="md:hidden">
          {isLoading ? "..." : "✗"}
        </span>
      </Button>
    </div>
  );
}