"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CategoryPlaceholder } from "./category-placeholder";

interface ProductImageGalleryProps {
  images: string[];
  /** Drives the placeholder shown when a product has no usable image. */
  categoryName: string;
  /** Image of the currently selected variant, if that variant has its own photo. */
  selectedImageUrl?: string | null;
  /**
   * Which variant the shopper picked. Syncing on this rather than on the image URL
   * matters when two variants share a photo: the gallery must still return to that
   * photo after the shopper has browsed the thumbnails.
   */
  selectedVariantId?: string | null;
}

/**
 * Web counterpart of `Mo-Capstone`'s ProductImageGallery: mobile pages through the
 * images by swiping, so here they get a thumbnail strip instead. A photo whose URL
 * fails to load is dropped rather than left as a broken frame, and a product with
 * no usable photo falls back to the category placeholder.
 */
export function ProductImageGallery({
  images,
  categoryName,
  selectedImageUrl,
  selectedVariantId,
}: ProductImageGalleryProps) {
  const [failed, setFailed] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const usable = images.filter((url) => !failed.includes(url));

  // Selecting a variant that has its own photo moves the gallery to it. Adjusting
  // state during render (rather than in an effect) is the pattern already used for
  // the shop filters in products-page.tsx.
  const [prevVariantId, setPrevVariantId] = useState(selectedVariantId);
  if (selectedVariantId !== prevVariantId) {
    setPrevVariantId(selectedVariantId);
    // `usable` holds trimmed URLs (resolveProductImageUrls), so trim before matching.
    const target = selectedImageUrl?.trim();
    const next = target ? usable.indexOf(target) : -1;
    if (next >= 0 && next !== activeIndex) setActiveIndex(next);
  }

  if (usable.length === 0) {
    return (
      <div className="relative aspect-square w-full bg-slate-50">
        <CategoryPlaceholder categoryName={categoryName} />
      </div>
    );
  }

  // A dropped image can leave the index past the end of the list.
  const safeIndex = Math.min(activeIndex, usable.length - 1);
  const activeImage = usable[safeIndex];

  const handleError = (url: string) => {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[ProductImageGallery] Failed to load image", url);
    }
    setFailed((current) =>
      current.includes(url) ? current : [...current, url],
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-50">
        <Image
          src={activeImage}
          alt={`${categoryName} — ảnh ${safeIndex + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain p-4"
          onError={() => handleError(activeImage)}
          priority
        />
        {usable.length > 1 && (
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-900/70 px-3 py-1 text-xs font-medium text-white">
            {safeIndex + 1}/{usable.length}
          </span>
        )}
      </div>

      {usable.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {usable.map((url, index) => (
            <button
              key={url}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Xem ảnh ${index + 1}`}
              aria-pressed={index === safeIndex}
              className={cn(
                "relative h-16 w-16 overflow-hidden rounded-lg border bg-slate-50 transition-colors",
                index === safeIndex
                  ? "border-primary ring-primary/30 ring-2"
                  : "border-slate-200 hover:border-slate-300",
              )}
            >
              <Image
                src={url}
                alt=""
                fill
                sizes="64px"
                className="object-contain p-1"
                onError={() => handleError(url)}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
