"use client";

import { 
  CheckCircle2,
  Info,
  UserPlus,
  UserMinus,
  Shield,
  MessageCircle,
} from "lucide-react";
import { cn } from "~/lib/utils";

interface SystemMessageProps {
  message: {
    id: string;
    content?: string;
    timestamp: number;
    systemType?: "typing" | "trade_completed" | "user_joined" | "user_left" | "middleman_joined" | "trade_cancelled" | "info";
  };
}

const systemTypeConfig = {
  typing: {
    icon: MessageCircle,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    animate: true,
  },
  trade_completed: {
    icon: CheckCircle2,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    animate: false,
  },
  user_joined: {
    icon: UserPlus,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    animate: false,
  },
  user_left: {
    icon: UserMinus,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    animate: false,
  },
  middleman_joined: {
    icon: Shield,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    animate: false,
  },
  trade_cancelled: {
    icon: Info,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    animate: false,
  },
  info: {
    icon: Info,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    animate: false,
  },
};

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

export function SystemMessage({ message }: SystemMessageProps) {
  const systemType = message.systemType ?? "info";
  const config = systemTypeConfig[systemType];
  const Icon = config.icon;

  return (
    <div className="flex justify-center py-2">
      <div className={cn(
        "flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs",
        config.bgColor,
        config.color
      )}>
        <Icon className={cn(
          "size-3",
          config.animate && "animate-pulse"
        )} />
        <span className="font-medium">{message.content ?? "System message"}</span>
        <span className="text-white/40">•</span>
        <span className="text-white/40">{formatTime(message.timestamp)}</span>
      </div>
    </div>
  );
}