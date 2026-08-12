"use client";

import React, { useState } from "react";
import { Wallet, Search, Loader2, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { formatVnd } from "@/shared/utils/format";
import { useAdminWalletInspector } from "../hooks/useCancellations";

interface WalletInspectorModalProps {
  initialUserId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function WalletInspectorModal({
  initialUserId = "",
  isOpen,
  onClose,
}: WalletInspectorModalProps) {
  const [userId, setUserId] = useState(initialUserId);
  const [queryUserId, setQueryUserId] = useState(initialUserId);

  const {
    data: wallet,
    isLoading,
    isError,
    refetch,
  } = useAdminWalletInspector(queryUserId, Boolean(queryUserId));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQueryUserId(userId.trim());
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-3xl p-6 shadow-2xl">
        <DialogHeader className="space-y-2 border-b border-slate-100 pb-4 dark:border-slate-800">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-[#2C3E35] dark:text-emerald-400">
            <Wallet className="h-5 w-5 text-[#2C3E35] dark:text-emerald-400" />
            Tra cứu Ví Khách hàng (Wallet Inspector)
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Kiểm tra số dư và tiền hoàn lại trong ví GlowScan của khách hàng.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSearch} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="userId"
              className="text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              Mã người dùng (User ID):
            </Label>
            <div className="flex gap-2">
              <Input
                id="userId"
                placeholder="Nhập User ID khách hàng (UUID)..."
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="rounded-xl border-slate-200 text-xs"
              />
              <Button
                type="submit"
                size="sm"
                className="rounded-xl bg-[#2C3E35] px-4 text-xs font-bold text-white hover:bg-[#3A5246]"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-8 text-xs text-slate-500">
              <Loader2 className="mb-2 h-6 w-6 animate-spin text-[#2C3E35]" />
              Đang tải dữ liệu ví...
            </div>
          ) : isError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center text-xs font-semibold text-rose-600">
              Không tìm thấy thông tin ví hoặc mã User ID không hợp lệ.
            </div>
          ) : wallet ? (
            <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  Số dư Ví GlowScan:
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => refetch()}
                  className="h-7 px-2 text-[10px] font-bold text-emerald-800 hover:bg-emerald-100"
                >
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Làm mới
                </Button>
              </div>

              <div className="text-2xl font-extrabold text-[#2C3E35] dark:text-emerald-400">
                {formatVnd(wallet.balanceVnd)}
              </div>

              <div className="flex flex-col gap-1 border-t border-emerald-200/80 pt-3 text-[11px] text-slate-600 dark:text-slate-400">
                <div>
                  <strong>Trạng thái ví:</strong>{" "}
                  <span className="font-bold text-emerald-700 uppercase">
                    {wallet.status}
                  </span>
                </div>
                <div className="truncate">
                  <strong>User ID:</strong> {wallet.userId}
                </div>
              </div>
            </div>
          ) : null}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full rounded-xl text-xs font-semibold sm:w-auto"
            >
              Đóng
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
