"use client";

import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function ProductsStubPage() {
  return (
    <div className="mx-auto flex min-h-[400px] w-full max-w-md items-center justify-center">
      <Card className="border-slate-200 p-6 text-center shadow-sm">
        <CardHeader className="flex flex-col items-center justify-center">
          <div className="bg-primary/10 text-primary mb-3 flex h-12 w-12 items-center justify-center rounded-2xl">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <CardTitle className="text-lg font-bold text-slate-900">
            Cửa hàng Sản phẩm
          </CardTitle>
          <CardDescription className="text-xs">
            Trình quản lý danh mục và cơ sở dữ liệu hoạt chất
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground flex flex-col gap-4 text-xs leading-relaxed">
          <p>
            Tính năng Cửa hàng Sản phẩm thông minh, giỏ hàng trực tuyến và hệ
            thống thanh toán đơn hàng e-commerce dự kiến sẽ được phát triển đầy
            đủ ở **Build Phase 2**.
          </p>
          <div className="flex justify-center gap-2">
            <Link href="/scan">
              <Button size="sm" className="rounded-lg text-xs font-semibold">
                Khảo sát da & Xem phác đồ
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
