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
  Shield,
  Crown,
  User,
  Ban,
  Eye,
  Edit,
  UserCheck,
  Mail,
  Calendar,
  Clock,
} from "lucide-react";
import { useState } from "react";
import UserDetailsDialog from "./user-details-dialog";
import EditUserDialog from "./edit-user-dialog";
import type { Doc, Id } from "~convex/_generated/dataModel";

type UserData = Doc<"user">;

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case "admin":
      return "destructive";
    case "middleman":
      return "default";
    case "banned":
      return "secondary";
    default:
      return "outline";
  }
};

const getRoleIcon = (role: string) => {
  switch (role) {
    case "admin":
      return <Crown className="size-3" />;
    case "middleman":
      return <Shield className="size-3" />;
    case "banned":
      return <Ban className="size-3" />;
    default:
      return <User className="size-3" />;
  }
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatLastSeen = (timestamp?: number) => {
  if (!timestamp) return "Never";
  
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return formatDate(timestamp);
};

function ActionsCell({ user, session }: { user: UserData; session: { sessionId: Id<"session"> } }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user._id)}>
            Copy user ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setDetailsOpen(true)}>
            <Eye className="mr-2 h-4 w-4" />
            View details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit user
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UserDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        user={user}
        session={session}
      />

      <EditUserDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        user={user}
        session={session}
      />
    </>
  );
}

export const columns = (session: { sessionId: Id<"session"> }): ColumnDef<UserData>[] => [
  {
    accessorKey: "image",
    header: "",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center justify-center w-8 h-8">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
              <User className="size-4 text-white/60" />
            </div>
          )}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium text-white/80 hover:text-white"
        >
          Display Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium text-white">{user.name}</span>
          {user.badges && user.badges.length > 0 && (
            <div className="flex gap-1 mt-1">
              {user.badges.slice(0, 2).map((badge, index) => (
                <Badge key={index} variant="outline" className="text-xs border-white/20 text-white/60">
                  {badge}
                </Badge>
              ))}
              {user.badges.length > 2 && (
                <Badge variant="outline" className="text-xs border-white/20 text-white/60">
                  +{user.badges.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium text-white/80 hover:text-white"
        >
          Username
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-2">
          <Mail className="size-4 text-white/50" />
          <span className="text-white/80">{user.email}</span>
          {user.emailVerified && (
            <UserCheck className="size-4 text-green-400" />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "roles",
    header: "Roles",
    cell: ({ row }) => {
      const user = row.original;
      const roles = user.roles || ["user"];
      
      return (
        <div className="flex flex-wrap gap-1">
          {roles.map((role, index) => (
            <Badge 
              key={index} 
              variant={getRoleBadgeVariant(role)}
              className="text-xs flex items-center gap-1"
            >
              {getRoleIcon(role)}
              {role}
            </Badge>
          ))}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const roles = row.getValue(id) as string[] || ["user"];
      return roles.includes(value);
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
          Joined
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const timestamp = row.getValue("_creationTime") as number;
      return (
        <div className="flex items-center gap-2 text-white/70">
          <Calendar className="size-4 text-white/50" />
          <span>{formatDate(timestamp)}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "lastSeen",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium text-white/80 hover:text-white"
        >
          Last Seen
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const lastSeen = row.getValue("lastSeen") as number | undefined;
      return (
        <div className="flex items-center gap-2 text-white/70">
          <Clock className="size-4 text-white/50" />
          <span>{formatLastSeen(lastSeen)}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original;
      return <ActionsCell user={user} session={session} />;
    },
  },
];