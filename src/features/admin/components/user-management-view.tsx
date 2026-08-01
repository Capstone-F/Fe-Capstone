"use client";

import { useDeferredValue, useState } from "react";
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
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { formatVnd } from "@/shared/utils/format";

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

export function UserManagementView() {
  const session = useSession();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const [role, setRole] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState("");
  const directory = useAdminUserDirectory({
    q: deferredSearch || undefined,
    role: role === "all" ? undefined : role,
    page: 1,
    limit: 100,
  });

  const users = directory.data?.items ?? [];
  const activeCount = users.filter((user) => user.isActive).length;
  const customerCount = users.filter((user) =>
    user.roles.includes("customer"),
  ).length;

  return (
    <TooltipProvider>
      <div className="space-y-6 p-4 sm:p-6">
        <header>
          <h1 className="text-xl font-semibold text-slate-950">
            Quản lý người dùng
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Tra cứu tài khoản, phân quyền, khóa truy cập và hỗ trợ số dư ví.
          </p>
        </header>

        <section className="grid gap-3 sm:grid-cols-3">
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

        <section className="border bg-white">
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

          {directory.isLoading ? (
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="w-16 text-right">Chi tiết</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <p className="font-medium text-slate-950">
                        {user.name || "Chưa cập nhật tên"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {user.email || "Chưa cập nhật email"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex max-w-72 flex-wrap gap-1">
                        {user.roles.map((item) => (
                          <Badge key={item} variant="outline">
                            {roleLabel.get(item) || item}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.isActive ? "secondary" : "destructive"}
                      >
                        {user.isActive ? "Hoạt động" : "Đã khóa"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell className="text-right">
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
    <div className="flex items-center gap-3 border bg-white p-4">
      <span className="text-emerald-700">{icon}</span>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-xl font-semibold text-slate-950">{value}</p>
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
  const [amountVnd, setAmountVnd] = useState(500_000);
  const [note, setNote] = useState("");

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

  async function topUp() {
    if (!detail.data || !Number.isInteger(amountVnd) || amountVnd <= 0) return;
    try {
      await topUpMutation.mutateAsync({
        userId: detail.data.id,
        amountVnd,
        note: note.trim() || undefined,
      });
      setNote("");
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
              <div className="mt-4 grid gap-3 sm:grid-cols-[180px_1fr_auto] sm:items-end">
                <div className="space-y-2">
                  <Label htmlFor="admin-wallet-amount">Số tiền</Label>
                  <Input
                    id="admin-wallet-amount"
                    type="number"
                    min={1}
                    step={1000}
                    value={amountVnd}
                    onChange={(event) =>
                      setAmountVnd(Number(event.target.value))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-wallet-note">Ghi chú</Label>
                  <Textarea
                    id="admin-wallet-note"
                    rows={1}
                    maxLength={500}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Lý do hỗ trợ số dư"
                  />
                </div>
                <Button
                  disabled={
                    busy || !Number.isInteger(amountVnd) || amountVnd <= 0
                  }
                  onClick={() => void topUp()}
                >
                  {topUpMutation.isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <WalletCards />
                  )}
                  Cộng tiền
                </Button>
              </div>
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
