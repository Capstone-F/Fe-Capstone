import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function OrderCardSkeleton() {
  return (
    <Card className="overflow-hidden border-slate-200 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="flex flex-col gap-3 p-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <Skeleton className="h-14 w-14 rounded-lg" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
    </Card>
  );
}
