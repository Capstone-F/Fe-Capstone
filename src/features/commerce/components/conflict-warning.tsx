import { AlertTriangle } from "lucide-react";
import { IngredientConflict } from "@/types/domain";
import { vi } from "@/config/locales/vi";
import { Checkbox } from "@/components/ui/checkbox";

interface ConflictWarningProps {
  conflicts: IngredientConflict[];
  acknowledged?: boolean;
  onAcknowledgeChange?: (value: boolean) => void;
}

/**
 * Ingredient-conflict warning panel. WARNING only — never blocks the user
 * (business rule 08). When onAcknowledgeChange is provided, shows the
 * acknowledge checkbox (cart/checkout); omitted on the product detail page.
 */
export function ConflictWarning({
  conflicts,
  acknowledged,
  onAcknowledgeChange,
}: ConflictWarningProps) {
  if (conflicts.length === 0) return null;

  return (
    <div className="bg-warning-soft border-warning/20 flex flex-col gap-2 rounded-xl border p-4">
      <div className="text-warning flex items-center gap-2 text-sm font-bold">
        <AlertTriangle className="h-4 w-4" />
        {vi.commerce.conflict.title}
      </div>
      <ul className="flex flex-col gap-1.5 text-xs text-slate-700">
        {conflicts.map((c, index) => (
          <li key={`${c.a}-${c.b}-${index}`} className="leading-relaxed">
            <span className="font-semibold">
              {c.productA} × {c.productB}:
            </span>{" "}
            {c.reason}
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-slate-500">{vi.commerce.conflict.note}</p>
      {onAcknowledgeChange && (
        <label className="mt-1 flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-700">
          <Checkbox
            checked={acknowledged}
            onCheckedChange={(value) => onAcknowledgeChange(value === true)}
          />
          {vi.commerce.conflict.acknowledge}
        </label>
      )}
    </div>
  );
}
