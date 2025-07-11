"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  ArrowUpDown,
  MessageSquare,
  Users,
  Clock,
  Eye,
  Package,
  Shield,
  Calendar,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Pause,
} from "lucide-react";
import { useState } from "react";
import type { Doc, Id } from "~convex/_generated/dataModel";
import type { ResolvedChat } from "~convex/chats";
import Link from "next/link";
import { useTranslations } from 'next-intl';

const getChatTypeBadgeVariant = (type: string) => {
  switch (type) {
    case "trade":
      return "default";
    case "direct_message":
      return "secondary";
    default:
      return "outline";
  }
};

const getTradeStatusBadgeVariant = (status?: string) => {
  switch (status) {
    case "completed":
      return "default";
    case "pending":
      return "secondary";
    case "accepted":
      return "default";
    case "waiting_for_middleman":
      return "secondary";
    case "cancelled":
      return "destructive";
    default:
      return "outline";
  }
};

const getTradeStatusIcon = (status?: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="size-3" />;
    case "pending":
      return <Clock className="size-3" />;
    case "accepted":
      return <TrendingUp className="size-3" />;
    case "waiting_for_middleman":
      return <Shield className="size-3" />;
    case "cancelled":
      return <XCircle className="size-3" />;
    case "none":
      return <Pause className="size-3" />;
    default:
      return <AlertCircle className="size-3" />;
  }
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatRelativeTime = (timestamp: number, t: any) => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return t('table.justNow');
  if (minutes < 60) return t('table.minutesAgo', { minutes });
  if (hours < 24) return t('table.hoursAgo', { hours });
  if (days < 7) return t('table.daysAgo', { days });
  
  return formatDate(timestamp);
};

function ActionsCell({ chat }: { chat: ResolvedChat }) {
  const t = useTranslations('admin.chats');
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">{t('table.openMenu')}</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t('table.actions')}</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(chat._id)}>
          {t('table.copyChatId')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/chat/${chat._id}`}>
            <Eye className="mr-2 h-4 w-4" />
            {t('table.viewChat')}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const useColumns = (): ColumnDef<ResolvedChat>[] => {
  const t = useTranslations('admin.chats');
  
  return [
    {
      accessorKey: "type",
      header: t('table.type'),
      cell: ({ row }) => {
        const chat = row.original;
        return (
          <div className="flex items-center gap-2">
            {chat.type === "trade" ? (
              <Package className="size-4 text-blue-400" />
            ) : (
              <MessageSquare className="size-4 text-green-400" />
            )}
            <Badge
              variant={getChatTypeBadgeVariant(chat.type)}
              className="text-xs"
            >
              {chat.type === "trade" ? t('table.trade') : t('table.directMessage')}
            </Badge>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return value === "all" || row.getValue(id) === value;
      },
    },
    {
      accessorKey: "participants",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-medium text-white/80 hover:text-white"
          >
            {t('table.participants')}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const chat = row.original;
        const participants = chat.participants.filter(p => p !== null);
      
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-white/50" />
              <span className="text-sm text-white/80">
                {participants.length} {participants.length !== 1 ? t('table.participants') : t('table.participant')}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {participants.slice(0, 3).map((participant, index) => (
                <Badge key={index} variant="outline" className="text-xs border-white/20 text-white/60">
                  {participant?.name ?? participant?.robloxUsername ?? "Unknown"}
                </Badge>
              ))}
              {participants.length > 3 && (
                <Badge variant="outline" className="text-xs border-white/20 text-white/60">
                  +{participants.length - 3} {t('table.more')}
                </Badge>
              )}
            </div>
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const aParticipants = rowA.original.participants.filter(p => p !== null);
        const bParticipants = rowB.original.participants.filter(p => p !== null);
        return aParticipants.length - bParticipants.length;
      },
    },
    {
      accessorKey: "tradeStatus",
      header: t('table.tradeStatus'),
      cell: ({ row }) => {
        const chat = row.original;
        if (chat.type !== "trade") {
          return <span className="text-white/40">{t('table.na')}</span>;
        }
      
        return (
          <Badge
            variant={getTradeStatusBadgeVariant(chat.tradeStatus)}
            className="text-xs flex items-center gap-1 w-fit"
          >
            {getTradeStatusIcon(chat.tradeStatus)}
            {chat.tradeStatus ?? t('statuses.none')}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        const status = row.getValue(id) as string | undefined;
        return value === "all" || status === value;
      },
    },
    {
      accessorKey: "middlemanProfile",
      header: t('table.middleman'),
      cell: ({ row }) => {
        const chat = row.original;
        if (!chat.middlemanProfile) {
          return <span className="text-white/40">{t('table.none')}</span>;
        }
      
        return (
          <div className="flex items-center gap-2">
            <Shield className="size-4 text-purple-400" />
            <Badge variant="secondary" className="text-xs">
              {chat.middlemanProfile.name ?? chat.middlemanProfile.robloxUsername}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "lastMessageAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-medium text-white/80 hover:text-white"
          >
            {t('table.lastActivity')}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const timestamp = row.getValue("lastMessageAt") as number;
        return (
          <div className="flex items-center gap-2 text-white/70">
            <Clock className="size-4 text-white/50" />
            <div className="flex flex-col">
              <span className="text-sm">{formatRelativeTime(timestamp, t)}</span>
              <span className="text-xs text-white/50">{formatDate(timestamp)}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "_creationTime",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-medium text-white/80 hover:text-white"
          >
            {t('table.created')}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const timestamp = row.getValue("_creationTime") as number;
        return (
          <div className="flex items-center gap-2 text-white/70">
            <Calendar className="size-4 text-white/50" />
            <span className="text-sm">{formatDate(timestamp)}</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const chat = row.original;
        return <ActionsCell chat={chat} />;
      },
    },
  ];
};