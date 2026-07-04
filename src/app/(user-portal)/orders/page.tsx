"use client";

import Link from "next/link";
import { ClipboardList, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function OrdersStubPage() {
  return (
    <div className="mx-auto flex min-h-[400px] w-full max-w-md items-center justify-center">
      <Card className="border-slate-200 p-6 text-center shadow-sm">
        <CardHeader className="flex flex-col items-center justify-center">
          <div className="bg-primary/10 text-primary mb-3 flex h-12 w-12 items-center justify-center rounded-2xl">
            <ClipboardList className="h-6 w-6" />
          </div>
          <CardTitle className="text-lg font-bold text-slate-900">
            Đơn hàng sản phẩm
          </CardTitle>
          <CardDescription className="text-xs">
            Theo dõi tình trạng giao hàng & mã bưu vận
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground flex flex-col gap-4 text-xs leading-relaxed">
          <p>
            Tính năng Quản lý đơn hàng sản phẩm skincare, liên kết hãng vận
            chuyển (GHTK, GHN) và tra cứu lộ trình bưu phẩm dự kiến sẽ được phát
            triển đầy đủ ở **Build Phase 2**.
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
