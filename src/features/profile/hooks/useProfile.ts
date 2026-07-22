import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { appConfig } from "@/lib/env";
import { profileApi } from "../api/profile.api";
import { profileMock } from "../api/profile.mock";
import { tokenStorage } from "@/features/auth/utils/token-storage";
import { extractBaumannFromAnswers } from "../mapper/profile-mapper";
import type { UserProfile, AllergyLabelResponse } from "../types/profile.types";
import type { SurveyAnswers, SurveyRecord } from "@/types/domain";

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: async (): Promise<UserProfile | null> => {
      if (appConfig.useMockApi) {
        return profileMock.getProfile();
      }

      if (typeof window !== "undefined" && !tokenStorage.getAccessToken()) {
        return null;
      }

      try {
        const [userResponse, dataResponse] = await Promise.all([
          profileApi.getUserMe(),
          profileApi.getCustomerMe(),
        ]);

        const user = userResponse.data;
        const data = dataResponse.data;

        return {
          id: data.customer?.id ?? user.id,
          name: user.name || "GlowScan User",
          email: user.email || "user@glowscan.local",
          phone: data.customer?.phone ?? "",
          gender: data.customer?.gender as "MALE" | "FEMALE" | "OTHER",
          dateOfBirth: data.customer?.dateOfBirth,
          allergies: data.allergies?.map((a) => a.code) ?? [],
          baumannCode: data.customer?.skinType?.code,
          oilyDryScore: data.customer?.baumannScores?.oilyDryScore,
        };
      } catch {
        return null;
      }
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<UserProfile>): Promise<UserProfile> => {
      if (appConfig.useMockApi) {
        return profileMock.patchProfile(data);
      }

      if (data.name !== undefined) {
        await profileApi.patchUserMe(data.name);
      }

      const body: Record<string, unknown> = {};
      if (data.phone !== undefined) body.phone = data.phone || null;
      if (data.gender !== undefined) body.gender = data.gender || null;
      if (data.dateOfBirth !== undefined)
        body.dateOfBirth = data.dateOfBirth || null;
      if (data.allergies !== undefined) body.allergyLabelCodes = data.allergies;

      await profileApi.patchCustomerMe(body);

      // Fetch the updated profile to return
      const queryKey = queryKeys.profile;
      const updated = await queryClient.fetchQuery({
        queryKey,
        queryFn: async (): Promise<UserProfile | null> => {
          const [userResponse, dataResponse] = await Promise.all([
            profileApi.getUserMe(),
            profileApi.getCustomerMe(),
          ]);

          const user = userResponse.data;
          const data = dataResponse.data;

          return {
            id: data.customer?.id ?? user.id,
            name: user.name || "GlowScan User",
            email: user.email || "user@glowscan.local",
            phone: data.customer?.phone ?? "",
            gender: data.customer?.gender as "MALE" | "FEMALE" | "OTHER",
            dateOfBirth: data.customer?.dateOfBirth,
            allergies: data.allergies?.map((a) => a.code) ?? [],
            baumannCode: data.customer?.skinType?.code,
            oilyDryScore: data.customer?.baumannScores?.oilyDryScore,
          };
        },
      });

      if (!updated) {
        throw new Error("Không thể tải thông tin profile sau khi cập nhật");
      }
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}

export function useSurveyHistory() {
  return useQuery({
    queryKey: queryKeys.surveyHistory,
    queryFn: async (): Promise<SurveyRecord[]> => {
      if (appConfig.useMockApi) {
        return profileMock.getSurveyHistory();
      }

      const response = await profileApi.getCustomerMe();
      const data = response.data;

      return data.surveyHistory
        .filter((s) => s.isCompleted)
        .map((s) => ({
          id: s.id,
          userId: data.customer?.id ?? "",
          baumannCode: extractBaumannFromAnswers(s.answers),
          answers: {} as SurveyAnswers,
          createdAt: s.createdAt,
        }));
    },
  });
}

export function useSaveSurvey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (answers: SurveyAnswers) => profileMock.postSurvey(answers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.surveyHistory });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}

export function useAllergyOptions() {
  return useQuery({
    queryKey: queryKeys.allergyOptions,
    queryFn: async (): Promise<AllergyLabelResponse[]> => {
      if (appConfig.useMockApi) {
        return profileMock.getAllergyOptions();
      }
      const response = await profileApi.getAllergyOptions();
      return response.data;
    },
  });
}
