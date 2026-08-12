"use client";

import { RestockQueueTable } from "@/features/admin/cancellations/components/restock-queue-table";

export default function StaffRestockDeskPage() {
  return (
    // The view owns its own page padding, matching the admin route.
    <RestockQueueTable isAdmin={false} />
  );
}
