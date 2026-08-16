import {
  Banknote,
  Boxes,
  CircleDot,
  PackagePlus,
  ShoppingBag,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

export interface ActivityMeta {
  icon: LucideIcon;
  /** Link to a filtered LIST page — the payload's id is not guaranteed routable. */
  href: string | null;
}

/**
 * Matching is substring-based and case-insensitive because the backend's activity
 * `type` vocabulary is not published. Unknown types degrade to a neutral row
 * rather than breaking the list.
 */
const RULES: Array<{ match: RegExp; meta: ActivityMeta }> = [
  {
    match: /withdraw/i,
    meta: { icon: Banknote, href: "/dashboard/finance?tab=clinics" },
  },
  {
    match: /cancel|refund/i,
    meta: { icon: Boxes, href: "/dashboard/finance?tab=refunds" },
  },
  { match: /order/i, meta: { icon: ShoppingBag, href: "/dashboard/commerce" } },
  {
    match: /stock|import/i,
    meta: { icon: PackagePlus, href: "/dashboard/stock-imports" },
  },
  {
    match: /user|customer|signup/i,
    meta: { icon: UserPlus, href: "/dashboard/users" },
  },
];

const FALLBACK: ActivityMeta = { icon: CircleDot, href: null };

export function activityMetaFor(type: string): ActivityMeta {
  return RULES.find((rule) => rule.match.test(type))?.meta ?? FALLBACK;
}
