"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "~convex/_generated/api";
import { Button } from "~/components/ui/button";
import { BetterBadge } from "~/components/ui/better-badge";
import { Users, Database, CheckCircle, AlertCircle } from "lucide-react";
import { getSession } from "~/lib/auth-client";
import type { Id } from "~convex/_generated/dataModel";

export default function AdminClient() {
  const [session, setSession] = useState<{ sessionId: Id<"session"> } | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<{ success: boolean; created: number } | null>(null);

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
  const existingMiddlemen = useQuery(api.middlemen.debugListAllMiddlemen);
  const approvedMiddlemen = existingMiddlemen?.filter(mm => mm.approvalStatus === "approved") ?? [];

  // Mutation to seed test middlemen
  const seedTestMiddlemen = useMutation(api.middlemen.seedTestMiddlemen);

  const handleSeedMiddlemen = async () => {
    if (!session) return;
    
    setIsSeeding(true);
    setSeedResult(null);
    
    try {
      const result = await seedTestMiddlemen({ session: session.sessionId });
      setSeedResult(result);
    } catch (error) {
      console.error("Failed to seed middlemen:", error);
      setSeedResult({ success: false, created: 0 });
    } finally {
      setIsSeeding(false);
    }
  };

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

          {approvedMiddlemen.length === 0 && (
            <div className="flex items-center justify-between p-4 border rounded-lg border-white/10 bg-white/5">
              <div>
                <p className="font-medium text-white">Seed Test Middlemen</p>
                <p className="text-sm text-white/60">
                  Create test middlemen data for development and testing
                </p>
              </div>
              <Button
                onClick={handleSeedMiddlemen}
                disabled={isSeeding}
                size="sm"
                variant="gradient"
                gradientType="purple"
              >
                {isSeeding ? "Creating..." : "Seed Data"}
              </Button>
            </div>
          )}

          {seedResult && (
            <div className={`flex items-center gap-3 p-4 border rounded-lg ${
              seedResult.success 
                ? "border-green-500/20 bg-green-500/10" 
                : "border-red-500/20 bg-red-500/10"
            }`}>
              {seedResult.success ? (
                <CheckCircle className="text-green-400 size-5" />
              ) : (
                <AlertCircle className="text-red-400 size-5" />
              )}
              <div>
                <p className={`font-medium ${seedResult.success ? "text-green-400" : "text-red-400"}`}>
                  {seedResult.success ? "Success!" : "Failed"}
                </p>
                <p className="text-sm text-white/60">
                  {seedResult.success 
                    ? `Created ${seedResult.created} test middlemen` 
                    : "Failed to create test middlemen"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}