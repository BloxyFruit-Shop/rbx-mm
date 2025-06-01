import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";

interface ItemSidebarSkeletonProps {
  className?: string;
  variant?: "default" | "minimal";
}

export default function ItemSidebarSkeleton({
  className,
  variant = "default",
}: ItemSidebarSkeletonProps) {
  return (
    <div className={cn("w-80", className)}>
      <Card
        className={cn(
          "h-fit",
          variant === "default" ? "" : "border-0 bg-transparent",
        )}
      >
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-2">
                <Skeleton className="h-5 w-20 rounded-full bg-white/10" />
                <Skeleton className="h-5 w-24 rounded-full bg-white/10" />
              </div>
              <Skeleton className="mb-2 h-6 w-48 bg-white/10" />
              <Skeleton className="h-4 w-16 bg-white/10" />
            </div>
            {variant === "default" && (
              <Skeleton className="h-8 w-8 bg-white/10" />
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#9747FF]/20 to-[#7E3BFF]/20 blur-xl"></div>
              <div className="relative flex h-32 w-32 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                <Skeleton className="h-24 w-24 bg-white/10" />
              </div>
            </div>
          </div>

          <div className="relative rounded-xl border border-[#9747FF]/20 bg-gradient-to-r from-[#9747FF]/10 to-[#7E3BFF]/10 p-6 text-center">
            <div className="relative">
              <Skeleton className="mx-auto mb-2 h-8 w-32 bg-white/10" />
              <Skeleton className="mx-auto mb-1 h-4 w-24 bg-white/10" />
              <Skeleton className="mx-auto h-3 w-20 bg-white/10" />
            </div>
          </div>

          <Separator className="bg-white/10" />

          <div>
            <div className="mb-4 flex items-center gap-2">
              <Skeleton className="h-4 w-4 bg-white/10" />
              <Skeleton className="h-5 w-20 bg-white/10" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
                <Skeleton className="h-4 w-16 bg-white/10" />
                <Skeleton className="h-5 w-20 bg-white/10" />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
                <Skeleton className="h-4 w-20 bg-white/10" />
                <Skeleton className="h-5 w-16 rounded-full bg-white/10" />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
                <Skeleton className="h-4 w-20 bg-white/10" />
                <Skeleton className="h-5 w-12 bg-white/10" />
              </div>
            </div>
          </div>

          <Separator className="bg-white/10" />

          <div>
            <Skeleton className="mb-3 h-5 w-24 bg-white/10" />
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <Skeleton className="mb-2 h-3 w-full bg-white/10" />
              <Skeleton className="mb-2 h-3 w-4/5 bg-white/10" />
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
