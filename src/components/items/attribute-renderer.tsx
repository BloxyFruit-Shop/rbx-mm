import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import { ExternalLink, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Type definitions for the attribute union
type ItemAttribute = 
  | { type: "key-value"; title: string; content: string }
  | { type: "percentile"; title: string; content: number }
  | { type: "image-link"; title: string; content: string; imageUrl: string; link?: string }
  | { type: "tag"; title: string };

interface AttributeRendererProps {
  attribute: ItemAttribute;
  variant?: "default" | "sidebar";
}

export default function AttributeRenderer({ 
  attribute, 
  variant = "default" 
}: AttributeRendererProps) {
  switch (attribute.type) {
    case "key-value":
      return (
        <div className={cn(
          "flex items-center justify-between",
          variant === "sidebar" 
            ? "p-4 transition-colors duration-200 border rounded-lg border-white/10 bg-white/5 hover:bg-white/10"
            : ""
        )}>
          <span className="text-sm text-white/60">{attribute.title}</span>
          <span className={cn(
            "font-semibold text-white",
            variant === "sidebar" ? "text-sm" : "text-sm"
          )}>
            {attribute.content}
          </span>
        </div>
      );

    case "percentile":
      return (
        <div className={cn(
          "flex items-center justify-between",
          variant === "sidebar" 
            ? "p-4 transition-colors duration-200 border rounded-lg border-white/10 bg-white/5 hover:bg-white/10"
            : ""
        )}>
          <span className="text-sm text-white/60">{attribute.title}</span>
          <div className="text-right">
            <div className="flex items-end">
              <span className={cn(
                "font-semibold text-white",
                variant === "sidebar" ? "text-sm" : "text-sm"
              )}>
                {attribute.content}%
              </span>
            </div>
          </div>
        </div>
      );

    case "image-link":
      if (variant === "sidebar") {
        return (
          <div className="p-4 transition-colors duration-200 border rounded-lg border-white/10 bg-white/5 hover:bg-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/60">{attribute.title}</span>
              {!!attribute.link && (
                <Link 
                  href={attribute.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#9747FF] hover:text-[#7E3BFF] transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 border rounded border-white/10 bg-white/5">
                <Image
                  src={attribute.imageUrl}
                  alt={attribute.content}
                  width={24}
                  height={24}
                  className="object-contain w-6 h-6"
                />
              </div>
              <span className="text-sm font-semibold text-white">
                {attribute.content}
              </span>
            </div>
          </div>
        );
      }
      
      return (
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/60">{attribute.title}</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-4 h-4 border rounded border-white/10 bg-white/5">
              <Image
                src={attribute.imageUrl}
                alt={attribute.content}
                width={12}
                height={12}
                className="object-contain w-3 h-3"
              />
            </div>
            <span className="text-sm text-white/80">
              {attribute.content}
            </span>
            {!!attribute.link && (
              <Link 
                href={attribute.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#9747FF] hover:text-[#7E3BFF] transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      );

    case "tag":
      if (variant === "sidebar") {
        return (
          <Badge className="cursor-default border-[#23c770]/30 bg-[#23c770]/20 text-xs text-[#23c770] shadow-lg">
            <Sparkles className="w-3 h-3 mr-1" />
            {attribute.title}
          </Badge>
        );
      }
      
      return (
        <div className="absolute top-10 right-3 z-10 @[20rem]:top-3 @[20rem]:right-20">
          <Badge className="border-[#23c770]/30 bg-[#23c770]/20 text-xs text-[#23c770]">
            {attribute.title}
          </Badge>
        </div>
      );

    default:
      return null;
  }
}