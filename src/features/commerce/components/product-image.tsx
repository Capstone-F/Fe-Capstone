"use client";

import Image from "next/image";
import { useState } from "react";
import { CategoryPlaceholder } from "./category-placeholder";

interface ProductImageProps {
  imageUrl: string | null;
  /** Drives the placeholder icon. Null when the product left the catalog. */
  categoryName: string | null;
  alt: string;
  sizes: string;
}

/**
 * One product photo with its fallbacks, mirroring `Mo-Capstone`'s
 * `features/shop/components/product/ProductImage.tsx`: a missing or dead URL
 * falls back to the category icon rather than a broken frame. Fills its parent,
 * so the caller owns the box and its rounding.
 */
export function ProductImage({
  imageUrl,
  categoryName,
  alt,
  sizes,
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  if (imageUrl && !failed) {
    return (
      <Image
        src={imageUrl}
        alt={alt}
        fill
        sizes={sizes}
        className="object-cover"
        onError={() => {
          if (process.env.NODE_ENV !== "production") {
            console.warn("[ProductImage] Failed to load image", imageUrl);
          }
          setFailed(true);
        }}
      />
    );
  }

  if (categoryName) {
    return <CategoryPlaceholder categoryName={categoryName} />;
  }

  return <div className="h-full w-full bg-slate-50" />;
}
