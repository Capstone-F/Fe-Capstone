import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { adminExpertsApi } from "../api/admin-experts.api";
import type {
  AdminExpertProfile,
  CreateAvailabilityPayload,
  ExpertAvailabilityBlock,
  UpdateAvailabilityPayload,
} from "../types/expert-admin.types";

/**
 * Every hook here takes the expert PROFILE id (`GET /experts` → `items[].id`).
 * Passing a user id silently targets the wrong record or 404s.
 */

/**
 * Expert profiles keyed by lower-cased email.
 *
 * `ExpertResponseDto` carries no `userId`, so email is the only field that links a profile
 * back to the account row in the users table.
 */
export function useExpertProfilesByEmail() {
  return useQuery({
    queryKey: ["admin-expert-profiles"],
    queryFn: async (): Promise<Map<string, AdminExpertProfile>> => {
      const { items } = (await adminExpertsApi.listProfiles()).data;
      const byEmail = new Map<string, AdminExpertProfile>();
      for (const profile of items) {
        if (profile.email) {
          byEmail.set(profile.email.toLowerCase(), profile);
        }
      }
      return byEmail;
    },
  });
}

export function useExpertAvailability(expertProfileId: string | null) {
  return useQuery({
    queryKey: queryKeys.expertAvailability(expertProfileId ?? ""),
    queryFn: async (): Promise<ExpertAvailabilityBlock[]> =>
      (await adminExpertsApi.getAvailability(expertProfileId as string)).data
        .items,
    enabled: Boolean(expertProfileId),
  });
}

export function useUpdateConsultationFee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      expertProfileId,
      consultationFee,
    }: {
      expertProfileId: string;
      consultationFee: number;
    }) =>
      (
        await adminExpertsApi.updateConsultationFee(
          expertProfileId,
          consultationFee,
        )
      ).data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["experts"] });
    },
  });
}

export function useUpdateExpertClinic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      expertProfileId,
      clinicId,
    }: {
      expertProfileId: string;
      clinicId: string;
    }) =>
      (await adminExpertsApi.updateExpert(expertProfileId, { clinicId })).data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["experts"] });
    },
  });
}

function useAvailabilityInvalidator() {
  const queryClient = useQueryClient();
  return (expertProfileId: string) =>
    queryClient.invalidateQueries({
      queryKey: queryKeys.expertAvailability(expertProfileId),
    });
}

export function useCreateAvailability() {
  const invalidate = useAvailabilityInvalidator();
  return useMutation({
    mutationFn: async ({
      expertProfileId,
      payload,
    }: {
      expertProfileId: string;
      payload: CreateAvailabilityPayload;
    }) =>
      (await adminExpertsApi.createAvailability(expertProfileId, payload)).data,
    onSuccess: (_data, variables) => {
      void invalidate(variables.expertProfileId);
    },
  });
}

export function useUpdateAvailability() {
  const invalidate = useAvailabilityInvalidator();
  return useMutation({
    mutationFn: async ({
      expertProfileId,
      blockId,
      payload,
    }: {
      expertProfileId: string;
      blockId: string;
      payload: UpdateAvailabilityPayload;
    }) =>
      (
        await adminExpertsApi.updateAvailability(
          expertProfileId,
          blockId,
          payload,
        )
      ).data,
    onSuccess: (_data, variables) => {
      void invalidate(variables.expertProfileId);
    },
  });
}

export function useDeleteAvailability() {
  const invalidate = useAvailabilityInvalidator();
  return useMutation({
    mutationFn: async ({
      expertProfileId,
      blockId,
    }: {
      expertProfileId: string;
      blockId: string;
    }) => {
      await adminExpertsApi.deleteAvailability(expertProfileId, blockId);
    },
    onSuccess: (_data, variables) => {
      void invalidate(variables.expertProfileId);
    },
  });
}
