"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { HelpCircle, Sparkles } from "lucide-react";
import { cn } from "~/lib/utils";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from 'next-intl';

export function FaqSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('home.faq');

  const faqs = [
    {
      question: t('questions.createTradeAd.question'),
      answer: t('questions.createTradeAd.answer'),
      category: t('questions.createTradeAd.category'),
    },
    {
      question: t('questions.middleman.question'),
      answer: t('questions.middleman.answer'),
      category: t('questions.middleman.category'),
    },
    {
      question: t('questions.itemValue.question'),
      answer: t('questions.itemValue.answer'),
      category: t('questions.itemValue.category'),
    },
    {
      question: t('questions.vouches.question'),
      answer: t('questions.vouches.answer'),
      category: t('questions.vouches.category'),
    },
  ];

  const leftColumnFaqs = faqs.slice(0, 2);
  const rightColumnFaqs = faqs.slice(2);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sectionRef} className="relative w-full px-4 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-pulse-slow absolute top-5 left-5 h-16 w-16 rounded-full bg-gradient-to-br from-[#9747FF]/10 to-transparent blur-xl sm:top-10 sm:left-10 sm:h-32 sm:w-32" />
        <div
          className="animate-pulse-slow absolute right-5 bottom-5 h-20 w-20 rounded-full bg-gradient-to-br from-[#7E3BFF]/10 to-transparent blur-xl sm:right-10 sm:bottom-10 sm:h-40 sm:w-40"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div
        className={`mb-8 flex flex-col items-center text-center transition-all duration-1000 sm:mb-12 ${isVisible ? "animate-fade-in-up" : "translate-y-8 opacity-0"}`}
      >
        <div className="mb-3 flex flex-col items-center gap-2 sm:mb-4 sm:flex-row sm:gap-3">
          <div className="hidden rounded-full bg-gradient-to-r from-[#9747FF] to-[#7E3BFF] p-2 shadow-lg sm:block sm:p-3">
            <HelpCircle className="h-5 w-5 text-white sm:h-6 sm:w-6" />
          </div>
          <h2 className="text-center text-2xl font-bold text-white sm:text-left sm:text-3xl lg:text-4xl">
            {t('title')}
          </h2>
          <Sparkles className="h-5 w-5 animate-pulse text-[#9747FF] sm:h-6 sm:w-6" />
        </div>
        <p className="max-w-2xl px-4 text-base text-white/70 sm:px-0 sm:text-lg">
          {t('subtitle')}
        </p>
        <div className="mt-3 h-1 w-16 rounded-full bg-gradient-to-r from-[#9747FF] to-[#7E3BFF] sm:mt-4 sm:w-24" />
      </div>

      <div
        className={`grid grid-cols-1 gap-4 transition-all duration-1000 sm:gap-4 lg:grid-cols-2 lg:gap-8 ${isVisible ? "animate-fade-in-up" : "translate-y-8 opacity-0"}`}
        style={{ animationDelay: "200ms" }}
      >
        <div className="space-y-3 sm:space-y-4 lg:space-y-6">
          <Accordion
            type="single"
            collapsible
            className="w-full space-y-3 sm:space-y-4"
          >
            {leftColumnFaqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="group border-none"
              >
                <AccordionTrigger
                  className={cn(
                    "rounded-xl bg-gradient-to-r from-[#3A2564] to-[#2A1854] px-4 py-4 text-left font-medium sm:px-6 sm:py-5",
                    "text-white transition-all duration-300 hover:no-underline",
                    "data-[state=open]:rounded-b-none data-[state=open]:from-[#4A2A94] data-[state=open]:to-[#3A2564]",
                    "border border-[#4A2A94]/40 hover:border-[#9747FF]/60 hover:shadow-lg hover:shadow-[#9747FF]/20",
                    "transform-gpu group-hover:scale-[1.01] data-[state=open]:scale-100 data-[state=open]:hover:scale-100",
                    "relative overflow-hidden",
                    "touch-manipulation", // Better touch handling on mobile
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#9747FF]/0 to-[#9747FF]/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative z-10 flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
                    <span className="self-start rounded-full bg-[#9747FF]/20 px-2 py-1 text-xs whitespace-nowrap text-neutral-100/95">
                      {faq.category}
                    </span>
                    <span className="flex-1 text-sm leading-relaxed sm:text-base">
                      {faq.question}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent
                  className={cn(
                    "rounded-b-xl bg-[#231347] px-4 text-sm text-white/80 sm:px-6 sm:text-base",
                    "border-b border-[#4A2A94]/40",
                    "relative overflow-hidden",
                  )}
                >
                  <div className="pt-3 pb-2 leading-relaxed sm:pt-4 sm:pb-2">
                    {faq.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="space-y-3 sm:space-y-4 lg:space-y-6">
          <Accordion
            type="single"
            collapsible
            className="w-full space-y-3 sm:space-y-4"
          >
            {rightColumnFaqs.map((faq, index) => (
              <AccordionItem
                key={index + 2}
                value={`item-${index + 2}`}
                className="group border-none"
              >
                <AccordionTrigger
                  className={cn(
                    "rounded-xl bg-gradient-to-r from-[#3A2564] to-[#2A1854] px-4 py-4 text-left font-medium sm:px-6 sm:py-5",
                    "text-white transition-all duration-300 hover:no-underline",
                    "data-[state=open]:rounded-b-none data-[state=open]:from-[#4A2A94] data-[state=open]:to-[#3A2564]",
                    "border border-[#4A2A94]/40 hover:border-[#7E3BFF]/60 hover:shadow-lg hover:shadow-[#7E3BFF]/20",
                    "transform-gpu group-hover:scale-[1.01] data-[state=open]:scale-100 data-[state=open]:hover:scale-100",
                    "relative overflow-hidden",
                    "touch-manipulation", // Better touch handling on mobile
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#7E3BFF]/0 to-[#7E3BFF]/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative z-10 flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
                    <span className="self-start rounded-full bg-[#7E3BFF]/20 px-2 py-1 text-xs whitespace-nowrap text-neutral-100/95">
                      {faq.category}
                    </span>
                    <span className="flex-1 text-sm leading-relaxed sm:text-base">
                      {faq.question}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent
                  className={cn(
                    "rounded-b-xl bg-[#231347] px-4 text-sm text-white/80 sm:px-6 sm:text-base",
                    "border-b border-[#4A2A94]/40",
                    "relative overflow-hidden",
                  )}
                >
                  <div className="pt-3 pb-2 leading-relaxed sm:pt-4 sm:pb-2">
                    {faq.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      <div
        className={`mt-8 flex justify-center transition-all duration-1000 sm:mt-12 ${isVisible ? "animate-fade-in-up" : "translate-y-8 opacity-0"}`}
        style={{ animationDelay: "400ms" }}
      >
        <div className="flex flex-col items-center gap-1 text-center text-sm text-white/40 sm:flex-row sm:gap-2">
          <span>{t('stillHaveQuestions')}</span>
          <span className="cursor-pointer text-[#9747FF] underline transition-colors hover:text-[#7E3BFF] sm:no-underline">
            {t('contactSupport')}
          </span>
        </div>
      </div>
    </div>
  );
}
