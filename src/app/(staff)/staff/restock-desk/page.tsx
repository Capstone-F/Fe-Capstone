"use client";

import { RestockQueueTable } from "@/features/admin/cancellations/components/restock-queue-table";

export default function StaffRestockDeskPage() {
  return (
    <div className="page-shell">
      <RestockQueueTable isAdmin={false} />
    </div>
  );
}
