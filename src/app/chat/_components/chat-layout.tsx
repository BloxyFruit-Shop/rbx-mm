"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { useTranslations } from 'next-intl';
import { Menu, ArrowLeft, TrendingUp, Star, Home, MessageCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { Button } from "~/components/ui/button";
import { ChatSidebar } from "./chat-sidebar";
import { ChatSidebarProvider, useChatSidebar } from "./chat-sidebar-context";
import { cn } from "~/lib/utils";
import { api } from "~convex/_generated/api";
import type { Id } from "~convex/_generated/dataModel";
import NavUserButton from "~/components/user/nav-user-button";

interface ChatLayoutProps {
  children: React.ReactNode;
  sessionId: Id<"session">;
  userId: Id<"user">;
}

function ChatLayoutInner({
  children,
  sessionId,
  userId
}: ChatLayoutProps) {
  const { 
    sidebarOpen, 
    setSidebarOpen, 
    mobileSidebarOpen, 
    setMobileSidebarOpen 
  } = useChatSidebar();
  
  const pathname = usePathname();
  const t = useTranslations('navigation');
  const tChat = useTranslations('chat');

  const chats = useQuery(api.chats.getUserChats, {
    session: sessionId,
  });

  const markUserOnline = useMutation(api.user.markUserOnline);

  // Client-side heartbeat to mark user as online
  useEffect(() => {
    // Mark user online immediately
    markUserOnline({ userId }).catch(console.error);

    // Set up interval to mark user online every 45 seconds
    const intervalId = setInterval(() => {
      markUserOnline({ userId }).catch(console.error);
    }, 45000); // 45 seconds

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [userId, markUserOnline]);

  const currentChatId = pathname.split("/").pop();
  const isInChat = currentChatId !== "chat";

  const isLoading = chats === undefined;

  const navigationItems = [
    { href: "/", label: t('home'), icon: Home },
    { href: "/trades", label: t('trades'), icon: TrendingUp },
    { href: "/values", label: t('values'), icon: Star },
    { href: "/chat", label: t('chat'), icon: MessageCircle },
  ];

  return (
    <div className="flex flex-col h-[100dvh] bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <header className="hidden md:flex flex-shrink-0 border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="flex items-center justify-between w-full px-4 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2"
            >
              <Menu className="size-4" />
            </Button>
            
            <div className="h-6 w-px bg-white/20" />
            
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/logo.webp"
                width={100}
                height={28}
                alt="RbxMM Logo"
                className="h-8 w-auto"
              />
            </Link>
          </div>

          <nav className="flex items-center gap-6">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = pathname.startsWith(item.href) && item.href !== "/" || (item.href === "/" && pathname === "/");
              
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-white/10 text-white" 
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  )}
                >
                  <IconComponent className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <NavUserButton />
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {isInChat && (
          <div className="absolute top-0 left-0 right-0 z-50 flex items-center gap-3 p-3 border-b border-white/10 bg-white/5 backdrop-blur-sm md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <ArrowLeft className="size-4" />
              <span className="text-sm font-medium text-white">{tChat('backToChat')}</span>
            </Button>
          </div>
        )}

        <div
          className={cn(
            "hidden md:block transition-all duration-300 ease-in-out",
            sidebarOpen ? "w-80" : "w-0 overflow-hidden",
          )}
        >
          <ChatSidebar
            isLoading={isLoading}
            chats={chats}
            currentUserId={userId}
            currentChatId={currentChatId === "chat" ? undefined : currentChatId}
          />
        </div>

        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="absolute top-0 bottom-0 left-0 w-80 max-w-[85vw]">
              <ChatSidebar
                isLoading={isLoading}
                chats={chats}
                currentUserId={userId}
                currentChatId={
                  currentChatId === "chat" ? undefined : currentChatId
                }
                onChatSelect={() => setMobileSidebarOpen(false)}
                showLogo={true}
              />
            </div>
          </div>
        )}

        <div
          className={cn(
            "flex flex-1 flex-col min-w-0",
            isInChat && "pt-14 md:pt-0",
          )}
        >
          {!isInChat && (
            <div className="flex items-center justify-between p-3 border-b border-white/10 bg-white/5 backdrop-blur-sm md:hidden">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/images/logo.webp"
                  width={80}
                  height={30}
                  alt="RbxMM Logo"
                  className="h-6 w-auto"
                />
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileSidebarOpen(true)}
                className="p-0 size-8"
              >
                <Menu className="size-4" />
              </Button>
            </div>
          )}
          
          {children}
        </div>
      </div>
    </div>
  );
}

export function ChatLayout(props: ChatLayoutProps) {
  return (
    <ChatSidebarProvider>
      <ChatLayoutInner {...props} />
    </ChatSidebarProvider>
  );
}