import { Product } from "@/types/domain";
import { vi } from "@/config/locales/vi";

/** Small pill row: "Hợp da bạn" / "Đã mua trước đây" quick badges for cards. */
export function CardBadges({ product }: { product: Product }) {
  return (
    <div className="flex flex-wrap gap-1">
      {product.matchesUserSkin && (
        <span className="bg-primary-soft text-primary rounded-full px-2 py-0.5 text-[10px] font-semibold">
          ✓ {vi.commerce.products.matchesSkin}
        </span>
      )}
      {product.previouslyPurchased && (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
          {vi.commerce.products.previouslyPurchased}
        </span>
      )}
    </div>
  );
}

/** Detail-page badge groups for skin types, concerns, and goals. */
export function CompatibilityBadges({ product }: { product: Product }) {
  return (
    <div className="flex flex-col gap-3">
      {product.skinTypes.length > 0 && (
        <BadgeGroup
          label={vi.commerce.detail.suitableFor}
          items={product.skinTypes}
          tone="sky"
        />
      )}
      {product.concerns.length > 0 && (
        <BadgeGroup
          label={vi.commerce.detail.addresses}
          items={product.concerns}
          tone="lavender"
        />
      )}
      {product.goals.length > 0 && (
        <BadgeGroup
          label={vi.commerce.detail.goals}
          items={product.goals}
          tone="mint"
        />
      )}
    </div>
  );
}

const TONE: Record<string, string> = {
  sky: "bg-sky text-slate-700",
  lavender: "bg-lavender text-slate-700",
  mint: "bg-mint text-slate-700",
};

function BadgeGroup({
  label,
  items,
  tone,
}: {
  label: string;
  items: string[];
  tone: keyof typeof TONE;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-slate-700">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span
            key={item}
            className={`${TONE[tone]} rounded-full px-2.5 py-1 text-xs font-medium`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
