"use client";

import React, { useState } from "react";
import {
  Users,
  UserPlus,
  Loader2,
  Pencil,
  Power,
  Calendar,
  Star,
  Plus,
  Trash2,
  Search,
  SearchX,
  RotateCw,
  AlertCircle,
} from "lucide-react";
import useDebounce from "@/shared/hooks/useDebounce";
import {
  useClinicExperts,
  useCreateExpert,
  useUpdateExpertProfile,
  useUpdateConsultationFee,
  useExpertAvailability,
  useCreateAvailability,
  useDeleteAvailability,
} from "../hooks/useClinicExperts";
import { formatVnd } from "@/shared/utils/format";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { DataTablePagination } from "@/shared/components/ui/data-table-pagination";
import {
  ClinicExpertItem,
  ExpertAvailabilitySlot,
} from "../api/clinic-experts.api";

const DAY_LABELS: Record<string, string> = {
  "0": "Chủ Nhật",
  "1": "Thứ Hai",
  "2": "Thứ Ba",
  "3": "Thứ Tư",
  "4": "Thứ Năm",
  "5": "Thứ Sáu",
  "6": "Thứ Bảy",
};

const SPECIALIZATION_MAP: Record<string, string> = {
  DERMATOLOGY: "Da liễu tổng quát",
  ACNE_TREATMENT: "Điều trị mụn",
  LASER_THERAPY: "Trị liệu Laser",
  COSMETIC_DERMATOLOGY: "Da liễu thẩm mỹ",
  ANTI_AGING: "Trẻ hóa & Chống lão hóa",
  PIGMENTATION: "Điều trị sắc tố & Nám",
  Dermatology: "Da liễu tổng quát",
  Acne: "Điều trị mụn",
  Laser: "Trị liệu Laser",
};

const activeFilterItems: Record<string, string> = {
  ALL: "Tất cả (Hoạt động & Vô hiệu hóa)",
  ACTIVE: "Chỉ Hoạt động",
  INACTIVE: "Chỉ Vô hiệu hóa",
};

const specializationFilterItems: Record<string, string> = {
  ALL: "Tất cả chuyên khoa",
  DERMATOLOGY: "Da liễu tổng quát",
  ACNE_TREATMENT: "Điều trị mụn",
  LASER_THERAPY: "Trị liệu Laser",
  COSMETIC_DERMATOLOGY: "Da liễu thẩm mỹ",
  ANTI_AGING: "Trẻ hóa & Chống lão hóa",
  PIGMENTATION: "Điều trị sắc tố & Nám",
};

const translateSpecialization = (spec?: string | null) => {
  if (!spec) return "Chưa phân loại";
  return (
    SPECIALIZATION_MAP[spec] || SPECIALIZATION_MAP[spec.toUpperCase()] || spec
  );
};

export function ClinicExpertManagementView() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 350);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [specializationFilter, setSpecializationFilter] = useState<string>("");

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ClinicExpertItem | null>(null);
  const [availabilityTarget, setAvailabilityTarget] =
    useState<ClinicExpertItem | null>(null);

  // Form states for creation
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "P@ssw0rd123!",
    specialization: "DERMATOLOGY",
    consultationFee: 300000,
    licenseNumber: "",
    bio: "",
    avatarUrl: "",
  });

  // Form states for edit
  const [editForm, setEditForm] = useState({
    specialization: "",
    consultationFee: 300000,
    licenseNumber: "",
    bio: "",
    avatarUrl: "",
  });

  // Form state for availability
  const [newSlot, setNewSlot] = useState({
    dayOfWeek: 1,
    startTime: "08:00",
    endTime: "12:00",
  });

  const parsedActive =
    activeFilter === "ACTIVE"
      ? true
      : activeFilter === "INACTIVE"
        ? false
        : undefined;

  const activeQuery = {
    search: debouncedSearch || undefined,
    specialization: specializationFilter.trim() || undefined,
    isActive: parsedActive,
    page,
    limit: 20,
  };

  const { data, isLoading, isFetching, isError, error, refetch } =
    useClinicExperts(activeQuery);
  const createMutation = useCreateExpert();
  const updateProfileMutation = useUpdateExpertProfile();
  const updateFeeMutation = useUpdateConsultationFee();

  const { data: availabilitySlots, isLoading: isSlotsLoading } =
    useExpertAvailability(availabilityTarget?.id || null);
  const createSlotMutation = useCreateAvailability();
  const deleteSlotMutation = useDeleteAvailability();

  if (isLoading && !data) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        <span className="text-xs font-medium text-slate-500">
          Đang tải danh sách Chuyên gia...
        </span>
      </div>
    );
  }

  const items = data?.items || [];
  const totalPages = Math.ceil((data?.total || 0) / 20) || 1;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      {
        user: {
          name: createForm.name,
          email: createForm.email,
          password: createForm.password,
          role: "expert",
        },
        profile: {
          specialization: createForm.specialization,
          consultationFee: createForm.consultationFee,
          licenseNumber: createForm.licenseNumber || undefined,
          bio: createForm.bio || undefined,
          avatarUrl: createForm.avatarUrl || undefined,
        },
      },
      {
        onSuccess: () => {
          setCreateModalOpen(false);
          setCreateForm({
            name: "",
            email: "",
            password: "P@ssw0rd123!",
            specialization: "Dermatology",
            consultationFee: 300000,
            licenseNumber: "",
            bio: "",
            avatarUrl: "",
          });
        },
      },
    );
  };

  const handleEditOpen = (expert: ClinicExpertItem) => {
    setEditTarget(expert);
    setEditForm({
      specialization: expert.specialization || "Dermatology",
      consultationFee: Number(expert.consultationFee || 300000),
      licenseNumber: expert.licenseNumber || "",
      bio: expert.bio || "",
      avatarUrl: expert.avatarUrl || "",
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;

    // Update profile fields
    updateProfileMutation.mutate(
      {
        id: editTarget.id,
        dto: {
          specialization: editForm.specialization,
          licenseNumber: editForm.licenseNumber || undefined,
          bio: editForm.bio || undefined,
          avatarUrl: editForm.avatarUrl || undefined,
        },
      },
      {
        onSuccess: () => {
          // If fee changed, update fee
          if (editForm.consultationFee !== Number(editTarget.consultationFee)) {
            updateFeeMutation.mutate({
              id: editTarget.id,
              consultationFee: editForm.consultationFee,
            });
          }
          setEditTarget(null);
        },
      },
    );
  };

  const handleToggleActive = (expert: ClinicExpertItem) => {
    const nextActive = !expert.isActive;
    const confirmMsg = nextActive
      ? `Bạn có chắc chắn muốn KÍCH HOẠT lại chuyên gia ${expert.name || expert.user?.name || expert.id}?`
      : `Bạn có chắc chắn muốn VÔ HIỆU HÓA chuyên gia ${expert.name || expert.user?.name || expert.id}? Chuyên gia sẽ bị ẩn khỏi danh sách đặt lịch public.`;

    if (window.confirm(confirmMsg)) {
      updateProfileMutation.mutate({
        id: expert.id,
        dto: { isActive: nextActive },
      });
    }
  };

  const handleAddSlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!availabilityTarget) return;
    createSlotMutation.mutate({
      expertId: availabilityTarget.id,
      slot: {
        dayOfWeek: Number(newSlot.dayOfWeek),
        startTime: newSlot.startTime,
        endTime: newSlot.endTime,
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Card */}
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            <Users className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Quản lý Đội ngũ Chuyên gia Phòng khám
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Khai báo tài khoản, thông tin chuyên môn, phí tư vấn và lịch làm
              việc tuần
            </p>
          </div>
        </div>

        <Button
          onClick={() => setCreateModalOpen(true)}
          className="rounded-xl bg-emerald-600 px-5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
        >
          <UserPlus className="mr-1.5 h-4 w-4" /> Thêm Chuyên gia Mới
        </Button>
      </div>

      {/* Roster Table Card */}
      <Card className="rounded-3xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <CardHeader className="flex flex-col gap-4 border-b border-slate-100 p-6 dark:border-slate-800">
          <CardTitle className="flex items-center justify-between text-base font-bold text-slate-900 dark:text-slate-100">
            <span>Danh sách Chuyên gia thuộc Phòng khám</span>
            {isFetching && (
              <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
            )}
          </CardTitle>

          {/* Filters Bar inside Table Card Header */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                Tìm kiếm chuyên gia:
              </label>
              <div className="relative">
                <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Tìm theo tên, email..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 rounded-xl pl-9 text-xs"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                Trạng thái hoạt động:
              </label>
              <Select
                value={activeFilter}
                items={activeFilterItems}
                onValueChange={(val) => {
                  setActiveFilter(val || "ALL");
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 rounded-xl text-xs">
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">
                    Tất cả (Hoạt động & Vô hiệu hóa)
                  </SelectItem>
                  <SelectItem value="ACTIVE">Chỉ Hoạt động</SelectItem>
                  <SelectItem value="INACTIVE">Chỉ Vô hiệu hóa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                Chuyên khoa:
              </label>
              <Select
                value={specializationFilter || "ALL"}
                items={specializationFilterItems}
                onValueChange={(val) => {
                  setSpecializationFilter(!val || val === "ALL" ? "" : val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 rounded-xl text-xs">
                  <SelectValue placeholder="Tất cả chuyên khoa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả chuyên khoa</SelectItem>
                  <SelectItem value="DERMATOLOGY">Da liễu tổng quát</SelectItem>
                  <SelectItem value="ACNE_TREATMENT">Điều trị mụn</SelectItem>
                  <SelectItem value="LASER_THERAPY">Trị liệu Laser</SelectItem>
                  <SelectItem value="COSMETIC_DERMATOLOGY">
                    Da liễu thẩm mỹ
                  </SelectItem>
                  <SelectItem value="ANTI_AGING">
                    Trẻ hóa & Chống lão hóa
                  </SelectItem>
                  <SelectItem value="PIGMENTATION">
                    Điều trị sắc tố & Nám
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isError ? (
            <div className="flex min-h-[250px] flex-col items-center justify-center gap-3 p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500 dark:bg-rose-950/50">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="flex max-w-sm flex-col gap-1">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {(error as Error)?.message ||
                    "Không thể tải danh sách chuyên gia"}
                </span>
                <span className="text-xs text-slate-500">
                  Đã có lỗi xảy ra trong quá trình truy vấn dữ liệu. Bạn có thể
                  thử lại hoặc xóa từ khóa tìm kiếm.
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  className="rounded-xl text-xs"
                >
                  <RotateCw className="mr-1.5 h-3.5 w-3.5" /> Thử lại
                </Button>
                {(search || specializationFilter || activeFilter !== "ALL") && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSearch("");
                      setSpecializationFilter("");
                      setActiveFilter("ALL");
                      setPage(1);
                    }}
                    className="rounded-xl text-xs"
                  >
                    Xóa bộ lọc
                  </Button>
                )}
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="flex min-h-[250px] flex-col items-center justify-center gap-3 p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
                <SearchX className="h-6 w-6" />
              </div>
              <div className="flex max-w-sm flex-col gap-1">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {search
                    ? `Không tìm thấy kết quả cho "${search}"`
                    : "Không có chuyên gia nào khớp với bộ lọc"}
                </span>
                <span className="text-xs text-slate-500">
                  Vui lòng kiểm tra lại từ khóa tìm kiếm hoặc điều chỉnh các
                  tiêu chí lọc.
                </span>
              </div>
              {(search || specializationFilter || activeFilter !== "ALL") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setSpecializationFilter("");
                    setActiveFilter("ALL");
                    setPage(1);
                  }}
                  className="mt-2 rounded-xl text-xs"
                >
                  Xóa bộ lọc & tìm kiếm
                </Button>
              )}
            </div>
          ) : (
            <Table className="text-xs">
              <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                <TableRow>
                  <TableHead className="font-semibold">Chuyên gia</TableHead>
                  <TableHead className="font-semibold">Chuyên khoa</TableHead>
                  <TableHead className="font-semibold">Số giấy phép</TableHead>
                  <TableHead className="font-semibold">Phí tư vấn</TableHead>
                  <TableHead className="font-semibold">Đánh giá</TableHead>
                  <TableHead className="font-semibold">Trạng thái</TableHead>
                  <TableHead className="text-right font-semibold">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const displayName =
                    item.name ||
                    item.user?.name ||
                    `BS. #${item.id.slice(0, 6)}`;
                  const displayEmail = item.email || item.user?.email || "";

                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {displayName}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {displayEmail}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-blue-200 bg-blue-50 text-blue-700"
                        >
                          {translateSpecialization(item.specialization)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-slate-600 dark:text-slate-400">
                        {item.licenseNumber || "—"}
                      </TableCell>
                      <TableCell className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {formatVnd(Number(item.consultationFee || 0))}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 font-bold text-amber-600">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span>
                            {item.rating ? item.rating.toFixed(1) : "5.0"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.isActive ? (
                          <Badge className="border-emerald-200 bg-emerald-100 text-emerald-800">
                            Hoạt động
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-rose-200 bg-rose-50 text-rose-800"
                          >
                            Vô hiệu hóa
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Manage Availability */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setAvailabilityTarget(item)}
                            title="Quản lý lịch làm việc tuần"
                            className="h-8 w-8 rounded-lg text-slate-600 hover:text-blue-600"
                          >
                            <Calendar className="h-4 w-4" />
                          </Button>

                          {/* Edit Profile */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditOpen(item)}
                            title="Chỉnh sửa thông tin"
                            className="h-8 w-8 rounded-lg text-slate-600 hover:text-emerald-600"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          {/* Toggle Active */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleActive(item)}
                            title={
                              item.isActive ? "Vô hiệu hóa" : "Kích hoạt lại"
                            }
                            className={`h-8 w-8 rounded-lg ${
                              item.isActive
                                ? "text-slate-500 hover:text-rose-600"
                                : "text-slate-500 hover:text-emerald-600"
                            }`}
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {/* Common Pagination */}
          <DataTablePagination
            page={page}
            totalPages={totalPages}
            totalItems={data?.total || 0}
            pageSize={20}
            onPageChange={(p) => setPage(p)}
          />
        </CardContent>
      </Card>

      {/* Create Expert Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="w-full max-w-md rounded-3xl p-6">
          <DialogHeader className="border-b border-slate-100 pb-3 dark:border-slate-800">
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-100">
              <UserPlus className="h-5 w-5 text-emerald-600" />
              Thêm Chuyên gia Mới
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Tạo tài khoản đăng nhập và hồ sơ chuyên môn (Phòng khám tự động
              gán)
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleCreateSubmit}
            className="flex flex-col gap-3 py-2 text-xs"
          >
            <div className="flex flex-col gap-1">
              <Label className="font-bold">Họ và tên Chuyên gia *:</Label>
              <Input
                required
                placeholder="VD: BS. Nguyễn Văn A"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm({ ...createForm, name: e.target.value })
                }
                className="rounded-xl text-xs"
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="font-bold">Email đăng nhập *:</Label>
              <Input
                type="email"
                required
                placeholder="VD: doctor.a@glowscan.vn"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm({ ...createForm, email: e.target.value })
                }
                className="rounded-xl text-xs"
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="font-bold">Mật khẩu mặc định *:</Label>
              <Input
                required
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm({ ...createForm, password: e.target.value })
                }
                className="rounded-xl font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <Label className="font-bold">Chuyên khoa *:</Label>
                <Select
                  value={createForm.specialization}
                  items={SPECIALIZATION_MAP}
                  onValueChange={(val) =>
                    setCreateForm({
                      ...createForm,
                      specialization: val || "DERMATOLOGY",
                    })
                  }
                >
                  <SelectTrigger className="h-9 rounded-xl text-xs">
                    <SelectValue placeholder="Chọn chuyên khoa" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SPECIALIZATION_MAP).map(([k, v]) => (
                      <SelectItem key={k} value={k} className="text-xs">
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <Label className="font-bold">Phí tư vấn (VNĐ) *:</Label>
                <Input
                  type="number"
                  required
                  value={createForm.consultationFee}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      consultationFee: Number(e.target.value),
                    })
                  }
                  className="rounded-xl font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <Label className="font-bold">Số giấy phép hành nghề:</Label>
              <Input
                placeholder="VD: CNHN-12345/BYT"
                value={createForm.licenseNumber}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    licenseNumber: e.target.value,
                  })
                }
                className="rounded-xl text-xs"
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="font-bold">
                Tiểu sử / Giới thiệu chuyên môn:
              </Label>
              <Textarea
                placeholder="Tóm tắt kinh nghiệm làm việc và chứng chỉ..."
                value={createForm.bio}
                onChange={(e) =>
                  setCreateForm({ ...createForm, bio: e.target.value })
                }
                className="h-16 resize-none rounded-xl text-xs"
              />
            </div>

            <DialogFooter className="border-t border-slate-100 pt-3 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
                className="rounded-xl text-xs"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Xác nhận Tạo Chuyên gia"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Expert Modal */}
      <Dialog
        open={Boolean(editTarget)}
        onOpenChange={(open) => !open && setEditTarget(null)}
      >
        <DialogContent className="w-full max-w-md rounded-3xl p-6">
          <DialogHeader className="border-b border-slate-100 pb-3 dark:border-slate-800">
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-100">
              <Pencil className="h-5 w-5 text-emerald-600" />
              Sửa Chuyên gia: {editTarget?.name || editTarget?.user?.name}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleEditSubmit}
            className="flex flex-col gap-3 py-2 text-xs"
          >
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <Label className="font-bold">Chuyên khoa *:</Label>
                <Select
                  value={editForm.specialization}
                  items={SPECIALIZATION_MAP}
                  onValueChange={(val) =>
                    setEditForm({ ...editForm, specialization: val || "" })
                  }
                >
                  <SelectTrigger className="h-9 rounded-xl text-xs">
                    <SelectValue placeholder="Chọn chuyên khoa" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SPECIALIZATION_MAP).map(([k, v]) => (
                      <SelectItem key={k} value={k} className="text-xs">
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <Label className="font-bold">Phí tư vấn (VNĐ) *:</Label>
                <Input
                  type="number"
                  required
                  value={editForm.consultationFee}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      consultationFee: Number(e.target.value),
                    })
                  }
                  className="rounded-xl font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <Label className="font-bold">Số giấy phép hành nghề:</Label>
              <Input
                value={editForm.licenseNumber}
                onChange={(e) =>
                  setEditForm({ ...editForm, licenseNumber: e.target.value })
                }
                className="rounded-xl text-xs"
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="font-bold">Tiểu sử / Giới thiệu:</Label>
              <Textarea
                value={editForm.bio}
                onChange={(e) =>
                  setEditForm({ ...editForm, bio: e.target.value })
                }
                className="h-20 resize-none rounded-xl text-xs"
              />
            </div>

            <DialogFooter className="border-t border-slate-100 pt-3 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditTarget(null)}
                className="rounded-xl text-xs"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={
                  updateProfileMutation.isPending || updateFeeMutation.isPending
                }
                className="rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
              >
                Lưu Thay đổi
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Availability Editor Modal */}
      <Dialog
        open={Boolean(availabilityTarget)}
        onOpenChange={(open) => !open && setAvailabilityTarget(null)}
      >
        <DialogContent className="w-full max-w-xl rounded-3xl p-6">
          <DialogHeader className="border-b border-slate-100 pb-3 dark:border-slate-800">
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-100">
              <Calendar className="h-5 w-5 text-emerald-600" />
              Lịch làm việc tuần:{" "}
              {availabilityTarget?.name || availabilityTarget?.user?.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Cấu hình các ca rảnh rỗi trong tuần để sinh slot cho bệnh nhân đặt
              lịch
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2 text-xs">
            {/* Add Slot Form */}
            <form
              onSubmit={handleAddSlotSubmit}
              className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50"
            >
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Thêm khung giờ rảnh:
              </span>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    Thứ trong tuần:
                  </label>
                  <Select
                    value={String(newSlot.dayOfWeek)}
                    items={DAY_LABELS}
                    onValueChange={(val) =>
                      setNewSlot({ ...newSlot, dayOfWeek: Number(val) })
                    }
                  >
                    <SelectTrigger className="h-9 rounded-xl text-xs">
                      <SelectValue placeholder="Chọn thứ" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DAY_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k} className="text-xs">
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    Từ giờ:
                  </label>
                  <Input
                    type="time"
                    required
                    value={newSlot.startTime}
                    onChange={(e) =>
                      setNewSlot({ ...newSlot, startTime: e.target.value })
                    }
                    className="h-9 w-full min-w-[105px] rounded-xl px-3 font-mono text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    Đến giờ:
                  </label>
                  <Input
                    type="time"
                    required
                    value={newSlot.endTime}
                    onChange={(e) =>
                      setNewSlot({ ...newSlot, endTime: e.target.value })
                    }
                    className="h-9 w-full min-w-[105px] rounded-xl px-3 font-mono text-xs"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={createSlotMutation.isPending}
                size="sm"
                className="mt-1 h-9 rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
              >
                {createSlotMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="mr-1.5 h-4 w-4" /> Thêm Ca rảnh
                  </>
                )}
              </Button>
            </form>

            {/* List Existing Slots */}
            {(() => {
              const rawSlots = availabilitySlots as unknown as
                | { items?: ExpertAvailabilitySlot[] }
                | ExpertAvailabilitySlot[];
              const slotsList = Array.isArray(rawSlots)
                ? rawSlots
                : Array.isArray(rawSlots?.items)
                  ? rawSlots.items
                  : [];
              return (
                <div className="flex flex-col gap-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Khung giờ hiện tại:
                  </span>
                  {isSlotsLoading ? (
                    <div className="flex justify-center p-4">
                      <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                    </div>
                  ) : slotsList.length === 0 ? (
                    <p className="p-3 text-center text-xs text-slate-400 italic">
                      Chưa có khung giờ làm việc nào.
                    </p>
                  ) : (
                    <div className="flex max-h-56 flex-col gap-2 overflow-y-auto pr-1">
                      {slotsList.map((slot) => {
                        const rec = slot as unknown as Record<string, string>;
                        const displayStart =
                          slot.startTime ||
                          rec.start_time ||
                          rec.startAt ||
                          "08:00";
                        const displayEnd =
                          slot.endTime || rec.end_time || rec.endAt || "17:00";
                        const dayName =
                          DAY_LABELS[String(slot.dayOfWeek)] ||
                          `Thứ ${slot.dayOfWeek}`;

                        return (
                          <div
                            key={slot.id}
                            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900"
                          >
                            <div className="flex items-center gap-3">
                              <Badge
                                variant="outline"
                                className="border-blue-200 bg-blue-50 font-bold text-blue-700"
                              >
                                {dayName}
                              </Badge>
                              <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                                {displayStart} - {displayEnd}
                              </span>
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                availabilityTarget &&
                                deleteSlotMutation.mutate({
                                  expertId: availabilityTarget.id,
                                  slotId: slot.id,
                                })
                              }
                              className="h-8 w-8 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          <DialogFooter className="border-t border-slate-100 pt-3 dark:border-slate-800">
            <Button
              variant="outline"
              onClick={() => setAvailabilityTarget(null)}
              className="w-full rounded-xl text-xs"
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
