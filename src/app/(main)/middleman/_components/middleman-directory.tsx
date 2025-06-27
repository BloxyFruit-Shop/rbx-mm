"use client";

import { useQuery } from "convex/react";
import { useTranslations } from "next-intl";
import { api } from "~convex/_generated/api";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Search, Filter, Grid, List } from "lucide-react";
import MiddlemanGrid from "./middleman-grid";
import SecurityBanner from "./security-banner";

export default function MiddlemanDirectory() {
  const t = useTranslations("middleman");
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const middlemen = useQuery(api.middlemen.listApprovedMiddlemen, {
    onlineOnly: showOnlineOnly,
  });

  const filteredMiddlemen = middlemen?.filter(
    (mm) =>
      !searchTerm ||
      (mm.userProfile?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        mm.userProfile?.robloxUsername
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())),
  );

  return (
    <div className="space-y-8">
      <SecurityBanner />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Available Middlemen
            </h2>
            <p className="text-white/60">
              {filteredMiddlemen?.length ?? 0} middlemen found
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Results */}
        {filteredMiddlemen === undefined ? (
          <div className="py-12 text-center">
            <div className="text-white/60">Loading middlemen...</div>
          </div>
        ) : filteredMiddlemen.length === 0 ? (
          <div className="py-12 text-center border rounded-2xl border-white/10 bg-white/5">
            <div className="text-white/60">
              No middlemen found.
            </div>
          </div>
        ) : (
          <MiddlemanGrid middlemen={filteredMiddlemen} viewMode={viewMode} />
        )}
      </div>
    </div>
  );
}
