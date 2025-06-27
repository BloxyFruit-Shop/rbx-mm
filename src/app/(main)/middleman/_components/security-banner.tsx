"use client";

import { useTranslations } from 'next-intl';
import { Shield, Lock, Eye, Clock } from 'lucide-react';

export default function SecurityBanner() {
  const t = useTranslations('middleman.security');

  const features = [
    { icon: Shield, text: t('verification.title') },
    { icon: Lock, text: t('escrow.title') },
    { icon: Eye, text: t('monitoring.title') },
    { icon: Clock, text: t('disputes.title') }
  ];

  return (
    <div className="relative p-6 overflow-hidden border rounded-2xl bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border-white/20">
      <div className="relative">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="mb-2 text-xl font-bold text-white">
              {t('title')}
            </h3>
            <p className="text-white/70">
              {t('subtitle')}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10">
                  <Icon className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium text-white">{feature.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}