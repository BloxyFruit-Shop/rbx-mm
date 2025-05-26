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

const faqs = [
  {
    question: "How do I create a trade ad?",
    answer:
      "To create a trade ad, navigate to the Trading page and click on the 'Create Ad' button. Select the items you want to offer and the items you're looking for, then publish your ad.",
    category: "Trading",
  },
  {
    question: "What is a middleman?",
    answer:
      "A middleman is a trusted third party who helps facilitate trades to ensure both parties receive what was agreed upon. They hold items from both traders until both sides of the trade are verified.",
    category: "Security",
  },
  {
    question: "How is an item's value calculated?",
    answer:
      "Item values are calculated using a combination of trading data, demand tracking, and expert analysis from our team. Values are updated regularly to reflect the current market.",
    category: "Pricing",
  },
  {
    question: "Can free vouches be taken?",
    answer:
      "Vouches should only be given after a successful trade to maintain the integrity of our reputation system. Free vouches can be removed by moderators if discovered.",
    category: "Reputation",
  },
];

export function FaqSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
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
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="animate-pulse-slow absolute top-5 left-5 h-16 w-16 sm:top-10 sm:left-10 sm:h-32 sm:w-32 rounded-full bg-gradient-to-br from-[#9747FF]/10 to-transparent blur-xl" />
        <div
          className="animate-pulse-slow absolute right-5 bottom-5 h-20 w-20 sm:right-10 sm:bottom-10 sm:h-40 sm:w-40 rounded-full bg-gradient-to-br from-[#7E3BFF]/10 to-transparent blur-xl"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div
        className={`mb-8 sm:mb-12 flex flex-col items-center text-center transition-all duration-1000 ${isVisible ? "animate-fade-in-up" : "translate-y-8 opacity-0"}`}
      >
        <div className="flex flex-col items-center gap-2 mb-3 sm:mb-4 sm:flex-row sm:gap-3">
          <div className="rounded-full bg-gradient-to-r from-[#9747FF] to-[#7E3BFF] p-2 sm:p-3 shadow-lg hidden sm:block">
            <HelpCircle className="w-5 h-5 text-white sm:h-6 sm:w-6" />
          </div>
          <h2 className="text-2xl font-bold text-center text-white sm:text-3xl lg:text-4xl sm:text-left">
            Frequently Asked Questions
          </h2>
          <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse text-[#9747FF]" />
        </div>
        <p className="max-w-2xl px-4 text-base sm:text-lg text-white/70 sm:px-0">
          Find answers to common questions about our platform and trading
          process
        </p>
        <div className="mt-3 sm:mt-4 h-1 w-16 sm:w-24 rounded-full bg-gradient-to-r from-[#9747FF] to-[#7E3BFF]" />
      </div>

      <div
        className={`grid grid-cols-1 gap-4 sm:gap-4 lg:grid-cols-2 lg:gap-8 transition-all duration-1000 ${isVisible ? "animate-fade-in-up" : "translate-y-8 opacity-0"}`}
        style={{ animationDelay: "200ms" }}
      >
        <div className="space-y-3 sm:space-y-4 lg:space-y-6">
          <Accordion type="single" collapsible className="w-full space-y-3 sm:space-y-4">
            {leftColumnFaqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-none group"
              >
                <AccordionTrigger
                  className={cn(
                    "rounded-xl bg-gradient-to-r from-[#3A2564] to-[#2A1854] px-4 py-4 sm:px-6 sm:py-5 text-left font-medium",
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
                    <span className="self-start rounded-full bg-[#9747FF]/20 px-2 py-1 text-xs text-neutral-100/95 whitespace-nowrap">
                      {faq.category}
                    </span>
                    <span className="flex-1 text-sm leading-relaxed sm:text-base">{faq.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent
                  className={cn(
                    "rounded-b-xl bg-[#231347] px-4 sm:px-6 text-sm sm:text-base text-white/80",
                    "border-b border-[#4A2A94]/40",
                    "relative overflow-hidden",
                  )}
                >
                  <div className="pt-3 pb-2 leading-relaxed sm:pt-4 sm:pb-2">{faq.answer}</div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="space-y-3 sm:space-y-4 lg:space-y-6">
          <Accordion type="single" collapsible className="w-full space-y-3 sm:space-y-4">
            {rightColumnFaqs.map((faq, index) => (
              <AccordionItem
                key={index + 2}
                value={`item-${index + 2}`}
                className="border-none group"
              >
                <AccordionTrigger
                  className={cn(
                    "rounded-xl bg-gradient-to-r from-[#3A2564] to-[#2A1854] px-4 py-4 sm:px-6 sm:py-5 text-left font-medium",
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
                    <span className="self-start rounded-full bg-[#7E3BFF]/20 px-2 py-1 text-xs text-neutral-100/95 whitespace-nowrap">
                      {faq.category}
                    </span>
                    <span className="flex-1 text-sm leading-relaxed sm:text-base">{faq.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent
                  className={cn(
                    "rounded-b-xl bg-[#231347] px-4 sm:px-6 text-sm sm:text-base text-white/80",
                    "border-b border-[#4A2A94]/40",
                    "relative overflow-hidden",
                  )}
                >
                  <div className="pt-3 pb-2 leading-relaxed sm:pt-4 sm:pb-2">{faq.answer}</div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      <div
        className={`mt-8 sm:mt-12 flex justify-center transition-all duration-1000 ${isVisible ? "animate-fade-in-up" : "translate-y-8 opacity-0"}`}
        style={{ animationDelay: "400ms" }}
      >
        <div className="flex flex-col items-center gap-1 text-sm text-center sm:flex-row sm:gap-2 text-white/40">
          <span>Still have questions?</span>
          <span className="cursor-pointer text-[#9747FF] transition-colors hover:text-[#7E3BFF] underline sm:no-underline">
            Contact Support
          </span>
        </div>
      </div>
    </div>
  );
}