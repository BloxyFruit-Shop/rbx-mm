"use client";

import { useQuery } from "convex/react";
import { useTranslations } from "next-intl";
import { api } from "~convex/_generated/api";
import MiddlemanGrid from "./middleman-grid";
import SecurityBanner from "./security-banner";

export default function MiddlemanDirectory() {
  const t = useTranslations("middleman");

  const middlemen = useQuery(api.user.listApprovedMiddlemen, {
    onlineOnly: false,
  });

  return (
    <div className="space-y-8">
      <SecurityBanner />

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {t('middlemenList.title')}
          </h2>
        </div>

        {middlemen === undefined ? (
          <div className="py-12 text-center">
            <div className="text-white/60">{t('middlemenList.loadingMiddlemen')}</div>
          </div>
        ) : middlemen.length === 0 ? (
          <div className="py-12 text-center border rounded-2xl border-white/10 bg-white/5">
            <div className="text-white/60">
              {t('middlemenList.noMiddlemen')}
            </div>
          </div>
        ) : (
          <MiddlemanGrid middlemen={middlemen} viewMode="grid" />
        )}
      </div>
    </div>
  );
}