"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  MessageCircle,
  ArrowRightLeft,
  Clock,
  Package,
  Sparkles,
  Search,
  Hash,
  Weight,
  Star,
  User,
  FileText,
} from "lucide-react";
import { cn } from "~/lib/utils";
import Image from "next/image";
import type { ResolvedTradeAd } from "~convex/tradeAds";
import { getSession } from "~/lib/auth-client";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "~convex/_generated/api";
import type { Id } from "~convex/_generated/dataModel";
import { TradeOfferDialog } from "~/components/trade/trade-offer-dialog";
import { TradeItemList } from "~/components/trade/trade-item-list";

interface TradeInfoDialogProps {
  tradeAd: ResolvedTradeAd | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusConfig = {
  open: {
    color: "bg-green-500/20 text-green-400 border-green-500/30",
    label: "Open",
    icon: Star,
  },
  closed: {
    color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    label: "Closed",
    icon: Package,
  },
  expired: {
    color: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    label: "Expired",
    icon: Clock,
  },
  cancelled: {
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    label: "Cancelled",
    icon: Package,
  },
};

function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
}

export default function TradeInfoDialog({
  tradeAd,
  open,
  onOpenChange,
}: TradeInfoDialogProps) {
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [tradeOfferDialogOpen, setTradeOfferDialogOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const router = useRouter();
  const findOrCreateDirectChat = useMutation(api.chats.findOrCreateDirectChat);
  const updateTradeAd = useMutation(api.tradeAds.updateTradeAd);

  const handleChat = async () => {
    if (!tradeAd) return;

    const sessionData = await getSession();
    if (!sessionData.data) {
      toast.error("You must be logged in to chat with this user.");
      return;
    }

    if (!tradeAd.creator?._id) {
      toast.error("Unable to start chat - user information not available.");
      return;
    }

    if (tradeAd.creator._id === sessionData.data.user.id) {
      toast.error("You cannot chat with yourself.");
      return;
    }

    setIsCreatingChat(true);

    const sessionId = sessionData.data.session.id as Id<"session">;

    try {
      const chatId = await findOrCreateDirectChat({
        tradeAd: tradeAd._id,
        otherUserId: tradeAd.creator._id,
        session: sessionId,
      });

      router.push(`/chat/${chatId}`);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create chat:", error);
      toast.error("Failed to start chat. Please try again.");
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleTradeOffer = async () => {
    if (!tradeAd) return;

    const sessionData = await getSession();
    if (!sessionData.data) {
      toast.error("You must be logged in to send a trade offer.");
      return;
    }

    if (!tradeAd.creator?._id) {
      toast.error(
        "Unable to send trade offer - user information not available.",
      );
      return;
    }

    if (tradeAd.creator._id === sessionData.data.user.id) {
      toast.error("You cannot send a trade offer to yourself.");
      return;
    }

    setTradeOfferDialogOpen(true);
  };

  const handleCancelTrade = async () => {
    if (!tradeAd) return;

    const sessionData = await getSession();
    if (!sessionData.data) {
      toast.error("You must be logged in to cancel this trade.");
      return;
    }

    if (tradeAd.creator?._id !== sessionData.data.user.id) {
      toast.error("You can only cancel your own trade ads.");
      return;
    }

    setIsCancelling(true);

    try {
      await updateTradeAd({
        tradeAdId: tradeAd._id,
        status: "cancelled",
        session: sessionData.data.session.id as Id<"session">,
      });

      toast.success("Trade ad cancelled successfully.");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to cancel trade:", error);
      toast.error("Failed to cancel trade. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  // Check if current user is the trade owner
  const checkIsOwner = async () => {
    const sessionData = await getSession();
    return sessionData.data?.user.id === tradeAd?.creator?._id;
  };

  const [isOwner, setIsOwner] = useState(false);

  // Check ownership when dialog opens
  useEffect(() => {
    if (open && tradeAd) {
      checkIsOwner().then(setIsOwner).catch(() => console.log("User trade"));
    }
  }, [open, tradeAd]);

  if (!tradeAd) return null;

  const isHearingOffers = tradeAd.wantItemsResolved.length === 0;
  const statusInfo = statusConfig[tradeAd.status];
  const StatusIcon = statusInfo.icon;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[calc(100vw-1rem)] max-w-4xl max-h-[90vh] flex flex-col bg-gradient-to-b from-[#0f051d] to-[#1a0b2e] border-white/10 p-0 overflow-y-auto">
          <div className="flex-shrink-0 p-6 pb-0">
            <DialogHeader className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center flex-1 min-w-0 gap-4">
                  <div className="relative flex-shrink-0">
                    <Avatar className="size-16 ring-2 ring-white/20">
                      <AvatarImage
                        src={tradeAd.creator?.robloxAvatarUrl ?? undefined}
                      />
                      <AvatarFallback className="text-lg font-semibold text-white bg-gradient-to-br from-purple-500 to-blue-500">
                        {tradeAd.creator?.name?.charAt(0) ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute p-1 rounded-full -right-1 -bottom-1 bg-white/10 backdrop-blur-sm">
                      <StatusIcon className="text-white size-4" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <DialogTitle className="text-xl font-bold text-white truncate">
                        {tradeAd.creator?.name ?? "Unknown User"}&apos;s Trade
                      </DialogTitle>
                      <Badge className={cn("text-sm font-medium flex-shrink-0", statusInfo.color)}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-sm text-white/60">
                      <Clock className="flex-shrink-0 size-4" />
                      <span className="truncate">{formatTimeAgo(tradeAd._creationTime)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="flex-1 min-h-0 p-6 overflow-y-auto">
            <div className="space-y-8">
            <TradeItemList
              items={tradeAd.haveItemsResolved}
              title="Items Offered"
              emptyText="No items offered"
              icon={Package}
              accentColor="green"
            />

            <div className="flex justify-center">
              <div className="relative">
                <div className="p-3 border rounded-full border-white/10 bg-gradient-to-r from-blue-500/20 to-purple-500/20">
                  <ArrowRightLeft className="text-white size-6" />
                </div>
                <div className="absolute inset-0 rounded-full animate-pulse bg-gradient-to-r from-blue-500 to-purple-600 opacity-20" />
              </div>
            </div>

            {isHearingOffers ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5">
                    <Sparkles className="size-5 text-white/60" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Looking For</h3>
                    <p className="text-sm text-white/60">Open to offers</p>
                  </div>
                </div>
                <div className="flex items-center justify-center p-12 border border-dashed rounded-xl border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20">
                      <Sparkles className="text-green-400 size-8" />
                    </div>
                    <p className="mb-2 text-lg font-semibold text-green-400">
                      Hearing All Offers
                    </p>
                    <p className="text-green-400/70">
                      This trader is open to any reasonable offers
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <TradeItemList
                items={tradeAd.wantItemsResolved}
                title="Items Wanted"
                emptyText="Hearing offers"
                icon={Search}
                accentColor="blue"
              />
            )}

            {tradeAd.notes && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5">
                    <FileText className="size-5 text-white/60" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Trade Notes</h3>
                    <p className="text-sm text-white/60">Additional information</p>
                  </div>
                </div>
                <div className="p-4 border rounded-xl border-white/10 bg-gradient-to-br from-white/5 to-white/10">
                  <p className="leading-relaxed text-white/80">{tradeAd.notes}</p>
                </div>
              </div>
            )}

            <div className="h-px bg-white/10" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="p-4 border rounded-xl border-white/10 bg-gradient-to-br from-white/5 to-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <Package className="text-green-400 size-5" />
                  <span className="font-medium text-white">Offering</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {tradeAd.haveItemsResolved.length}
                </p>
                <p className="text-sm text-white/60">items</p>
              </div>

              <div className="p-4 border rounded-xl border-white/10 bg-gradient-to-br from-white/5 to-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <Search className="text-blue-400 size-5" />
                  <span className="font-medium text-white">Wanting</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {isHearingOffers ? "Any" : tradeAd.wantItemsResolved.length}
                </p>
                <p className="text-sm text-white/60">
                  {isHearingOffers ? "offers" : "items"}
                </p>
              </div>

              <div className="p-4 border rounded-xl border-white/10 bg-gradient-to-br from-white/5 to-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <User className="text-purple-400 size-5" />
                  <span className="font-medium text-white">Trader</span>
                </div>
                <p className="text-lg font-bold text-white truncate">
                  {tradeAd.creator?.name ?? "Unknown"}
                </p>
                <p className="text-sm text-white/60">creator</p>
              </div>
            </div>

            </div>
          </div>

          <div className="flex-shrink-0 p-6 pt-0">
            {tradeAd.status === "open" && (
              <div className="flex flex-col gap-3 sm:flex-row">
                {isOwner ? (
                  <Button
                    variant="destructive"
                    size="lg"
                    onClick={handleCancelTrade}
                    disabled={isCancelling}
                    className="flex-1"
                  >
                    {isCancelling ? "Cancelling..." : "Cancel Trade Ad"}
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleChat}
                      disabled={isCreatingChat}
                      className="flex-1 border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/10 disabled:opacity-50"
                    >
                      <MessageCircle className="mr-2 size-5" />
                      Start Chat
                    </Button>
                    <Button
                      size="lg"
                      onClick={handleTradeOffer}
                      disabled={isCreatingChat}
                      className="flex-1 text-white border-0 shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 shadow-blue-500/25 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
                    >
                      <ArrowRightLeft className="mr-2 size-5" />
                      Send Trade Offer
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <TradeOfferDialog
        open={tradeOfferDialogOpen}
        onOpenChange={setTradeOfferDialogOpen}
        recipientId={tradeAd.creator?._id}
        tradeAdData={{
          id: tradeAd._id,
          wantItems: tradeAd.wantItemsResolved.map((item) => ({
            id: item._id,
            name: item.name,
            thumbnailUrl: item.thumbnailUrl,
            quantity: item.quantity,
            rarity: item.rarity,
            mutations: item.mutations,
            price: item.price,
            age: item.age,
          })),
        }}
      />
    </>
  );
}