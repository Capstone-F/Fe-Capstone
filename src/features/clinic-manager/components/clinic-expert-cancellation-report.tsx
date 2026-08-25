"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { normalizeApiError } from "@/core/api/errors";
import { ExpertCancellationReport } from "@/features/cancellation-reports/components/expert-cancellation-report";
import { useClinicExpertCancellationStats } from "@/features/cancellation-reports/hooks/useExpertCancellationReports";

const UNBOUND_CLINIC_MESSAGE =
  "Người quản lý phòng khám chưa được gắn với phòng khám";

export function ClinicExpertCancellationReport() {
  const router = useRouter();
  const [windowValue, setWindowValue] = useState("POLICY");
  const days = windowValue === "POLICY" ? undefined : Number(windowValue);
  const query = useClinicExpertCancellationStats({ days });
  const error = query.error ? normalizeApiError(query.error) : null;
  const unboundClinicMessage =
    error?.status === 403 && error.message.includes(UNBOUND_CLINIC_MESSAGE);

  return (
    <ExpertCancellationReport
      scope="clinic"
      data={query.data}
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      error={error}
      onRetry={() => void query.refetch()}
      windowValue={windowValue}
      onWindowChange={setWindowValue}
      onExpertSelect={(expertId) =>
        router.push(`/clinic/bookings?expertId=${encodeURIComponent(expertId)}`)
      }
      unboundClinicMessage={unboundClinicMessage}
    />
  );
}
