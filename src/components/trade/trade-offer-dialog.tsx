"use client";

import { useState, useEffect } from "react";
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
import { TradeItemList } from "./trade-item-list";

interface TradeOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatId?: string;
  recipientId?: Id<"user">;
  tradeAdData?: {
    id: Id<"tradeAds">;
    wantItems: Array<{
      id: string;
      name: string;
      thumbnailUrl: string;
      quantity: number;
      rarity: string;
      mutations?: string[];
      price?: number;
      age?: number;
    }>;
  };
}

export function TradeOfferDialog({
  open,
  onOpenChange,
  chatId,
  recipientId,
  tradeAdData,
}: TradeOfferDialogProps) {
  const [offeringItems, setOfferingItems] = useState<TradeItem[]>([]);
  const [requestingItems, setRequestingItems] = useState<TradeItem[]>([]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(false);

  // Auto-populate requesting items when trade ad data is available
  useEffect(() => {
    if (tradeAdData?.wantItems) {
      setRequestingItems(
        tradeAdData.wantItems.map((item) => ({
          itemId: item.id as Id<"items">,
          item: {
            _id: item.id as Id<"items">,
            name: item.name,
            thumbnailUrl: item.thumbnailUrl,
            rarity: item.rarity,
            category: "Unknown", // We don't have this info from the trade ad
          },
          quantity: item.quantity,
          mutations: item.mutations ?? [],
          price: item.price,
          age: item.age,
        }))
      );
    }
  }, [tradeAdData]);

  const createTradeOffer = useMutation(api.chatTradeOffers.createTradeOffer);
  const findOrCreateDirectChat = useMutation(api.chats.findOrCreateDirectChat);

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

  const handleUpdateOfferingItem = (index: number, updates: Partial<TradeItem>) => {
    setOfferingItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...updates } : item)),
    );
  };

  const handleRemoveOfferingItem = (index: number) => {
    setOfferingItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (offeringItems.length === 0) {
      toast.error("Please add at least one item to offer");
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
      
      if (chatId) {
        // Create trade offer in existing chat
        await createTradeOffer({
          chatId: chatId as Id<"chats">,
          offering: offeringItems.map((item) => ({
            id: item.itemId,
            name: item.item.name,
            thumbnailUrl: item.item.thumbnailUrl,
            quantity: item.quantity,
            rarity: item.item.rarity,
            mutations: item.mutations.length > 0 ? item.mutations : undefined,
            price: item.price,
            age: item.age,
          })),
          session: sessionId,
        });

        toast.success("Trade offer sent!");
      } else if (tradeAdData && recipientId) {
        // Create chat and trade offer for trade ad
        const chatId = await findOrCreateDirectChat({
          tradeAd: tradeAdData.id,
          otherUserId: recipientId,
          session: sessionId,
        });

        // Create the trade offer in the chat
        await createTradeOffer({
          chatId: chatId as Id<"chats">,
          offering: offeringItems.map((item) => ({
            id: item.itemId,
            name: item.item.name,
            thumbnailUrl: item.item.thumbnailUrl,
            quantity: item.quantity,
            rarity: item.item.rarity,
            mutations: item.mutations.length > 0 ? item.mutations : undefined,
            price: item.price,
            age: item.age,
          })),
          session: sessionId,
        });

        toast.success("Trade offer sent!");
        
        // Navigate to the chat
        window.location.href = `/chat/${chatId}`;
      } else {
        toast.error("Missing required information to create trade offer");
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

  const isFromChat = !!chatId;
  const hasTradeAdData = !!tradeAdData;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-y-auto flex flex-col max-h-[90vh] max-w-4xl">
        <DialogHeader className="flex-shrink-0 px-4 py-3 border-b border-white/10">
          <DialogTitle className="text-lg">
            Create Trade Offer
          </DialogTitle>
          <DialogDescription className="text-white/70">
            {isFromChat 
              ? "Create a trade offer to send in this chat"
              : "What items are you offering for this trade?"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-4 space-y-4">
            <TradeItemSelector
              title="Items You're Offering"
              items={offeringItems}
              onAddItem={handleAddOfferingItem}
              onRemoveItem={handleRemoveOfferingItem}
              onUpdateItem={handleUpdateOfferingItem}
              placeholder="Add items you want to trade away"
              compact={false}
              maxHeight="400px"
            />
            
            {requestingItems.length > 0 && (
              <TradeItemList
                items={requestingItems.map(item => ({
                  _id: item.itemId,
                  name: item.item.name,
                  thumbnailUrl: item.item.thumbnailUrl,
                  rarity: item.item.rarity,
                  quantity: item.quantity,
                  mutations: item.mutations,
                  price: item.price,
                  age: item.age,
                }))}
                title={hasTradeAdData ? "They Want (from trade ad)" : "Reference Items"}
                emptyText="No items requested"
                icon={Search}
                accentColor="blue"
              />
            )}

            <div className="space-y-4">
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
                      className="resize-none min-h-[80px]"
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

        <div className="flex-shrink-0 px-4 py-3 border-t border-white/10">
          <div className="flex flex-col gap-3 @sm:flex-row @sm:items-center @sm:justify-between">
            <div className="text-sm text-white/60">
              {offeringItems.length > 0 
                ? `Offering ${offeringItems.length} item${offeringItems.length !== 1 ? "s" : ""}`
                : "Add items you want to offer"
              }
              {requestingItems.length > 0 && (
                <span> • Requesting {requestingItems.length} item{requestingItems.length !== 1 ? "s" : ""}</span>
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
                disabled={isSubmitting || offeringItems.length === 0}
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