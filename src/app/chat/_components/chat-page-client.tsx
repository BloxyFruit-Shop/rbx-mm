"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { ChatHeader } from "./chat-header";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { api } from "~convex/_generated/api";
import type { Id } from "~convex/_generated/dataModel";

interface ChatPageClientProps {
  chatId: string;
  sessionId: Id<"session">;
  currentUserId: Id<"user">;
  currentUserName: string;
  currentUserAvatar?: string;
  currentUserRoles: string[];
  initialTradeStatus: string;
}

export function ChatPageClient({
  chatId,
  sessionId,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  currentUserRoles,
  initialTradeStatus,
}: ChatPageClientProps) {
  const router = useRouter();
  const [optimisticHandlers, setOptimisticHandlers] = useState<{
    onOptimisticMessage?: (message: any) => void;
    onOptimisticError?: (tempId: string) => void;
  }>({});

  const [tradeStatus, setTradeStatus] = useState(initialTradeStatus);

  // Get reactive chat data
  const chatData = useQuery(api.chats.getChatById, {
    chatId: chatId as Id<"chats">,
    session: sessionId,
  });

  // Get trade ad data if available
  const tradeAdData = useQuery(
    api.tradeAds.getTradeAdById,
    chatData?.tradeAd ? { tradeAdId: chatData.tradeAd } : "skip"
  );

  // Handle case where chat is deleted or no longer accessible
  useEffect(() => {
    if (chatData === null) {
      // Chat was deleted or user no longer has access
      router.push("/chat");
    }
  }, [chatData, router]);

  // Show loading state while checking if chat exists
  if (chatData === null) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white/60">Loading chat...</p>
        </div>
      </div>
    );
  }

  // Update local trade status when chat data changes
  useEffect(() => {
    if (chatData?.tradeStatus) {
      setTradeStatus(chatData.tradeStatus);
    } else if (chatData?.type === "direct_message") {
      setTradeStatus("none"); // Default for direct messages
    }
  }, [chatData?.tradeStatus, chatData?.type]);

  // Determine if user is middleman
  const isMiddleman = currentUserRoles.includes("middleman");

  const handleOptimisticMessage = useCallback((message: any) => {
    optimisticHandlers.onOptimisticMessage?.(message);
  }, [optimisticHandlers.onOptimisticMessage]);

  const handleOptimisticError = useCallback((tempId: string) => {
    optimisticHandlers.onOptimisticError?.(tempId);
  }, [optimisticHandlers.onOptimisticError]);

  const setOptimisticMessageHandler = useCallback((handler: (message: any) => void) => {
    setOptimisticHandlers(prev => ({ ...prev, onOptimisticMessage: handler }));
  }, []);

  const setOptimisticErrorHandler = useCallback((handler: (tempId: string) => void) => {
    setOptimisticHandlers(prev => ({ ...prev, onOptimisticError: handler }));
  }, []);

  // Prepare trade ad data for the chat input
  const chatTradeAdData = tradeAdData ? {
    id: tradeAdData._id,
    wantItems: tradeAdData.wantItemsResolved.map(item => ({
      id: item._id,
      name: item.name,
      thumbnailUrl: item.thumbnailUrl,
      quantity: item.quantity,
      rarity: item.rarity,
    }))
  } : undefined;

  return (
    <div className="flex flex-col h-full">
      <ChatHeader 
        chatId={chatId} 
        sessionId={sessionId} 
        currentUserId={currentUserId}
        isMiddleman={isMiddleman}
        tradeStatus={tradeStatus}
      />
      <ChatMessages 
        chatId={chatId} 
        sessionId={sessionId} 
        currentUserId={currentUserId}
        isMiddleman={isMiddleman}
        onOptimisticMessage={setOptimisticMessageHandler}
        onOptimisticError={setOptimisticErrorHandler}
      />
      <ChatInput 
        chatId={chatId} 
        sessionId={sessionId} 
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        currentUserAvatar={currentUserAvatar}
        tradeStatus={tradeStatus}
        isMiddleman={isMiddleman}
        tradeAdCreatorId={chatData?.tradeAdCreatorId}
        tradeAdData={chatTradeAdData}
        chatType={chatData?.type ?? "trade"}
        participantIds={chatData?.participantIds}
        onOptimisticMessage={handleOptimisticMessage}
        onOptimisticError={handleOptimisticError}
      />
    </div>
  );
}