import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { PlusCircle } from "lucide-react";
import { cn } from "~/lib/utils";

const faqs = [
  {
    question: "How do I create a trade ad?",
    answer:
      "To create a trade ad, navigate to the Trading page and click on the 'Create Ad' button. Select the items you want to offer and the items you're looking for, then publish your ad.",
  },
  {
    question: "What is a middleman?",
    answer:
      "A middleman is a trusted third party who helps facilitate trades to ensure both parties receive what was agreed upon. They hold items from both traders until both sides of the trade are verified.",
  },
  {
    question: "How is an item's value calculated?",
    answer:
      "Item values are calculated using a combination of trading data, demand tracking, and expert analysis from our team. Values are updated regularly to reflect the current market.",
  },
  {
    question: "Can free vouches be taken?",
    answer:
      "Vouches should only be given after a successful trade to maintain the integrity of our reputation system. Free vouches can be removed by moderators if discovered.",
  },
];

export function FaqSection() {
  const leftColumnFaqs = faqs.slice(0, 2);
  const rightColumnFaqs = faqs.slice(2);

  return (
    <div className="w-full rounded-2xl bg-[#1a0b2e]/90 py-6 px-4 border border-[#4A2A94]/30">
      <div className="flex justify-center items-center w-full">
        <h2 className="mb-8 text-3xl font-bold text-white relative">
        <span className="text-white">FAQ</span>
        <span className="absolute -bottom-2 left-0 w-16 h-1 bg-gradient-to-r from-[#9747FF] to-[#7E3BFF] rounded-full"></span>
      </h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
        <div className="space-y-4">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {leftColumnFaqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-none"
              >
                <AccordionTrigger
                  className={cn(
                    "rounded-xl bg-gradient-to-r from-[#3A2564] to-[#2A1854] px-6 py-4 text-base font-medium",
                    "text-white hover:bg-[#3A2564] hover:no-underline transition-colors duration-200",
                    "data-[state=open]:rounded-b-none data-[state=open]:from-[#4A2A94] data-[state=open]:to-[#3A2564]",
                    "border border-[#4A2A94]/40 hover:border-[#4A2A94]/70"
                  )}
                >
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent
                  className={cn(
                    "rounded-b-xl bg-[#231347] px-6 text-base text-white/80",
                    "border-b border-[#4A2A94]/40"
                  )}
                >
                  <div className="pt-2">{faq.answer}</div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="space-y-4">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {rightColumnFaqs.map((faq, index) => (
              <AccordionItem
                key={index + 2}
                value={`item-${index + 2}`}
                className="border-none"
              >
                <AccordionTrigger
                  className={cn(
                    "rounded-xl bg-gradient-to-r from-[#3A2564] to-[#2A1854] px-6 py-4 text-base font-medium",
                    "text-white hover:bg-[#3A2564] hover:no-underline transition-colors duration-200",
                    "data-[state=open]:rounded-b-none data-[state=open]:from-[#4A2A94] data-[state=open]:to-[#3A2564]",
                    "border border-[#4A2A94]/40 hover:border-[#4A2A94]/70"
                  )}
                >
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent
                  className={cn(
                    "rounded-b-xl bg-[#231347] px-6 text-base text-white/80",
                    "border-b border-[#4A2A94]/40"
                  )}
                >
                  <div className="pt-2">{faq.answer}</div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
