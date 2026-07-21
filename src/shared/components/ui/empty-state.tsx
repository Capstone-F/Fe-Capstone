import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  className?: string;
}

// Reusable empty-state card matching the app's dashed-border pattern.
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "text-muted-foreground flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center",
        className,
      )}
    >
      {Icon ? <Icon className="mb-3 h-12 w-12 text-slate-300" /> : null}
      <p className="font-bold text-slate-700">{title}</p>
      {description ? <p className="mt-1 text-xs">{description}</p> : null}
      {action?.href ? (
        <Link href={action.href} className="mt-4 inline-block">
          <Button variant="outline" size="sm" className="text-xs">
            {action.label}
          </Button>
        </Link>
      ) : action?.onClick ? (
        <Button
          variant="outline"
          size="sm"
          onClick={action.onClick}
          className="mt-4 text-xs"
        >
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}
