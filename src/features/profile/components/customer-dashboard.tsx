"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";

import {
  User,
  ShoppingBag,
  CalendarDays,
  Loader2,
  AlertCircle,
  Calendar,
  CreditCard,
  ChevronRight,
  Star,
  Wallet as WalletIcon,
  Info,
  Video,
} from "lucide-react";

import { FeedbackModal } from "@/features/booking/components/feedback-modal";
import { WalletCard } from "@/features/wallet/components/wallet-card";
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
import { FormController } from "@/shared/components/form/form-controller";
import { DatePicker } from "@/shared/components/form/date-picker";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/components/ui/card";
import { useProfile, useUpdateProfile } from "../hooks/useProfile";
import { useOrders } from "@/features/commerce/hooks/useOrders";
import { useBookings } from "@/features/booking/hooks/useBooking";
import { formatVnd } from "@/shared/utils/format";
import type { UserProfile } from "../types/profile.types";
import {
  profileFormSchema,
  type ProfileFormValues,
} from "@/features/profile/schemas/profile-form.schema";

interface ProfileFormProps {
  profile: UserProfile;
  updateProfileMutation: {
    mutate: (variables: Partial<UserProfile>) => void;
    isPending: boolean;
  };
}

function ProfileForm({ profile, updateProfileMutation }: ProfileFormProps) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: profile.name ?? "",
      phone: profile.phone ?? "",
      gender:
        profile.gender === "MALE" || profile.gender === "FEMALE"
          ? profile.gender
          : "OTHER",
      dateOfBirth: profile.dateOfBirth?.split("T")[0] ?? "",
      allergies: profile.allergies ?? [],
    },
  });

  const handleSubmit = (values: ProfileFormValues) => {
    updateProfileMutation.mutate({
      name: values.name,
      phone: values.phone,
      gender: values.gender,
      dateOfBirth: values.dateOfBirth || null,
    });
  };

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="max-w-xl space-y-4"
      noValidate
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormController control={form.control} name="name" label="Họ và tên">
          {(field) => (
            <Input
              {...field}
              id={field.name}
              className="rounded-xl border-slate-200 text-xs"
              placeholder="Nguyễn Văn A"
              aria-invalid={Boolean(form.formState.errors.name)}
            />
          )}
        </FormController>
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-bold text-slate-700">
            Email
          </Label>
          <Input
            id="email"
            value={profile.email}
            disabled
            className="rounded-xl border-slate-200 bg-slate-50 text-xs text-slate-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormController
          control={form.control}
          name="phone"
          label="Số điện thoại"
        >
          {(field) => (
            <Input
              {...field}
              id={field.name}
              inputMode="numeric"
              pattern="[0-9]*"
              className="rounded-xl border-slate-200 text-xs"
              placeholder="09xxxxxxxx"
              onChange={(event) =>
                field.onChange(event.target.value.replace(/\D/g, ""))
              }
              aria-invalid={Boolean(form.formState.errors.phone)}
            />
          )}
        </FormController>
        <FormController control={form.control} name="gender" label="Giới tính">
          {(field) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id={field.name} className="w-full rounded-xl">
                <SelectValue>
                  {field.value === "FEMALE"
                    ? "Nữ"
                    : field.value === "MALE"
                      ? "Nam"
                      : "Khác"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Nam</SelectItem>
                <SelectItem value="FEMALE">Nữ</SelectItem>
                <SelectItem value="OTHER">Khác</SelectItem>
              </SelectContent>
            </Select>
          )}
        </FormController>
      </div>

      <FormController
        control={form.control}
        name="dateOfBirth"
        label="Ngày sinh"
        className="max-w-sm"
      >
        {(field) => (
          <DatePicker
            id={field.name}
            value={field.value}
            onChange={field.onChange}
            invalid={Boolean(form.formState.errors.dateOfBirth)}
            placeholder="Chọn ngày sinh"
            className="w-full text-xs"
          />
        )}
      </FormController>

      <div className="flex justify-end border-t border-slate-100 pt-4">
        <Button
          type="submit"
          disabled={updateProfileMutation.isPending}
          className="rounded-xl bg-[#2C3E35] px-6 font-bold text-white hover:bg-[#3A5246]"
        >
          {updateProfileMutation.isPending ? "Đang lưu..." : "Lưu Thay Đổi"}
        </Button>
      </div>
    </form>
  );
}

type TabType = "profile" | "orders" | "appointments" | "wallet";

export function CustomerDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const activeTab: TabType =
    requestedTab === "orders" ||
    requestedTab === "appointments" ||
    requestedTab === "wallet"
      ? requestedTab
      : "profile";

  const selectTab = (tab: TabType) => {
    router.replace(tab === "profile" ? "/profile" : `/profile?tab=${tab}`, {
      scroll: false,
    });
  };

  // Profile data
  const { data: profile, isLoading: isLoadingProfile } = useProfile();

  // Orders data
  const { orders: hydratedOrders, isLoading: isLoadingOrders } = useOrders({
    page: 1,
    limit: 10,
  });
  const ordersData = hydratedOrders
    ? { orders: hydratedOrders.map((ho) => ho.order) }
    : undefined;

  // Bookings data
  const { data: bookings, isLoading: isLoadingBookings } = useBookings();

  // Feedback modal state
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [selectedDoctorName, setSelectedDoctorName] = useState("");

  const handleOpenFeedback = (bookingId: string, doctorName?: string) => {
    setSelectedBookingId(bookingId);
    setSelectedDoctorName(doctorName || "Bác sĩ");
    setFeedbackModalOpen(true);
  };

  // Update profile mutation
  const updateProfileMutation = useUpdateProfile();

  const isLoading = isLoadingProfile;

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full flex-col items-center justify-center text-center">
        <Loader2 className="text-primary mb-4 h-8 w-8 animate-spin" />
        <p className="text-sm font-medium text-slate-500">
          Đang tải thông tin tài khoản...
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center justify-center p-12 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-600">
          <User className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Chưa Đăng Nhập</h3>
        <p className="mt-1 text-xs text-slate-500">
          Vui lòng đăng nhập để xem thông tin cá nhân, số dư ví và phác đồ điều
          trị của bạn.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button
            onClick={() => router.push("/login?redirectTo=/profile")}
            className="rounded-xl bg-[#6b5cf6] text-xs font-bold text-white hover:bg-[#5a4ae5]"
          >
            Đăng Nhập Ngay
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="rounded-xl text-xs font-semibold"
          >
            Về Trang Chủ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Hồ Sơ Tài Khoản
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Quản lý thông tin cá nhân, đơn hàng và lịch hẹn của bạn.
        </p>
      </div>

      <div className="flex flex-col items-start gap-8 md:flex-row">
        {/* Left Column Navigation */}
        <div className="flex w-full shrink-0 flex-col gap-1.5 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs md:w-64">
          <button
            type="button"
            onClick={() => selectTab("profile")}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold transition-all ${
              activeTab === "profile"
                ? "bg-[#2C3E35] text-white"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <User className="h-4.5 w-4.5" />
            Thông Tin Cá Nhân
          </button>
          <button
            type="button"
            onClick={() => selectTab("wallet")}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold transition-all ${
              activeTab === "wallet"
                ? "bg-[#2C3E35] text-white"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <WalletIcon className="h-4.5 w-4.5" />
            Ví GlowScan & Nạp Tiền
          </button>
          <button
            type="button"
            onClick={() => selectTab("orders")}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold transition-all ${
              activeTab === "orders"
                ? "bg-[#2C3E35] text-white"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <ShoppingBag className="h-4.5 w-4.5" />
            Lịch Sử Đơn Hàng
          </button>
          <button
            type="button"
            onClick={() => selectTab("appointments")}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold transition-all ${
              activeTab === "appointments"
                ? "bg-[#2C3E35] text-white"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <CalendarDays className="h-4.5 w-4.5" />
            Lịch Hẹn Bác Sĩ
          </button>
        </div>

        {/* Right Column Content Panel */}
        <div className="min-h-[480px] w-full flex-1">
          {/* Tab 1: Profile Information */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <Card className="border-slate-200 shadow-2xs">
                <CardHeader className="border-b border-slate-100 p-6">
                  <CardTitle className="text-lg font-bold text-slate-900">
                    Thông Tin Cá Nhân
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Cập nhật thông tin liên hệ và cơ bản để bác sĩ dễ dàng hỗ
                    trợ bạn.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ProfileForm
                    profile={profile}
                    updateProfileMutation={updateProfileMutation}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tab 3: Order History */}
          {activeTab === "orders" && (
            <Card className="border-slate-200 shadow-2xs">
              <CardHeader className="border-b border-slate-100 p-6">
                <CardTitle className="text-lg font-bold text-slate-900">
                  Lịch Sử Đơn Hàng
                </CardTitle>
                <CardDescription className="text-xs">
                  Theo dõi và quản lý trạng thái thanh toán và vận chuyển các
                  đơn hàng của bạn.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {isLoadingOrders ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  </div>
                ) : !ordersData || ordersData.orders.length === 0 ? (
                  <div className="py-12 text-center">
                    <AlertCircle className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                    <p className="text-xs text-slate-500">
                      Bạn chưa thực hiện đơn hàng nào.
                    </p>
                    <Button
                      onClick={() => router.push("/products")}
                      className="mt-4 rounded-xl bg-[#2C3E35] text-xs font-bold text-white"
                    >
                      Mua Sắm Sản Phẩm Ngay
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ordersData.orders.map((order) => (
                      <div
                        key={order.id}
                        onClick={() => router.push(`/orders/${order.id}`)}
                        className="flex cursor-pointer flex-col justify-between rounded-xl border border-slate-100 p-4 transition-all hover:border-slate-200 hover:bg-slate-50/50 sm:flex-row sm:items-center"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">
                              Đơn hàng của bạn
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                order.status === "PAID"
                                  ? "border border-emerald-100 bg-emerald-50 text-emerald-700"
                                  : order.status === "PENDING"
                                    ? "border border-amber-100 bg-amber-50 text-amber-700"
                                    : "border border-slate-200 bg-slate-50 text-slate-600"
                              }`}
                            >
                              {order.status === "PAID"
                                ? "Đã thanh toán"
                                : order.status === "PENDING"
                                  ? "Chờ thanh toán"
                                  : "Đã hủy"}
                            </span>
                          </div>
                          <span className="block text-[10px] text-slate-400">
                            Ngày đặt:{" "}
                            {new Date(order.createdAt).toLocaleDateString(
                              "vi-VN",
                            )}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-4 sm:mt-0 sm:justify-end">
                          <div className="text-right">
                            <span className="block text-[10px] text-slate-400">
                              Tổng tiền
                            </span>
                            <strong className="text-xs font-bold text-slate-950">
                              {formatVnd(order.totalVnd)}
                            </strong>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tab: Wallet & Top-up */}
          {activeTab === "wallet" && <WalletCard />}

          {/* Tab 4: Doctor Appointments */}
          {activeTab === "appointments" && (
            <Card className="border-slate-200 shadow-2xs">
              <CardHeader className="border-b border-slate-100 p-6">
                <CardTitle className="text-lg font-bold text-slate-900">
                  Lịch Hẹn Khám Bác Sĩ
                </CardTitle>
                <CardDescription className="text-xs">
                  Danh sách các cuộc hẹn tư vấn da trực tuyến hoặc trực tiếp với
                  chuyên gia.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {isLoadingBookings ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  </div>
                ) : !bookings || bookings.length === 0 ? (
                  <div className="py-12 text-center">
                    <Calendar className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                    <p className="text-xs text-slate-500">
                      Bạn chưa đăng ký lịch tư vấn nào.
                    </p>
                    <Button
                      onClick={() => router.push("/experts")}
                      className="mt-4 rounded-xl bg-[#6b5cf6] text-xs font-bold text-white hover:bg-[#5a4ae5]"
                    >
                      Tìm Chuyên Gia & Đặt Lịch
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => {
                      const statusNorm = (booking.status || "").toUpperCase();

                      return (
                        <div
                          key={booking.id}
                          className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs sm:flex-row sm:items-center"
                        >
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-900">
                                Bác sĩ: {booking.expertName}
                              </h4>
                              {booking.isFollowUp ? (
                                <span className="rounded-full border border-emerald-300 bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-900 uppercase">
                                  🟢 TÁI KHÁM MIỄN PHÍ 0Đ
                                </span>
                              ) : (
                                <span
                                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                                    statusNorm === "CONFIRMED"
                                      ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                                      : statusNorm === "IN_PROGRESS"
                                        ? "animate-pulse border border-indigo-200 bg-indigo-50 text-indigo-700"
                                        : statusNorm === "COMPLETED"
                                          ? "border border-teal-200 bg-teal-50 text-teal-800"
                                          : statusNorm === "PENDING"
                                            ? booking.isPaid
                                              ? "border border-blue-200 bg-blue-50 text-blue-700"
                                              : "border border-amber-200 bg-amber-50 text-amber-800"
                                            : "border border-red-100 bg-red-50 text-red-600"
                                  }`}
                                >
                                  {statusNorm === "CONFIRMED"
                                    ? "Đã xác nhận"
                                    : statusNorm === "IN_PROGRESS"
                                      ? "🟣 Đang tư vấn"
                                      : statusNorm === "COMPLETED"
                                        ? "✅ Đã hoàn thành"
                                        : statusNorm === "PENDING"
                                          ? booking.isPaid
                                            ? "🔵 Đã trả ví - Chờ duyệt"
                                            : "🟡 Chờ thanh toán ví"
                                          : "Đã hủy"}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>
                                Thời gian:{" "}
                                {new Date(booking.dateTime).toLocaleString(
                                  "vi-VN",
                                )}
                              </span>
                            </div>
                            {booking.symptoms && (
                              <p className="mt-1 rounded-lg border border-slate-100 bg-slate-50 p-2 text-[11px] text-slate-500 italic">
                                Triệu chứng: &quot;{booking.symptoms}&quot;
                              </p>
                            )}

                            {/* Display Submitted Feedback if any */}
                            {booking.feedback && (
                              <div className="mt-2 flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50/60 p-2 text-xs">
                                <div className="flex items-center gap-0.5">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                      key={s}
                                      className={`h-3.5 w-3.5 ${
                                        s <= (booking.feedback?.rating || 0)
                                          ? "fill-amber-400 text-amber-400"
                                          : "fill-slate-200 text-slate-200"
                                      }`}
                                    />
                                  ))}
                                </div>
                                {booking.feedback.comment && (
                                  <span className="text-[11px] font-semibold text-slate-700">
                                    &quot;{booking.feedback.comment}&quot;
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="mt-3 flex flex-col items-end justify-between gap-2 sm:mt-0">
                            <div className="text-right">
                              <span className="block text-[10px] text-slate-400">
                                Chi phí tư vấn
                              </span>
                              <strong className="text-xs font-extrabold text-[#2C3E35]">
                                {booking.isFollowUp
                                  ? "0đ (Tái khám)"
                                  : formatVnd(
                                      booking.feeChargedVnd ||
                                        booking.amount ||
                                        200000,
                                    )}
                              </strong>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap justify-end gap-2">
                              {statusNorm === "PENDING" &&
                                !booking.isPaid &&
                                !booking.isFollowUp && (
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      router.push(
                                        `/booking/${booking.expertId}/checkout?bookingId=${booking.id}`,
                                      )
                                    }
                                    className="rounded-xl bg-amber-600 text-xs font-bold text-white shadow-xs hover:bg-amber-700"
                                  >
                                    <CreditCard className="mr-1.5 h-3.5 w-3.5" />
                                    Thanh toán ngay
                                  </Button>
                                )}
                              {statusNorm !== "CANCELLED" && (
                                <Button
                                  size="sm"
                                  variant={
                                    statusNorm === "CONFIRMED" ||
                                    statusNorm === "IN_PROGRESS"
                                      ? "default"
                                      : "outline"
                                  }
                                  onClick={() =>
                                    router.push(`/appointments/${booking.id}`)
                                  }
                                  className="rounded-xl text-xs font-bold"
                                >
                                  {statusNorm === "CONFIRMED" ||
                                  statusNorm === "IN_PROGRESS" ? (
                                    <Video className="mr-1.5 h-3.5 w-3.5" />
                                  ) : (
                                    <Info className="mr-1.5 h-3.5 w-3.5" />
                                  )}
                                  {statusNorm === "CONFIRMED" ||
                                  statusNorm === "IN_PROGRESS"
                                    ? "Vào phòng tư vấn"
                                    : statusNorm === "COMPLETED"
                                      ? "Xem lại ca tư vấn"
                                      : "Chi tiết"}
                                </Button>
                              )}
                            </div>
                            {statusNorm === "COMPLETED" && (
                              <div className="flex flex-wrap items-center gap-1.5">
                                {!booking.feedback && (
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleOpenFeedback(
                                        booking.id,
                                        booking.expertName,
                                      )
                                    }
                                    className="rounded-xl bg-amber-500 text-xs font-bold text-white shadow-xs hover:bg-amber-600"
                                  >
                                    <Star className="mr-1.5 h-3.5 w-3.5 fill-white" />
                                    Đánh Giá Bác Sĩ
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    router.push(`/booking/${booking.expertId}`)
                                  }
                                  className="rounded-xl border-emerald-200 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
                                >
                                  🔁 Đặt Lịch Tái Khám
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        bookingId={selectedBookingId}
        doctorName={selectedDoctorName}
      />
    </div>
  );
}
