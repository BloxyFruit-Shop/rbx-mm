"use client";

import { memo, useState } from "react";
import { useTranslations } from "next-intl";
import { notFound, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { cn } from "~/lib/utils";
import {
  User,
  Star,
  Calendar,
  MessageCircle,
  Shield,
  Crown,
  Award,
  TrendingUp,
  Package,
  ExternalLink,
} from "lucide-react";
import { api } from "~convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import Link from "next/link";
import TradeAdCard from "~/app/(main)/trades/_components/trade-ad-card";
import TradeInfoDialog from "~/components/trade/trade-info-dialog";
import VouchCard from "./vouch-card";
import type { ResolvedTradeAd } from "~convex/tradeAds";
import type { Id } from "~convex/_generated/dataModel";
import { getSession } from "~/lib/auth-client";
import { toast } from "sonner";

interface UserProfileClientProps {
  username: string;
}

interface SendMessageButtonProps {
  userId: Id<"user">;
  username: string;
  buttonText: string;
}

function SendMessageButton({ userId, username, buttonText }: SendMessageButtonProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const findOrCreateDirectMessage = useMutation(api.chats.findOrCreateDirectMessage);

  const handleSendMessage = async () => {
    const sessionData = await getSession();
    if (!sessionData.data) {
      toast.error("You must be logged in to send a message.");
      return;
    }

    if (userId === sessionData.data.user.id) {
      toast.error("You cannot send a message to yourself.");
      return;
    }

    setIsCreating(true);

    try {
      const chatId = await findOrCreateDirectMessage({
        otherUserId: userId,
        session: sessionData.data.session.id as Id<"session">,
      });

      router.push(`/chat/${chatId}`);
    } catch (error) {
      console.error("Failed to create direct message:", error);
      toast.error("Failed to start conversation. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Button
      onClick={handleSendMessage}
      disabled={isCreating}
      className="border-0 bg-gradient-to-r from-[#9747FF] to-[#7E3BFF] text-white hover:from-[#8A42E6] hover:to-[#7332E6] disabled:opacity-50"
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      {isCreating ? "Starting..." : buttonText}
    </Button>
  );
}

const UserProfileClient = memo(function UserProfileClient({
  username,
}: UserProfileClientProps) {
  const t = useTranslations("userProfile");
  const [selectedTradeAd, setSelectedTradeAd] = useState<ResolvedTradeAd | null>(null);
  const [tradeInfoDialogOpen, setTradeInfoDialogOpen] = useState(false);

  const userProfile = useQuery(api.user.getUserByUsername, { username });
  const userTradeAds = useQuery(
    api.tradeAds.listTradeAds,
    userProfile ? { creatorId: userProfile._id } : "skip",
  );
  const userVouches = useQuery(
    api.vouches.getVouchesForUser,
    userProfile ? { userId: userProfile._id } : "skip",
  );

  if (userProfile === null) {
    notFound();
  }

  if (userProfile === undefined) {
    return null; // Loading handled by Suspense
  }

  const handleSeeDetails = (tradeAd: ResolvedTradeAd) => {
    setSelectedTradeAd(tradeAd);
    setTradeInfoDialogOpen(true);
  };

  const formatJoinDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRoleIcon = (roles: string[] = []) => {
    if (roles.includes("admin"))
      return <Crown className="w-4 h-4 text-yellow-400" />;
    if (roles.includes("middleman"))
      return <Shield className="w-4 h-4 text-blue-400" />;
    return <User className="w-4 h-4 text-white/60" />;
  };

  const getRoleBadgeColor = (roles: string[] = []) => {
    if (roles.includes("admin"))
      return "border-yellow-500/30 bg-yellow-500/20 text-yellow-400";
    if (roles.includes("middleman"))
      return "border-blue-500/30 bg-blue-500/20 text-blue-400";
    return "border-white/20 bg-white/10 text-white/80";
  };

  const getHighestRole = (roles: string[] = []) => {
    if (roles.includes("admin")) return "Admin";
    if (roles.includes("middleman")) return "Middleman";
    return "User";
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-4 w-4",
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : i < rating
              ? "fill-yellow-400/50 text-yellow-400"
              : "text-white/20",
        )}
      />
    ));
  };

  const openTradeAds = userTradeAds?.filter((ad) => ad.status === "open") ?? [];
  const closedTradeAds =
    userTradeAds?.filter((ad) => ad.status !== "open") ?? [];

  return (
    <>
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#150a30]/80">
          <div className="absolute inset-0 bg-gradient-to-r from-[#9747FF]/5 to-[#7E3BFF]/5 blur-3xl"></div>
          <div className="relative p-8 lg:p-12">
            <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start">
              <div className="relative">
                <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-[#9747FF]/30 to-[#7E3BFF]/30 blur-2xl"></div>
                <Avatar className="relative h-24 w-24 border-4 border-[#9747FF]/30 shadow-2xl lg:h-28 lg:w-28">
                  <AvatarImage
                    src={userProfile.robloxAvatarUrl ?? undefined}
                    alt={`${userProfile.name ?? userProfile.robloxUsername}'s avatar`}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-[#9747FF]/20 to-[#7E3BFF]/20 text-xl font-bold text-white lg:text-2xl">
                    {(userProfile.name ?? userProfile.robloxUsername)?.charAt(0)?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1 text-center lg:text-left">
                <div className="mb-4 space-y-2">
                  <div className="flex flex-col items-center gap-3 lg:flex-row lg:items-center">
                    <div className="space-y-1">
                      <h1 className="text-2xl font-bold text-white lg:text-3xl">
                        {userProfile.name ?? userProfile.robloxUsername}
                      </h1>
                      <p className="text-sm text-white/60">
                        @{userProfile.robloxUsername}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getRoleIcon(userProfile.roles)}
                      <Badge
                        className={cn(
                          "text-sm font-medium",
                          getRoleBadgeColor(userProfile.roles),
                        )}
                      >
                        {getHighestRole(userProfile.roles)}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-white/60 lg:justify-start">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      {t("joinedOn")} {formatJoinDate(userProfile._creationTime)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 mb-6 lg:justify-start">
                  <div className="flex items-center gap-2">
                    {userProfile.averageRating ? (
                      <>
                        <div className="flex items-center gap-1">
                          {renderStars(userProfile.averageRating)}
                        </div>
                        <span className="text-lg font-semibold text-white">
                          {userProfile.averageRating.toFixed(1)}
                        </span>
                        <span className="text-sm text-white/60">
                          ({userProfile.vouchCount} {t("vouches")})
                        </span>
                      </>
                    ) : (
                      <span className="text-white/60">{t("noRating")}</span>
                    )}
                  </div>
                </div>

                {userProfile.badges && userProfile.badges.length > 0 && (
                  <div className="mb-6 space-y-3">
                    <h3 className="text-sm font-medium text-white/80">
                      {t("badges")}
                    </h3>
                    <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
                      {userProfile.badges.map((badge, index) => (
                        <Badge
                          key={index}
                          className="border-[#9747FF]/30 bg-[#9747FF]/20 text-[#9747FF]"
                        >
                          <Award className="w-3 h-3 mr-1" />
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <SendMessageButton 
                  userId={userProfile._id}
                  username={userProfile.robloxUsername ?? userProfile.name ?? ""}
                  buttonText={t("sendMessage")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 lg:grid-cols-1 lg:gap-3">
                <Card className="border-green-500/20 bg-green-500/10">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      <span className="text-2xl font-bold text-green-400">
                        {openTradeAds.length}
                      </span>
                    </div>
                    <p className="text-xs text-green-400/80">{t("activeAds")}</p>
                  </CardContent>
                </Card>

                <Card className="border-blue-500/20 bg-blue-500/10">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Package className="w-5 h-5 text-blue-400" />
                      <span className="text-2xl font-bold text-blue-400">
                        {closedTradeAds.length}
                      </span>
                    </div>
                    <p className="text-xs text-blue-400/80">
                      {t("completedAds")}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        <Card className="overflow-hidden">
          <Tabs defaultValue="trades" className="w-full">
            <CardHeader className="pb-0">
              <TabsList className="grid w-full grid-cols-2 bg-white/5">
                <TabsTrigger
                  value="trades"
                  className="data-[state=active]:bg-[#9747FF]/20 data-[state=active]:text-[#9747FF]"
                >
                  <span className="flex items-center gap-2">
                    <TrendingUp className="size-4" />
                    <span className="hidden sm:inline">{t("tradeAds")}</span>
                    <span className="sm:hidden">Trades</span>
                    <Badge
                      variant="secondary"
                      className="ml-1 bg-white/10 text-white/80"
                    >
                      {userTradeAds?.length ?? 0}
                    </Badge>
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="vouches"
                  className="flex items-center gap-2 data-[state=active]:bg-[#9747FF]/20 data-[state=active]:text-[#9747FF]"
                >
                  <span className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    <span className="hidden sm:inline">{t("vouches")}</span>
                    <span className="sm:hidden">Reviews</span>
                    <Badge
                      variant="secondary"
                      className="ml-1 bg-white/10 text-white/80"
                    >
                      {userProfile.vouchCount}
                    </Badge>
                  </span>
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="p-6">
              <TabsContent value="trades" className="mt-0 space-y-6">
                {openTradeAds.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <h3 className="text-lg font-semibold text-white">
                        {t("activeTradeAds")}
                      </h3>
                      <Badge className="text-green-400 border-green-500/30 bg-green-500/20">
                        {openTradeAds.length}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                      {openTradeAds.map((tradeAd) => (
                        <TradeAdCard 
                          key={tradeAd._id} 
                          tradeAd={tradeAd} 
                          onSeeDetails={() => handleSeeDetails(tradeAd)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {closedTradeAds.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <h3 className="text-lg font-semibold text-white">
                        {t("completedTradeAds")}
                      </h3>
                      <Badge className="text-blue-400 border-blue-500/30 bg-blue-500/20">
                        {closedTradeAds.length}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                      {closedTradeAds.map((tradeAd) => (
                        <TradeAdCard 
                          key={tradeAd._id} 
                          tradeAd={tradeAd} 
                          onSeeDetails={() => handleSeeDetails(tradeAd)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {(!userTradeAds || userTradeAds.length === 0) && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="flex items-center justify-center w-20 h-20 mb-6 border rounded-full border-white/10 bg-white/5">
                      <TrendingUp className="w-10 h-10 text-white/40" />
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-white/80">
                      {t("noTradeAds")}
                    </h3>
                    <p className="max-w-md text-white/60">
                      {t("noTradeAdsDescription")}
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="vouches" className="mt-0 space-y-6">
                {userVouches && userVouches.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {userVouches.map((vouch) => (
                      <VouchCard key={vouch._id} vouch={vouch} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="flex items-center justify-center w-20 h-20 mb-6 border rounded-full border-white/10 bg-white/5">
                      <Star className="w-10 h-10 text-white/40" />
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-white/80">
                      {t("noVouches")}
                    </h3>
                    <p className="max-w-md text-white/60">
                      {t("noVouchesDescription")}
                    </p>
                  </div>
                )}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>

      <TradeInfoDialog
        tradeAd={selectedTradeAd}
        open={tradeInfoDialogOpen}
        onOpenChange={setTradeInfoDialogOpen}
      />
    </>
  );
});

export default UserProfileClient;