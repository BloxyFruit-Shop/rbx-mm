import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export default function TradesLoadingState() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="w-48 h-8 bg-white/10" />
            <Skeleton className="h-4 w-96 bg-white/10" />
          </div>
          <Skeleton className="w-32 h-10 bg-white/10" />
        </div>
        
        <div className="flex flex-wrap gap-4">
          <Skeleton className="w-64 h-10 bg-white/10" />
          <Skeleton className="w-40 h-10 bg-white/10" />
          <Skeleton className="w-40 h-10 bg-white/10" />
          <Skeleton className="w-40 h-10 bg-white/10" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="h-full">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full bg-white/10" />
                <div className="space-y-1">
                  <Skeleton className="w-24 h-4 bg-white/10" />
                  <Skeleton className="w-16 h-3 bg-white/10" />
                </div>
              </div>
              
              <div className="space-y-3">
                <Skeleton className="w-20 h-4 bg-white/10" />
                <div className="flex gap-2">
                  <Skeleton className="w-12 h-12 rounded bg-white/10" />
                  <Skeleton className="w-12 h-12 rounded bg-white/10" />
                  <Skeleton className="w-12 h-12 rounded bg-white/10" />
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Skeleton className="flex-1 h-9 bg-white/10" />
                <Skeleton className="flex-1 h-9 bg-white/10" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}