import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/core/api/errors";
import { queryKeys } from "@/lib/query/keys";
import { supportApi } from "../api/support.api";
import {
  CloseSupportSessionDto,
  CreateSupportSessionDto,
  ListSupportSessionsQueryDto,
  MarkSupportReadDto,
  SendSupportMessageDto,
} from "../types/support.types";

export function useMyLiveSupportSession(enabled = true) {
  return useQuery({
    queryKey: queryKeys.supportLiveSession(),
    queryFn: () => supportApi.getMyLiveSession(),
    enabled,
    staleTime: 5000,
    retry: (failureCount, error) =>
      error instanceof ApiError && error.status === 404
        ? false
        : failureCount < 2,
    // `null` means the customer has no live session. Do not keep requesting the
    // endpoint in that valid state; creating a session seeds this query cache.
    refetchInterval: (query) => (query.state.data ? 5000 : false),
  });
}

export function useCreateSupportSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateSupportSessionDto) => supportApi.createSession(dto),
    onSuccess: (sessionData) => {
      queryClient.setQueryData(queryKeys.supportLiveSession(), sessionData);
      queryClient.invalidateQueries({ queryKey: ["support"] });
    },
  });
}

export function useSupportSessions(query?: ListSupportSessionsQueryDto) {
  return useQuery({
    queryKey: queryKeys.supportSessions(query),
    queryFn: () => supportApi.listSessions(query),
    refetchInterval: 5000,
  });
}

export function useSupportSessionDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.supportSession(id),
    queryFn: () => supportApi.getSession(id),
    enabled: Boolean(id),
    refetchInterval: 3000,
  });
}

export function useClaimSupportSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => supportApi.claimSession(id),
    onSuccess: (updatedSession, id) => {
      queryClient.setQueryData(queryKeys.supportSession(id), updatedSession);
      queryClient.invalidateQueries({ queryKey: ["support", "sessions"] });
    },
  });
}

export function useSupportMessagesPolling(
  sessionId: string,
  isChatActive = true,
) {
  return useQuery({
    queryKey: queryKeys.supportMessages(sessionId, 0),
    queryFn: () => supportApi.getMessages(sessionId, 0, 100),
    enabled: Boolean(sessionId) && isChatActive,
    refetchInterval: isChatActive ? 3000 : false,
  });
}

export function useSendSupportMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SendSupportMessageDto }) =>
      supportApi.sendMessage(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.supportMessages(id, 0),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.supportSession(id) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.supportLiveSession(),
      });
      queryClient.invalidateQueries({ queryKey: ["support", "sessions"] });
    },
  });
}

export function useMarkSupportRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MarkSupportReadDto }) =>
      supportApi.markRead(id, data),
    onSuccess: (updatedSession, { id }) => {
      queryClient.setQueryData(queryKeys.supportSession(id), updatedSession);
      queryClient.invalidateQueries({ queryKey: ["support", "sessions"] });
    },
  });
}

export function useCloseSupportSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: CloseSupportSessionDto }) =>
      supportApi.closeSession(id, data),
    onSuccess: (updatedSession, { id }) => {
      queryClient.setQueryData(queryKeys.supportSession(id), updatedSession);
      queryClient.setQueryData(queryKeys.supportLiveSession(), null);
      queryClient.invalidateQueries({ queryKey: ["support"] });
    },
  });
}
