import { Suspense } from "react";
import { CustomerDashboard } from "@/features/profile/components/customer-dashboard";

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#F4F3ED]">
      <Suspense
        fallback={
          <div className="flex min-h-[480px] items-center justify-center text-sm text-slate-500">
            Đang tải hồ sơ...
          </div>
        }
      >
        <CustomerDashboard />
      </Suspense>
    </div>
  );
}
