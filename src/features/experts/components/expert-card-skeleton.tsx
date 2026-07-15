import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

// Loading placeholder mirroring the expert list card layout.
export function ExpertCardSkeleton() {
  return (
    <Card className="flex flex-col justify-between border-slate-200 shadow-xs">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-16 bg-slate-300" />
            <Skeleton className="h-5 w-32 bg-slate-300" />
          </div>
          <Skeleton className="h-5 w-10 shrink-0 bg-slate-300" />
        </div>
        <Skeleton className="mt-2 h-3.5 w-40 bg-slate-300" />
      </CardHeader>
      <CardContent className="flex-1 p-4 pt-1 pb-2">
        <Skeleton className="h-3 w-full bg-slate-300" />
        <Skeleton className="mt-1.5 h-3 w-4/5 bg-slate-300" />
        <div className="mt-3 flex flex-wrap gap-1">
          <Skeleton className="h-4 w-16 bg-slate-300" />
          <Skeleton className="h-4 w-14 bg-slate-300" />
          <Skeleton className="h-4 w-20 bg-slate-300" />
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
          <Skeleton className="h-3 w-20 bg-slate-300" />
          <Skeleton className="h-3 w-12 bg-slate-300" />
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between rounded-b-xl border-t border-slate-100 bg-slate-50/50 p-4 pt-2">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-2.5 w-16 bg-slate-300" />
          <Skeleton className="h-4 w-20 bg-slate-300" />
        </div>
        <Skeleton className="h-8 w-28 rounded-lg" />
      </CardFooter>
    </Card>
  );
}
