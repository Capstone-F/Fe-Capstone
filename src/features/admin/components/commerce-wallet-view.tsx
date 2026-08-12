"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ShoppingBag,
  Wallet,
  Percent,
  Search,
  PlusCircle,
  Loader2,
} from "lucide-react";
import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/components/ui/card";
import { formatVnd } from "@/shared/utils/format";

export function CommerceWalletView() {
  const queryClient = useQueryClient();

  // Combo Discount Settings State
  const { data: comboSettings, isLoading: isComboLoading } = useQuery({
    queryKey: ["admin-combo-discount"],
    queryFn: async () => {
      const res = await apiClient.get<{
        percent: number;
        minSubtotalVnd: number;
      }>(API_ENDPOINTS.ADMIN_COMMERCE.COMBO_DISCOUNT);
      return res.data;
    },
  });

  const [comboForm, setComboForm] = useState({
    percent: 10,
    minSubtotalVnd: 0,
  });

  React.useEffect(() => {
    if (comboSettings) {
      queueMicrotask(() => {
        setComboForm({
          percent: comboSettings.percent ?? 10,
          minSubtotalVnd: comboSettings.minSubtotalVnd ?? 0,
        });
      });
    }
  }, [comboSettings]);

  const updateComboMutation = useMutation({
    mutationFn: (body: typeof comboForm) =>
      apiClient.patch(API_ENDPOINTS.ADMIN_COMMERCE.COMBO_DISCOUNT, body),
    onSuccess: () => {
      toast.success("Đã cập nhật cấu hình ưu đãi Combo AI Khảo sát!");
      queryClient.invalidateQueries({ queryKey: ["admin-combo-discount"] });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Không thể cập nhật cấu hình ưu đãi";
      toast.error(msg);
    },
  });

  // Wallet Top-up & Inspector State
  const [userIdInput, setUserIdInput] = useState("");
  const [searchUserId, setSearchUserId] = useState("");
  const [topUpAmount, setTopUpAmount] = useState<number>(50000);
  const [topUpReason, setTopUpReason] = useState("");

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

  const handleSearchWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userIdInput.trim()) {
      toast.error("Vui lòng nhập User ID khách hàng.");
      return;
    }
    setSearchUserId(userIdInput.trim());
  };

  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchUserId) {
      toast.error("Vui lòng tra cứu ví người dùng trước khi nạp.");
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
        {/* Card 1: Combo Discount Settings */}
        <Card className="rounded-3xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
            <CardTitle className="flex items-center gap-2 text-base font-bold text-[#2C3E35] dark:text-emerald-400">
              <Percent className="h-5 w-5 text-[#2C3E35] dark:text-emerald-400" />
              Cấu Hình Ưu Đãi Combo AI Khảo Sát
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {isComboLoading ? (
              <div className="flex items-center justify-center p-8 text-xs text-slate-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin text-[#2C3E35]" />{" "}
                Đang tải cấu hình...
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateComboMutation.mutate(comboForm);
                }}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="percent"
                    className="text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    Phần trăm giảm giá (%):
                  </Label>
                  <Input
                    id="percent"
                    type="number"
                    min={0}
                    max={100}
                    value={comboForm.percent}
                    onChange={(e) =>
                      setComboForm({
                        ...comboForm,
                        percent: Math.min(
                          100,
                          Math.max(0, parseInt(e.target.value, 10) || 0),
                        ),
                      })
                    }
                    className="rounded-xl border-slate-200 text-xs"
                  />
                  <span className="text-[11px] text-slate-400">
                    Áp dụng tự động khi khách mua trọn bộ Combo từ gợi ý Routine
                    AI.
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="minSubtotalVnd"
                    className="text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    Giá trị đơn tối thiểu (VNĐ):
                  </Label>
                  <Input
                    id="minSubtotalVnd"
                    type="number"
                    min={0}
                    value={comboForm.minSubtotalVnd}
                    onChange={(e) =>
                      setComboForm({
                        ...comboForm,
                        minSubtotalVnd: Math.max(
                          0,
                          parseInt(e.target.value, 10) || 0,
                        ),
                      })
                    }
                    className="rounded-xl border-slate-200 text-xs"
                  />
                  <span className="text-[11px] font-semibold text-slate-500">
                    Xem trước: {formatVnd(comboForm.minSubtotalVnd)}
                  </span>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={updateComboMutation.isPending}
                    className="w-full rounded-xl bg-[#2C3E35] text-xs font-bold text-white hover:bg-[#3A5246]"
                  >
                    {updateComboMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Lưu Cấu Hình Combo AI"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Card 2: Wallet Top-Up & Inspector */}
        <Card className="rounded-3xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
            <CardTitle className="flex items-center gap-2 text-base font-bold text-[#2C3E35] dark:text-emerald-400">
              <Wallet className="h-5 w-5 text-[#2C3E35] dark:text-emerald-400" />
              Soi & Nạp Tiền Trực Tiếp Vào Ví Khách Hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5 pt-6">
            {/* Search User Wallet */}
            <form onSubmit={handleSearchWallet} className="flex gap-2">
              <Input
                placeholder="Nhập User ID khách hàng (UUID)..."
                value={userIdInput}
                onChange={(e) => setUserIdInput(e.target.value)}
                className="flex-1 rounded-xl border-slate-200 text-xs"
              />
              <Button
                type="submit"
                size="sm"
                className="rounded-xl bg-[#2C3E35] px-4 text-xs font-bold text-white hover:bg-[#3A5246]"
              >
                <Search className="mr-1 h-3.5 w-3.5" /> Tra cứu
              </Button>
            </form>

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
                Nhập User ID của khách hàng để tra cứu ví và nạp tiền trực tiếp.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
