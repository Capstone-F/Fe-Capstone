"use client";

import React, { useState } from "react";
import {
  Building2,
  Plus,
  Search,
  Power,
  RefreshCw,
  Edit2,
  MapPin,
  Phone,
  Mail,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { toast } from "sonner";
import { DataTablePagination } from "@/shared/components/ui/data-table-pagination";

import {
  useAdminClinics,
  useCreateAdminClinic,
  useUpdateAdminClinic,
  useDeactivateAdminClinic,
} from "../hooks/useAdminClinics";

export interface Clinic {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function ClinicsManagementView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
  });

  const { data, isLoading, refetch, isRefetching } = useAdminClinics({
    q: searchTerm,
    activeOnly,
  });

  const createMutation = useCreateAdminClinic();
  const updateMutation = useUpdateAdminClinic();
  const deactivateMutation = useDeactivateAdminClinic();

  const openCreateModal = () => {
    setEditingClinic(null);
    setFormData({ name: "", address: "", phone: "", email: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (clinic: Clinic) => {
    setEditingClinic(clinic);
    setFormData({
      name: clinic.name || "",
      address: clinic.address || "",
      phone: clinic.phone || "",
      email: clinic.email || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClinic(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên phòng khám.");
      return;
    }

    if (editingClinic) {
      updateMutation.mutate({ id: editingClinic.id, body: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleToggleStatus = (clinic: Clinic) => {
    if (clinic.isActive) {
      deactivateMutation.mutate(clinic.id);
    } else {
      updateMutation.mutate({ id: clinic.id, body: { isActive: true } });
    }
  };

  const clinics = data?.items || [];
  const totalPages = Math.max(1, Math.ceil(clinics.length / PAGE_SIZE));
  const paginatedClinics = clinics.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Action Header */}
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E2EBE6] text-[#2C3E35] dark:bg-emerald-950 dark:text-emerald-400">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Quản lý Phòng Khám Đối Tác
            </h2>
            <p className="text-xs text-slate-500">
              Khai báo danh sách phòng khám liên kết, thiết lập địa chỉ và quản
              lý trạng thái hoạt động.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={openCreateModal}
            className="rounded-xl bg-[#2C3E35] px-4 text-xs font-bold text-white shadow-xs hover:bg-[#3A5246]"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Thêm Phòng Khám Mới
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Clinics Table — Search & Filter inside Card header */}
      <Card className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Embedded Search & Filter bar */}
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-800/40">
          <div className="relative w-full sm:w-72">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Tìm theo tên phòng khám..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-xl border-slate-200 pl-9 text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActiveOnly((prev) => !prev)}
              className={`rounded-full px-4 text-xs font-bold transition-all ${
                activeOnly
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 text-slate-600"
              }`}
            >
              {activeOnly ? "✓ Đang hoạt động" : "Tất cả phòng khám"}
            </Button>
          </div>
        </div>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-xs text-slate-500">
              <Loader2 className="mb-2 h-6 w-6 animate-spin text-[#2C3E35]" />
              Đang tải danh sách phòng khám...
            </div>
          ) : clinics.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-12 text-center text-xs text-slate-500">
              <Building2 className="h-10 w-10 text-slate-300" />
              <span className="text-sm font-bold text-slate-700">
                Chưa có phòng khám nào
              </span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 font-bold text-slate-700">
                      Tên Phòng Khám
                    </th>
                    <th className="px-4 py-3 font-bold text-slate-700">
                      Địa Chỉ
                    </th>
                    <th className="px-4 py-3 font-bold text-slate-700">
                      Liên Hệ
                    </th>
                    <th className="px-4 py-3 font-bold text-slate-700">
                      Trạng Thái
                    </th>
                    <th className="px-4 py-3 text-right font-bold text-slate-700">
                      Thao Tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedClinics.map((clinic) => (
                    <tr
                      key={clinic.id}
                      className={`transition-colors hover:bg-slate-50/70 ${
                        !clinic.isActive ? "bg-slate-50/50 opacity-70" : ""
                      }`}
                    >
                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        {clinic.name}
                      </td>

                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          <span>{clinic.address || "Chưa cập nhật"}</span>
                        </div>
                      </td>

                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        <div className="flex flex-col gap-0.5 text-[11px]">
                          {clinic.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-slate-400" />{" "}
                              {clinic.phone}
                            </span>
                          )}
                          {clinic.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3 text-slate-400" />{" "}
                              {clinic.email}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                            clinic.isActive
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {clinic.isActive ? (
                            <>
                              <CheckCircle className="h-3 w-3" /> Đang hoạt động
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3" /> Đã tạm ngừng
                            </>
                          )}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(clinic)}
                            className="h-8 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                          >
                            <Edit2 className="mr-1 h-3.5 w-3.5" /> Chỉnh sửa
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(clinic)}
                            className={`h-8 rounded-xl text-xs font-bold ${
                              clinic.isActive
                                ? "border-rose-200 text-rose-600 hover:bg-rose-50"
                                : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            }`}
                          >
                            <Power className="mr-1 h-3.5 w-3.5" />
                            {clinic.isActive ? "Tạm ngừng" : "Kích hoạt lại"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination */}
              <DataTablePagination
                page={page}
                totalPages={totalPages}
                totalItems={clinics.length}
                pageSize={PAGE_SIZE}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="max-w-md rounded-3xl p-6 shadow-2xl">
          <DialogHeader className="space-y-2 border-b border-slate-100 pb-4">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-[#2C3E35]">
              <Building2 className="h-5 w-5 text-[#2C3E35]" />
              {editingClinic ? "Chỉnh sửa Phòng Khám" : "Thêm Phòng Khám Mới"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Nhập đầy đủ thông tin phòng khám liên kết trong hệ thống.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="name"
                className="text-xs font-bold text-slate-700"
              >
                Tên Phòng Khám *:
              </Label>
              <Input
                id="name"
                required
                placeholder="VD: Phòng Khám Skin Care Quận 1"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="rounded-xl border-slate-200 text-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="address"
                className="text-xs font-bold text-slate-700"
              >
                Địa Chỉ:
              </Label>
              <Input
                id="address"
                placeholder="VD: 123 Nguyễn Thị Minh Khai, P.6, Q.3, TP.HCM"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="rounded-xl border-slate-200 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="phone"
                  className="text-xs font-bold text-slate-700"
                >
                  Số Điện Thoại:
                </Label>
                <Input
                  id="phone"
                  placeholder="0901234567"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="rounded-xl border-slate-200 text-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="email"
                  className="text-xs font-bold text-slate-700"
                >
                  Email:
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="clinic@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="rounded-xl border-slate-200 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 border-t border-slate-100 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                className="rounded-xl text-xs font-semibold"
              >
                Quay lại
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="rounded-xl bg-[#2C3E35] px-6 text-xs font-bold text-white hover:bg-[#3A5246]"
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingClinic ? (
                  "Lưu Thay Đổi"
                ) : (
                  "Tạo Phòng Khám"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
