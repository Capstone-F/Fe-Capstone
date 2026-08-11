"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  Clock,
  Headphones,
  MessageSquare,
  PackagePlus,
  ShieldCheck,
} from "lucide-react";
import { buttonVariants } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { useStockImportForms } from "@/features/stock/hooks/useStock";
import { useSupportSessions } from "@/features/support/hooks/useSupport";

export default function StaffDashboardPage() {
  const { data: stockData } = useStockImportForms({ limit: 10 });
  const { data: supportData } = useSupportSessions({ limit: 10 });

  const pendingDraftCount =
    stockData?.items?.filter((i) => i.status === "DRAFT").length || 0;
  const submittedCount =
    stockData?.items?.filter((i) => i.status === "SUBMITTED").length || 0;
  const openChatCount =
    supportData?.items?.filter((i) => i.status === "OPEN").length || 0;
  const activeChatCount =
    supportData?.items?.filter((i) => i.status === "ACTIVE").length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Bảng điều khiển Vận hành & Hỗ trợ Nhân viên
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Hệ thống quản lý phiếu nhập kho e-commerce và tổng đài chat hỗ trợ
          khách hàng 1-1.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-xs font-semibold uppercase">
              Phiên Chat Chờ Tiếp Nhận
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {openChatCount}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              Khách hàng đang chờ nhận tư vấn
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-xs font-semibold uppercase">
              Phiên Chat Đang Hỗ Trợ
            </CardTitle>
            <Headphones className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {activeChatCount}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              Đang trò chuyện 1-1 với khách
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-xs font-semibold uppercase">
              Phiếu Nhập Chờ Duyệt
            </CardTitle>
            <Boxes className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {submittedCount}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              Phiếu ở trạng thái Chờ duyệt
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-xs font-semibold uppercase">
              Phiếu Nháp Đang Tạo
            </CardTitle>
            <ShieldCheck className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {pendingDraftCount}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              Phiếu ở trạng thái Bản nháp
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Shortcuts */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="flex flex-col justify-between border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <Boxes className="h-5 w-5 text-emerald-600" />
              Phiếu Nhập Kho
            </CardTitle>
            <p className="text-muted-foreground text-xs">
              Tạo bản nháp, trình duyệt, xác nhận cộng kho thực tế hoặc hủy/từ
              chối phiếu nhập.
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <Link
              href="/staff/stock-imports"
              className={buttonVariants({
                className:
                  "w-full gap-2 bg-emerald-600 text-white hover:bg-emerald-700",
              })}
            >
              Quản lý kho hàng <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Tổng Đài Support Chat 1-1
            </CardTitle>
            <p className="text-muted-foreground text-xs">
              Tiếp nhận phiên hỗ trợ khách hàng, giải đáp thắc mắc đơn hàng và
              sản phẩm.
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <Link
              href="/staff/support-chat"
              className={buttonVariants({
                className:
                  "w-full gap-2 bg-blue-600 text-white hover:bg-blue-700",
              })}
            >
              Mở tổng đài Support <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <PackagePlus className="h-5 w-5 text-purple-600" />
              Onboard Sản Phẩm Mới
            </CardTitle>
            <p className="text-muted-foreground text-xs">
              Khai báo SKU sản phẩm mới, cập nhật hình ảnh biến thể và danh mục
              thành phần mỹ phẩm.
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <Link
              href="/staff/catalog"
              className={buttonVariants({
                variant: "outline",
                className: "w-full gap-2",
              })}
            >
              Onboard SKU mới <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
