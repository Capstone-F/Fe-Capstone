"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { vi } from "@/config/locales/vi";
import { Button } from "@/shared/components/ui/button";

// Route-level error boundary for the user portal.
export default function UserPortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error to the console for debugging.
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
