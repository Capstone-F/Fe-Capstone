"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Truck,
  PackageCheck,
  RefreshCw,
  Eye,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  Building2,
  Send,
  Package,
  MapPin,
  XCircle,
} from "lucide-react";
import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { formatVnd } from "@/shared/utils/format";
import { StaffPageHeader } from "@/features/staff/components/staff-page-header";
import { CancelOrderStaffModal } from "@/features/admin/cancellations/components/cancel-order-staff-modal";
import {
  useAdminDeliveries,
  useConfirmHandover,
  useCreateGhnOrder,
  useAdvanceDelivery,
} from "../hooks/useAdminDeliveries";
import type { DeliveryItem } from "../api/deliveries-admin.api";

// Map internal Delivery Status to Vietnamese
const deliveryStatusLabels: Record<string, { label: string; class: string }> = {
  PENDING: {
    label: "Chờ xử lý",
    class: "bg-[#E2EBE6] text-[#2C3E35] border border-[#2C3E35]/20 font-bold",
  },
  PROCESSING: {
    label: "Đang chuẩn bị hàng",
    class: "bg-blue-100 text-blue-900 border border-blue-200 font-bold",
  },
  SHIPPED: {
    label: "Đang vận chuyển",
    class: "bg-purple-100 text-purple-900 border border-purple-200 font-bold",
  },
  IN_TRANSIT: {
    label: "Đang vận chuyển",
    class: "bg-purple-100 text-purple-900 border border-purple-200 font-bold",
  },
  DELIVERED: {
    label: "Giao thành công",
    class: "bg-emerald-600 text-white font-bold shadow-xs",
  },
  FAILED: {
    label: "Giao thất bại",
    class: "bg-rose-100 text-rose-800 border border-rose-200 font-bold",
  },
  CANCELLED: {
    label: "Đã hủy giao",
    class: "bg-slate-100 text-slate-600 border border-slate-200",
  },
  RETURNING: {
    label: "Đang chuyển hoàn",
    class: "bg-amber-100 text-amber-900 border border-amber-200 font-bold",
  },
  RETURNED: {
    label: "Đã chuyển hoàn",
    class: "bg-orange-100 text-orange-900 border border-orange-200 font-bold",
  },
};

// Map raw GHN Provider Status string to Vietnamese
const ghnStatusLabels: Record<string, string> = {
  ready_to_pick: "Chờ tài xế GHN lấy hàng",
  pending: "Chờ xác nhận đơn",
  picking: "Tài xế đang lấy hàng",
  picked: "GHN đã lấy kiện hàng",
  storing: "Đã nhập kho GHN",
  transporting: "Đang vận chuyển liên tỉnh",
  sorting: "Đang phân loại tại bưu cục",
  delivering: "Tài xế đang giao hàng",
  delivered: "Giao thành công",
  delivery_fail: "Giao không thành công",
  waiting_to_return: "Chờ chuyển hoàn",
  return: "Đang chuyển hoàn kho",
  return_transporting: "Đang vận chuyển hàng hoàn",
  return_sorting: "Đang phân loại hàng hoàn",
  returning: "Đang giao hàng về kho",
  return_fail: "Chuyển hoàn thất bại",
  returned: "Đã chuyển hoàn kho",
  cancel: "Đã hủy vận chuyển",
};

export interface OrderItemDetail {
  id: string;
  orderItemId?: string;
  productVariantId?: string;
  productName?: string;
  sku?: string;
  quantity: number;
  unitPriceVnd: number;
  lineTotalVnd?: number;
  imageUrl?: string;
}

export interface OrderDetailData {
  id: string;
  code?: string;
  status: string;
  totalVnd?: number;
  totalAmountVnd?: number;
  subtotalVnd?: number;
  shippingFeeVnd?: number;
  items?: OrderItemDetail[];
  recipientName?: string;
  recipientPhone?: string;
  streetAddress?: string;
}

export function StaffDeliveriesView() {
  const [filterTab, setFilterTab] = useState<"AWAITING" | "SHIPPED" | "ALL">(
    "AWAITING",
  );
  const [detailDelivery, setDetailDelivery] = useState<DeliveryItem | null>(
    null,
  );

  // Handover modal state (TC-STF-09)
  const [handoverModalDelivery, setHandoverModalDelivery] =
    useState<DeliveryItem | null>(null);
  const [handoverNote, setHandoverNote] = useState("Giao tại dock A");

  // Staff order cancel modal state
  const [cancelModalOrderId, setCancelModalOrderId] = useState<string | null>(
    null,
  );

  const { data, isLoading, refetch, isRefetching } = useAdminDeliveries();
  const handoverMutation = useConfirmHandover();
  const createGhnMutation = useCreateGhnOrder();
  const advanceMutation = useAdvanceDelivery();

  const allDeliveries = React.useMemo(() => data?.items || [], [data]);

  // Compute item counts for each tab filter
  const tabCounts = React.useMemo(() => {
    const awaiting = allDeliveries.filter(
      (item) =>
        !item.handedOverAt &&
        item.status !== "CANCELLED" &&
        item.status !== "RETURNED" &&
        item.status !== "DELIVERED",
    ).length;

    const shipped = allDeliveries.filter(
      (item) =>
        item.status === "SHIPPED" ||
        item.status === "IN_TRANSIT" ||
        (Boolean(item.handedOverAt) &&
          item.status !== "DELIVERED" &&
          item.status !== "CANCELLED" &&
          item.status !== "RETURNED"),
    ).length;

    return {
      AWAITING: awaiting,
      SHIPPED: shipped,
      ALL: allDeliveries.length,
    };
  }, [allDeliveries]);

  // Filter deliveries reactively based on active tab
  const deliveries = React.useMemo(() => {
    switch (filterTab) {
      case "AWAITING":
        return allDeliveries.filter(
          (item) =>
            !item.handedOverAt &&
            item.status !== "CANCELLED" &&
            item.status !== "RETURNED" &&
            item.status !== "DELIVERED",
        );
      case "SHIPPED":
        return allDeliveries.filter(
          (item) =>
            item.status === "SHIPPED" ||
            item.status === "IN_TRANSIT" ||
            (Boolean(item.handedOverAt) &&
              item.status !== "DELIVERED" &&
              item.status !== "CANCELLED" &&
              item.status !== "RETURNED"),
        );
      case "ALL":
      default:
        return allDeliveries;
    }
  }, [allDeliveries, filterTab]);

  const handleHandoverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverModalDelivery) return;

    handoverMutation.mutate(
      {
        orderId: handoverModalDelivery.orderId,
        note: handoverNote.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success(
            `Đã xác nhận bàn giao kiện hàng cho GHN thành công! Đơn chuyển sang Đang vận chuyển.`,
          );
          setHandoverModalDelivery(null);
          setDetailDelivery(null);
        },
        onError: (err: unknown) => {
          const status = (err as { response?: { status?: number } })?.response
            ?.status;
          if (status === 409) {
            toast.error("Đơn hàng này đã được bàn giao trước đó!");
          } else {
            const msg =
              (err as { response?: { data?: { message?: string } } })?.response
                ?.data?.message || "Không thể xác nhận bàn giao";
            toast.error(msg);
          }
        },
      },
    );
  };

  const handleCreateGhnOrder = (deliveryId: string) => {
    createGhnMutation.mutate(deliveryId, {
      onSuccess: (res) => {
        if (res.data.created) {
          toast.success(
            `Khởi tạo vận đơn GHN thành công! Mã vận đơn: ${res.data.delivery.providerOrderCode}`,
          );
        } else {
          toast.info("Đã có mã vận đơn GHN từ trước.");
        }
        if (detailDelivery?.id === deliveryId) {
          setDetailDelivery(res.data.delivery);
        }
      },
      onError: (err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Không thể tạo đơn GHN";
        toast.error(msg);
      },
    });
  };

  const handleAdvanceDelivery = (deliveryId: string, steps = 10) => {
    advanceMutation.mutate(
      { deliveryId, steps },
      {
        onSuccess: (res) => {
          const newStatus = res.data.delivery.status;
          const statusText =
            deliveryStatusLabels[newStatus]?.label || newStatus;
          toast.success(
            `Đã đẩy tiến trình giao hàng! Trạng thái mới: ${statusText}`,
          );
          if (detailDelivery?.id === deliveryId) {
            setDetailDelivery(res.data.delivery);
          }
        },
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Không thể đẩy tiến trình giao hàng";
          toast.error(msg);
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <StaffPageHeader
        icon={Truck}
        title="Bàn Giao Hàng Cho GHN & Quản Lý Vận Đơn"
        description="Quản lý hàng chờ giao carrier GHN, xác nhận bàn giao tại kho và theo dõi lộ trình vận chuyển hàng hóa."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching}
              className="rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300"
            >
              <RefreshCw
                className={`mr-1.5 h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`}
              />
              Làm Mới
            </Button>
          </div>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2 dark:border-slate-800">
        {[
          {
            key: "AWAITING",
            label: "Chờ Bàn Giao GHN",
            icon: PackageCheck,
            count: tabCounts.AWAITING,
          },
          {
            key: "SHIPPED",
            label: "Đang Vận Chuyển",
            icon: Truck,
            count: tabCounts.SHIPPED,
          },
          {
            key: "ALL",
            label: "Tất Cả Đơn Giao Hàng",
            icon: RotateCw,
            count: tabCounts.ALL,
          },
        ].map((tab) => {
          const isActive = filterTab === tab.key;
          const IconComp = tab.icon;
          return (
            <Button
              key={tab.key}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                setFilterTab(tab.key as "AWAITING" | "SHIPPED" | "ALL")
              }
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                isActive
                  ? "bg-[#2C3E35] text-white shadow-xs hover:bg-[#3A5246]"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              <IconComp className="mr-1.5 h-3.5 w-3.5" />
              {tab.label}
              <span
                className={`ml-1.5 rounded-full px-2 py-0.5 text-[10px] ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                }`}
              >
                {tab.count}
              </span>
            </Button>
          );
        })}
      </div>

      {/* Deliveries Table */}
      <Card className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-xs text-slate-500">
              <Loader2 className="mb-2 h-6 w-6 animate-spin text-[#2C3E35]" />
              Đang tải hàng chờ bàn giao...
            </div>
          ) : deliveries.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-12 text-center text-xs text-slate-500">
              <Truck className="h-10 w-10 text-slate-300" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Không có đơn hàng giao nào ở mục này
              </span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold text-slate-400 uppercase dark:border-slate-800 dark:bg-slate-800/40">
                    <th className="p-4">Mã Vận Đơn</th>
                    <th className="p-4">Mã Đơn Hàng</th>
                    <th className="p-4">Mã Vận Đơn GHN</th>
                    <th className="p-4">Trạng Thái Giao Hàng</th>
                    <th className="p-4">Bàn Giao Kho</th>
                    <th className="p-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {deliveries.map((item) => {
                    const isHandedOver = Boolean(item.handedOverAt);
                    const isMissingGhn = !item.providerOrderCode;
                    const statusInfo = deliveryStatusLabels[item.status] || {
                      label: item.status,
                      class: "bg-slate-100 text-slate-700",
                    };
                    const providerText = item.providerStatus
                      ? ghnStatusLabels[item.providerStatus] ||
                        item.providerStatus
                      : null;

                    return (
                      <tr
                        key={item.id}
                        className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                      >
                        <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                          #{item.id.slice(0, 8).toUpperCase()}
                        </td>

                        <td className="p-4 font-mono text-slate-700 dark:text-slate-300">
                          #{item.orderId.slice(0, 8).toUpperCase()}
                        </td>

                        <td className="p-4 font-mono font-semibold">
                          {item.providerOrderCode ? (
                            <span className="font-bold text-emerald-700 dark:text-emerald-400">
                              {item.providerOrderCode}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-bold text-rose-600">
                              <AlertTriangle className="h-3.5 w-3.5" /> Chưa tạo
                              mã GHN
                            </span>
                          )}
                        </td>

                        <td className="p-4">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] ${statusInfo.class}`}
                          >
                            {statusInfo.label}
                            {providerText ? ` (${providerText})` : ""}
                          </span>
                        </td>

                        <td className="p-4">
                          {isHandedOver ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Đã bàn giao (
                              {new Date(item.handedOverAt!).toLocaleTimeString(
                                "vi-VN",
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                              )
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                              Chờ bàn giao kho
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isMissingGhn && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCreateGhnOrder(item.id)}
                                disabled={createGhnMutation.isPending}
                                className="h-8 rounded-xl border-rose-200 bg-rose-50 text-xs font-bold text-rose-700 hover:bg-rose-100"
                              >
                                <Send className="mr-1 h-3.5 w-3.5" /> Tạo Đơn
                                GHN
                              </Button>
                            )}

                            {!isHandedOver && item.providerOrderCode && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setHandoverModalDelivery(item);
                                  setHandoverNote("Giao tại dock A");
                                }}
                                className="h-8 rounded-xl bg-[#2C3E35] text-xs font-bold text-white hover:bg-[#3A5246]"
                              >
                                <PackageCheck className="mr-1 h-3.5 w-3.5" />{" "}
                                Bàn Giao GHN
                              </Button>
                            )}

                            {isHandedOver && item.status !== "DELIVERED" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleAdvanceDelivery(item.id, 10)
                                }
                                disabled={advanceMutation.isPending}
                                className="h-8 rounded-xl border-blue-200 text-xs font-bold text-blue-700 hover:bg-blue-50"
                              >
                                <Play className="mr-1 h-3.5 w-3.5" /> Đẩy Đã
                                Giao Hàng
                              </Button>
                            )}

                            {item.status !== "DELIVERED" &&
                              item.status !== "CANCELLED" &&
                              item.status !== "RETURNED" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    setCancelModalOrderId(item.orderId)
                                  }
                                  className="h-8 rounded-xl border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                >
                                  <XCircle className="mr-1 h-3.5 w-3.5" /> Hủy
                                  đơn
                                </Button>
                              )}

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDetailDelivery(item)}
                              className="h-8 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                            >
                              <Eye className="mr-1 h-3.5 w-3.5" /> Xem chi tiết
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Handover Confirmation Modal (TC-STF-09) */}
      {handoverModalDelivery && (
        <Dialog
          open={Boolean(handoverModalDelivery)}
          onOpenChange={(open) => !open && setHandoverModalDelivery(null)}
        >
          <DialogContent className="w-full max-w-md rounded-3xl p-6 shadow-2xl">
            <DialogHeader className="border-b border-slate-100 pr-8 pb-4 dark:border-slate-800">
              <DialogTitle className="flex items-center gap-2 text-base font-bold text-[#2C3E35] dark:text-emerald-400">
                <PackageCheck className="h-5 w-5 shrink-0 text-[#2C3E35] dark:text-emerald-400" />
                <span>Xác Nhận Bàn Giao Kiện Hàng Cho GHN</span>
              </DialogTitle>
              <DialogDescription className="pt-1 text-xs text-slate-500">
                Xác nhận đã giao kiện hàng cho đối tác vận chuyển GHN. Đơn hàng
                sẽ chuyển sang trạng thái Đang vận chuyển.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={handleHandoverSubmit}
              className="flex flex-col gap-4 py-2"
            >
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs dark:border-slate-800 dark:bg-slate-900">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500">Mã đơn hàng:</span>
                    <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      #{handoverModalDelivery.orderId.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Mã vận đơn GHN:</span>
                    <p className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {handoverModalDelivery.providerOrderCode || "Chưa tạo"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="ho-note"
                  className="text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Ghi chú bàn giao (Ghi chú dock / tài xế nhận hàng) *:
                </Label>
                <Input
                  id="ho-note"
                  required
                  placeholder="VD: Giao tại dock A, tài xế Nguyễn Văn A..."
                  value={handoverNote}
                  onChange={(e) => setHandoverNote(e.target.value)}
                  className="rounded-xl text-xs"
                />
              </div>

              <DialogFooter className="flex-row items-center justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setHandoverModalDelivery(null)}
                  className="rounded-xl text-xs font-semibold"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={handoverMutation.isPending}
                  className="rounded-xl bg-[#2C3E35] px-5 text-xs font-bold text-white hover:bg-[#3A5246]"
                >
                  {handoverMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Xác Nhận Bàn Giao"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Comprehensive Delivery Detail Modal with Items & Tracking */}
      {detailDelivery && (
        <DeliveryDetailModal
          delivery={detailDelivery}
          isOpen={Boolean(detailDelivery)}
          onClose={() => setDetailDelivery(null)}
          onCreateGhnOrder={() => handleCreateGhnOrder(detailDelivery.id)}
          onOpenHandover={() => {
            const target = detailDelivery;
            setDetailDelivery(null);
            setHandoverModalDelivery(target);
          }}
          onAdvance={() => handleAdvanceDelivery(detailDelivery.id, 10)}
          onCancelOrder={(orderId) => {
            setDetailDelivery(null);
            setCancelModalOrderId(orderId);
          }}
        />
      )}

      <CancelOrderStaffModal
        isOpen={cancelModalOrderId !== null}
        onClose={() => setCancelModalOrderId(null)}
        orderId={cancelModalOrderId || ""}
      />
    </div>
  );
}

interface DetailDeliveryModalProps {
  delivery: DeliveryItem;
  isOpen: boolean;
  onClose: () => void;
  onOpenHandover: () => void;
  onCreateGhnOrder: () => void;
  onAdvance: () => void;
  onCancelOrder: (orderId: string) => void;
}

function DeliveryDetailModal({
  delivery,
  isOpen,
  onClose,
  onCreateGhnOrder,
  onOpenHandover,
  onAdvance,
  onCancelOrder,
}: DetailDeliveryModalProps) {
  // Query Order Detail (hàng hóa trong đơn hàng)
  const { data: orderData, isLoading: isOrderLoading } = useQuery({
    queryKey: ["order-detail", delivery.orderId],
    queryFn: async (): Promise<OrderDetailData | null> => {
      try {
        const res = await apiClient.get<OrderDetailData>(
          API_ENDPOINTS.ORDERS.DETAIL(delivery.orderId),
        );
        return res.data;
      } catch {
        return null;
      }
    },
    enabled: Boolean(delivery.orderId),
  });

  const statusInfo = deliveryStatusLabels[delivery.status] || {
    label: delivery.status,
    class: "bg-slate-100 text-slate-700",
  };

  const providerText = delivery.providerStatus
    ? ghnStatusLabels[delivery.providerStatus] || delivery.providerStatus
    : "Chờ cập nhật";

  const carrierName = "GHN (Giao Hàng Nhanh)";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-2rem)] rounded-3xl p-4 shadow-2xl sm:max-w-2xl sm:p-6">
        <DialogHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex min-w-0 flex-wrap items-start justify-between gap-2 pr-8">
            <DialogTitle className="flex min-w-0 items-start gap-2 text-lg font-bold break-words text-[#2C3E35] dark:text-emerald-400">
              <Building2 className="h-5 w-5 text-[#2C3E35] dark:text-emerald-400" />
              Chi Tiết Vận Đơn Giao Hàng #
              {delivery.id.slice(0, 8).toUpperCase()}
            </DialogTitle>
            <Badge className={`text-xs ${statusInfo.class}`}>
              {statusInfo.label}
            </Badge>
          </div>
          <DialogDescription className="text-xs text-slate-500">
            Mã đơn hàng:{" "}
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              #{delivery.orderId}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2 text-xs">
          {/* Section 1: Thông tin vận chuyển */}
          <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
            <div>
              <span className="text-[11px] text-slate-500">
                Đơn vị vận chuyển:
              </span>
              <p className="font-bold text-slate-900 dark:text-white">
                {carrierName}
              </p>
            </div>

            <div>
              <span className="text-[11px] text-slate-500">
                Mã vận đơn GHN:
              </span>
              <p className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                {delivery.providerOrderCode || "Chưa tạo mã GHN"}
              </p>
            </div>

            <div>
              <span className="text-[11px] text-slate-500">
                Trạng thái lộ trình:
              </span>
              <p className="font-bold text-blue-800 dark:text-blue-300">
                {providerText}
              </p>
            </div>

            <div>
              <span className="text-[11px] text-slate-500">
                Bàn giao tại kho:
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {delivery.handedOverAt
                  ? `Đã bàn giao (${new Date(delivery.handedOverAt).toLocaleString("vi-VN")})`
                  : "Chưa bàn giao cho carrier"}
              </p>
            </div>

            {delivery.recipientName && (
              <div className="sm:col-span-2">
                <span className="text-[11px] text-slate-500">
                  Người nhận & Địa chỉ giao hàng:
                </span>
                <p className="font-bold text-slate-900 dark:text-white">
                  {delivery.recipientName}
                </p>
                <p className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  {delivery.streetAddress || "Đã lưu trên đơn hàng"}
                </p>
              </div>
            )}

            {delivery.handoverNote && (
              <div className="rounded-xl bg-amber-50 p-2.5 text-[11px] text-amber-900 sm:col-span-2 dark:bg-amber-950/30 dark:text-amber-300">
                <strong>Ghi chú bàn giao:</strong> {delivery.handoverNote}
              </div>
            )}
          </div>

          {/* Section 2: Danh sách hàng hóa trong đơn hàng (Xem chi tiết) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between border-b pb-2 dark:border-slate-800">
              <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                <Package className="h-4 w-4 text-[#2C3E35] dark:text-emerald-400" />
                Danh Sách Hàng Hóa Trong Đơn Hàng
              </span>
              {Boolean(orderData?.totalVnd || orderData?.totalAmountVnd) && (
                <span className="font-extrabold text-[#2C3E35] dark:text-emerald-400">
                  Tổng đơn:{" "}
                  {formatVnd(
                    (orderData?.totalVnd || orderData?.totalAmountVnd)!,
                  )}
                </span>
              )}
            </div>

            {isOrderLoading ? (
              <div className="flex items-center justify-center p-6 text-xs text-slate-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#2C3E35]" />
                Đang tải thông tin hàng hóa...
              </div>
            ) : orderData?.items && orderData.items.length > 0 ? (
              <div className="flex flex-col gap-2">
                {orderData.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex min-w-0 flex-col gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-2xs sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {item.imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={item.imageUrl}
                          alt={item.productName || "Sản phẩm"}
                          className="h-12 w-12 rounded-xl border border-slate-200/80 object-cover shadow-2xs dark:border-slate-800"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                          <Package className="h-6 w-6" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold break-words text-slate-900 dark:text-white">
                          {item.productName ||
                            `Biến thể #${item.productVariantId?.slice(0, 8)}`}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {item.sku ? (
                            <span className="mr-1.5 font-mono text-[10px] font-semibold text-slate-400">
                              [{item.sku}]
                            </span>
                          ) : null}
                          Số lượng:{" "}
                          <strong className="text-slate-800 dark:text-slate-200">
                            {item.quantity}
                          </strong>{" "}
                          x {formatVnd(item.unitPriceVnd)}
                        </p>
                      </div>
                    </div>

                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {formatVnd(
                        item.lineTotalVnd || item.quantity * item.unitPriceVnd,
                      )}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-slate-50 p-4 text-xs dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b pb-2 dark:border-slate-800">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Kiện Hàng Mỹ Phẩm GlowScan #
                    {delivery.orderId.slice(0, 8).toUpperCase()}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    Vận Đơn GHN Express
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1 text-[11px]">
                  <div>
                    <span className="text-slate-500">Người nhận hàng:</span>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {delivery.recipientName || "Khách hàng GlowScan"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Cước phí vận chuyển:</span>
                    <p className="font-bold text-emerald-700 dark:text-emerald-400">
                      {formatVnd(delivery.shippingFeeVnd || 0)}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500">Địa chỉ giao hàng:</span>
                    <p className="font-medium text-slate-800 dark:text-slate-200">
                      {delivery.streetAddress ||
                        "Địa chỉ nhận hàng theo đơn hàng"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Lịch sử sự kiện giao hàng (Tracking History) */}
          {delivery.statusEvents && delivery.statusEvents.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Lịch sử cập nhật trạng thái GHN:
              </span>
              <div className="flex max-h-36 flex-col gap-2 overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                {delivery.statusEvents.map((evt, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-[11px]"
                  >
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {ghnStatusLabels[evt.providerStatus] ||
                        evt.providerStatus}
                    </span>
                    <span className="text-slate-400">
                      {new Date(evt.occurredAt).toLocaleString("vi-VN")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons inside detail modal */}
          <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
            {!delivery.providerOrderCode && (
              <Button
                size="sm"
                onClick={onCreateGhnOrder}
                className="rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-700"
              >
                <Send className="mr-1.5 h-3.5 w-3.5" /> Tạo Đơn GHN
              </Button>
            )}

            {!delivery.handedOverAt && delivery.providerOrderCode && (
              <Button
                size="sm"
                onClick={onOpenHandover}
                className="rounded-xl bg-[#2C3E35] text-xs font-bold text-white hover:bg-[#3A5246]"
              >
                <PackageCheck className="mr-1.5 h-3.5 w-3.5" /> Bàn Giao Kiện
                Hàng ➔
              </Button>
            )}

            {delivery.handedOverAt && delivery.status !== "DELIVERED" && (
              <Button
                size="sm"
                onClick={onAdvance}
                className="rounded-xl bg-blue-600 text-xs font-bold text-white hover:bg-blue-700"
              >
                <Play className="mr-1.5 h-3.5 w-3.5" /> Đã vận chuyển
              </Button>
            )}

            {delivery.status !== "DELIVERED" &&
              delivery.status !== "CANCELLED" &&
              delivery.status !== "RETURNED" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCancelOrder?.(delivery.orderId)}
                  className="rounded-xl border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                >
                  <XCircle className="mr-1.5 h-3.5 w-3.5" /> Hủy Đơn Hàng
                </Button>
              )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
