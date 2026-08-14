"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  AlertTriangle,
  CalendarDays,
  Check,
  ClipboardCopy,
  Copy,
  KeyRound,
  Loader2,
  PackageSearch,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";
import { ApiError } from "@/core/api/errors";
import { buttonVariants, Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/shared/components/ui/field";
import { cn } from "@/lib/utils";
import { STOCK_WARNING_BADGE_CLASS } from "@/features/treatment/constants/routine-tracking";
import { useSeedDemoCustomer } from "../hooks/useAdminDemo";
import {
  seedDemoCustomerSchema,
  type SeedDemoCustomerFormValues,
} from "../schemas/admin-forms.schema";
import type {
  SeedDemoCustomerPayload,
  SeedDemoCustomerResponse,
} from "../types/demo-customer.types";

const defaults: SeedDemoCustomerFormValues = {
  email: "",
  password: "",
  fullName: "",
  historyDays: "",
};

function CopyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background flex min-w-0 items-center justify-between gap-3 rounded-lg border px-3 py-2">
      <div className="min-w-0">
        <p className="text-muted-foreground text-[11px] font-medium">{label}</p>
        <p className="truncate font-mono text-xs font-semibold" title={value}>
          {value}
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Sao chép ${label}`}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            toast.success(`Đã sao chép ${label}.`);
          } catch {
            toast.error(`Không thể sao chép ${label}.`);
          }
        }}
      >
        <Copy />
      </Button>
    </div>
  );
}

function DemoCustomerResult({
  result,
  onDismiss,
}: {
  result: SeedDemoCustomerResponse;
  onDismiss: () => void;
}) {
  const walletHref = {
    pathname: "/dashboard/commerce",
    query: {
      userId: result.credentials.userId,
      email: result.credentials.email,
      name: "Demo Customer",
    },
  };

  const copyCredentials = async () => {
    try {
      await navigator.clipboard.writeText(
        `Email: ${result.credentials.email}\nMật khẩu: ${result.credentials.password}`,
      );
      toast.success("Đã sao chép thông tin đăng nhập.");
    } catch {
      toast.error("Không thể sao chép thông tin đăng nhập.");
    }
  };

  return (
    <div className="space-y-4 border-t pt-5" aria-live="polite">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Check className="size-5 rounded-full bg-emerald-600 p-1 text-white" />
            <h3 className="font-semibold">Khách hàng demo đã sẵn sàng</h3>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Dùng tài khoản dưới đây để đăng nhập và bắt đầu live demo.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Ẩn kết quả tạo khách hàng demo"
          onClick={onDismiss}
        >
          <X />
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="bg-muted/30 space-y-3 rounded-xl border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="flex items-center gap-2 text-sm font-semibold">
              <KeyRound className="size-4 text-emerald-700" />
              Thông tin đăng nhập
            </h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copyCredentials}
            >
              <ClipboardCopy />
              Sao chép cả hai
            </Button>
          </div>
          <Alert className="border-amber-200 bg-amber-50 text-amber-900">
            <AlertTriangle />
            <AlertTitle>Mật khẩu chỉ hiển thị một lần</AlertTitle>
            <AlertDescription>
              Hãy sao chép trước khi đóng hoặc tạo tài khoản demo khác.
            </AlertDescription>
          </Alert>
          <CopyValue label="Email" value={result.credentials.email} />
          <CopyValue label="Mật khẩu" value={result.credentials.password} />
          <CopyValue label="User ID" value={result.credentials.userId} />
          <CopyValue
            label="Customer ID"
            value={result.credentials.customerId}
          />
        </section>

        <section className="space-y-3 rounded-xl border p-4">
          <h4 className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="size-4 text-violet-600" />
            Routine đã kích hoạt
          </h4>
          <div>
            <p className="font-medium">{result.routine.title}</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Bắt đầu từ {result.routine.activeFromDate} · Sáng{" "}
              {result.routine.morningSteps} bước · Tối{" "}
              {result.routine.eveningSteps} bước
            </p>
          </div>
          <CopyValue label="Routine ID" value={result.routine.routineId} />

          <div className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-4">
            {[
              ["Hoàn thành", result.history.completedDays],
              ["Bỏ lỡ", result.history.missedDays],
              ["Chuỗi ngày", result.history.currentStreak],
              ["Check-in", result.history.checkInCount],
            ].map(([label, value]) => (
              <div key={label} className="bg-muted rounded-lg px-3 py-2">
                <p className="text-lg font-bold">{value}</p>
                <p className="text-muted-foreground text-[11px]">{label}</p>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <CalendarDays className="size-3.5" />
            Lịch sử {result.history.from} – {result.history.to}
          </p>
        </section>

        <section className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-amber-950 xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h4 className="flex items-center gap-2 text-sm font-semibold">
                <PackageSearch className="size-4" />
                Sản phẩm sắp hết để live demo
              </h4>
              <p className="mt-2 font-semibold">
                {result.lowStock.productName}
              </p>
              <p className="mt-0.5 font-mono text-xs">{result.lowStock.sku}</p>
            </div>
            <Badge
              variant="outline"
              className={cn(STOCK_WARNING_BADGE_CLASS.LOW, "h-6 px-3")}
            >
              LOW
            </Badge>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs text-amber-800">Dung tích còn lại</p>
              <p className="font-semibold">
                {result.lowStock.remainingMl === null
                  ? "Chưa xác định"
                  : `${result.lowStock.remainingMl} ml`}
              </p>
            </div>
            <div>
              <p className="text-xs text-amber-800">Số ngày còn lại</p>
              <p className="font-semibold">
                {result.lowStock.daysLeft === null
                  ? "Chưa xác định"
                  : `${result.lowStock.daysLeft} ngày`}
              </p>
            </div>
            <div>
              <p className="text-xs text-amber-800">Mức dùng dự kiến</p>
              <p className="font-semibold">{result.lowStock.dailyMl} ml/ngày</p>
            </div>
          </div>
        </section>

        <section className="space-y-3 rounded-xl border p-4 xl:col-span-2">
          <h4 className="text-sm font-semibold">Các bước tiếp theo</h4>
          <ol className="space-y-2 pl-5 text-sm">
            {result.nextSteps.map((step, index) => (
              <li key={`${index}-${step}`} className="list-decimal pl-1">
                {step}
              </li>
            ))}
          </ol>
          <Link
            href={walletHref}
            className={cn(buttonVariants({ variant: "outline" }), "mt-1")}
          >
            <Wallet />
            Mở công cụ nạp ví cho tài khoản này
          </Link>
        </section>
      </div>
    </div>
  );
}

export function DemoCustomerSeeder() {
  const mutation = useSeedDemoCustomer();
  const [result, setResult] = useState<SeedDemoCustomerResponse | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<SeedDemoCustomerFormValues>({
    resolver: zodResolver(seedDemoCustomerSchema),
    defaultValues: defaults,
  });

  const submit = async (values: SeedDemoCustomerFormValues) => {
    setServerError(null);
    form.clearErrors("email");

    const payload: SeedDemoCustomerPayload = {};
    const email = values.email.trim();
    const fullName = values.fullName.trim();
    if (email) payload.email = email;
    if (values.password) payload.password = values.password;
    if (fullName) payload.fullName = fullName;
    if (values.historyDays) payload.historyDays = Number(values.historyDays);

    try {
      const seeded = await mutation.mutateAsync(payload);
      setResult(seeded);
      toast.success("Đã chuẩn bị xong tài khoản khách hàng demo.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể tạo khách hàng demo.";
      if (error instanceof ApiError && error.status === 409) {
        form.setError("email", { message }, { shouldFocus: true });
        return;
      }
      setServerError(message);
    }
  };

  return (
    <Card className="border-emerald-200 shadow-sm">
      <CardHeader className="border-b bg-emerald-50/60">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="size-5 text-emerald-700" />
          Tạo nhanh khách hàng cho live demo
        </CardTitle>
        <p className="text-muted-foreground text-sm font-normal">
          Một lần bấm sẽ tạo tài khoản, đơn đã thanh toán, routine đang hoạt
          động, lịch sử check-in và cảnh báo sản phẩm sắp hết.
        </p>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        <form
          noValidate
          onSubmit={form.handleSubmit(submit)}
          className="space-y-4"
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field data-invalid={Boolean(form.formState.errors.email)}>
              <FieldLabel htmlFor="demo-email">Email tùy chọn</FieldLabel>
              <Input
                id="demo-email"
                type="email"
                autoComplete="off"
                placeholder="demo.tracking@glowscan.local"
                disabled={mutation.isPending}
                aria-invalid={Boolean(form.formState.errors.email)}
                {...form.register("email")}
              />
              <FieldError errors={[form.formState.errors.email]} />
            </Field>

            <Field data-invalid={Boolean(form.formState.errors.password)}>
              <FieldLabel htmlFor="demo-password">Mật khẩu tùy chọn</FieldLabel>
              <Input
                id="demo-password"
                type="password"
                autoComplete="new-password"
                placeholder="P@ssw0rd"
                disabled={mutation.isPending}
                aria-invalid={Boolean(form.formState.errors.password)}
                {...form.register("password")}
              />
              <FieldError errors={[form.formState.errors.password]} />
            </Field>

            <Field data-invalid={Boolean(form.formState.errors.fullName)}>
              <FieldLabel htmlFor="demo-full-name">Họ tên tùy chọn</FieldLabel>
              <Input
                id="demo-full-name"
                autoComplete="off"
                placeholder="Demo Customer"
                disabled={mutation.isPending}
                aria-invalid={Boolean(form.formState.errors.fullName)}
                {...form.register("fullName")}
              />
              <FieldError errors={[form.formState.errors.fullName]} />
            </Field>

            <Field data-invalid={Boolean(form.formState.errors.historyDays)}>
              <FieldLabel htmlFor="demo-history-days">
                Số ngày lịch sử
              </FieldLabel>
              <Input
                id="demo-history-days"
                type="number"
                min={7}
                max={60}
                step={1}
                inputMode="numeric"
                placeholder="14"
                disabled={mutation.isPending}
                aria-invalid={Boolean(form.formState.errors.historyDays)}
                onKeyDown={(event) => {
                  if (["e", "E", "+", "-", ".", ","].includes(event.key)) {
                    event.preventDefault();
                  }
                }}
                {...form.register("historyDays")}
              />
              <FieldDescription>
                Backdate từ 7–60 ngày; mặc định 14 ngày.
              </FieldDescription>
              <FieldError errors={[form.formState.errors.historyDays]} />
            </Field>
          </div>

          {serverError && (
            <Alert variant="destructive">
              <AlertTriangle />
              <AlertTitle>Không thể tạo dữ liệu demo</AlertTitle>
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="submit"
              size="lg"
              disabled={mutation.isPending}
              className="bg-emerald-700 text-white hover:bg-emerald-800"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Đang chuẩn bị dữ liệu demo...
                </>
              ) : (
                <>
                  <Sparkles />
                  Tạo khách hàng demo ngay
                </>
              )}
            </Button>
            <p className="text-muted-foreground text-xs">
              Để trống toàn bộ để BE tự dùng giá trị mặc định và email duy nhất.
            </p>
          </div>
        </form>

        {result && (
          <DemoCustomerResult
            result={result}
            onDismiss={() => setResult(null)}
          />
        )}
      </CardContent>
    </Card>
  );
}
