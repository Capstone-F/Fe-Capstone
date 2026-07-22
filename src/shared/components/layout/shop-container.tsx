import React from "react";

/**
 * Standard container wrapper used by shop sub-pages.
 * Replaces the container that was previously in (shop)/layout.tsx,
 * allowing the landing page at "/" to be full-width.
 */
export function ShopContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-6 lg:p-8">{children}</div>
  );
}
