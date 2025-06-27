"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
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
import { Shield, Clock, AlertTriangle, UserCheck } from "lucide-react";
import { api } from "~convex/_generated/api";
import type { Id } from "~convex/_generated/dataModel";
import { toast } from "sonner";
import { MiddlemanSearch } from "./middleman-search";

interface MiddlemanCallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatId: string;
  sessionId: Id<"session">;
}

const WAIT_TIME_OPTIONS = [
  { value: "10-30 minutes", label: "10-30 minutes" },
  { value: "30-60 minutes", label: "30-60 minutes" },
  { value: "+1 hour", label: "+1 hour" },
];

const COMMON_REASONS = [
  "Complete the trade",
  "Trust issues with the other party",
  "Report odd behaviour",
  "Other (specify below)",
];

export function MiddlemanCallDialog({
  open,
  onOpenChange,
  chatId,
  sessionId,
}: MiddlemanCallDialogProps) {
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [estimatedWaitTime, setEstimatedWaitTime] = useState("");
  const [desiredMiddleman, setDesiredMiddleman] = useState<Id<"user"> | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const createMiddlemanCall = useMutation(api.middlemanCalls.createMiddlemanCall);

  const handleSubmit = async () => {
    const finalReason = reason === "Other (specify below)" ? customReason : reason;
    
    if (!finalReason.trim()) {
      toast.error("Please provide a reason for the middleman call.");
      return;
    }

    if (!estimatedWaitTime) {
      toast.error("Please select an estimated wait time.");
      return;
    }

    if (finalReason.length > 500) {
      toast.error("Reason cannot exceed 500 characters.");
      return;
    }

    setIsLoading(true);

    try {
      await createMiddlemanCall({
        chatId: chatId as Id<"chats">,
        reason: finalReason.trim(),
        estimatedWaitTime,
        desiredMiddleman,
        session: sessionId,
      });

      toast.success("Middleman call created successfully!");
      onOpenChange(false);
      
      // Reset form
      setReason("");
      setCustomReason("");
      setEstimatedWaitTime("");
      setDesiredMiddleman(undefined);
    } catch (error) {
      console.error("Failed to create middleman call:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create middleman call.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
      // Reset form when closing
      setReason("");
      setCustomReason("");
      setEstimatedWaitTime("");
      setDesiredMiddleman(undefined);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="mb-4">
          <DialogTitle className="flex items-center gap-2">
            <Shield className="size-5 text-purple-500" />
            Call Middleman
          </DialogTitle>
          <DialogDescription>
            Request a middleman to help facilitate your trade safely. A qualified middleman will join your chat to assist.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for middleman call</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                {COMMON_REASONS.map((reasonOption) => (
                  <SelectItem key={reasonOption} value={reasonOption}>
                    {reasonOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {reason === "Other (specify below)" && (
            <div className="space-y-2">
              <Label htmlFor="customReason">Custom reason</Label>
              <Textarea
                id="customReason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Please describe why you need a middleman..."
                maxLength={500}
                rows={3}
              />
              <div className="text-xs text-muted-foreground text-right">
                {customReason.length}/500
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="waitTime" className="flex items-center gap-2">
              <Clock className="size-4" />
              How long can you wait?
            </Label>
            <Select value={estimatedWaitTime} onValueChange={setEstimatedWaitTime}>
              <SelectTrigger>
                <SelectValue placeholder="Select estimated wait time..." />
              </SelectTrigger>
              <SelectContent>
                {WAIT_TIME_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <UserCheck className="size-4" />
              Preferred Middleman (Optional)
            </Label>
            <MiddlemanSearch
              value={desiredMiddleman}
              onValueChange={setDesiredMiddleman}
              placeholder="Search for a specific middleman..."
              disabled={isLoading}
              compact={true}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to allow any available middleman to accept your call.
            </p>
          </div>

          <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <AlertTriangle className="size-4 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-200">
              <p className="font-medium mb-1">Important:</p>
              <ul className="text-xs space-y-1 text-yellow-200/80">
                <li>- Wait times depend on middleman availability. You may wait longer if no one is available right now. You can check for available middleman <a className="font-semibold underline" href="/middleman">here</a>.</li>
                {desiredMiddleman && (
                  <li>- Only your selected middleman can accept this call (unless an admin intervenes).</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !reason || (!customReason && reason === "Other (specify below)") || !estimatedWaitTime}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? "Creating..." : "Call Middleman"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}