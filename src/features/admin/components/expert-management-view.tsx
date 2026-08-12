"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
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
  UserCheck,
  MoreHorizontal,
  Pencil,
  DollarSign,
  Hospital,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { DataTablePagination } from "@/shared/components/ui/data-table-pagination";

import {
  useClinics,
  useAdminUsers,
  useCreateExpert,
  useAdminQuickBook,
} from "@/features/admin/hooks/useAdminUsers";
import { useExperts } from "@/features/experts/hooks/useExperts";
import { FormController } from "@/shared/components/form/form-controller";
import {
  CurrencyInput,
  parseVndInput,
} from "@/shared/components/form/currency-input";
import { formatVnd } from "@/shared/utils/format";
import {
  createExpertSchema,
  quickBookSchema,
  type CreateExpertValues,
  type QuickBookValues,
} from "@/features/admin/schemas/admin-forms.schema";

const EXPERT_SPECIALTIES = [
  { value: "DERMATOLOGY", label: "Dermatology (Da Liễu Chung)" },
  { value: "ACNE_TREATMENT", label: "Acne Treatment (Điều Trị Mụn)" },
  { value: "LASER_THERAPY", label: "Laser Therapy (Trị Liệu Laser)" },
  { value: "COSMETIC_DERMATOLOGY", label: "Cosmetic Dermatology (Thẩm Mỹ Da)" },
  { value: "ANTI_AGING", label: "Anti-Aging (Chống Lão Hóa)" },
  { value: "PIGMENTATION", label: "Pigmentation (Trị Nám / Tàn Nhanh)" },
];
const DEFAULT_EXPERT_PASSWORD = "password123";

function defaultDateStr() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  return tomorrow.toISOString().slice(0, 16);
}

interface ExpertUser {
  id: string;
  name?: string | null;
  email?: string | null;
  clinicId?: string | null;
  isActive?: boolean;
  roles?: string[];
}

export function ExpertManagementView() {
  const [isCreateExpertOpen, setIsCreateExpertOpen] = useState(false);
  const [isQuickBookOpen, setIsQuickBookOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // Edit Modals State
  const [editFeeExpert, setEditFeeExpert] = useState<ExpertUser | null>(null);
  const [editFeeValue, setEditFeeValue] = useState("");
  const [editClinicExpert, setEditClinicExpert] = useState<ExpertUser | null>(
    null,
  );
  const [editClinicValue, setEditClinicValue] = useState("");

  const createExpertForm = useForm<CreateExpertValues>({
    resolver: zodResolver(createExpertSchema),
    defaultValues: {
      emailPrefix: "",
      emailDomain: "@glowscan.com",
      fullName: "",
      temporaryPassword: DEFAULT_EXPERT_PASSWORD,
      clinicId: "",
      specialization: "DERMATOLOGY",
      consultationFee: "300000",
    },
  });
  const quickBookForm = useForm<QuickBookValues>({
    resolver: zodResolver(quickBookSchema),
    defaultValues: {
      expertId: "",
      scheduledAt: defaultDateStr(),
      reason: "Khảo sát da OSNT - Khám tư vấn mụn nhọt & phác đồ điều trị",
    },
  });
  const emailPrefix = useWatch({
    control: createExpertForm.control,
    name: "emailPrefix",
  });
  const emailDomain = useWatch({
    control: createExpertForm.control,
    name: "emailDomain",
  });
  const consultationFee = useWatch({
    control: createExpertForm.control,
    name: "consultationFee",
  });

  // Queries & Mutations
  const { data: clinics = [], isLoading: isLoadingClinics } = useClinics();
  const { data: users = [], isLoading: isLoadingUsers } = useAdminUsers({
    role: "expert",
  });
  const { data: expertsList = [] } = useExperts();

  const createExpertMutation = useCreateExpert();
  const quickBookMutation = useAdminQuickBook();

  // Doctor options for Quick Booking dropdown
  const doctorOptions =
    expertsList.length > 0
      ? expertsList.map((exp) => ({
          id: exp.id,
          name: exp.name,
          subtitle: `${exp.title || "Chuyên gia Da Liễu"} (${exp.clinic || "GlowScan Clinic"})`,
        }))
      : users.map((u) => {
          const assignedClinic = clinics.find((c) => c.id === u.clinicId);
          return {
            id: u.id,
            name: u.name,
            subtitle: `${u.email} (${assignedClinic?.name || "GlowScan Clinic"})`,
          };
        });

  // Handlers: Create Expert
  const handleOpenCreateExpertModal = () => {
    setIsCreateExpertOpen(true);
    createExpertForm.reset({
      emailPrefix: "",
      emailDomain: "@glowscan.com",
      fullName: "",
      temporaryPassword: DEFAULT_EXPERT_PASSWORD,
      clinicId: clinics[0]?.id ?? "",
      specialization: "DERMATOLOGY",
      consultationFee: "300000",
    });
  };

  const handleCreateExpert = (values: CreateExpertValues) => {
    const fullEmail = values.emailPrefix.includes("@")
      ? values.emailPrefix
      : `${values.emailPrefix}${values.emailDomain}`;

    createExpertMutation.mutate(
      {
        email: fullEmail,
        name: values.fullName,
        role: "expert",
        clinicId: values.clinicId || undefined,
        temporaryPassword: values.temporaryPassword,
        specialization: values.specialization,
        consultationFee: parseVndInput(values.consultationFee),
      },
      {
        onSuccess: (newUser) => {
          toast.success(`Tạo tài khoản chuyên gia ${newUser.name} thành công!`);
          setIsCreateExpertOpen(false);
        },
        onError: (err: unknown) => {
          const msg =
            (err as Error)?.message || "Không thể tạo tài khoản chuyên gia.";
          toast.error(msg);
        },
      },
    );
  };

  // Handlers: Quick Book Cheat
  const handleOpenQuickBookModal = () => {
    setIsQuickBookOpen(true);
    quickBookForm.reset({
      expertId: doctorOptions[0]?.id ?? "",
      scheduledAt: defaultDateStr(),
      reason: "Khảo sát da OSNT - Khám tư vấn mụn nhọt & phác đồ điều trị",
    });
  };

  const handleExecuteQuickBook = (values: QuickBookValues) => {
    quickBookMutation.mutate(
      {
        expertId: values.expertId,
        scheduledAt: new Date(values.scheduledAt).toISOString(),
        reason: values.reason,
      },
      {
        onSuccess: () => {
          toast.success(
            "Tạo ca hẹn nhanh thành công. Ca hẹn đang chờ xác nhận.",
            {
              action: {
                label: "Mở cổng chuyên gia",
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
    const text = `Tài khoản chuyên gia:\nEmail: ${email}\nMật khẩu mặc định: ${DEFAULT_EXPERT_PASSWORD}`;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Đã sao chép thông tin đăng nhập!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered list
  const filteredUsers = users.filter((u: ExpertUser) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      (u.name ?? "").toLowerCase().includes(q) ||
      (u.email ?? "").toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  // Handlers: edit fee
  const handleOpenEditFee = (u: ExpertUser) => {
    setEditFeeExpert(u);
    setEditFeeValue("");
  };

  const handleSaveEditFee = () => {
    if (!editFeeExpert) return;
    import("@/core/api/client").then(({ apiClient }) => {
      apiClient
        .put(`/experts/${editFeeExpert.id}/consultation-fee`, {
          consultationFee: Number(editFeeValue.replace(/[^0-9]/g, "")),
        })
        .then(() => {
          toast.success("Đã cập nhật phí tư vấn!");
          setEditFeeExpert(null);
        })
        .catch(() => toast.error("Không thể cập nhật phí tư vấn."));
    });
  };

  // Handlers: edit clinic
  const handleOpenEditClinic = (u: ExpertUser) => {
    setEditClinicExpert(u);
    setEditClinicValue(u.clinicId ?? "");
  };

  const handleSaveEditClinic = () => {
    if (!editClinicExpert) return;
    import("@/core/api/client").then(({ apiClient }) => {
      apiClient
        .patch(`/experts/${editClinicExpert.id}`, { clinicId: editClinicValue })
        .then(() => {
          toast.success("Đã cập nhật phòng khám!");
          setEditClinicExpert(null);
        })
        .catch(() => toast.error("Không thể cập nhật phòng khám."));
    });
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* ── Header Welcome ── */}
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E2EBE6] text-[#2C3E35] dark:bg-emerald-950 dark:text-emerald-400">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Onboard & Quản Lý Tài Khoản Chuyên Gia
            </h2>
            <p className="text-xs text-slate-500">
              Tạo tài khoản chuyên gia da liễu, liên kết phòng khám và thiết lập
              khung giờ tư vấn.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick booking helper */}
          <Button
            onClick={handleOpenQuickBookModal}
            className="rounded-xl bg-amber-500 text-xs font-bold text-white shadow-xs hover:bg-amber-600"
          >
            <Zap className="mr-1.5 h-4 w-4 fill-white" /> Tạo ca hẹn nhanh
          </Button>

          <Link href="/expert" target="_blank">
            <Button
              variant="outline"
              className="rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <ExternalLink className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
              Mở cổng chuyên gia
            </Button>
          </Link>

          <Button
            onClick={handleOpenCreateExpertModal}
            className="rounded-xl bg-[#2C3E35] text-xs font-bold text-white shadow-xs hover:bg-[#3A5246]"
          >
            <UserPlus className="mr-1.5 h-4 w-4" /> Tạo chuyên gia mới
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
              Tổng số chuyên gia
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
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">
              Chuyên gia kích hoạt
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {users.filter((u) => u.isActive !== false).length}
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Area: Table inside Card (standard pattern) ── */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Embedded Search bar */}
        <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="relative w-full sm:w-72">
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
              Đang tải danh sách tài khoản chuyên gia...
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-400">
            <User className="h-8 w-8 text-slate-300" />
            <p className="text-xs font-semibold">
              Chưa có tài khoản chuyên gia nào.
            </p>
            <Button
              size="sm"
              onClick={handleOpenCreateExpertModal}
              className="mt-2 rounded-xl bg-emerald-600 text-xs font-bold text-white"
            >
              Tạo chuyên gia đầu tiên
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 font-bold text-slate-700">
                    Họ và tên chuyên gia
                  </th>
                  <th className="px-4 py-3 font-bold text-slate-700">
                    Email Đăng Nhập
                  </th>
                  <th className="px-4 py-3 font-bold text-slate-700">
                    Vai Trò
                  </th>
                  <th className="px-4 py-3 font-bold text-slate-700">
                    Phòng Khám Phân Công
                  </th>
                  <th className="px-4 py-3 text-right font-bold text-slate-700">
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {paginatedUsers.map((u: ExpertUser) => {
                  const assignedClinic = clinics.find(
                    (c: { id: string; name: string }) => c.id === u.clinicId,
                  );

                  return (
                    <tr
                      key={u.id}
                      className="transition-colors hover:bg-slate-50/60"
                    >
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-900">
                          {u.name || "Chưa cập nhật tên"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-700">
                        {u.email || "Chưa cập nhật email"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className="border-emerald-200 bg-emerald-50 text-[10px] font-bold text-emerald-800"
                        >
                          Chuyên gia
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {assignedClinic ? (
                          <span className="font-medium text-slate-800">
                            {(assignedClinic as { name: string }).name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">
                            Chưa gán
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 rounded-lg p-0 text-slate-500 hover:bg-slate-100"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            }
                          />
                          <DropdownMenuContent
                            align="end"
                            className="w-52 rounded-xl text-xs"
                          >
                            <DropdownMenuGroup>
                              <DropdownMenuLabel className="text-[11px] text-slate-400">
                                Thao tác chuyên gia
                              </DropdownMenuLabel>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="cursor-pointer gap-2 rounded-lg text-xs"
                              onClick={() =>
                                u.email && handleCopyCredentials(u.email, u.id)
                              }
                              disabled={!u.email}
                            >
                              {copiedId === u.id ? (
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                              {copiedId === u.id
                                ? "Đã sao chép"
                                : "Sao chép thông tin đăng nhập"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer gap-2 rounded-lg text-xs"
                              onClick={() => handleOpenEditFee(u)}
                            >
                              <DollarSign className="h-3.5 w-3.5 text-amber-500" />
                              Sửa phí tư vấn
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer gap-2 rounded-lg text-xs"
                              onClick={() => handleOpenEditClinic(u)}
                            >
                              <Hospital className="h-3.5 w-3.5 text-teal-500" />
                              Đổi phòng khám
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="cursor-pointer gap-2 rounded-lg text-xs text-slate-500"
                              onClick={() => window.open("/expert", "_blank")}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Xem tại cổng chuyên gia
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {/* Pagination */}
            <DataTablePagination
              page={page}
              totalPages={totalPages}
              totalItems={filteredUsers.length}
              pageSize={PAGE_SIZE}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>

      {/* ── Modal Dialog 1: Tạo Tài Khoản Bác Sĩ Mới ── */}
      <Dialog open={isCreateExpertOpen} onOpenChange={setIsCreateExpertOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Tạo tài khoản chuyên gia mới
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Nhập thông tin tài khoản chuyên gia. Mật khẩu tạm thời sẽ được
              dùng để đăng nhập tại `/login`.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={createExpertForm.handleSubmit(handleCreateExpert)}
            className="space-y-4 py-2"
            noValidate
          >
            {/* Email Field with Auto Domain */}
            <div className="space-y-2">
              <div className="grid gap-2 sm:grid-cols-[1fr_160px]">
                <FormController
                  control={createExpertForm.control}
                  name="emailPrefix"
                  label="Email đăng nhập"
                >
                  {(field) => (
                    <div className="relative">
                      <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        {...field}
                        id={field.name}
                        placeholder="VD: dr.nguyen"
                        className="rounded-xl border-slate-200 pl-9 text-xs"
                        aria-invalid={Boolean(
                          createExpertForm.formState.errors.emailPrefix,
                        )}
                      />
                    </div>
                  )}
                </FormController>
                <FormController
                  control={createExpertForm.control}
                  name="emailDomain"
                  label="Tên miền"
                >
                  {(field) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id={field.name} className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="@glowscan.com">
                          @glowscan.com
                        </SelectItem>
                        <SelectItem value="@glowscan.vn">
                          @glowscan.vn
                        </SelectItem>
                        <SelectItem value="@gmail.com">@gmail.com</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </FormController>
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
            <FormController
              control={createExpertForm.control}
              name="fullName"
              label="Họ và tên chuyên gia"
            >
              {(field) => (
                <div className="relative">
                  <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="VD: BS. Nguyễn Văn An"
                    className="rounded-xl border-slate-200 pl-9 text-xs"
                    aria-invalid={Boolean(
                      createExpertForm.formState.errors.fullName,
                    )}
                  />
                </div>
              )}
            </FormController>

            {/* Temporary Password */}
            <FormController
              control={createExpertForm.control}
              name="temporaryPassword"
              label="Mật khẩu tạm thời"
            >
              {(field) => (
                <div className="relative">
                  <KeyRound className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    {...field}
                    id={field.name}
                    className="rounded-xl border-slate-200 pl-9 font-mono text-xs"
                    aria-invalid={Boolean(
                      createExpertForm.formState.errors.temporaryPassword,
                    )}
                  />
                </div>
              )}
            </FormController>

            {/* Specialty */}
            <FormController
              control={createExpertForm.control}
              name="specialization"
              label="Chuyên khoa da liễu"
            >
              {(field) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id={field.name} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPERT_SPECIALTIES.map((spec) => (
                      <SelectItem key={spec.value} value={spec.value}>
                        {spec.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </FormController>

            {/* Clinic Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Phòng Khám Phân Công
              </label>
              {isLoadingClinics ? (
                <p className="text-xs text-slate-400">Đang nạp phòng khám...</p>
              ) : (
                <FormController
                  control={createExpertForm.control}
                  name="clinicId"
                >
                  {(field) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id={field.name} className="w-full">
                        <SelectValue placeholder="Chọn phòng khám" />
                      </SelectTrigger>
                      <SelectContent>
                        {clinics.map((clinic) => (
                          <SelectItem key={clinic.id} value={clinic.id}>
                            {clinic.name} ({clinic.address})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </FormController>
              )}
            </div>

            <FormController
              control={createExpertForm.control}
              name="consultationFee"
              label="Phí tư vấn (VND)"
              description={
                consultationFee
                  ? `Khách hàng sẽ thanh toán ${formatVnd(Number(consultationFee))} cho mỗi ca tư vấn thường.`
                  : "Vui lòng nhập phí tư vấn."
              }
            >
              {(field) => (
                <CurrencyInput
                  id={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                  className="rounded-xl border-slate-200 text-xs"
                  aria-invalid={Boolean(
                    createExpertForm.formState.errors.consultationFee,
                  )}
                />
              )}
            </FormController>

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
                disabled={createExpertMutation.isPending}
                className="rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
              >
                {createExpertMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Tạo tài khoản chuyên gia"
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
              <Zap className="h-5 w-5 fill-amber-500 text-amber-500" /> Tạo ca
              hẹn nhanh
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Tạo nhanh ca hẹn ở trạng thái Tạo một ca hẹn ở trạng thái chờ xác
              nhận và gán cho chuyên gia đã chọn.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={quickBookForm.handleSubmit(handleExecuteQuickBook)}
            className="space-y-4 py-2"
            noValidate
          >
            {/* Select Expert */}
            <FormController
              control={quickBookForm.control}
              name="expertId"
              label="Chọn chuyên gia phụ trách"
            >
              {(field) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id={field.name}
                    className="w-full"
                    aria-invalid={Boolean(
                      quickBookForm.formState.errors.expertId,
                    )}
                  >
                    <SelectValue placeholder="Chọn chuyên gia" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctorOptions.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id}>
                        {doc.name} - {doc.subtitle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </FormController>

            {/* Scheduled Date/Time */}
            <FormController
              control={quickBookForm.control}
              name="scheduledAt"
              label="Thời gian ca hẹn"
            >
              {(field) => (
                <div className="relative">
                  <Calendar className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    {...field}
                    id={field.name}
                    type="datetime-local"
                    className="rounded-xl border-slate-200 pl-9 text-xs"
                    aria-invalid={Boolean(
                      quickBookForm.formState.errors.scheduledAt,
                    )}
                  />
                </div>
              )}
            </FormController>

            {/* Reason */}
            <FormController
              control={quickBookForm.control}
              name="reason"
              label="Lý do / triệu chứng tư vấn"
            >
              {(field) => (
                <div className="relative">
                  <MessageSquare className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    {...field}
                    id={field.name}
                    className="rounded-xl border-slate-200 pl-9 text-xs"
                    aria-invalid={Boolean(
                      quickBookForm.formState.errors.reason,
                    )}
                  />
                </div>
              )}
            </FormController>

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
                    <Zap className="mr-1.5 h-3.5 w-3.5 fill-white" /> Tạo ca hẹn
                    ngay
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Edit Fee Dialog ── */}
      <Dialog
        open={!!editFeeExpert}
        onOpenChange={(open) => !open && setEditFeeExpert(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Cập nhật phí tư vấn
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Chuyên gia: <strong>{editFeeExpert?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <label className="text-xs font-bold text-slate-700">
              Phí tư vấn mới (VND)
            </label>
            <div className="relative">
              <DollarSign className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="VD: 300000"
                value={editFeeValue}
                onChange={(e) => setEditFeeValue(e.target.value)}
                className="rounded-xl border-slate-200 pl-9 text-xs"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditFeeExpert(null)}
              className="rounded-xl text-xs"
            >
              Hủy
            </Button>
            <Button
              size="sm"
              onClick={handleSaveEditFee}
              className="rounded-xl bg-[#2C3E35] text-xs font-bold text-white hover:bg-[#3A5246]"
            >
              Lưu phí tư vấn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Clinic Dialog ── */}
      <Dialog
        open={!!editClinicExpert}
        onOpenChange={(open) => !open && setEditClinicExpert(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Đổi phòng khám
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Chuyên gia: <strong>{editClinicExpert?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <label className="text-xs font-bold text-slate-700">
              Phòng khám phụ trách
            </label>
            <Select
              value={editClinicValue}
              onValueChange={(v) => setEditClinicValue(v ?? "")}
            >
              <SelectTrigger className="rounded-xl text-xs">
                <SelectValue placeholder="Chọn phòng khám" />
              </SelectTrigger>
              <SelectContent>
                {clinics.map((c: { id: string; name: string }) => (
                  <SelectItem key={c.id} value={c.id} className="text-xs">
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditClinicExpert(null)}
              className="rounded-xl text-xs"
            >
              Hủy
            </Button>
            <Button
              size="sm"
              onClick={handleSaveEditClinic}
              className="rounded-xl bg-[#2C3E35] text-xs font-bold text-white hover:bg-[#3A5246]"
            >
              Lưu phòng khám
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
