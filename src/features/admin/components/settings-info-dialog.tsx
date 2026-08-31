"use client";

import type { ReactNode } from "react";
import { AlertTriangle, Info } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { humanizeWarning, resolveWarnings } from "../utils/warnings";

interface SettingsInfoDialogProps {
  title: string;
  warnings?: string[];
  children?: ReactNode;
}

export function SettingsInfoDialog({
  title,
  warnings,
  children,
}: SettingsInfoDialogProps) {
  const items = resolveWarnings(warnings).map(humanizeWarning);
  const hasWarnings = items.length > 0;

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className={cn(
              "relative rounded-full text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300",
              hasWarnings &&
                "text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300",
            )}
          />
        }
      >
        <Info className="h-4 w-4" />
        <span className="sr-only">{title}</span>
        {hasWarnings && (
          <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-amber-500" />
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 text-xs text-slate-600 dark:text-slate-300">
          {children}
          {hasWarnings && (
            <div className="flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50/70 p-3 dark:border-amber-900/40 dark:bg-amber-950/20">
              <p className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                <AlertTriangle className="h-3.5 w-3.5" /> Cảnh báo với cấu hình
                hiện tại
              </p>
              <ul className="list-disc space-y-1 pl-4 break-words text-amber-800 dark:text-amber-300">
                {items.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
