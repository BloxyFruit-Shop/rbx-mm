"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "~convex/_generated/api";
import { BetterBadge } from "~/components/ui/better-badge";
import { Users, Database } from "lucide-react";
import { getSession } from "~/lib/auth-client";
import type { Id } from "~convex/_generated/dataModel";

export default function AdminClient() {
  const [session, setSession] = useState<{ sessionId: Id<"session"> } | null>(null);

  // Get session on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const sessionData = await getSession();
        if (sessionData.data?.session?.id) {
          setSession({ sessionId: sessionData.data.session.id as Id<"session"> });
        }
      } catch (error) {
        console.error("Failed to load session:", error);
      }
    };

    loadSession().catch(() => console.log("failed to load session"));
  }, []);

  // Query to check existing middlemen
  const existingMiddlemen = useQuery(api.middlemen.listAllMiddlemen, {});
  const approvedMiddlemen = existingMiddlemen?.filter(mm => mm.approvalStatus === "approved") ?? [];

  if (!session) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="p-6 border rounded-xl border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
            <Database className="text-blue-400 size-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Database Management</h3>
            <p className="text-sm text-white/60">Manage platform data and seed test content</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg border-white/10 bg-white/5">
            <div className="flex items-center gap-3">
              <Users className="text-purple-400 size-5" />
              <div>
                <p className="font-medium text-white">Approved Middlemen</p>
                <p className="text-sm text-white/60">
                  {approvedMiddlemen.length} approved middlemen in database
                </p>
              </div>
            </div>
            <BetterBadge 
              variant={approvedMiddlemen.length > 0 ? "success" : "warning"} 
              size="sm"
            >
              {approvedMiddlemen.length > 0 ? "Active" : "Empty"}
            </BetterBadge>
          </div>

        </div>
      </div>
    </div>
  );
}