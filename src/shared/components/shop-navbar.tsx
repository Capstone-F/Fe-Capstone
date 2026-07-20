"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ClipboardList,
  LogOut,
  ShoppingCart,
  Sparkles,
  UserCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/features/commerce/hooks/use-cart";
import { useMergeGuestCartOnLogin } from "@/features/commerce/hooks/use-merge-guest-cart-on-login";
import { useSession } from "@/features/auth/hooks/use-session";
import { logout, startLogin } from "@/features/auth/api/auth-client";
import { queryKeys } from "@/lib/query/keys";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { vi } from "@/config/locales/vi";

export function ShopNavbar() {
  const { data: cart } = useCart();
  const session = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const itemCount = cart?.itemCount ?? 0;
  const n = vi.commerce.nav;

  // Merge a guest cart into the server cart when the user logs in.
  useMergeGuestCartOnLogin();

  function handleLogin() {
    // Return to the current page after Keycloak login.
    void startLogin({ redirectTo: pathname });
  }

  function handleLogout() {
    startTransition(async () => {
      try {
        await logout();
      } catch {
        // Ignore errors if session already cleared
      } finally {
        queryClient.invalidateQueries({ queryKey: queryKeys.session });
        queryClient.invalidateQueries({ queryKey: queryKeys.cart });
        router.refresh();
      }
    });
  }

  const user = session.data;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 md:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900">
            Glow<span className="text-primary">Scan</span>
          </span>
        </Link>

        <nav className="flex items-center gap-5">
          <Link
            href="/products"
            className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
          >
            {n.products}
          </Link>
          <Link
            href="/orders"
            className="text-muted-foreground hover:text-primary flex items-center gap-1.5 text-sm font-medium transition-colors"
          >
            <ClipboardList className="h-4 w-4" />
            {n.orders}
          </Link>
          <Link
            href="/cart"
            className="text-muted-foreground hover:text-primary relative flex items-center gap-1.5 text-sm font-medium transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
            {n.cart}
            {itemCount > 0 && (
              <Badge className="absolute -top-2 -right-3 h-4 min-w-4 justify-center px-1 text-[10px]">
                {itemCount}
              </Badge>
            )}
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1.5"
                  />
                }
              >
                <UserCircle2 className="h-4 w-4" />
                <span className="max-w-32 truncate">
                  {user.name ?? user.email ?? n.account}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {user.name ?? user.email ?? n.account}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href="/orders" />}>
                  {n.orders}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} disabled={isPending}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {n.logout}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              size="sm"
              onClick={handleLogin}
              disabled={session.isLoading}
            >
              {n.login}
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
