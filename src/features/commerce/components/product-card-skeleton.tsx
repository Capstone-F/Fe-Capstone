import { Card, CardContent, CardFooter } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <Card className="flex flex-col justify-between overflow-hidden border-slate-200 py-0 shadow-xs">
      <Skeleton className="aspect-square w-full rounded-none bg-slate-300" />
      <CardContent className="flex flex-col gap-2 p-3">
        <Skeleton className="h-3 w-16 bg-slate-300" />
        <Skeleton className="h-4 w-full bg-slate-300" />
        <Skeleton className="h-4 w-3/4 bg-slate-300" />
        <Skeleton className="mt-1 h-3 w-20 bg-slate-300" />
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 p-3">
        <Skeleton className="h-4 w-20 bg-slate-300" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </CardFooter>
    </Card>
  );
}
