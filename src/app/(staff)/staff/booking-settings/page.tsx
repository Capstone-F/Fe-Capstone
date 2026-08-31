"use client";

import { CalendarClock } from "lucide-react";

import { BookingSettingsCard } from "@/features/admin/components/booking-settings-card";
import { StaffPageHeader } from "@/features/staff/components/staff-page-header";

export default function StaffBookingSettingsPage() {
  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <StaffPageHeader
        icon={CalendarClock}
        title="Cài Đặt Lịch Hẹn"
        description="Xem các tham số deadline booking hiện hành. Chỉ Admin mới có thể chỉnh sửa."
      />

      <BookingSettingsCard />
    </div>
  );
}
