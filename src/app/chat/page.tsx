import { MessageCircle, Users } from "lucide-react";
import { Button } from "~/components/ui/button";
import Link from "next/link";

export default function ChatPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="max-w-md text-center space-y-6">
        
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 animate-pulse" />
          <div className="relative flex items-center justify-center w-full h-full rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-white/10">
            <MessageCircle className="size-10 text-purple-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">
            Welcome to Trade Chat
          </h1>
          <p className="text-white/70 leading-relaxed">
            Select a conversation from the sidebar to start chatting with other traders, 
            or browse the marketplace to find new trading partners.
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
            asChild
            variant="outline" 
            className="w-full"
          >
            <Link href="/values">
              View Item Values
            </Link>
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