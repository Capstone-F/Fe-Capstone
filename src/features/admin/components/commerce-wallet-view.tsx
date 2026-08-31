"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShoppingBag, Wallet, Search, PlusCircle, Loader2 } from "lucide-react";
import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import useDebounce from "@/shared/hooks/useDebounce";
import { useAdminUserDirectory } from "@/features/admin/hooks/useAdminUsers";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/components/ui/card";
import { formatVnd } from "@/shared/utils/format";
import { LowStockThresholdCard } from "./low-stock-threshold-card";
import { BookingSettingsCard } from "./booking-settings-card";
import { ClinicCommissionSettingsCard } from "./clinic-commission-settings-card";
import { ComboDiscountCard } from "./combo-discount-card";

interface CommerceWalletViewProps {
  initialCustomer?: {
    id: string;
    name: string;
    email: string;
  };
}

export function CommerceWalletView({
  initialCustomer,
}: CommerceWalletViewProps) {
  // Wallet Top-up & Inspector State
  const [customerQuery, setCustomerQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(initialCustomer ?? null);
  const [topUpAmount, setTopUpAmount] = useState<number>(50000);
  const [topUpReason, setTopUpReason] = useState("");

  const searchUserId = selectedCustomer?.id ?? "";
  const debouncedCustomerQuery = useDebounce(customerQuery.trim(), 350);

  // Admins know customers by name or email, never by UUID — so look the id up for them.
  const customerDirectory = useAdminUserDirectory({
    q: debouncedCustomerQuery || undefined,
    role: "customer",
    page: 1,
    limit: 8,
  });
  const customerResults = customerDirectory.data?.items ?? [];

  const {
    data: wallet,
    isLoading: isWalletLoading,
    refetch: refetchWallet,
  } = useQuery({
    queryKey: ["admin-wallet-inspect", searchUserId],
    queryFn: async () => {
      const res = await apiClient.get<{
        userId: string;
        balanceVnd: number;
        currency: string;
        status: string;
      }>(API_ENDPOINTS.ADMIN_WALLETS.DETAIL(searchUserId));
      return res.data;
    },
    enabled: Boolean(searchUserId),
  });

  const topUpMutation = useMutation({
    mutationFn: ({
      userId,
      amountVnd,
      reason,
    }: {
      userId: string;
      amountVnd: number;
      reason?: string;
    }) =>
      apiClient.post(API_ENDPOINTS.ADMIN_WALLETS.TOP_UP(userId), {
        amountVnd,
        reason,
      }),
    onSuccess: () => {
      toast.success(
        `Đã nạp thành công ${formatVnd(topUpAmount)} vào ví khách hàng!`,
      );
      refetchWallet();
      setTopUpReason("");
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Không thể nạp tiền vào ví";
      toast.error(msg);
    },
  });

  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchUserId) {
      toast.error("Vui lòng chọn khách hàng trước khi nạp.");
      return;
    }
    if (topUpAmount < 1000) {
      toast.error("Số tiền nạp tối thiểu là 1,000 VNĐ.");
      return;
    }

    topUpMutation.mutate({
      userId: searchUserId,
      amountVnd: topUpAmount,
      reason: topUpReason.trim() || undefined,
    });
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E2EBE6] text-[#2C3E35] dark:bg-emerald-950 dark:text-emerald-400">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Cấu Hình Thương Mại & Quản Lý Ví Khách Hàng
            </h2>
            <p className="text-xs text-slate-500">
              Điều chỉnh % ưu đãi Combo Routine AI và nạp tiền thủ công cho Ví
              GlowScan.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Card 1: Combo Discount Settings (Survey + Treatment) */}
        <div className="flex flex-col gap-6">
          <ComboDiscountCard
            kind="survey"
            title="Cấu Hình Ưu Đãi Combo AI Khảo Sát"
            description="Áp dụng tự động khi khách mua trọn bộ Combo từ gợi ý Routine AI."
          />
          <ComboDiscountCard
            kind="treatment"
            title="Cấu Hình Ưu Đãi Combo Treatment"
            description="Áp dụng tự động khi khách mua trọn bộ Combo liệu trình Treatment."
          />
        </div>

        <LowStockThresholdCard />

        <BookingSettingsCard />

        {/* Card 2: Wallet Top-Up & Inspector */}
        <Card className="rounded-3xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
            <CardTitle className="flex items-center gap-2 text-base font-bold text-[#2C3E35] dark:text-emerald-400">
              <Wallet className="h-5 w-5 text-[#2C3E35] dark:text-emerald-400" />
              Soi & Nạp Tiền Trực Tiếp Vào Ví Khách Hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5 pt-6">
            {/* Customer picker */}
            {selectedCustomer ? (
              <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-slate-900 dark:text-slate-100">
                    {selectedCustomer.name || "Chưa cập nhật tên"}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">
                    {selectedCustomer.email || "Chưa cập nhật email"}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCustomer(null);
                    setCustomerQuery("");
                  }}
                  className="shrink-0 rounded-xl text-xs font-semibold"
                >
                  Đổi khách hàng
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Tìm khách hàng theo tên hoặc email..."
                    value={customerQuery}
                    onChange={(e) => setCustomerQuery(e.target.value)}
                    className="rounded-xl border-slate-200 pl-8 text-xs"
                  />
                </div>

                {customerDirectory.isLoading ? (
                  <div className="flex items-center justify-center p-4 text-xs text-slate-500">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#2C3E35]" />
                    Đang tìm khách hàng...
                  </div>
                ) : customerResults.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
                    Không tìm thấy khách hàng phù hợp.
                  </p>
                ) : (
                  <ul className="max-h-56 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                    {customerResults.map((customer) => (
                      <li key={customer.id}>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedCustomer({
                              id: customer.id,
                              name: customer.name ?? "",
                              email: customer.email ?? "",
                            })
                          }
                          className="w-full px-3 py-2 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        >
                          <p className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
                            {customer.name || "Chưa cập nhật tên"}
                          </p>
                          <p className="truncate text-[11px] text-slate-500">
                            {customer.email || "Chưa cập nhật email"}
                          </p>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Wallet Info Result */}
            {isWalletLoading ? (
              <div className="flex items-center justify-center p-6 text-xs text-slate-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#2C3E35]" />{" "}
                Đang tải thông tin ví...
              </div>
            ) : wallet ? (
              <div className="flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                    Số dư Ví GlowScan:
                  </span>
                  <span className="text-lg font-extrabold text-[#2C3E35] dark:text-emerald-400">
                    {formatVnd(wallet.balanceVnd)}
                  </span>
                </div>

                {/* Top Up Form */}
                <form
                  onSubmit={handleTopUpSubmit}
                  className="flex flex-col gap-3 border-t border-emerald-200/80 pt-3"
                >
                  <div className="flex flex-col gap-1">
                    <Label
                      htmlFor="topUpAmount"
                      className="text-xs font-bold text-slate-700"
                    >
                      Số tiền cần nạp (VNĐ, tối thiểu 1,000đ):
                    </Label>
                    <Input
                      id="topUpAmount"
                      type="number"
                      min={1000}
                      value={topUpAmount}
                      onChange={(e) =>
                        setTopUpAmount(
                          Math.max(1000, parseInt(e.target.value, 10) || 1000),
                        )
                      }
                      className="rounded-xl border-slate-200 text-xs font-bold text-emerald-800"
                    />
                    <span className="text-[11px] font-semibold text-slate-500">
                      Thành tiền: {formatVnd(topUpAmount)}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label
                      htmlFor="topUpReason"
                      className="text-xs font-bold text-slate-700"
                    >
                      Lý do nạp tiền (Tùy chọn):
                    </Label>
                    <Input
                      id="topUpReason"
                      placeholder="VD: Đền bù voucher, hoàn tiền hỗ trợ..."
                      value={topUpReason}
                      onChange={(e) => setTopUpReason(e.target.value)}
                      className="rounded-xl border-slate-200 text-xs"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={topUpMutation.isPending}
                    className="mt-1 rounded-xl bg-emerald-700 text-xs font-bold text-white hover:bg-emerald-800"
                  >
                    {topUpMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <PlusCircle className="mr-1.5 h-4 w-4" /> Nạp Tiền Vào
                        Ví Khách Hàng
                      </>
                    )}
                  </Button>
                </form>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                Chọn một khách hàng ở trên để tra cứu ví và nạp tiền trực tiếp.
              </div>
            )}
          </CardContent>
        </Card>
        <ClinicCommissionSettingsCard />
      </div>
    </div>
  );
}
