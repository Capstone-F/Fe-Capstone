import { Check } from "lucide-react";
import { vi } from "@/config/locales/vi";
import { cn } from "@/lib/utils";

const STEPS = [
  vi.commerce.checkout.steps.review,
  vi.commerce.checkout.steps.address,
  vi.commerce.checkout.steps.payment,
  vi.commerce.checkout.steps.confirm,
  vi.commerce.checkout.steps.done,
];

/** 5-step progress header. `current` is 0-based. */
export function CheckoutStepper({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-between">
      {STEPS.map((label, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <div key={label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                  done && "bg-success text-success-foreground",
                  active && "bg-primary text-primary-foreground",
                  !done && !active && "bg-slate-100 text-slate-400",
                )}
              >
                {done ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-1 h-0.5 flex-1",
                  done ? "bg-success" : "bg-slate-100",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
