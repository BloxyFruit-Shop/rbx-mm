"use client";

import { useQuery } from "convex/react";
import { api } from "~convex/_generated/api";
import { Badge } from "~/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { 
  User,
  Mail,
  Calendar,
  Clock,
  Shield,
  Crown,
  Ban,
  UserCheck,
  Hash,
  Monitor,
  MapPin,
  Globe,
  Tag,
} from "lucide-react";
import type { Doc, Id } from "~convex/_generated/dataModel";

interface UserDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: Doc<"user">;
  session: { sessionId: Id<"session"> };
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case "admin":
      return <Crown className="text-red-400 size-4" />;
    case "middleman":
      return <Shield className="text-blue-400 size-4" />;
    case "banned":
      return <Ban className="text-red-400 size-4" />;
    default:
      return <User className="text-gray-400 size-4" />;
  }
};

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

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hours ago`;
  if (days < 7) return `${days} days ago`;
  
  return formatDate(timestamp);
};

export default function UserDetailsDialog({ open, onOpenChange, user, session }: UserDetailsDialogProps) {
  // Fetch user sessions
  const userSessions = useQuery(
    api.user.getUserSessions,
    open ? { userId: user._id, session: session.sessionId } : "skip"
  );

  const activeSessions = userSessions?.filter(s => new Date(s.expiresAt) > new Date()) ?? [];
  const roles = user.roles ?? ["user"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-white/10 bg-gradient-to-b from-[#0f051d] to-[#1a0b2e]">
        <DialogHeader>
          <DialogTitle className="text-white">User Details</DialogTitle>
          <DialogDescription className="text-white/70">
            View detailed information about this user.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-shrink-0">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="object-cover w-20 h-20 rounded-full"
                />
              ) : (
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                  <User className="size-8 text-white/60" />
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-3">
              <div>
                <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                <p className="text-white/60">{user.email}</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {roles.map((role, index) => (
                  <Badge 
                    key={index} 
                    variant={getRoleBadgeVariant(role)}
                    className="flex items-center gap-1"
                  >
                    {getRoleIcon(role)}
                    {role}
                  </Badge>
                ))}
                {user.emailVerified && (
                  <Badge variant="outline" className="text-green-400 border-green-500/30">
                    <UserCheck className="mr-1 size-3" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {user.badges && user.badges.length > 0 && (
            <div className="p-4 border rounded-lg border-white/10 bg-white/5">
              <h3 className="flex items-center gap-2 mb-3 font-semibold text-white">
                <Tag className="size-4" />
                Badges
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.badges.map((badge, index) => (
                  <Badge key={index} variant="outline" className="border-white/20 text-white/70">
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 border rounded-lg border-white/10 bg-white/5">
            <h3 className="mb-3 font-semibold text-white">Account Information</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-sm">
                <Hash className="text-white/50 size-4" />
                <span className="text-white/70">ID:</span>
                <code className="px-1 py-0.5 text-xs rounded bg-white/10 text-white/80 font-mono">
                  {user._id}
                </code>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="text-white/50 size-4" />
                <span className="text-white/70">Email:</span>
                <span className="text-white/80">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="text-white/50 size-4" />
                <span className="text-white/70">Joined:</span>
                <span className="text-white/80">{formatDate(user._creationTime)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="text-white/50 size-4" />
                <span className="text-white/70">Last Seen:</span>
                <span className="text-white/80">{formatLastSeen(user.lastSeen)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="text-white/50 size-4" />
                <span className="text-white/70">Updated:</span>
                <span className="text-white/80">{formatDate(new Date(user.updatedAt).getTime())}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <UserCheck className="text-white/50 size-4" />
                <span className="text-white/70">Verified:</span>
                <span className={`${user.emailVerified ? "text-green-400" : "text-red-400"}`}>
                  {user.emailVerified ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-lg border-white/10 bg-white/5">
            <h3 className="flex items-center gap-2 mb-3 font-semibold text-white">
              <Monitor className="size-4" />
              Active Sessions ({activeSessions.length})
            </h3>
            
            {activeSessions.length === 0 ? (
              <p className="text-sm text-white/60">No active sessions</p>
            ) : (
              <div className="space-y-3">
                {activeSessions.slice(0, 5).map((session) => (
                  <div key={session._id} className="p-3 border rounded-md border-white/10 bg-white/5">
                    <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <Globe className="text-white/50 size-3" />
                        <span className="text-white/70">IP:</span>
                        <span className="text-white/80">{session.ipAddress || "Unknown"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="text-white/50 size-3" />
                        <span className="text-white/70">Expires:</span>
                        <span className="text-white/80">
                          {formatDate(new Date(session.expiresAt).getTime())}
                        </span>
                      </div>
                      {session.userAgent && (
                        <div className="flex items-start gap-2 sm:col-span-2">
                          <Monitor className="text-white/50 size-3 mt-0.5" />
                          <span className="text-white/70">Device:</span>
                          <span className="text-xs break-all text-white/80">
                            {session.userAgent}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {activeSessions.length > 5 && (
                  <p className="text-xs text-white/60">
                    And {activeSessions.length - 5} more sessions...
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="p-4 border rounded-lg border-white/10 bg-white/5">
            <h3 className="mb-3 font-semibold text-white">Role Information</h3>
            <div className="space-y-2">
              {roles.map((role, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-md bg-white/5">
                  {getRoleIcon(role)}
                  <div>
                    <span className="font-medium text-white capitalize">{role}</span>
                    <p className="text-xs text-white/60">
                      {role === "admin" && "Full administrative access"}
                      {role === "middleman" && "Can mediate trades and handle disputes"}
                      {role === "user" && "Standard user permissions"}
                      {role === "banned" && "Account is banned from the platform"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}