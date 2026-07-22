"use client";

import * as React from "react";
import { Check, Palette } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/shared/components/ui/dropdown-menu";

const THEMES = [
  {
    id: "default",
    name: "Xanh đại dương (Mặc định)",
    color: "bg-[oklch(0.53_0.105_205)]",
    className: "",
  },
  {
    id: "theme-emerald",
    name: "Xanh ngọc lục bảo",
    color: "bg-[oklch(0.627_0.194_149.214)]",
    className: "theme-emerald",
  },
  {
    id: "theme-orange",
    name: "Cam hoàng hôn",
    color: "bg-[oklch(0.612_0.17_28.59)]",
    className: "theme-orange",
  },
  {
    id: "theme-violet",
    name: "Tím cẩm chạch",
    color: "bg-[oklch(0.505_0.213_275.12)]",
    className: "theme-violet",
  },
  {
    id: "theme-rose",
    name: "Hồng nhạt",
    color: "bg-[oklch(0.645_0.2_3.5)]",
    className: "theme-rose",
  },
];

export function ThemeSwitcher() {
  const [activeTheme, setActiveTheme] = React.useState<string>("default");

  const changeTheme = React.useCallback(
    (themeId: string, saveToStorage: boolean = true) => {
      if (typeof window === "undefined") return;

      const html = document.documentElement;

      // Remove all previous themes
      THEMES.forEach((t) => {
        if (t.className) {
          html.classList.remove(t.className);
        }
      });

      // Add active theme
      const selected = THEMES.find((t) => t.id === themeId);
      if (selected && selected.className) {
        html.classList.add(selected.className);
      }

      setActiveTheme(themeId);
      if (saveToStorage) {
        localStorage.setItem("admin-theme", themeId);
      }
    },
    [],
  );

  // Load saved theme on mount
  React.useEffect(() => {
    const savedTheme = localStorage.getItem("admin-theme");
    if (savedTheme) {
      const timer = setTimeout(() => changeTheme(savedTheme, false), 0); // false to avoid redundant saves
      return () => clearTimeout(timer);
    }
  }, [changeTheme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground border-input bg-background/50 inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium whitespace-nowrap shadow-xs backdrop-blur transition-colors focus-visible:ring-1 focus-visible:outline-none">
        <Palette className="h-4 w-4" />
        <span className="hidden sm:inline">{"Đổi giao diện"}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{"Chọn màu chủ đạo"}</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {THEMES.map((theme) => (
          <DropdownMenuItem
            key={theme.id}
            onClick={() => changeTheme(theme.id)}
            className="flex cursor-pointer items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span
                className={`h-4 w-4 rounded-full ${theme.color} border border-black/10`}
              />
              <span>{theme.name}</span>
            </div>
            {activeTheme === theme.id && (
              <Check className="text-primary h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
