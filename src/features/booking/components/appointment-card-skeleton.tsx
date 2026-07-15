import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

// Loading placeholder mirroring the appointment card layout.
export function AppointmentCardSkeleton() {
  return (
    <Card className="overflow-hidden border-slate-200 shadow-xs">
      <div className="flex flex-col items-start justify-between gap-2 border-b border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center">
        <Skeleton className="h-3.5 w-40 bg-slate-300" />
        <Skeleton className="h-4 w-24 bg-slate-300" />
      </div>
      <CardContent className="grid grid-cols-1 gap-4 p-4 md:grid-cols-12">
        <div className="flex items-center gap-2.5 md:col-span-4">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-2.5 w-24 bg-slate-300" />
            <Skeleton className="h-4 w-28 bg-slate-300" />
          </div>
        </div>
        <div className="flex items-center gap-2.5 md:col-span-4">
          <Skeleton className="h-5 w-5 shrink-0" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-2.5 w-20 bg-slate-300" />
            <Skeleton className="h-3.5 w-32 bg-slate-300" />
          </div>
        </div>
        <div className="flex items-center gap-2.5 md:col-span-2">
          <Skeleton className="h-5 w-5 shrink-0" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-2.5 w-16 bg-slate-300" />
            <Skeleton className="h-3.5 w-16 bg-slate-300" />
          </div>
        </div>
        <div className="flex items-center justify-end md:col-span-2">
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </CardContent>
      <div className="flex gap-2 border-t border-slate-100/50 bg-slate-50/10 px-4 py-2">
        <Skeleton className="mt-0.5 h-4 w-4 shrink-0" />
        <Skeleton className="h-3.5 w-3/4 bg-slate-300" />
      </div>
    </Card>
  );
}
