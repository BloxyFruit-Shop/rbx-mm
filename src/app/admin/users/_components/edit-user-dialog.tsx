"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "~convex/_generated/api";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { 
  Plus, 
  Trash2, 
  User,
  Shield,
  Crown,
  Ban,
  UserCheck,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import type { Doc, Id } from "~convex/_generated/dataModel";

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: Doc<"user">;
  session: { sessionId: Id<"session"> };
}

const availableRoles = [
  { value: "user", label: "User", icon: User, description: "Standard user permissions" },
  { value: "middleman", label: "Middleman", icon: Shield, description: "Can mediate trades" },
  { value: "admin", label: "Admin", icon: Crown, description: "Full administrative access" },
  { value: "banned", label: "Banned", icon: Ban, description: "Account is banned" },
];

const availableBadges = [
  "Verified Trader",
  "Top Seller",
  "Community Helper",
  "Beta Tester",
  "VIP Member",
  "Trusted Member",
  "Event Participant",
  "Bug Reporter",
  "Content Creator",
  "Early Adopter",
];

export default function EditUserDialog({ open, onOpenChange, user, session }: EditUserDialogProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [newBadge, setNewBadge] = useState("");

  const updateUserRoles = useMutation(api.user.updateUserRoles);
  const updateUserBadges = useMutation(api.user.updateUserBadges);
  const toggleUserBan = useMutation(api.user.toggleUserBan);

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setSelectedRoles(user.roles || ["user"]);
      setSelectedBadges(user.badges || []);
    }
  }, [user]);

  const handleRoleToggle = (role: string) => {
    setSelectedRoles(prev => {
      if (prev.includes(role)) {
        // Don't allow removing all roles
        if (prev.length === 1) {
          toast.error("User must have at least one role");
          return prev;
        }
        return prev.filter(r => r !== role);
      } else {
        return [...prev, role];
      }
    });
  };

  const handleAddBadge = () => {
    if (newBadge.trim() && !selectedBadges.includes(newBadge.trim())) {
      setSelectedBadges(prev => [...prev, newBadge.trim()]);
      setNewBadge("");
    }
  };

  const handleRemoveBadge = (badge: string) => {
    setSelectedBadges(prev => prev.filter(b => b !== badge));
  };

  const handleQuickBan = async () => {
    setIsUpdating(true);
    try {
      const isBanned = user.roles?.includes("banned");
      await toggleUserBan({
        userId: user._id,
        banned: !isBanned,
        session: session.sessionId,
      });
      toast.success(`User ${!isBanned ? "banned" : "unbanned"} successfully`);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to toggle ban:", error);
      toast.error("Failed to update ban status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      // Update roles if changed
      const currentRoles = user.roles || ["user"];
      if (JSON.stringify(selectedRoles.sort()) !== JSON.stringify(currentRoles.sort())) {
        await updateUserRoles({
          userId: user._id,
          roles: selectedRoles as any,
          session: session.sessionId,
        });
      }

      // Update badges if changed
      const currentBadges = user.badges || [];
      if (JSON.stringify(selectedBadges.sort()) !== JSON.stringify(currentBadges.sort())) {
        await updateUserBadges({
          userId: user._id,
          badges: selectedBadges,
          session: session.sessionId,
        });
      }

      toast.success("User updated successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update user:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update user");
    } finally {
      setIsUpdating(false);
    }
  };

  const getRoleIcon = (roleValue: string) => {
    const role = availableRoles.find(r => r.value === roleValue);
    if (!role) return <User className="size-4" />;
    const IconComponent = role.icon;
    return <IconComponent className="size-4" />;
  };

  const isBanned = selectedRoles.includes("banned");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-white/10 bg-gradient-to-b from-[#0f051d] to-[#1a0b2e]">
        <DialogHeader>
          <DialogTitle className="text-white">Edit User</DialogTitle>
          <DialogDescription className="text-white/70">
            Update user roles and badges. Changes will be applied immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-4 border rounded-lg border-white/10 bg-white/5">
            <div className="flex items-center gap-4">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="object-cover w-12 h-12 rounded-full"
                />
              ) : (
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                  <User className="size-6 text-white/60" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-white">{user.name}</h3>
                <p className="text-sm text-white/60">{user.email}</p>
                <p className="text-xs text-white/50">ID: {user._id}</p>
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-lg border-white/10 bg-white/5">
            <h3 className="mb-3 font-semibold text-white">Quick Actions</h3>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={isBanned ? "default" : "destructive"}
                size="sm"
                onClick={handleQuickBan}
                disabled={isUpdating}
                className="flex items-center gap-2"
              >
                <Ban className="size-4" />
                {isBanned ? "Unban User" : "Ban User"}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Roles</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {availableRoles.map((role) => {
                const isSelected = selectedRoles.includes(role.value);
                const IconComponent = role.icon;
                
                return (
                  <div
                    key={role.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? "border-purple-500/50 bg-purple-500/10"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                    onClick={() => handleRoleToggle(role.value)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        isSelected ? "bg-purple-500/20" : "bg-white/10"
                      }`}>
                        <IconComponent className={`size-4 ${
                          isSelected ? "text-purple-400" : "text-white/60"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{role.label}</span>
                          {isSelected && (
                            <Badge variant="outline" className="text-xs text-purple-400 border-purple-500/30">
                              Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-white/60">{role.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Badges</h3>
            
            <div className="p-4 border rounded-lg border-white/10 bg-white/5">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="size-4 text-white/60" />
                <span className="font-medium text-white">Add Badge</span>
              </div>
              <div className="flex gap-2">
                <Select value={newBadge} onValueChange={setNewBadge}>
                  <SelectTrigger className="bg-white/5 border-white/20">
                    <SelectValue placeholder="Select a badge" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBadges
                      .filter(badge => !selectedBadges.includes(badge))
                      .map((badge) => (
                        <SelectItem key={badge} value={badge}>
                          {badge}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddBadge}
                  disabled={!newBadge}
                  className="border-white/20 bg-white/5 hover:bg-white/10"
                >
                  <Plus className="size-4" />
                </Button>
              </div>
              <div className="mt-2">
                <Input
                  placeholder="Or type a custom badge..."
                  value={newBadge}
                  onChange={(e) => setNewBadge(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddBadge()}
                  className="bg-white/5 border-white/20"
                />
              </div>
            </div>

            {selectedBadges.length > 0 ? (
              <div className="p-4 border rounded-lg border-white/10 bg-white/5">
                <h4 className="mb-3 font-medium text-white">Current Badges</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedBadges.map((badge, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="flex items-center gap-1 border-white/20 text-white/70"
                    >
                      {badge}
                      <button
                        type="button"
                        onClick={() => handleRemoveBadge(badge)}
                        className="ml-1 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-white/60">No badges assigned</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-white border-white/20 bg-white/5 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUpdating}
              className="bg-gradient-to-r from-[#9747FF] to-[#7E3BFF] hover:from-[#8A42E6] hover:to-[#7139E6] text-white border-0"
            >
              {isUpdating ? "Updating..." : "Update User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}