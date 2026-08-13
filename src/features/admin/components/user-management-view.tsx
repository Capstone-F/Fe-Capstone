"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  CircleDollarSign,
  Info,
  Loader2,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
  UserX,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";

import { useSession } from "@/features/auth/hooks/useSession";
import {
  useAdminUserDetail,
  useAdminUserDirectory,
  useAdminWallet,
  useAdminWalletTopUp,
  useUpdateAdminUserRoles,
  useUpdateAdminUserStatus,
} from "@/features/admin/hooks/useAdminUsers";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { formatVnd } from "@/shared/utils/format";
import useDebounce from "@/shared/hooks/useDebounce";
import { FormController } from "@/shared/components/form/form-controller";
import {
  CurrencyInput,
  parseVndInput,
} from "@/shared/components/form/currency-input";
import {
  adminWalletTopUpSchema,
  type AdminWalletTopUpValues,
} from "@/features/admin/schemas/admin-forms.schema";
import { DataTablePagination } from "@/shared/components/ui/data-table-pagination";

const roleOptions = [
  { value: "customer", label: "Khách hàng" },
  { value: "expert", label: "Chuyên gia" },
  { value: "staff", label: "Nhân viên" },
  { value: "clinic_manager", label: "Quản lý phòng khám" },
  { value: "app_admin", label: "Quản trị viên" },
] as const;

const roleLabel = new Map<string, string>(
  roleOptions.map((role) => [role.value, role.label]),
);

/** Base UI shows the raw value ("all") in a closed trigger without this value→label map. */
const roleFilterItems: Record<string, string> = {
  all: "Tất cả vai trò",
  ...Object.fromEntries(roleOptions.map((role) => [role.value, role.label])),
};

export function UserManagementView() {
  const session = useSession();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 350);
  const [role, setRole] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState("");

  // Pagination state
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const directory = useAdminUserDirectory({
    q: debouncedSearch || undefined,
    role: role === "all" ? undefined : role,
    page: 1,
    limit: 100,
  });

  const allUsers = directory.data?.items ?? [];
  const activeCount = allUsers.filter((user) => user.isActive).length;
  const customerCount = allUsers.filter((user) =>
    user.roles.includes("customer"),
  ).length;
  const totalPages = Math.max(1, Math.ceil(allUsers.length / PAGE_SIZE));
  const users = allUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <TooltipProvider>
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E2EBE6] text-[#2C3E35] dark:bg-emerald-950 dark:text-emerald-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Quản Lý Người Dùng & Phân Quyền
              </h2>
              <p className="text-xs text-slate-500">
                Tra cứu tài khoản, phân quyền vai trò, khóa truy cập và hỗ trợ
                số dư ví khách hàng.
              </p>
            </div>
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-3">
          <Metric
            icon={<Users className="h-5 w-5" />}
            label="Tổng người dùng"
            value={directory.data?.total ?? 0}
          />
          <Metric
            icon={<UserCheck className="h-5 w-5" />}
            label="Đang hoạt động"
            value={activeCount}
          />
          <Metric
            icon={<WalletCards className="h-5 w-5" />}
            label="Khách hàng"
            value={customerCount}
          />
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm theo tên hoặc email"
                className="pl-9"
              />
            </div>
            <Select
              value={role}
              onValueChange={(value) => setRole(value ?? "all")}
              items={roleFilterItems}
            >
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue placeholder="Tất cả vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {directory.isLoading && !directory.data ? (
            <div className="flex min-h-64 items-center justify-center text-sm text-slate-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tải người
              dùng...
            </div>
          ) : directory.isError ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
              <p className="text-sm text-red-600">
                Không thể tải danh sách người dùng.
              </p>
              <Button
                variant="outline"
                onClick={() => void directory.refetch()}
              >
                Thử lại
              </Button>
            </div>
          ) : users.length === 0 ? (
            <div className="min-h-64 p-10 text-center text-sm text-slate-500">
              Không tìm thấy người dùng phù hợp.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 font-bold text-slate-700">
                      Người dùng
                    </th>
                    <th className="px-4 py-3 font-bold text-slate-700">
                      Vai trò
                    </th>
                    <th className="px-4 py-3 font-bold text-slate-700">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 font-bold text-slate-700">
                      Ngày tạo
                    </th>
                    <th className="w-16 px-4 py-3 text-right font-bold text-slate-700">
                      Chi tiết
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="transition-colors hover:bg-slate-50/60"
                    >
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">
                          {user.name || "Chưa cập nhật tên"}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {user.email || "Chưa cập nhật email"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex max-w-72 flex-wrap gap-1">
                          {user.roles.map((item) => (
                            <Badge
                              key={item}
                              variant="outline"
                              className="text-[10px] font-semibold"
                            >
                              {roleLabel.get(item) || item}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={user.isActive ? "secondary" : "destructive"}
                          className="text-[10px] font-semibold"
                        >
                          {user.isActive ? "Hoạt động" : "Đã khóa"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                aria-label={`Xem chi tiết ${user.name || user.email || "người dùng"}`}
                                onClick={() => setSelectedUserId(user.id)}
                              />
                            }
                          >
                            <Info />
                          </TooltipTrigger>
                          <TooltipContent>Xem chi tiết</TooltipContent>
                        </Tooltip>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination */}
              <DataTablePagination
                page={page}
                totalPages={totalPages}
                totalItems={allUsers.length}
                pageSize={PAGE_SIZE}
                onPageChange={(p) => {
                  setPage(p);
                }}
              />
            </div>
          )}
        </section>

        <UserDetailDialog
          key={selectedUserId}
          userId={selectedUserId}
          currentUserId={session.data?.id ?? ""}
          onClose={() => setSelectedUserId("")}
        />
      </div>
    </TooltipProvider>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
        {icon}
      </span>
      <div>
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function UserDetailDialog({
  userId,
  currentUserId,
  onClose,
}: {
  userId: string;
  currentUserId: string;
  onClose: () => void;
}) {
  const detail = useAdminUserDetail(userId);
  const wallet = useAdminWallet(userId);
  const rolesMutation = useUpdateAdminUserRoles();
  const statusMutation = useUpdateAdminUserStatus();
  const topUpMutation = useAdminWalletTopUp();
  const [roleDraft, setRoleDraft] = useState<string[] | null>(null);
  const topUpForm = useForm<AdminWalletTopUpValues>({
    resolver: zodResolver(adminWalletTopUpSchema),
    defaultValues: { amountVnd: "500000", note: "" },
  });

  const roles = roleDraft ?? detail.data?.roles ?? [];

  const rolesChanged = detail.data
    ? [...roles].sort().join(",") !== [...detail.data.roles].sort().join(",")
    : false;

  async function saveRoles() {
    if (!detail.data || roles.length === 0) return;
    try {
      await rolesMutation.mutateAsync({ id: detail.data.id, roles });
      setRoleDraft(null);
      toast.success("Đã cập nhật vai trò.");
    } catch (reason) {
      toast.error(
        reason instanceof Error
          ? reason.message
          : "Không thể cập nhật vai trò.",
      );
    }
  }

  async function toggleStatus() {
    if (!detail.data) return;
    try {
      await statusMutation.mutateAsync({
        id: detail.data.id,
        isActive: !detail.data.isActive,
      });
      toast.success(
        detail.data.isActive ? "Đã khóa tài khoản." : "Đã mở tài khoản.",
      );
    } catch (reason) {
      toast.error(
        reason instanceof Error
          ? reason.message
          : "Không thể cập nhật trạng thái.",
      );
    }
  }

  async function topUp(values: AdminWalletTopUpValues) {
    if (!detail.data) return;
    const amountVnd = parseVndInput(values.amountVnd);
    try {
      await topUpMutation.mutateAsync({
        userId: detail.data.id,
        amountVnd,
        note: values.note || undefined,
      });
      topUpForm.reset({ amountVnd: values.amountVnd, note: "" });
      toast.success(`Đã cộng ${formatVnd(amountVnd)} vào ví.`);
    } catch (reason) {
      toast.error(
        reason instanceof Error
          ? reason.message
          : "Không thể cộng tiền vào ví.",
      );
    }
  }

  const isSelf = detail.data?.id === currentUserId;
  const busy =
    rolesMutation.isPending ||
    statusMutation.isPending ||
    topUpMutation.isPending;

  return (
    <Dialog open={Boolean(userId)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Thông tin người dùng</DialogTitle>
          <DialogDescription>
            Dữ liệu chi tiết và số dư ví chỉ được tải khi mở cửa sổ này.
          </DialogDescription>
        </DialogHeader>

        {detail.isLoading ? (
          <div className="flex min-h-56 items-center justify-center text-sm text-slate-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tải chi
            tiết...
          </div>
        ) : detail.isError || !detail.data ? (
          <div className="py-12 text-center text-sm text-red-600">
            Không thể tải thông tin người dùng.
          </div>
        ) : (
          <div className="space-y-6">
            <section className="grid gap-3 border p-4 sm:grid-cols-2">
              <InfoRow
                label="Họ tên"
                value={detail.data.name || "Chưa cập nhật"}
              />
              <InfoRow
                label="Email"
                value={detail.data.email || "Chưa cập nhật"}
              />
              <InfoRow label="Nhà cung cấp" value={detail.data.provider} />
              <InfoRow
                label="Ngày tạo"
                value={new Date(detail.data.createdAt).toLocaleString("vi-VN")}
              />
            </section>

            <section>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-700" />
                <h3 className="text-sm font-semibold">Vai trò và truy cập</h3>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {roleOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 border p-3 text-sm"
                  >
                    <Checkbox
                      checked={roles.includes(option.value)}
                      disabled={busy || isSelf}
                      onCheckedChange={(checked) =>
                        setRoleDraft((currentDraft) => {
                          const current = currentDraft ?? roles;
                          return checked
                            ? [...new Set([...current, option.value])]
                            : current.filter((role) => role !== option.value);
                        })
                      }
                    />
                    {option.label}
                  </label>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  disabled={
                    !rolesChanged || roles.length === 0 || busy || isSelf
                  }
                  onClick={() => void saveRoles()}
                >
                  Lưu vai trò
                </Button>
                <Button
                  size="sm"
                  variant={detail.data.isActive ? "destructive" : "outline"}
                  disabled={busy || isSelf}
                  onClick={() => void toggleStatus()}
                >
                  {detail.data.isActive ? <UserX /> : <UserCheck />}
                  {detail.data.isActive ? "Khóa tài khoản" : "Mở tài khoản"}
                </Button>
                {isSelf && (
                  <p className="self-center text-xs text-slate-500">
                    Không thể tự thay đổi quyền hoặc khóa chính mình.
                  </p>
                )}
              </div>
            </section>

            <section className="border-t pt-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <CircleDollarSign className="h-4 w-4 text-emerald-700" /> Ví
                    người dùng
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Credit trực tiếp bằng admin ledger, không qua cổng thanh
                    toán.
                  </p>
                </div>
                <p className="text-lg font-semibold text-slate-950">
                  {wallet.isLoading
                    ? "Đang tải..."
                    : wallet.data
                      ? formatVnd(Number(wallet.data.balanceVnd))
                      : "Không khả dụng"}
                </p>
              </div>
              <form
                onSubmit={topUpForm.handleSubmit(topUp)}
                className="mt-4 grid gap-3 sm:grid-cols-[180px_1fr_auto] sm:items-end"
                noValidate
              >
                <FormController
                  control={topUpForm.control}
                  name="amountVnd"
                  label="Số tiền"
                >
                  {(field) => (
                    <CurrencyInput
                      id={field.name}
                      value={field.value}
                      onValueChange={field.onChange}
                      aria-invalid={Boolean(
                        topUpForm.formState.errors.amountVnd,
                      )}
                    />
                  )}
                </FormController>
                <FormController
                  control={topUpForm.control}
                  name="note"
                  label="Ghi chú"
                >
                  {(field) => (
                    <Textarea
                      {...field}
                      id={field.name}
                      rows={1}
                      maxLength={500}
                      placeholder="Lý do hỗ trợ số dư"
                      aria-invalid={Boolean(topUpForm.formState.errors.note)}
                    />
                  )}
                </FormController>
                <Button type="submit" disabled={busy}>
                  {topUpMutation.isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <WalletCards />
                  )}
                  Cộng tiền
                </Button>
              </form>
            </section>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
