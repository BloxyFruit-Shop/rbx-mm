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
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import {
  Search,
  Package,
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import type { Id } from "~convex/_generated/dataModel";
import { getSession } from "~/lib/auth-client";
import { TradeItemSelector } from "~/components/trade/trade-item-selector";
import type { SearchResultItem, TradeItem } from "~/components/trade/trade-item-types";
import { useTranslations } from 'next-intl';

interface CreateTradeAdDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}


export default function CreateTradeAdDialog({
  open,
  onOpenChange,
}: CreateTradeAdDialogProps) {
  const t = useTranslations('trades');
  const tCommon = useTranslations('common');
  const tNotifications = useTranslations('notifications');
  
  const [haveItems, setHaveItems] = useState<TradeItem[]>([]);
  const [wantItems, setWantItems] = useState<TradeItem[]>([]);
  const [notes, setNotes] = useState("");
  const [hearingOffers, setHearingOffers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(false);

  const createTradeAd = useMutation(api.tradeAds.createTradeAd);

  const handleAddHaveItem = (item: SearchResultItem) => {
    setHaveItems((prev) => [
      ...prev,
      {
        itemId: item._id,
        item,
        quantity: 1,
        mutations: [],
      },
    ]);
  };

  const handleAddWantItem = (item: SearchResultItem) => {
    setWantItems((prev) => [
      ...prev,
      {
        itemId: item._id,
        item,
        quantity: 1,
        mutations: [],
      },
    ]);
  };

  const handleUpdateHaveItem = (index: number, updates: Partial<TradeItem>) => {
    setHaveItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...updates } : item)),
    );
  };

  const handleUpdateWantItem = (index: number, updates: Partial<TradeItem>) => {
    setWantItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...updates } : item)),
    );
  };

  const handleRemoveHaveItem = (index: number) => {
    setHaveItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveWantItem = (index: number) => {
    setWantItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (haveItems.length === 0 && wantItems.length === 0) {
      toast.error("Please add at least one item to offer or request");
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
      await createTradeAd({
        haveItems: haveItems.map((item) => ({
          itemId: item.itemId,
          quantity: item.quantity,
          price: item.price,
          mutations: item.mutations.length > 0 ? item.mutations : undefined,
          age: item.age,
        })),
        wantItems: hearingOffers
          ? []
          : wantItems.map((item) => ({
              itemId: item.itemId,
              quantity: item.quantity,
              price: item.price,
              mutations: item.mutations.length > 0 ? item.mutations : undefined,
              age: item.age,
            })),
        notes: notes.trim() || undefined,
        session: sessionId,
      });

      toast.success(tNotifications('tradeCreated'));
      onOpenChange(false);

      // Reset form
      setHaveItems([]);
      setWantItems([]);
      setNotes("");
      setHearingOffers(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create trade ad",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] w-[95vw] max-w-6xl p-0 flex flex-col @container overflow-y-auto ">
        <DialogHeader className="flex-shrink-0 px-4 py-3 border-b border-white/10 @lg:px-6 @lg:py-4">
          <DialogTitle className="text-lg @lg:text-xl">
            {t('createAd')}
          </DialogTitle>
          <DialogDescription className="text-sm text-white/70 @lg:text-base">
            Create a new trade ad to offer items and find what you&apos;re
            looking for
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 @lg:p-6">
            <Tabs defaultValue="offering" className="space-y-4 @lg:space-y-6">
              <TabsList className="grid w-full h-10 grid-cols-2 p-1 border border-white/10 bg-white/5 @lg:h-12">
                <TabsTrigger
                  value="offering"
                  className="h-8 text-sm @lg:h-10 @lg:text-base data-[state=active]:border-green-500/30 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500/20 data-[state=active]:to-emerald-500/20"
                >
                  <span className="flex items-center gap-2">
                    <Package className="size-3 @lg:size-4" />
                    <span className="hidden @sm:inline">{t('offering')}</span>
                    <span className="@sm:hidden">{t('offering')}</span>
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="wanting"
                  className="h-8 text-sm @lg:h-10 @lg:text-base data-[state=active]:border-blue-500/30 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-cyan-500/20"
                >
                  <span className="flex items-center gap-2">
                    <Search className="size-3 @lg:size-4" />
                    <span className="hidden @sm:inline">{t('seeking')}</span>
                    <span className="@sm:hidden">{t('seeking')}</span>
                  </span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="offering" className="mt-4 space-y-4 @lg:mt-6 @lg:space-y-6 ">
                <TradeItemSelector
                  title="Items You're Offering"
                  items={haveItems}
                  onAddItem={handleAddHaveItem}
                  onRemoveItem={handleRemoveHaveItem}
                  onUpdateItem={handleUpdateHaveItem}
                  placeholder="Add items you want to trade away"
                />
              </TabsContent>

              <TabsContent value="wanting" className="mt-4 space-y-4 @lg:mt-6 @lg:space-y-6">
                <div className="p-4 border rounded-xl border-white/10 bg-gradient-to-br from-white/5 to-white/10">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="hearing-offers"
                      checked={hearingOffers}
                      onCheckedChange={(checked) =>
                        setHearingOffers(checked === true)
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor="hearing-offers"
                        className="font-medium text-white cursor-pointer"
                      >
                        I&apos;m hearing offers
                      </Label>
                      <p className="mt-1 text-sm text-white/60">
                        Don&apos;t specify what you want - let others make
                        offers
                      </p>
                    </div>
                  </div>
                </div>

                {!hearingOffers && (
                  <TradeItemSelector
                    title="Items You Want"
                    items={wantItems}
                    onAddItem={handleAddWantItem}
                    onRemoveItem={handleRemoveWantItem}
                    onUpdateItem={handleUpdateWantItem}
                    placeholder="Add items you're looking for"
                  />
                )}

                {hearingOffers && (
                  <div className="flex items-center justify-center p-12 text-center border border-dashed rounded-xl border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
                    <div>
                      <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                        <Sparkles className="text-green-400 size-8" />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-green-400">
                        Hearing All Offers
                      </h3>
                      <p className="max-w-md text-green-400/70">
                        Other players can offer any items they think you might
                        want. You&apos;ll receive notifications for all trade
                        proposals.
                      </p>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="mt-6 space-y-4 @lg:mt-8 ">
              <Collapsible
                open={notesExpanded}
                onOpenChange={setNotesExpanded}
              >
                <div className="p-3 border rounded-md border-white/10 bg-gradient-to-br from-white/5 to-white/10 @lg:p-4 @lg:rounded-md">
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center justify-between w-full h-auto p-0 text-sm font-medium text-white hover:bg-transparent @lg:text-base"
                    >
                      <div className="flex items-center gap-2">
                        <Package className="size-3 @lg:size-4" />
                        <span className="hidden @sm:inline">Additional Notes (Optional)</span>
                        <span className="@sm:hidden">Notes</span>
                        {notes && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {notes.length}
                          </Badge>
                        )}
                      </div>
                      {notesExpanded ? (
                        <ChevronUp className="size-3 text-white/60 @lg:size-4" />
                      ) : (
                        <ChevronDown className="size-3 text-white/60 @lg:size-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3">
                    <Textarea
                      placeholder="Add any additional information about your trade preferences, specific requirements, or contact details..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      maxLength={500}
                      className="min-h-[80px] resize-none text-sm @lg:min-h-[100px] @lg:text-base"
                    />
                    <div className="flex flex-col gap-1 mt-2 @sm:flex-row @sm:items-center @sm:justify-between">
                      <p className="text-xs text-white/50 @lg:text-sm">
                        Be specific about your preferences to get better offers
                      </p>
                      <p className="text-xs text-white/60 @lg:text-sm">
                        {notes.length}/500 characters
                      </p>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 px-4 py-3 border-t border-white/10 @lg:px-6 @lg:py-4">
          <div className="flex flex-col gap-3 @sm:flex-row @sm:items-center @sm:justify-between">
            <div className="text-xs text-white/60 @lg:text-sm">
              {haveItems.length > 0 && (
                <span>
                  Offering {haveItems.length} item
                  {haveItems.length !== 1 ? "s" : ""}
                </span>
              )}
              {haveItems.length > 0 &&
                (wantItems.length > 0 || hearingOffers) && <span> • </span>}
              {wantItems.length > 0 && (
                <span>
                  Wanting {wantItems.length} item
                  {wantItems.length !== 1 ? "s" : ""}
                </span>
              )}
              {hearingOffers && <span>Open to all offers</span>}
            </div>
            <div className="flex gap-2 @sm:gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="flex-1 @sm:flex-initial "
              >
                {tCommon('cancel')}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  (haveItems.length === 0 && wantItems.length === 0)
                }
                variant="gradient"
                className="flex-1 @sm:flex-initial"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 size-3 animate-spin @lg:size-4" />
                )}
                <span className="hidden @sm:inline">
                  {isSubmitting ? tCommon('loading') : t('createAd')}
                </span>
                <span className="@sm:hidden">
                  {isSubmitting ? tCommon('loading') : tCommon('submit')}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}