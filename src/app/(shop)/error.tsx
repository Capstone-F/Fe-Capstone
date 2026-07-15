"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { vi } from "@/config/locales/vi";
import { Button } from "@/components/ui/button";

// Route-level error boundary for the shop routes.
export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const t = vi.common.error;

  return (
    <div className="text-muted-foreground mx-auto flex min-h-[50vh] w-full max-w-md flex-col items-center justify-center gap-3 p-12 text-center">
      <AlertTriangle className="h-12 w-12 text-slate-300" />
      <p className="font-bold text-slate-700">{t.title}</p>
      <p className="text-sm">{t.description}</p>
      <Button onClick={() => reset()} className="mt-2 rounded-lg text-sm">
        {t.retry}
      </Button>
    </div>
  );
}
