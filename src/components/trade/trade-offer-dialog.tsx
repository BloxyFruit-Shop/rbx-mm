"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "~convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import {
  Package,
  Loader2,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import type { Id } from "~convex/_generated/dataModel";
import { getSession } from "~/lib/auth-client";
import { TradeItemSelector } from "./trade-item-selector";
import type { SearchResultItem, TradeItem } from "./trade-item-types";

interface TradeOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatId?: string;
  recipientId?: Id<"user">;
  mode?: "chat" | "standalone";
}

export function TradeOfferDialog({
  open,
  onOpenChange,
  chatId,
  recipientId,
  mode = "standalone",
}: TradeOfferDialogProps) {
  const [offeringItems, setOfferingItems] = useState<TradeItem[]>([]);
  const [requestingItems, setRequestingItems] = useState<TradeItem[]>([]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(false);

  const createTradeOffer = useMutation(api.chatTradeOffers.createTradeOffer);

  const handleAddOfferingItem = (item: SearchResultItem) => {
    setOfferingItems((prev) => [
      ...prev,
      {
        itemId: item._id,
        item,
        quantity: 1,
        mutations: [],
      },
    ]);
  };

  const handleAddRequestingItem = (item: SearchResultItem) => {
    setRequestingItems((prev) => [
      ...prev,
      {
        itemId: item._id,
        item,
        quantity: 1,
        mutations: [],
      },
    ]);
  };

  const handleUpdateOfferingItem = (index: number, updates: Partial<TradeItem>) => {
    setOfferingItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...updates } : item)),
    );
  };

  const handleUpdateRequestingItem = (index: number, updates: Partial<TradeItem>) => {
    setRequestingItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...updates } : item)),
    );
  };

  const handleRemoveOfferingItem = (index: number) => {
    setOfferingItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveRequestingItem = (index: number) => {
    setRequestingItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (offeringItems.length === 0 && requestingItems.length === 0) {
      toast.error("Please add at least one item to offer or request");
      return;
    }

    if (mode === "chat" && !chatId) {
      toast.error("Chat ID is required for chat trade offers");
      return;
    }

    const sessionData = await getSession();

    if (!sessionData.data) {
      toast.error(
        sessionData?.error?.message ?? "You need to log in before continuing",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const sessionId = sessionData.data.session.id as Id<"session">;
      
      if (mode === "chat" && chatId) {
        await createTradeOffer({
          chatId: chatId as Id<"chats">,
          offering: offeringItems.map((item) => ({
            id: item.itemId,
            name: item.item.name,
            thumbnailUrl: item.item.thumbnailUrl,
            quantity: item.quantity,
            rarity: item.item.rarity,
          })),
          requesting: requestingItems.map((item) => ({
            id: item.itemId,
            name: item.item.name,
            thumbnailUrl: item.item.thumbnailUrl,
            quantity: item.quantity,
            rarity: item.item.rarity,
          })),
          session: sessionId,
        });

        toast.success("Trade offer sent!");
      } else {
        // Handle standalone mode if needed
        toast.info("Standalone trade offers not yet implemented");
        return;
      }

      onOpenChange(false);

      // Reset form
      setOfferingItems([]);
      setRequestingItems([]);
      setNotes("");
      setNotesExpanded(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create trade offer",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCompact = mode === "chat";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`p-0 flex flex-col ${
        isCompact 
          ? 'max-h-[90vh] max-w-4xl' 
          : 'max-h-[95vh] max-w-6xl'
      }`}>
        <DialogHeader className={`flex-shrink-0 border-b border-white/10 ${
          isCompact ? 'px-4 py-3' : 'px-6 py-4'
        }`}>
          <DialogTitle className={isCompact ? 'text-lg' : 'text-xl'}>
            Create Trade Offer
          </DialogTitle>
          <DialogDescription className="text-white/70">
            {mode === "chat" 
              ? "Create a trade offer to send in this chat"
              : "Create a new trade offer"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className={isCompact ? 'p-4' : 'p-6'}>
            <Tabs defaultValue="offering" className="space-y-4">
              <TabsList className={`grid w-full grid-cols-2 p-1 border border-white/10 bg-white/5 ${
                isCompact ? 'h-10' : 'h-12'
              }`}>
                <TabsTrigger
                  value="offering"
                  className={`${isCompact ? 'h-8' : 'h-10'} data-[state=active]:border-green-500/30 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500/20 data-[state=active]:to-emerald-500/20`}
                >
                  <span className="flex items-center gap-2">
                    <Package className="size-4" />
                    <span>Offering</span>
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="requesting"
                  className={`${isCompact ? 'h-8' : 'h-10'} data-[state=active]:border-blue-500/30 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-cyan-500/20`}
                >
                  <span className="flex items-center gap-2">
                    <Search className="size-4" />
                    <span>Requesting</span>
                  </span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="offering" className="mt-4 space-y-4">
                <TradeItemSelector
                  title="Items You're Offering"
                  items={offeringItems}
                  onAddItem={handleAddOfferingItem}
                  onRemoveItem={handleRemoveOfferingItem}
                  onUpdateItem={handleUpdateOfferingItem}
                  placeholder="Add items you want to trade away"
                  compact={isCompact}
                  maxHeight={isCompact ? "300px" : undefined}
                />
              </TabsContent>

              <TabsContent value="requesting" className="mt-4 space-y-4">
                <TradeItemSelector
                  title="Items You Want"
                  items={requestingItems}
                  onAddItem={handleAddRequestingItem}
                  onRemoveItem={handleRemoveRequestingItem}
                  onUpdateItem={handleUpdateRequestingItem}
                  placeholder="Add items you're looking for"
                  compact={isCompact}
                  maxHeight={isCompact ? "300px" : undefined}
                />
              </TabsContent>
            </Tabs>

            {/* Notes Section */}
            <div className="mt-6 space-y-4">
              <Collapsible
                open={notesExpanded}
                onOpenChange={setNotesExpanded}
              >
                <div className="p-3 border rounded-lg border-white/10 bg-gradient-to-br from-white/5 to-white/10">
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center justify-between w-full h-auto p-0 font-medium text-white hover:bg-transparent"
                    >
                      <div className="flex items-center gap-2">
                        <Package className="size-4" />
                        Additional Notes (Optional)
                        {notes && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {notes.length} chars
                          </Badge>
                        )}
                      </div>
                      {notesExpanded ? (
                        <ChevronUp className="size-4 text-white/60" />
                      ) : (
                        <ChevronDown className="size-4 text-white/60" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3">
                    <Textarea
                      placeholder="Add any additional information about your trade offer..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      maxLength={300}
                      className={`resize-none ${isCompact ? 'min-h-[80px]' : 'min-h-[100px]'}`}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-white/50">
                        Be specific about your preferences
                      </p>
                      <p className="text-xs text-white/60">
                        {notes.length}/300 characters
                      </p>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`flex-shrink-0 border-t border-white/10 ${
          isCompact ? 'px-4 py-3' : 'px-6 py-4'
        }`}>
          <div className="flex flex-col gap-3 @sm:flex-row @sm:items-center @sm:justify-between">
            <div className="text-sm text-white/60">
              {offeringItems.length > 0 && (
                <span>
                  Offering {offeringItems.length} item
                  {offeringItems.length !== 1 ? "s" : ""}
                </span>
              )}
              {offeringItems.length > 0 && requestingItems.length > 0 && (
                <span> • </span>
              )}
              {requestingItems.length > 0 && (
                <span>
                  Requesting {requestingItems.length} item
                  {requestingItems.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="flex-1 @sm:flex-initial"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  (offeringItems.length === 0 && requestingItems.length === 0)
                }
                variant="gradient"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                {isSubmitting ? "Creating..." : "Send Trade Offer"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}