"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { Star } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import { api } from "~convex/_generated/api";
import type { Id } from "~convex/_generated/dataModel";
import { toast } from "sonner";

interface VouchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  toUserId: Id<"user">;
  tradeAdId?: Id<"tradeAds">;
  sessionId: Id<"session">;
}

export function VouchDialog({
  open,
  onOpenChange,
  toUserId,
  tradeAdId,
  sessionId,
}: VouchDialogProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);

  const giveVouch = useMutation(api.vouches.giveVouch);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      toast.error("Please add a comment for your vouch");
      return;
    }

    try {
      await giveVouch({
        toUserId,
        rating,
        comment: comment.trim(),
        tradeAdId,
        session: sessionId,
      });

      toast.success("Vouch submitted successfully!");
      onOpenChange(false);
      
      // Reset form
      setRating(5);
      setComment("");
      setHoveredRating(0);
    } catch (error) {
      console.error("Error submitting vouch:", error);
      
      // Handle specific error cases with user-friendly messages
      const errorMessage = error instanceof Error ? error.message : "Failed to submit vouch";
      
      if (errorMessage.includes("already submitted a vouch")) {
        toast.error("You've already vouched for this user in this trade");
      } else if (errorMessage.includes("cannot vouch for yourself")) {
        toast.error("You cannot vouch for yourself");
      } else if (errorMessage.includes("Rating must be between")) {
        toast.error("Please select a rating between 1 and 5 stars");
      } else if (errorMessage.includes("Comment cannot exceed")) {
        toast.error("Comment is too long (maximum 300 characters)");
      } else if (errorMessage.includes("does not exist")) {
        toast.error("This user or trade no longer exists");
      } else if (errorMessage.includes("must be logged in")) {
        toast.error("Please log in to submit a vouch");
      } else {
        toast.error("An error occurred while submitting your vouch. Please try again.");
      }
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset form when closing
    setRating(5);
    setComment("");
    setHoveredRating(0);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Vouch for your Middleman</DialogTitle>
          <DialogDescription>
            Share your trading experience to help build trust in the community.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 transition-colors hover:scale-110"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={cn(
                      "size-6 transition-colors",
                      (hoveredRating >= star || rating >= star)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    )}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {rating} star{rating !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment</Label>
            <Textarea
              id="comment"
              placeholder="Share your trading experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={300}
              rows={4}
              className="resize-none"
            />
            <div className="text-xs text-right text-muted-foreground">
              {comment.length}/300
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={handleSubmit}
            disabled={!comment.trim()}
          >
            Submit Vouch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}