"use client";

import { useState } from "react";
import { useTranslations } from 'next-intl';
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { Search, MessageCircle } from "lucide-react";
import { ChatListItem } from "./chat-list-item";
import Link from "next/link";
import Image from "next/image";
import type { ResolvedChat } from '~convex/chats';
import type { Id } from '~convex/_generated/dataModel';

interface ChatSidebarProps {
  isLoading: boolean;
  currentUserId: Id<"user">;
  chats: ResolvedChat[] | undefined;
  currentChatId?: string;
  onChatSelect?: () => void;
  showLogo?: boolean;
}

export function ChatSidebar({
  isLoading,
  chats,
  currentChatId,
  currentUserId,
  onChatSelect,
  showLogo = false,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const t = useTranslations('chat');

  // Show skeleton UI while loading
  if (isLoading) {
    return <ChatSidebar.Skeleton />;
  }

  const allChats = chats ?? [];

  const filteredChats = allChats.filter((chat) => {
    const otherParticipant = chat.participants.find((p) => (p && p._id !== currentUserId));
    const name = otherParticipant?.name ?? "Unknown User";
    const lastMessage = chat.lastMessage?.content ?? "";

    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedFilter === "all") return matchesSearch;

    return matchesSearch;
  });

  return (
    <div className="flex flex-col h-full border-r w-80 border-white/10 bg-slate-900/80 sm:bg-white/5 backdrop-blur-sm">
      <div className="flex-shrink-0 p-4 border-b border-white/10">
        <div className="flex items-center gap-2 mb-4">
          {showLogo ? (
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/logo.webp"
                width={120}
                height={45}
                alt="RbxMM Logo"
                className="w-auto h-8"
              />
            </Link>
          ) : (
            <>
              <MessageCircle className="text-purple-400 size-5" />
              <h1 className="text-lg font-semibold text-white">Chats</h1>
            </>
          )}
        </div>
        <div className="relative mb-3">
          <Search className="absolute -translate-y-1/2 left-3 top-1/2 size-4 text-white/50" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <MessageCircle className="mb-3 size-12 text-white/20" />
            <p className="mb-1 text-white/60">No chats found</p>
            <p className="text-sm text-white/40">
              {searchQuery
                ? "Try a different search term"
                : "Start a conversation to see it here"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 p-3">
            {filteredChats.map((chat) => (
              <ChatListItem
                key={chat._id} // Use Convex's `_id`
                chat={chat}
                currentUserId={currentUserId}
                isActive={currentChatId === chat._id}
                onSelect={onChatSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Skeleton Component as a static property - a nice pattern!
ChatSidebar.Skeleton = function ChatSidebarSkeleton() {
  return (
    <div className="flex flex-col h-full border-r w-80 border-white/10 bg-white/5">
      <div className="flex-shrink-0 p-4 border-b border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="w-6 h-6 rounded-full bg-white/10" />
          <Skeleton className="w-24 h-6 bg-white/10" />
        </div>
        <Skeleton className="w-full h-10 mb-3 bg-white/10" />
        <div className="flex gap-1">
          <Skeleton className="w-16 h-7 bg-white/10" />
          <Skeleton className="w-20 h-7 bg-white/10" />
          <Skeleton className="w-20 h-7 bg-white/10" />
        </div>
      </div>
      <div className="flex flex-col flex-1 gap-2 p-3 overflow-y-auto">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2 rounded-lg">
            <Skeleton className="rounded-full size-12 bg-white/10" />
            <div className="flex-1 space-y-2">
              <Skeleton className="w-3/4 h-4 bg-white/10" />
              <Skeleton className="w-full h-3 bg-white/10" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex-shrink-0 p-3 border-t border-white/10">
        <Skeleton className="w-1/2 h-4 bg-white/10" />
      </div>
    </div>
  );
};