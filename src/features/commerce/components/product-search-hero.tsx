"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, History } from "lucide-react";
import { buildProductsHref } from "@/features/commerce/lib/product-filters";
import {
  pushRecentSearch,
  readRecentSearches,
} from "@/features/commerce/lib/recent-searches";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

const c = {
  title: "Tìm sản phẩm hợp với làn da của bạn",
  subtitle: "Tìm theo tên, thương hiệu hoặc hoạt chất — đã kiểm tra xung đột.",
  placeholder: "VD: sữa rửa mặt cho da dầu, Niacinamide...",
  submit: "Tìm kiếm",
  recent: "Tìm gần đây",
};

export function ProductSearchHero() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState("");
  const [recent, setRecent] = useState<string[]>([]);

  // localStorage is read in an effect, never during render: SSR has no
  // localStorage and reading it while rendering causes a hydration mismatch.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecent(readRecentSearches());
  }, []);

  const submit = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    pushRecentSearch(trimmed);
    router.push(buildProductsHref(searchParams, { query: trimmed }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit(value);
  };

  return (
    <section className="rounded-2xl bg-[#2C3E35] px-6 py-8 text-[#E0F2E9] sm:px-10 sm:py-10">
      <h2 className="text-xl font-bold sm:text-2xl">{c.title}</h2>
      <p className="mt-1 text-sm text-[#E0F2E9]/70">{c.subtitle}</p>

      <form onSubmit={handleSubmit} className="mt-5 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={c.placeholder}
            aria-label={c.submit}
            className="h-11 border-transparent bg-white pl-9 text-sm text-slate-900"
          />
        </div>
        <Button type="submit" className="h-11 px-5 text-sm font-semibold">
          {c.submit}
        </Button>
      </form>

      {recent.length > 0 ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs text-[#E0F2E9]/60">
            <History className="h-3.5 w-3.5" />
            {c.recent}
          </span>
          {recent.map((entry) => (
            <button
              key={entry}
              type="button"
              onClick={() => submit(entry)}
              className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none motion-reduce:transition-none"
            >
              {entry}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
