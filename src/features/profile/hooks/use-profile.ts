import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import {
  getProfile,
  patchProfile,
  getSurveyHistory,
  postSurvey,
  getAllergyOptions,
} from "../api/profile-client";
import { UserProfile } from "@/types/domain";

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: getProfile,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<UserProfile>) => patchProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}

export function useSurveyHistory() {
  return useQuery({
    queryKey: queryKeys.surveyHistory,
    queryFn: getSurveyHistory,
  });
}

export function useSaveSurvey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postSurvey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.surveyHistory });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}

export function useAllergyOptions() {
  return useQuery({
    queryKey: queryKeys.allergyOptions,
    queryFn: getAllergyOptions,
  });
}
