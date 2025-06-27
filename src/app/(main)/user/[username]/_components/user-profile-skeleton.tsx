import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export default function UserProfileSkeleton() {
  return (
    <div className="space-y-8">
      <Card className="overflow-hidden">
        <CardHeader className="pb-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <Skeleton className="h-24 w-24 rounded-full bg-white/10" />
              <div className="text-center sm:text-left space-y-2">
                <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center">
                  <Skeleton className="h-8 w-48 bg-white/10" />
                  <Skeleton className="h-6 w-20 rounded-full bg-white/10" />
                </div>
                <Skeleton className="h-4 w-32 bg-white/10" />
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
                    <Skeleton className="h-6 w-16 mx-auto mb-1 bg-white/10" />
                    <Skeleton className="h-3 w-12 mx-auto bg-white/10" />
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Skeleton className="h-9 w-32 bg-white/10" />
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-6">
        <div className="grid w-full grid-cols-2 gap-2">
          <Skeleton className="h-10 bg-white/10" />
          <Skeleton className="h-10 bg-white/10" />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="h-fit">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24 bg-white/10" />
                      <Skeleton className="h-3 w-16 bg-white/10" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-20 bg-white/10" />
                    <Skeleton className="h-3 w-12 bg-white/10" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Skeleton className="h-16 w-full bg-white/10 mb-3" />
                <Skeleton className="h-8 w-full bg-white/10" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}