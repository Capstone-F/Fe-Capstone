"use client";

import { RestockQueueTable } from "@/features/admin/cancellations/components/restock-queue-table";

export default function AdminCancellationsPage() {
  return <RestockQueueTable isAdmin={true} />;
}
