import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";

interface ItemSidebarSkeletonProps {
  className?: string;
  variant?: 'default' | 'minimal';
}

export default function ItemSidebarSkeleton({ className, variant = 'default' }: ItemSidebarSkeletonProps) {
  return (
    <div className={cn("w-80", className)}>
      <Card className={cn(
        "h-fit",
        variant === 'default' ? "" : "border-0 bg-transparent"
      )}>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Skeleton className="h-5 w-20 rounded-full bg-white/10" />
                <Skeleton className="h-5 w-24 rounded-full bg-white/10" />
              </div>
              <Skeleton className="h-6 w-48 mb-2 bg-white/10" />
              <Skeleton className="h-4 w-16 bg-white/10" />
            </div>
            {variant === 'default' && (
              <Skeleton className="w-8 h-8 bg-white/10" />
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#9747FF]/20 to-[#7E3BFF]/20 rounded-xl blur-xl"></div>
              <div className="relative flex items-center justify-center w-32 h-32 border bg-white/5 border-white/10 rounded-xl backdrop-blur-sm">
                <Skeleton className="w-24 h-24 bg-white/10" />
              </div>
            </div>
          </div>

          <div className="relative p-6 text-center border rounded-xl bg-gradient-to-r from-[#9747FF]/10 to-[#7E3BFF]/10 border-[#9747FF]/20 backdrop-blur-sm">
            <div className="relative">
              <Skeleton className="h-8 w-32 mx-auto mb-2 bg-white/10" />
              <Skeleton className="h-4 w-24 mx-auto mb-1 bg-white/10" />
              <Skeleton className="h-3 w-20 mx-auto bg-white/10" />
            </div>
          </div>

          <Separator className="bg-white/10" />

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="w-4 h-4 bg-white/10" />
              <Skeleton className="h-5 w-20 bg-white/10" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-white/5 border-white/10">
                <Skeleton className="h-4 w-16 bg-white/10" />
                <Skeleton className="h-5 w-20 bg-white/10" />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg bg-white/5 border-white/10">
                <Skeleton className="h-4 w-20 bg-white/10" />
                <Skeleton className="h-5 w-16 rounded-full bg-white/10" />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg bg-white/5 border-white/10">
                <Skeleton className="h-4 w-20 bg-white/10" />
                <Skeleton className="h-5 w-12 bg-white/10" />
              </div>
            </div>
          </div>

          <Separator className="bg-white/10" />

          <div>
            <Skeleton className="h-5 w-24 mb-3 bg-white/10" />
            <div className="p-4 border rounded-lg bg-white/5 border-white/10">
              <Skeleton className="h-3 w-full mb-2 bg-white/10" />
              <Skeleton className="h-3 w-4/5 mb-2 bg-white/10" />
              <Skeleton className="h-3 w-3/4 bg-white/10" />
            </div>
          </div>

          <Separator className="bg-white/10" />

          <div className="text-center">
            <Skeleton className="inline-block h-8 w-32 rounded-lg bg-white/10" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}