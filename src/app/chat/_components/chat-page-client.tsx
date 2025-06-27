"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery } from "convex/react";
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

  // Update local trade status when chat data changes
  useEffect(() => {
    if (chatData?.tradeStatus) {
      setTradeStatus(chatData.tradeStatus);
    }
  }, [chatData?.tradeStatus]);

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
        onOptimisticMessage={handleOptimisticMessage}
        onOptimisticError={handleOptimisticError}
      />
    </div>
  );
}