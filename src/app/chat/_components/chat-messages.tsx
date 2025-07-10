"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { MessageBubble } from "./message-bubble";
import { TradeOfferCard } from "./trade-offer-card";
import { MiddlemanCallCard } from "./middleman-call-card";
import { SystemMessage } from "./system-message";
import { api } from "~convex/_generated/api";
import type { Id } from "~convex/_generated/dataModel";
import type { ResolvedMessage } from '~convex/chats';

interface ChatMessagesProps {
  chatId: string;
  sessionId: Id<"session">;
  currentUserId: Id<"user">;
  isMiddleman: boolean;
  onOptimisticMessage?: (handler: (message: ResolvedMessage) => void) => void;
  onOptimisticError?: (handler: (tempId: string) => void) => void;
}

export function ChatMessages({
  chatId,
  sessionId,
  currentUserId,
  isMiddleman,
  onOptimisticMessage,
  onOptimisticError,
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [optimisticMessages, setOptimisticMessages] = useState<ResolvedMessage[]>([]);

  const serverMessages = useQuery(api.messages.getChatMessages, {
    chatId: chatId as Id<"chats">,
    session: sessionId,
  });

  const chatData = useQuery(api.chats.getChatById, {
    chatId: chatId as Id<"chats">,
    session: sessionId,
  });

  console.log('Messages', chatData)

  const markChatAsRead = useMutation(api.chats.markChatAsRead);
  const readStates = useQuery(api.chats.getChatParticipantsReadStates, {
    chatId: chatId as Id<"chats">,
  });

  // Combine server messages with optimistic messages
  const messages = serverMessages ? [...serverMessages, ...optimisticMessages] : optimisticMessages;

  // Handle optimistic message addition
  const handleOptimisticMessage = useCallback((message: ResolvedMessage) => {
    setOptimisticMessages(prev => [...prev, message]);
  }, []);

  // Handle optimistic message error (remove it)
  const handleOptimisticError = useCallback((tempId: string) => {
    setOptimisticMessages(prev => prev.filter(msg => msg._id !== tempId));
  }, []);

  // Clean up optimistic messages when server messages update
  useEffect(() => {
    if (serverMessages && optimisticMessages.length > 0) {
      // Remove optimistic messages that now exist in server messages
      setOptimisticMessages(prev => 
        prev.filter(optimistic => 
          !serverMessages.some(server => 
            server.content === optimistic.content && 
            server.senderId === optimistic.senderId &&
            Math.abs(server.timestamp - optimistic.timestamp) < 5000 // Within 5 seconds
          )
        )
      );
    }
  }, [serverMessages, optimisticMessages.length]);

  // Expose handlers to parent
  useEffect(() => {
    onOptimisticMessage?.(handleOptimisticMessage);
    onOptimisticError?.(handleOptimisticError);
  }, [handleOptimisticMessage, handleOptimisticError, onOptimisticMessage, onOptimisticError]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark chat as read when server messages change (not optimistic messages)
  useEffect(() => {
    if (serverMessages && serverMessages.length > 0) {
      const latestServerMessage = serverMessages[serverMessages.length - 1];
      if (latestServerMessage && latestServerMessage._id && !latestServerMessage._id.toString().startsWith('temp-')) {
        markChatAsRead({
          chatId: chatId as Id<"chats">,
          userId: currentUserId,
          lastReadMessageId: latestServerMessage._id,
        }).catch(console.error);
      }
    }
  }, [serverMessages, chatId, currentUserId, markChatAsRead]);

  if (serverMessages === undefined) {
    return (
      <div className="flex items-center justify-center flex-1 p-8">
        <div className="text-center">
          <div className="flex items-center justify-center mx-auto mb-4 rounded-full size-16 bg-white/5">
            <Avatar className="size-12">
              <AvatarFallback className="text-white bg-gradient-to-br from-purple-500 to-blue-500">
                ...
              </AvatarFallback>
            </Avatar>
          </div>
          <h3 className="mb-2 text-lg font-medium text-white">
            Loading messages...
          </h3>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center flex-1 p-8">
        <div className="text-center">
          <div className="flex items-center justify-center mx-auto mb-4 rounded-full size-16 bg-white/5">
            <Avatar className="size-12">
              <AvatarFallback className="text-white bg-gradient-to-br from-purple-500 to-blue-500">
                ?
              </AvatarFallback>
            </Avatar>
          </div>
          <h3 className="mb-2 text-lg font-medium text-white">
            No messages yet
          </h3>
          <p className="text-sm text-white/60">
            Start the conversation by sending a message below
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="space-y-4 p-3 pb-6 sm:p-4 @container">
        {messages.map((message, index) => {
          const prevMessage = messages[index - 1];
          const showAvatar =
            !prevMessage ||
            prevMessage.senderId !== message.senderId ||
            prevMessage.type !== message.type ||
            message.timestamp - prevMessage.timestamp > 1000 * 60 * 5; // 5 minutes

          const isCurrentUser = message.senderId === currentUserId;
          
          // Find the last message from current user
          const lastUserMessage = messages
            .slice()
            .reverse()
            .find(m => m.senderId === currentUserId && m.type === "message");
          const isLastUserMessage = isCurrentUser && message._id === lastUserMessage?._id;

          // Check if message is read by other participant (only for last user message)
          const otherParticipantReadState = readStates?.find(state => state.userId !== currentUserId);
          let isRead = false;
          if (isCurrentUser && isLastUserMessage && otherParticipantReadState) {
            // Check if the other participant has read this message or a later one
            const otherParticipantLastReadMessage = messages.find(m => m._id === otherParticipantReadState.lastReadMessageId);
            if (otherParticipantLastReadMessage) {
              isRead = message.timestamp <= otherParticipantLastReadMessage.timestamp;
            }
          }

          // Check if this is an optimistic message
          const isOptimistic = message._id.toString().startsWith('temp-');

          switch (message.type) {
            case "message":
              return (
                <MessageBubble
                  key={message._id}
                  message={{
                    id: message._id,
                    content: message.content,
                    senderId: message.senderId ?? undefined,
                    senderName: message.sender?.name ?? "Unknown User",
                    senderAvatar: message.sender?.robloxAvatarUrl ?? undefined,
                    timestamp: message.timestamp,
                    isCurrentUser,
                    sender: message.sender,
                  }}
                  showAvatar={showAvatar}
                  isRead={isRead}
                  showStatus={isLastUserMessage}
                  isOptimistic={isOptimistic}
                />
              );

            case "trade_offer":
              return (
                <TradeOfferCard
                  key={message._id}
                  message={{
                    id: message._id,
                    senderId: message.senderId ?? undefined,
                    senderName: message.sender?.name ?? "Unknown User",
                    senderAvatar: message.sender?.robloxAvatarUrl ?? undefined,
                    timestamp: message.timestamp,
                    isCurrentUser,
                    sender: message.sender,
                    tradeOffer: message.tradeOffer,
                  }}
                  showAvatar={showAvatar}
                  sessionId={sessionId}
                />
              );

            case "middleman_call":
              return (
                <MiddlemanCallCard
                  key={message._id}
                  message={{
                    id: message._id,
                    senderId: message.senderId ?? undefined,
                    senderName: message.sender?.name ?? "Unknown User",
                    senderAvatar: message.sender?.robloxAvatarUrl ?? undefined,
                    timestamp: message.timestamp,
                    isCurrentUser,
                    sender: message.sender,
                    middlemanCall: message.middlemanCall,
                  }}
                  showAvatar={showAvatar}
                  sessionId={sessionId}
                  currentUserId={currentUserId}
                  isMiddleman={isMiddleman}
                />
              );

            case "system":
              return (
                <SystemMessage
                  key={message._id}
                  message={{
                    id: message._id,
                    content: message.content,
                    timestamp: message.timestamp,
                    systemType: message.systemType,
                  }}
                  currentUserId={currentUserId}
                  participants={chatData?.participants}
                  tradeAdId={chatData?.tradeAd}
                  middlemanId={chatData?.middleman}
                  sessionId={sessionId}
                />
              );

            default:
              return null;
          }
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
