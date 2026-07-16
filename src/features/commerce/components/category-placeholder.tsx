import {
  Droplets,
  SprayCan,
  FlaskConical,
  CircleDot,
  Sun,
  Layers,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_VISUALS: Record<
  string,
  { icon: LucideIcon; className: string }
> = {
  cleanser: { icon: Droplets, className: "bg-sky text-slate-700" },
  toner: { icon: SprayCan, className: "bg-lavender text-slate-700" },
  serum: { icon: FlaskConical, className: "bg-mint text-slate-700" },
  moisturizer: { icon: CircleDot, className: "bg-sky text-slate-700" },
  sunscreen: { icon: Sun, className: "bg-warning-soft text-warning" },
  mask: { icon: Layers, className: "bg-lavender text-slate-700" },
};

const DEFAULT_VISUAL = {
  icon: Layers,
  className: "bg-slate-100 text-slate-500",
};

/**
 * Be-Capstone has no product-image field — render a category-keyed icon
 * tile instead of a real photo (design doc §1). Falls back to a neutral
 * tile for category names outside the known 6 (Cleanser/Toner/Serum/
 * Moisturizer/Sunscreen/Mask).
 */
export function CategoryPlaceholder({
  categoryName,
  className,
}: {
  categoryName: string;
  className?: string;
}) {
  const visual =
    CATEGORY_VISUALS[categoryName.trim().toLowerCase()] ?? DEFAULT_VISUAL;
  const Icon = visual.icon;
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center",
        visual.className,
        className,
      )}
    >
      <Icon className="h-10 w-10 opacity-70" />
    </div>
  );
}
