"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ShoppingBag,
  UserCircle2,
  LogOut,
  Scan,
  ArrowLeft,
  CalendarDays,
  Wallet,
} from "lucide-react";
import { useSession } from "@/features/auth/hooks/useSession";
import { useCart } from "@/features/commerce/hooks/useCart";
import { CartConflictIndicator } from "@/features/commerce/components/cart-conflict-indicator";
import { authApi } from "@/features/auth/api/auth.api";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { BrandMark } from "@/shared/components/brand-mark";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const session = useSession();
  const { data: cart, conflicts } = useCart();
  const queryClient = useQueryClient();

  const cartCount =
    cart?.lines?.reduce((sum, line) => sum + line.quantity, 0) ?? 0;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore
    } finally {
      queryClient.setQueryData(queryKeys.session, null);
      queryClient.removeQueries({ queryKey: queryKeys.profile });
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      window.location.href = "/";
    }
  };

  const user = session.data;

  const navLinks = [
    {
      label: "Shop",
      href: "/products",
      active:
        pathname.startsWith("/products") ||
        pathname.startsWith("/cart") ||
        pathname.startsWith("/checkout") ||
        pathname.startsWith("/orders"),
    },
    {
      label: "Chăm sóc",
      href: "/care",
      active:
        pathname.startsWith("/care") ||
        pathname.startsWith("/treatment") ||
        pathname.startsWith("/scan") ||
        pathname.startsWith("/survey"),
    },
    {
      label: "Chuyên gia",
      href: "/experts",
      requiresAuth: true,
      active:
        pathname.startsWith("/experts") || pathname.startsWith("/booking"),
    },
    {
      label: "Phòng khám",
      href: "/clinics",
      requiresAuth: true,
      active: pathname.startsWith("/clinics"),
    },
  ];

  // Helper to get mobile header configuration
  const getMobileHeaderConfig = (path: string) => {
    const topLevels = [
      "/",
      "/products",
      "/care",
      "/experts",
      "/clinics",
      "/profile",
    ];
    if (topLevels.includes(path)) {
      return null;
    }

    if (path === "/clinics") {
      return { title: "Phòng khám đối tác", backHref: "/" };
    }
    if (path.startsWith("/clinics/")) {
      return { title: "Chi tiết phòng khám", backHref: "/clinics" };
    }
    if (path === "/cart") {
      return { title: "Giỏ hàng", backHref: "/products" };
    }
    if (path === "/checkout") {
      return { title: "Thanh toán", backHref: "/cart" };
    }
    if (path.startsWith("/products/")) {
      return { title: "Chi tiết sản phẩm", backHref: "/products" };
    }
    if (path === "/orders") {
      return { title: "Đơn hàng của tôi", backHref: "/profile" };
    }
    if (path.startsWith("/orders/")) {
      return { title: "Chi tiết đơn hàng", backHref: "/orders" };
    }
    if (path === "/survey") {
      return { title: "Khảo sát da AI", backHref: "/" };
    }
    if (path.startsWith("/scan")) {
      return { title: "Quét da AI", backHref: "/" };
    }
    if (path.startsWith("/booking")) {
      return { title: "Đặt lịch chuyên gia", backHref: "/experts" };
    }
    if (path.startsWith("/experts/")) {
      return { title: "Thông tin chuyên gia", backHref: "/experts" };
    }
    if (path === "/login") {
      return { title: "Đăng nhập", backHref: "/" };
    }
    if (path === "/signup") {
      return { title: "Đăng ký", backHref: "/login" };
    }
    if (path === "/complete-profile") {
      return { title: "Hoàn thiện hồ sơ", backHref: "/" };
    }

    return null;
  };

  const mobileHeader = getMobileHeaderConfig(pathname);

  const handleBack = () => {
    if (mobileHeader) {
      if (typeof window !== "undefined" && window.history.length > 1) {
        router.back();
      } else {
        router.push(mobileHeader.backHref);
      }
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? "border-b border-slate-200/80 bg-white/90 shadow-xs backdrop-blur-md"
          : "border-b border-slate-100 bg-white/80 backdrop-blur-xs"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile Custom Header or Standard Logo */}
        {mobileHeader ? (
          <>
            {/* Mobile layout for nested/action pages */}
            <div className="flex w-full items-center justify-between md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-9 w-9 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-base font-bold text-slate-800">
                {mobileHeader.title}
              </h1>
              {/* Optional Right Spacer/Cart badge */}
              <Link href="/cart" className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                >
                  <ShoppingBag className="h-4.5 w-4.5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#2C3E35] text-[10px] font-bold text-white shadow-xs">
                      {cartCount}
                    </span>
                  )}
                </Button>
                <CartConflictIndicator
                  conflicts={conflicts}
                  lines={cart?.lines ?? []}
                  className="absolute -right-1 -bottom-1"
                />
              </Link>
            </div>

            {/* Desktop Brand Logo fallback */}
            <BrandMark className="hidden md:flex" />
          </>
        ) : (
          <BrandMark />
        )}

        {/* Desktop Main Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={
                link.requiresAuth && !session.isLoading && !user
                  ? `/login?redirectTo=${encodeURIComponent(link.href)}`
                  : link.href
              }
              className={`text-sm font-semibold transition-colors duration-200 ${
                link.active
                  ? "text-[#2C3E35] underline decoration-[#2C3E35] decoration-2 underline-offset-8"
                  : "text-slate-600 hover:text-[#2C3E35]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Utilities & Contextual CTA - Hidden on mobile if custom header is shown */}
        <div
          className={`items-center gap-3 ${mobileHeader ? "hidden md:flex" : "flex"}`}
        >
          {/* Quick Search Button */}
          {/* <Link href="/products">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              title="Tìm kiếm"
            >
              <Search className="h-4.5 w-4.5" />
            </Button>
          </Link> */}

          {/* Cart Badge */}
          <Link href="/cart" className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              title="Giỏ hàng"
            >
              <ShoppingBag className="h-4.5 w-4.5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#2C3E35] text-[10px] font-bold text-white shadow-xs">
                  {cartCount}
                </span>
              )}
            </Button>
            <CartConflictIndicator
              conflicts={conflicts}
              lines={cart?.lines ?? []}
              className="absolute -right-1 -bottom-1"
            />
          </Link>

          {/* Account Menu / Login Button */}
          {session.isLoading ? (
            <Skeleton className="h-9 w-22 rounded-xl" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 text-xs font-semibold text-slate-800 hover:bg-slate-100"
                  />
                }
              >
                <UserCircle2 className="h-4.5 w-4.5 text-[#2C3E35]" />
                <span className="hidden max-w-28 truncate sm:inline">
                  {user.name ?? user.email ?? "Tài khoản"}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs font-bold text-slate-800">
                    {user.name ?? user.email ?? "Tài khoản"}
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href="/profile" />}>
                  <UserCircle2 className="mr-2 h-4 w-4" />
                  Hồ sơ cá nhân
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/profile?tab=wallet" />}>
                  <Wallet className="mr-2 h-4 w-4" />
                  Ví GlowScan
                </DropdownMenuItem>
                <DropdownMenuItem
                  render={<Link href="/profile?tab=appointments" />}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Lịch hẹn của tôi
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/orders" />}>
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Đơn hàng của tôi
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-xl border-slate-300 text-xs font-bold text-[#2C3E35] hover:bg-slate-50"
              >
                Đăng nhập
              </Button>
            </Link>
          )}

          {/* Contextual CTA: Quét Da AI */}
          <Link href="/scan" className="hidden sm:inline-block">
            <Button
              size="sm"
              className="h-9 rounded-xl bg-[#2C3E35] px-4 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#3A5246] active:scale-95"
            >
              <Scan className="mr-1.5 h-3.5 w-3.5" />
              Quét da AI
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
