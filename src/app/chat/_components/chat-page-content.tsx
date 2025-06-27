"use client";

import { MessageCircle, Users, Star } from "lucide-react";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { useChatSidebar } from "./chat-sidebar-context";
import { useEffect, useState } from "react";

export function ChatPageContent() {
  const { openSidebar, setMobileSidebarOpen } = useChatSidebar();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const handleViewChatList = () => {
    if (isMobile) {
      // On mobile, open the mobile sidebar
      setMobileSidebarOpen(true);
    } else {
      // On desktop, open the regular sidebar
      openSidebar();
    }
  };

  return (
    <div className="flex items-center justify-center flex-1 p-8">
      <div className="max-w-md space-y-6 text-center">
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 rounded-full animate-pulse bg-gradient-to-r from-purple-500/20 to-blue-500/20" />
          <div className="relative flex items-center justify-center w-full h-full border rounded-full border-white/10 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
            <MessageCircle className="text-purple-400 size-10" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">
            Welcome to Trade Chat
          </h1>
          <p className="leading-relaxed text-white/70">
            Select a conversation from the sidebar to start chatting with other
            traders, or browse the marketplace to find new trading partners.
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button
            asChild
            variant="gradient"
            gradientType="purple"
            className="w-full"
          >
            <Link href="/trades">
              <Users className="mr-2 size-4" />
              Browse Trades
            </Link>
          </Button>

          <Button 
            variant="outline" 
            className="w-full md:hidden"
            onClick={handleViewChatList}
          >
            <Star className="mr-2 size-4" />
            View Chat List
          </Button>
        </div>

        <div className="flex justify-center gap-6 pt-4 text-center">
          <div>
            <div className="text-lg font-bold text-white">2.8K</div>
            <div className="text-xs text-white/50">Active Traders</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">15K</div>
            <div className="text-xs text-white/50">Trades Today</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">99.9%</div>
            <div className="text-xs text-white/50">Success Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}