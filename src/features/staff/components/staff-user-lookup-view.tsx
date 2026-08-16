"use client";

import { useState } from "react";
import { Info, Loader2, Search, UserCheck, Users } from "lucide-react";

import {
  useAdminUserDetail,
  useAdminUserDirectory,
} from "@/features/admin/hooks/useAdminUsers";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import useDebounce from "@/shared/hooks/useDebounce";
import { DataTablePagination } from "@/shared/components/ui/data-table-pagination";
import { StaffPageHeader } from "./staff-page-header";

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

const roleFilterItems: Record<string, string> = {
  all: "Tất cả vai trò",
  ...Object.fromEntries(roleOptions.map((role) => [role.value, role.label])),
};

export function StaffUserLookupView() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 350);
  const [role, setRole] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState("");

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
      <div className="flex flex-col gap-6 p-4 sm:p-6">
        <StaffPageHeader
          icon={Users}
          title="Tra Cứu Người Dùng (User Directory)"
          description="Tra cứu danh sách và xem thông tin chi tiết người dùng toàn hệ thống (Quyền đọc Read-Only)."
        />

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
            icon={<Users className="h-5 w-5 text-emerald-600" />}
            label="Khách hàng (Customer)"
            value={customerCount}
          />
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm theo tên hoặc email"
                className="pl-9 text-xs"
              />
            </div>
            <Select
              value={role}
              onValueChange={(value) => setRole(value ?? "all")}
              items={roleFilterItems}
            >
              <SelectTrigger className="w-full text-xs sm:w-52">
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

          {directory.isLoading ? (
            <div className="flex min-h-64 items-center justify-center text-xs text-slate-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#2C3E35]" />{" "}
              Đang tải danh sách người dùng...
            </div>
          ) : directory.isError ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
              <p className="text-xs text-red-600">
                Không thể tải danh sách người dùng.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void directory.refetch()}
              >
                Thử lại
              </Button>
            </div>
          ) : users.length === 0 ? (
            <div className="min-h-64 p-10 text-center text-xs text-slate-500">
              Không tìm thấy người dùng phù hợp.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/40">
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">
                      Người dùng
                    </th>
                    <th className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">
                      Vai trò
                    </th>
                    <th className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">
                      Ngày tạo
                    </th>
                    <th className="w-16 px-4 py-3 text-right font-bold text-slate-700 dark:text-slate-300">
                      Chi tiết
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600 dark:divide-slate-800 dark:text-slate-300">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900 dark:text-white">
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
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
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
                            <Info className="h-4 w-4 text-slate-600" />
                          </TooltipTrigger>
                          <TooltipContent>Xem chi tiết</TooltipContent>
                        </Tooltip>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

        {selectedUserId && (
          <UserDetailReadOnlyDialog
            key={selectedUserId}
            userId={selectedUserId}
            onClose={() => setSelectedUserId("")}
          />
        )}
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
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
        {icon}
      </span>
      <div>
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

function UserDetailReadOnlyDialog({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) {
  const detail = useAdminUserDetail(userId);

  return (
    <Dialog open={Boolean(userId)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-2rem)] rounded-3xl p-4 sm:max-w-xl sm:p-6">
        <DialogHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-[#2C3E35] dark:text-emerald-400">
            <Info className="h-5 w-5" />
            Chi Tiết Người Dùng
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Thông tin chi tiết tài khoản người dùng.
          </DialogDescription>
        </DialogHeader>

        {detail.isLoading ? (
          <div className="flex min-h-56 items-center justify-center text-xs text-slate-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#2C3E35]" />{" "}
            Đang tải chi tiết...
          </div>
        ) : detail.isError || !detail.data ? (
          <div className="py-12 text-center text-xs text-red-600">
            Không thể tải thông tin người dùng.
          </div>
        ) : (
          <div className="space-y-4 py-2 text-xs">
            <div className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
              <InfoRow label="User ID (UUID)" value={detail.data.id} mono />
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
                label="Trạng thái"
                value={
                  detail.data.isActive
                    ? "Hoạt động (Active)"
                    : "Đã khóa (Inactive)"
                }
              />
              <InfoRow
                label="Ngày tạo"
                value={new Date(detail.data.createdAt).toLocaleString("vi-VN")}
              />
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Vai trò được gán (Roles):
              </span>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {detail.data.roles.map((role) => (
                  <Badge
                    key={role}
                    variant="outline"
                    className="text-xs font-bold"
                  >
                    {roleLabel.get(role) || role}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] text-slate-500">{label}</p>
      <p
        className={`mt-0.5 text-xs font-semibold text-slate-900 dark:text-white ${mono ? "font-mono text-[11px]" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
