import { ShopNavbar } from "@/components/shop-navbar";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <ShopNavbar />
      <div className="flex flex-1 flex-col bg-slate-50/50 p-4 md:p-6 lg:p-8">
        {children}
      </div>
    </div>
  );
}
