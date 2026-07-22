"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, HeartPulse, Scan, Stethoscope, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Shop",
      href: "/products",
      icon: ShoppingBag,
      active: pathname.startsWith("/products") || pathname === "/",
    },
    {
      label: "Chăm sóc",
      href: "/care",
      icon: HeartPulse,
      active: pathname.startsWith("/care") || pathname.startsWith("/treatment"),
    },
    {
      label: "Quét da",
      href: "/scan",
      icon: Scan,
      isPrimary: true,
      active: pathname.startsWith("/scan"),
    },
    {
      label: "Chuyên gia",
      href: "/experts",
      icon: Stethoscope,
      active:
        pathname.startsWith("/experts") || pathname.startsWith("/booking"),
    },
    {
      label: "Hồ sơ",
      href: "/profile",
      icon: User,
      active: pathname.startsWith("/profile") || pathname.startsWith("/orders"),
    },
  ];

  return (
    <div className="fixed right-0 bottom-0 left-0 z-50 flex h-16 items-center justify-around border-t border-slate-200 bg-white/95 px-2 backdrop-blur-md md:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        if (item.isPrimary) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group relative -top-3 flex flex-col items-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2C3E35] text-white shadow-md transition-transform active:scale-95">
                <Icon className="h-6 w-6" />
              </div>
              <span className="mt-0.5 text-[10px] font-bold text-[#2C3E35]">
                {item.label}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center py-1 transition-colors",
              item.active
                ? "text-[#2C3E35]"
                : "text-slate-400 hover:text-slate-600",
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="mt-1 text-[10px] font-semibold">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
