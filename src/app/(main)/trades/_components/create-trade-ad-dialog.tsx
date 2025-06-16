"use client";

import { useState, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "~convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import MultipleSelector from "~/components/ui/multiselect";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "~/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import {
  Plus,
  Minus,
  X,
  Search,
  Package,
  Loader2,
  Sparkles,
  Weight,
  Hash,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import type { Id } from "~convex/_generated/dataModel";
import type { ITEM_TYPES } from "~convex/types";
import { getSession } from "~/lib/auth-client";

interface CreateTradeAdDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Type for items returned from search API (after transformation)
type SearchResultItem = {
  _id: Id<"items">;
  _creationTime: number;
  name: string;
  gameId: Id<"games">;
  thumbnailUrl: string;
  attributes: {
    gameTag: string;
    details: {
      rarity: string;
      type: {
        category: string;
        sellValue?: number;
        buyPrice?: number;
      };
    };
  };
};

interface TradeItem {
  itemId: Id<"items">;
  item: SearchResultItem;
  quantity: number;
  weightKg?: number;
  mutations: string[];
}

const availableMutations = [
  { value: "Shiny", label: "Shiny" },
  { value: "Large", label: "Large" },
  { value: "Small", label: "Small" },
  { value: "Golden", label: "Golden" },
  { value: "Rainbow", label: "Rainbow" },
  { value: "Glowing", label: "Glowing" },
  { value: "Crystalline", label: "Crystalline" },
  { value: "Ethereal", label: "Ethereal" },
];

function ItemSelector({
  title,
  items,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  placeholder,
}: {
  title: string;
  items: TradeItem[];
  onAddItem: (item: SearchResultItem) => void;
  onRemoveItem: (index: number) => void;
  onUpdateItem: (index: number, updates: Partial<TradeItem>) => void;
  placeholder: string;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchPopoverOpen, setSearchPopoverOpen] = useState(false);

  // Fetch items for selection
  const allItems = useQuery(api.itemDetails.searchItems, {
    gameTag: "GrowAGarden",
    searchTerm: searchTerm || undefined,
    type:
      selectedCategory === "all"
        ? undefined
        : (selectedCategory as (typeof ITEM_TYPES)[number]),
    sortBy: "name",
    sortOrder: "asc",
    paginationOpts: { numItems: 50, cursor: null },
  });

  const filteredItems = useMemo(() => {
    if (!allItems?.page) return [];

    // Filter out items already selected
    const selectedItemIds = new Set(items.map((item) => item.itemId));
    // Cast the items to the correct type since we know the API transforms them correctly
    const transformedItems = allItems.page as SearchResultItem[];
    return transformedItems.filter((item) => !selectedItemIds.has(item._id));
  }, [allItems?.page, items]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <Badge variant="default">{items.length} items</Badge>
        </div>
      </div>

      {items.length > 0 && (
        <div className="grid gap-4">
          {items.map((tradeItem, index) => (
            <div
              key={`${tradeItem.itemId}-${index}`}
              className="relative p-2 transition-all duration-200 border rounded-sm border-white/10 bg-gradient-to-br from-white/5 to-white/10"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex items-center gap-3 sm:flex-shrink-0">
                  <div className="relative overflow-hidden border rounded-sm size-16 border-white/20 bg-white/10">
                    <Image
                      src={tradeItem.item.thumbnailUrl}
                      alt={tradeItem.item.name}
                      width={64}
                      height={64}
                      className="object-contain size-full"
                    />
                  </div>
                  <div className="flex-1 sm:flex-initial">
                    <h4 className="font-semibold text-white">
                      {tradeItem.item.name}
                    </h4>
                    <p className="text-sm text-white/60">
                      {tradeItem.item.attributes.details.type.category}
                    </p>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium text-white/80">
                        <Hash className="size-4" />
                        Quantity
                      </Label>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="p-0 size-8 border-white/20 bg-white/5 hover:bg-white/10"
                          onClick={() =>
                            onUpdateItem(index, {
                              quantity: Math.max(1, tradeItem.quantity - 1),
                            })
                          }
                        >
                          <Minus className="size-3" />
                        </Button>
                        <div className="flex items-center justify-center w-12 h-8 text-sm font-medium text-white border rounded border-white/20 bg-white/5">
                          {tradeItem.quantity}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="p-0 size-8 border-white/20 bg-white/5 hover:bg-white/10"
                          onClick={() =>
                            onUpdateItem(index, {
                              quantity: tradeItem.quantity + 1,
                            })
                          }
                        >
                          <Plus className="size-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium text-white/80">
                        <Weight className="size-4" />
                        Weight (kg)
                      </Label>
                      <Input
                        type="number"
                        placeholder="Optional"
                        value={tradeItem.weightKg ?? ""}
                        onChange={(e) =>
                          onUpdateItem(index, {
                            weightKg: e.target.value
                              ? parseFloat(e.target.value)
                              : undefined,
                          })
                        }
                        className="h-8"
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium text-white/80">
                      <Sparkles className="size-4" />
                      Mutations
                    </Label>
                    <MultipleSelector
                      value={tradeItem.mutations.map((m) => ({
                        value: m,
                        label: m,
                      }))}
                      onChange={(selected) => {
                        onUpdateItem(index, {
                          mutations: selected.map((s) => s.value),
                        });
                      }}
                      defaultOptions={availableMutations}
                      placeholder="Select mutations..."
                      emptyIndicator={
                        <p className="text-sm text-center text-white/60">
                          No mutations found
                        </p>
                      }
                      className="border-white/20 bg-white/5"
                      badgeClassName="bg-purple-500/20 border-purple-500/30 text-purple-300"
                    />
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveItem(index)}
                  className="absolute p-0 text-red-400 top-2 right-2 size-8 hover:bg-red-500/10 hover:text-red-300"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Popover
            open={searchPopoverOpen}
            onOpenChange={setSearchPopoverOpen}
          >
            <div className="relative flex-1">
              <Search className="absolute -translate-y-1/2 top-1/2 left-3 size-4 text-white/50" />
              <PopoverAnchor asChild>
                <Input
                  placeholder="Search items to add..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    // Open popover when user starts typing
                    if (e.target.value && !searchPopoverOpen) {
                      setSearchPopoverOpen(true);
                    }
                    // Close popover when search is cleared
                    if (!e.target.value) {
                      setSearchPopoverOpen(false);
                    }
                  }}
                  onFocus={() => {
                    // Always open popover when focusing if there's a search term
                    if (searchTerm) {
                      setSearchPopoverOpen(true);
                    }
                  }}
                  className="pl-10"
                />
              </PopoverAnchor>
            </div>
            <PopoverContent
              className="p-0 max-h-80 w-96 border-white/20 bg-black/95 backdrop-blur-sm"
              align="start"
              sideOffset={4}
              onOpenAutoFocus={(e) => e.preventDefault()}
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <div className="p-2">
                <div 
                  className="overflow-y-auto max-h-72"
                  style={{ 
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent'
                  }}
                  onWheel={(e) => {
                    // Allow wheel scrolling within the container
                    e.stopPropagation();
                  }}
                >
                  {searchTerm ? (
                    filteredItems.length === 0 ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <Search className="mx-auto mb-2 size-8 text-white/40" />
                          <p className="text-sm text-white/60">No items found</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredItems.slice(0, 10).map((item) => (
                          <button
                            key={item._id}
                            type="button"
                            className="flex items-center w-full gap-3 p-3 text-left transition-all duration-200 border rounded-sm cursor-pointer border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            onClick={() => {
                              onAddItem(item);
                              setSearchTerm(""); // Clear search after adding
                              setSearchPopoverOpen(false); // Close popover
                            }}
                          >
                            <div className="flex-shrink-0 overflow-hidden border rounded size-10 border-white/20 bg-white/10">
                              <Image
                                src={item.thumbnailUrl}
                                alt={item.name}
                                width={40}
                                height={40}
                                className="object-contain size-full"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-white truncate">
                                {item.name}
                              </p>
                              <p className="text-xs text-white/60">
                                {item.attributes.details.type.category}
                              </p>
                            </div>
                            <Plus className="flex-shrink-0 size-4 text-white/60" />
                          </button>
                        ))}
                      </div>
                    )
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <Search className="mx-auto mb-2 size-8 text-white/40" />
                        <p className="text-sm text-white/60">
                          Start typing to search items
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Crop">Crops</SelectItem>
              <SelectItem value="Pet">Pets</SelectItem>
              <SelectItem value="Egg">Eggs</SelectItem>
              <SelectItem value="Gear">Gear</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {items.length === 0 && (
        <div className="flex items-center justify-center p-12 text-center border border-dashed rounded-xl border-white/20 bg-white/5">
          <div>
            <Package className="mx-auto mb-4 size-12 text-white/40" />
            <p className="text-white/60">{placeholder}</p>
            <p className="mt-1 text-sm text-white/40">
              Search and click items above to add them
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreateTradeAdDialog({
  open,
  onOpenChange,
}: CreateTradeAdDialogProps) {
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
        sessionData.error.message ?? "You need to log in before continuing",
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
          weightKg: item.weightKg,
          mutations: item.mutations.length > 0 ? item.mutations : undefined,
        })),
        wantItems: hearingOffers
          ? []
          : wantItems.map((item) => ({
              itemId: item.itemId,
              quantity: item.quantity,
              weightKg: item.weightKg,
              mutations: item.mutations.length > 0 ? item.mutations : undefined,
            })),
        notes: notes.trim() || undefined,
        session: sessionId,
      });

      toast.success("Trade ad created successfully!");
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
      <DialogContent className="max-h-[95vh] max-w-6xl p-0 flex flex-col">
        <DialogHeader className="flex-shrink-0 px-6 py-4 border-b border-white/10">
          <DialogTitle className="text-xl">
            Create Trade Advertisement
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Create a new trade ad to offer items and find what you&apos;re
            looking for
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-6">
            <Tabs defaultValue="offering" className="space-y-6">
              <TabsList className="grid w-full h-12 grid-cols-2 p-1 border border-white/10 bg-white/5">
                <TabsTrigger
                  value="offering"
                  className="h-10 data-[state=active]:border-green-500/30 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500/20 data-[state=active]:to-emerald-500/20"
                >
                  <span className="flex items-center gap-2">
                    <Package className="size-4" />
                    <span>Offering</span>
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="wanting"
                  className="h-10 data-[state=active]:border-blue-500/30 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-cyan-500/20"
                >
                  <span className="flex items-center gap-2">
                    <Search className="size-4" />
                    <span>Wanting</span>
                  </span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="offering" className="mt-6 space-y-6">
                <ItemSelector
                  title="Items You're Offering"
                  items={haveItems}
                  onAddItem={handleAddHaveItem}
                  onRemoveItem={handleRemoveHaveItem}
                  onUpdateItem={handleUpdateHaveItem}
                  placeholder="Add items you want to trade away"
                />
              </TabsContent>

              <TabsContent value="wanting" className="mt-6 space-y-6">
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
                  <ItemSelector
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

            <div className="mt-8 space-y-4">
              <Collapsible
                open={notesExpanded}
                onOpenChange={setNotesExpanded}
              >
                <div className="p-4 border rounded-xl border-white/10 bg-gradient-to-br from-white/5 to-white/10">
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
                      id="notes"
                      placeholder="Add any additional information about your trade preferences, specific requirements, or contact details..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      maxLength={500}
                      className="min-h-[100px] resize-none"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-white/50">
                        Be specific about your preferences to get better
                        offers
                      </p>
                      <p className="text-xs text-white/60">
                        {notes.length}/500 characters
                      </p>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 px-6 py-4 border-t border-white/10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-white/60">
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
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  (haveItems.length === 0 && wantItems.length === 0)
                }
                variant="gradient"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                {isSubmitting ? "Creating..." : "Create Trade Ad"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}