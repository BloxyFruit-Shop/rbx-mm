import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export default function StockLoadingSkeleton() {
  return (
    <div className="space-y-8">
      <Card className="overflow-hidden">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-xl bg-white/10" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48 bg-white/10" />
              <Skeleton className="h-4 w-32 bg-white/10" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-4 w-4 bg-white/10" />
                  <Skeleton className="h-4 w-16 bg-white/10" />
                </div>
                <Skeleton className="h-8 w-16 bg-white/10" />
                <Skeleton className="h-3 w-20 bg-white/10 mt-1" />
              </div>
            ))}
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, columnIndex) => (
          <Card key={columnIndex} className="h-fit">
            <CardHeader className="pb-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg bg-white/10" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-20 bg-white/10" />
                      <Skeleton className="h-5 w-12 rounded-full bg-white/10" />
                    </div>
                    <Skeleton className="h-4 w-32 bg-white/10 mt-1" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-24 rounded-lg bg-white/10" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-16 bg-white/10" />
                    <Skeleton className="h-8 w-16 rounded-lg bg-white/10" />
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, itemIndex) => (
                  <div key={itemIndex} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                    <Skeleton className="h-10 w-10 rounded-lg bg-white/10" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 bg-white/10" />
                      <Skeleton className="h-3 w-16 bg-white/10" />
                    </div>
                    <div className="space-y-1 text-right">
                      <Skeleton className="ml-auto h-4 w-8 bg-white/10" />
                      <Skeleton className="ml-auto h-3 w-12 bg-white/10" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}