"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Wrench, Loader2, Sparkles } from "lucide-react";
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
import { DemoCustomerSeeder } from "./demo-customer-seeder";

export function QaCheatsView() {
  const [customerId, setCustomerId] = useState("");
  const [baumannCode, setBaumannCode] = useState("OSNW");

  const updateSurveyMutation = useMutation({
    mutationFn: ({ id, code }: { id: string; code: string }) =>
      apiClient.patch(API_ENDPOINTS.ADMIN_QA_CHEATS.CUSTOMER_SURVEY(id), {
        baumannSkinType: code,
      }),
    onSuccess: () => {
      toast.success(
        `Đã cập nhật loại da QA (${baumannCode}) cho Khách hàng thành công!`,
      );
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Không thể cập nhật loại da QA";
      toast.error(msg);
    },
  });

  const handleUpdateSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId.trim()) {
      toast.error("Vui lòng nhập Customer / User ID.");
      return;
    }
    updateSurveyMutation.mutate({
      id: customerId.trim(),
      code: baumannCode.trim().toUpperCase(),
    });
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
            <Wrench className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Bảng Công Cụ Phím Tắt QA & Kiểm Thử Hệ Thống (QA Cheats)
            </h2>
            <p className="text-xs text-slate-500">
              Chuẩn bị dữ liệu live demo và thay đổi nhanh trạng thái khách hàng
              để kiểm thử các luồng sản phẩm, routine và ví.
            </p>
          </div>
        </div>
      </div>

      <DemoCustomerSeeder />

      <div className="max-w-2xl">
        <Card className="rounded-3xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
            <CardTitle className="flex items-center gap-2 text-base font-bold text-purple-900 dark:text-purple-300">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Ghi Đè Nhanh Loại Da Baumann (Cheat Skin Type)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleUpdateSurvey} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="customerId"
                  className="text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Customer / User ID (UUID) *:
                </Label>
                <Input
                  id="customerId"
                  required
                  placeholder="Nhập ID tài khoản khách hàng..."
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="rounded-xl border-slate-200 font-mono text-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="baumannCode"
                  className="text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Mã Loại Da Baumann mong muốn (16 loại da, VD: OSNW, DSPT,
                  OSPW...):
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="baumannCode"
                    required
                    placeholder="OSNW"
                    value={baumannCode}
                    onChange={(e) =>
                      setBaumannCode(e.target.value.toUpperCase())
                    }
                    className="rounded-xl border-slate-200 font-mono text-xs font-bold text-purple-800 uppercase"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {[
                    "OSNW",
                    "OSNT",
                    "OSPW",
                    "OSPT",
                    "ORNT",
                    "DSNW",
                    "DSPT",
                    "DRNW",
                  ].map((code) => (
                    <Button
                      key={code}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setBaumannCode(code)}
                      className={`h-7 rounded-full text-[10px] font-bold ${
                        baumannCode === code
                          ? "border-purple-600 bg-purple-600 text-white"
                          : "border-slate-200 text-slate-600"
                      }`}
                    >
                      {code}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="pt-3">
                <Button
                  type="submit"
                  disabled={updateSurveyMutation.isPending}
                  className="w-full rounded-xl bg-purple-700 text-xs font-bold text-white hover:bg-purple-800"
                >
                  {updateSurveyMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Ghi Đè Loại Da Nhanh Cho Khách Hàng"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
