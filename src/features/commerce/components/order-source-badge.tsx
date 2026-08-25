import { HeartPulse } from "lucide-react";
import type { OrderSource } from "@/types/domain";
import { Badge } from "@/shared/components/ui/badge";

export function OrderSourceBadge({ source }: { source: OrderSource }) {
  if (source !== "TREATMENT") return null;

  return (
    <Badge
      variant="outline"
      className="border-violet-200 bg-violet-50 text-violet-700"
    >
      <HeartPulse className="mr-1 h-3 w-3" />
      Theo liệu trình
    </Badge>
  );
}
