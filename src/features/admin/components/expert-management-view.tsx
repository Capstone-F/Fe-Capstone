"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  UserPlus,
  Building2,
  Stethoscope,
  KeyRound,
  Mail,
  User,
  Copy,
  Check,
  Search,
  ExternalLink,
  Loader2,
  Zap,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";

import {
  useClinics,
  useAdminUsers,
  useCreateUser,
  useAdminQuickBook,
} from "@/features/admin/hooks/useAdminUsers";
import { useExperts } from "@/features/experts/hooks/useExperts";

const EXPERT_SPECIALTIES = [
  { value: "DERMATOLOGY", label: "Dermatology (Da Liễu Chung)" },
  { value: "ACNE_TREATMENT", label: "Acne Treatment (Điều Trị Mụn)" },
  { value: "LASER_THERAPY", label: "Laser Therapy (Trị Liệu Laser)" },
  { value: "COSMETIC_DERMATOLOGY", label: "Cosmetic Dermatology (Thẩm Mỹ Da)" },
  { value: "ANTI_AGING", label: "Anti-Aging (Chống Lão Hóa)" },
  { value: "PIGMENTATION", label: "Pigmentation (Trị Nám / Tàn Nhanh)" },
];

export function ExpertManagementView() {
  const [isCreateExpertOpen, setIsCreateExpertOpen] = useState(false);
  const [isQuickBookOpen, setIsQuickBookOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State: Create Expert
  const [emailPrefix, setEmailPrefix] = useState("");
  const [emailDomain, setEmailDomain] = useState("@glowscan.com");
  const [fullName, setFullName] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState("password123");
  const [selectedClinicId, setSelectedClinicId] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("DERMATOLOGY");

  // Form State: Quick Book Cheat
  const defaultDateStr = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    return tomorrow.toISOString().slice(0, 16);
  };
  const [quickExpertId, setQuickExpertId] = useState("");
  const [quickScheduledAt, setQuickScheduledAt] = useState(defaultDateStr());
  const [quickReason, setQuickReason] = useState(
    "Khảo sát da OSNT - Khám tư vấn mụn nhọt & phác đồ điều trị",
  );

  // Queries & Mutations
  const { data: clinics = [], isLoading: isLoadingClinics } = useClinics();
  const { data: users = [], isLoading: isLoadingUsers } = useAdminUsers({
    role: "expert",
  });
  const { data: expertsData } = useExperts({ limit: 50 });
  const expertsList = expertsData?.data || [];

  const createUserMutation = useCreateUser();
  const quickBookMutation = useAdminQuickBook();

  // Handlers: Create Expert
  const handleOpenCreateExpertModal = () => {
    setIsCreateExpertOpen(true);
    setEmailPrefix("");
    setFullName("");
    setTemporaryPassword("password123");
    if (clinics.length > 0) {
      setSelectedClinicId(clinics[0].id);
    }
  };

  const handleCreateExpert = (e: React.FormEvent) => {
    e.preventDefault();

    let fullEmail = emailPrefix.trim();
    if (!fullEmail) {
      toast.error("Vui lòng nhập tên tài khoản Email.");
      return;
    }
    if (!fullEmail.includes("@")) {
      fullEmail = `${fullEmail}${emailDomain}`;
    }

    if (!fullName.trim()) {
      toast.error("Vui lòng nhập Họ & Tên Bác sĩ.");
      return;
    }

    if (!temporaryPassword.trim()) {
      toast.error("Vui lòng nhập Mật khẩu tạm thời.");
      return;
    }

    createUserMutation.mutate(
      {
        email: fullEmail,
        name: fullName.trim(),
        role: "expert",
        clinicId: selectedClinicId || undefined,
        temporaryPassword,
      },
      {
        onSuccess: (newUser) => {
          toast.success(`Tạo tài khoản Bác sĩ ${newUser.name} thành công! 🎉`);
          setIsCreateExpertOpen(false);
        },
        onError: (err: unknown) => {
          const msg =
            (err as Error)?.message || "Không thể tạo tài khoản Bác sĩ.";
          toast.error(msg);
        },
      },
    );
  };

  // Handlers: Quick Book Cheat
  const handleOpenQuickBookModal = () => {
    setIsQuickBookOpen(true);
    if (expertsList.length > 0) {
      setQuickExpertId(expertsList[0].id);
    }
  };

  const handleExecuteQuickBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickExpertId) {
      toast.error("Vui lòng chọn Bác sĩ phụ trách.");
      return;
    }

    const isoDate = new Date(quickScheduledAt).toISOString();

    quickBookMutation.mutate(
      {
        expertId: quickExpertId,
        scheduledAt: isoDate,
        reason: quickReason,
      },
      {
        onSuccess: () => {
          toast.success(
            "⚡ Tạo Ca Hẹn Cheat Thành Công! Ca hẹn ở trạng thái PENDING.",
            {
              action: {
                label: "Mở Workspace Bác Sĩ (/expert)",
                onClick: () => window.open("/expert", "_blank"),
              },
            },
          );
          setIsQuickBookOpen(false);
        },
        onError: (err: unknown) => {
          const msg = (err as Error)?.message || "Không thể tạo ca hẹn cheat.";
          toast.error(msg);
        },
      },
    );
  };

  const handleCopyCredentials = (email: string, id: string) => {
    const text = `Tài khoản Bác sĩ:\nEmail: ${email}\nMật khẩu: ${temporaryPassword}`;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Đã sao chép thông tin đăng nhập!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered list
  const filteredUsers = users.filter((u) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* ── Header Welcome ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Quản Lý & Tạo Tài Khoản Bác Sĩ (Expert Portal)
          </h2>
          <p className="text-sm text-slate-500">
            Tạo tài khoản Bác sĩ mới, tạo ca hẹn Cheat 1-Click để test luồng
            Chấp Nhận Lịch Hẹn nhanh chóng.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Book Cheat Button */}
          <Button
            onClick={handleOpenQuickBookModal}
            className="rounded-xl bg-amber-500 text-xs font-bold text-white shadow-xs hover:bg-amber-600"
          >
            <Zap className="mr-1.5 h-4 w-4 fill-white" />⚡ Tạo Ca Hẹn Cheat
            (1-Click)
          </Button>

          <Link href="/expert" target="_blank">
            <Button
              variant="outline"
              className="rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <ExternalLink className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
              Mở /expert
            </Button>
          </Link>

          <Button
            onClick={handleOpenCreateExpertModal}
            className="rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
          >
            <UserPlus className="mr-1.5 h-4 w-4" />➕ Tạo Bác Sĩ Mới
          </Button>
        </div>
      </div>

      {/* ── Top Stats Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">
              Tổng số Bác sĩ
            </p>
            <p className="text-2xl font-bold text-slate-900">{users.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">
              Phòng khám hợp tác
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {clinics.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Công cụ Test</p>
            <p className="text-sm font-bold text-amber-600">
              Quick Book Cheat Sẵn Sàng
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Area ── */}
      <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-heading text-base font-bold text-slate-900">
            Danh Sách Tài Khoản Bác Sĩ
          </h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Tìm theo tên, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-xl border-slate-200 pl-9 text-xs"
            />
          </div>
        </div>

        {isLoadingUsers ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-center text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            <p className="text-xs font-semibold">
              Đang nạp danh sách tài khoản Bác sĩ...
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-400">
            <User className="h-8 w-8 text-slate-300" />
            <p className="text-xs font-semibold">
              Chưa có tài khoản Bác sĩ nào được tạo.
            </p>
            <Button
              size="sm"
              onClick={handleOpenCreateExpertModal}
              className="mt-2 rounded-xl bg-emerald-600 text-xs font-bold text-white"
            >
              ➕ Tạo Bác Sĩ Đầu Tiên
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 font-bold text-slate-700">
                <tr>
                  <th className="px-4 py-3">Họ và Tên Bác Sĩ</th>
                  <th className="px-4 py-3">Email Đăng Nhập</th>
                  <th className="px-4 py-3">Vai Trò</th>
                  <th className="px-4 py-3">Phòng Khám Phân Công</th>
                  <th className="px-4 py-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {filteredUsers.map((u) => {
                  const assignedClinic = clinics.find(
                    (c) => c.id === u.clinicId,
                  );

                  return (
                    <tr
                      key={u.id}
                      className="transition-colors hover:bg-slate-50/60"
                    >
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {u.name}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-700">
                        {u.email}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className="border-emerald-200 bg-emerald-50 text-[10px] font-bold text-emerald-800"
                        >
                          Expert / Bác Sĩ
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {assignedClinic ? (
                          <span className="font-medium text-slate-800">
                            {assignedClinic.name}
                          </span>
                        ) : (
                          <span className="text-slate-400">Chưa gán</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopyCredentials(u.email, u.id)}
                          className="rounded-lg text-xs text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          {copiedId === u.id ? (
                            <>
                              <Check className="mr-1 h-3.5 w-3.5 text-emerald-600" />
                              Đã Copy
                            </>
                          ) : (
                            <>
                              <Copy className="mr-1 h-3.5 w-3.5" />
                              Copy Acc
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal Dialog 1: Tạo Tài Khoản Bác Sĩ Mới ── */}
      <Dialog open={isCreateExpertOpen} onOpenChange={setIsCreateExpertOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              ➕ Tạo Tài Khoản Bác Sĩ Mới (Create Expert Account)
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Nhập thông tin tài khoản cho Bác sĩ. Mật khẩu tạm thời sẽ được
              dùng để đăng nhập tại `/login`.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateExpert} className="space-y-4 py-2">
            {/* Email Field with Auto Domain */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Email Đăng Nhập <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-1">
                <div className="relative flex-1">
                  <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="VD: dr.nguyen"
                    value={emailPrefix}
                    onChange={(e) => setEmailPrefix(e.target.value)}
                    className="rounded-xl border-slate-200 pl-9 text-xs"
                    required
                  />
                </div>
                <select
                  value={emailDomain}
                  onChange={(e) => setEmailDomain(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="@glowscan.com">@glowscan.com</option>
                  <option value="@glowscan.vn">@glowscan.vn</option>
                  <option value="@gmail.com">@gmail.com</option>
                </select>
              </div>
              <p className="text-[11px] text-slate-400">
                Tài khoản đầy đủ:{" "}
                <span className="font-mono text-emerald-700">
                  {emailPrefix.includes("@")
                    ? emailPrefix
                    : `${emailPrefix || "username"}${emailDomain}`}
                </span>
              </p>
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Họ và Tên Bác Sĩ <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  placeholder="VD: BS. Nguyễn Văn An"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="rounded-xl border-slate-200 pl-9 text-xs"
                  required
                />
              </div>
            </div>

            {/* Temporary Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Mật Khẩu Tạm Thời <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <KeyRound className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  value={temporaryPassword}
                  onChange={(e) => setTemporaryPassword(e.target.value)}
                  className="rounded-xl border-slate-200 pl-9 font-mono text-xs"
                  required
                />
              </div>
            </div>

            {/* Specialty */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Chuyên Khoa Da Liễu
              </label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none"
              >
                {EXPERT_SPECIALTIES.map((spec) => (
                  <option key={spec.value} value={spec.value}>
                    {spec.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Clinic Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Phòng Khám Phân Công
              </label>
              {isLoadingClinics ? (
                <p className="text-xs text-slate-400">Đang nạp phòng khám...</p>
              ) : (
                <select
                  value={selectedClinicId}
                  onChange={(e) => setSelectedClinicId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none"
                >
                  <option value="">
                    -- Không phân công (Hoặc chọn phòng khám) --
                  </option>
                  {clinics.map((clinic) => (
                    <option key={clinic.id} value={clinic.id}>
                      {clinic.name} ({clinic.address})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsCreateExpertOpen(false)}
                className="rounded-xl text-xs font-medium text-slate-500"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createUserMutation.isPending}
                className="rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
              >
                {createUserMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Tạo Tài Khoản Bác Sĩ"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Modal Dialog 2: ⚡ Tạo Ca Hẹn Cheat (Quick Booking Cheat) ── */}
      <Dialog open={isQuickBookOpen} onOpenChange={setIsQuickBookOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-amber-900">
              <Zap className="h-5 w-5 fill-amber-500 text-amber-500" />⚡ Tạo Ca
              Hẹn Cheat 1-Click (Admin Quick Book)
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Tạo nhanh ca hẹn ở trạng thái{" "}
              <strong className="text-amber-700">PENDING</strong> gán cho Bác sĩ
              để test ngay nút Chấp Nhận Lịch Hẹn tại `/expert`.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleExecuteQuickBook} className="space-y-4 py-2">
            {/* Select Expert */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Chọn Bác Sĩ Phụ Trách <span className="text-red-500">*</span>
              </label>
              <select
                value={quickExpertId}
                onChange={(e) => setQuickExpertId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none"
                required
              >
                {expertsList.map((exp) => (
                  <option key={exp.id} value={exp.id}>
                    {exp.name} ({exp.specialization || "Da liễu"}) -{" "}
                    {exp.clinic?.name || "GlowScan Clinic"}
                  </option>
                ))}
              </select>
            </div>

            {/* Scheduled Date/Time */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Thời Gian Ca Hẹn (Scheduled At){" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="datetime-local"
                  value={quickScheduledAt}
                  onChange={(e) => setQuickScheduledAt(e.target.value)}
                  className="rounded-xl border-slate-200 pl-9 text-xs"
                  required
                />
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Lý Do / Triệu Chứng Tư Vấn
              </label>
              <div className="relative">
                <MessageSquare className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  value={quickReason}
                  onChange={(e) => setQuickReason(e.target.value)}
                  className="rounded-xl border-slate-200 pl-9 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsQuickBookOpen(false)}
                className="rounded-xl text-xs font-medium text-slate-500"
              >
                Đóng
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={quickBookMutation.isPending}
                className="rounded-xl bg-amber-500 text-xs font-bold text-white shadow-xs hover:bg-amber-600"
              >
                {quickBookMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Zap className="mr-1.5 h-3.5 w-3.5 fill-white" />⚡ Tạo Ca
                    Hẹn Ngay
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
