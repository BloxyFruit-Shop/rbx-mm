"use client";

import { useTranslations } from 'next-intl';
import { MessageCircle, HandHeart, Shield, CheckCircle2 } from 'lucide-react';

export default function ProcessGuide() {
  const t = useTranslations('middleman.howItWorks');

  const steps = [
    { icon: MessageCircle, title: "Contact", description: "Choose & message a middleman" },
    { icon: HandHeart, title: "Negotiate", description: "Agree on terms & commission" },
    { icon: Shield, title: "Secure Trade", description: "Items held safely during exchange" },
    { icon: CheckCircle2, title: "Complete", description: "Both parties receive items" }
  ];

  return (
    <div className="p-6 border bg-white/5 border-white/10 rounded-2xl">
      <h3 className="mb-4 text-lg font-semibold text-white">
        How It Works
      </h3>
      
      <div className="space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={index} className="flex items-start gap-3">
              <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-400 to-blue-500">
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">{step.title}</div>
                <div className="text-xs text-white/60">{step.description}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}