"use client";

import { useState, useCallback } from "react";
import { ChatHeader } from "./chat-header";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import type { Id } from "~convex/_generated/dataModel";

interface ChatPageClientProps {
  chatId: string;
  sessionId: Id<"session">;
  currentUserId: Id<"user">;
  currentUserName: string;
  currentUserAvatar?: string;
}

export function ChatPageClient({
  chatId,
  sessionId,
  currentUserId,
  currentUserName,
  currentUserAvatar,
}: ChatPageClientProps) {
  const [optimisticHandlers, setOptimisticHandlers] = useState<{
    onOptimisticMessage?: (message: any) => void;
    onOptimisticError?: (tempId: string) => void;
  }>({});

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
      <ChatHeader chatId={chatId} sessionId={sessionId} currentUserId={currentUserId} />
      <ChatMessages 
        chatId={chatId} 
        sessionId={sessionId} 
        currentUserId={currentUserId}
        onOptimisticMessage={setOptimisticMessageHandler}
        onOptimisticError={setOptimisticErrorHandler}
      />
      <ChatInput 
        chatId={chatId} 
        sessionId={sessionId} 
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        currentUserAvatar={currentUserAvatar}
        onOptimisticMessage={handleOptimisticMessage}
        onOptimisticError={handleOptimisticError}
      />
    </div>
  );
}