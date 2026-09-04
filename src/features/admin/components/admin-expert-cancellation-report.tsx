"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAdminClinics } from "@/features/admin/hooks/useAdminClinics";
import { ExpertCancellationReport } from "@/features/cancellation-reports/components/expert-cancellation-report";
import { useAdminExpertCancellationStats } from "@/features/cancellation-reports/hooks/useExpertCancellationReports";
import { normalizeApiError } from "@/core/api/errors";
import { ExpertCancellationPolicyCard } from "./expert-cancellation-policy-card";

export function AdminExpertCancellationReport() {
  const router = useRouter();
  const [windowValue, setWindowValue] = useState("POLICY");
  const [clinicId, setClinicId] = useState("ALL");
  const days = windowValue === "POLICY" ? undefined : Number(windowValue);
  const query = useAdminExpertCancellationStats({
    days,
    clinicId: clinicId === "ALL" ? undefined : clinicId,
  });
  const clinicsQuery = useAdminClinics({ limit: 100 });

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <ExpertCancellationReport
        scope="admin"
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching}
        error={query.error ? normalizeApiError(query.error) : null}
        onRetry={() => void query.refetch()}
        windowValue={windowValue}
        onWindowChange={setWindowValue}
        clinics={clinicsQuery.data?.items ?? []}
        clinicId={clinicId}
        onClinicChange={setClinicId}
        onExpertSelect={(expertId) =>
          router.push(
            `/dashboard/experts?expertId=${encodeURIComponent(expertId)}`,
          )
        }
      />
      <ExpertCancellationPolicyCard />
    </div>
  );
}
