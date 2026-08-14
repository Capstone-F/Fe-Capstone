"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { buildProductsHref } from "@/features/commerce/lib/product-filters";
import { SEARCH_SUGGESTIONS } from "@/features/commerce/constants/discovery";

const c = { title: "Gợi ý cho bạn" };

export function SearchSuggestionChips() {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <section className="flex flex-col gap-2.5">
      <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
        {c.title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {SEARCH_SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion.label}
            type="button"
            onClick={() =>
              router.push(
                buildProductsHref(searchParams, {
                  [suggestion.kind]: suggestion.value,
                }),
              )
            }
            className="focus-visible:ring-primary rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
          >
            {suggestion.label}
          </button>
        ))}
      </div>
    </section>
  );
}
