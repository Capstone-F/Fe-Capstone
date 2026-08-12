import Image from "next/image";
import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getCategoryIcon,
  getCategoryLabel,
} from "@/features/commerce/mapper/category-mapper";

/**
 * Stand-in for a product photo: renders the category's custom icon
 * (public/icons/categories/, resolved via the category mapper). Used when a
 * product has no variant `imageUrl`, or when the stored URL fails to load.
 * Falls back to a neutral glyph for categories that have no mapped icon
 * (e.g. a new BE category not yet added to the constant).
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
