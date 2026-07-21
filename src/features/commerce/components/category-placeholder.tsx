import Image from "next/image";
import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getCategoryIcon,
  getCategoryLabel,
} from "@/features/commerce/mapper/category-mapper";

/**
 * Be-Capstone has no product-image field — render the category's custom icon
 * (public/icons/categories/, resolved via the category mapper) instead of a
 * real photo. Falls back to a neutral glyph for categories that have no mapped
 * icon (e.g. a new BE category not yet added to the constant).
 */
export function CategoryPlaceholder({
  categoryName,
  className,
}: {
  categoryName: string;
  className?: string;
}) {
  const icon = getCategoryIcon(categoryName);

  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center bg-slate-50",
        className,
      )}
    >
      {icon ? (
        <Image
          src={icon}
          alt={getCategoryLabel(categoryName)}
          fill
          sizes="(max-width: 768px) 33vw, 200px"
          className="object-contain p-[22%]"
        />
      ) : (
        <Layers className="h-10 w-10 text-slate-400" />
      )}
    </div>
  );
}
