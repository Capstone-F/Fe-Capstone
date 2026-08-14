import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { stockApi } from "../api/stock.api";
import {
  AdjustStockDto,
  CreateStockImportFormDto,
  ImportBatchDto,
  ListStockImportFormsQueryDto,
  RejectStockImportFormDto,
  UpdateStockImportFormDto,
} from "../types/stock.types";

export function useStockImportForms(query?: ListStockImportFormsQueryDto) {
  return useQuery({
    queryKey: queryKeys.stockImportForms(query),
    queryFn: () => stockApi.listImportForms(query),
    placeholderData: keepPreviousData,
  });
}

export function useStockImportFormDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.stockImportForm(id),
    queryFn: () => stockApi.getImportForm(id),
    enabled: Boolean(id),
  });
}

export function useCreateStockImportForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStockImportFormDto) =>
      stockApi.createImportForm(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock", "import-forms"] });
    },
  });
}

export function useUpdateStockImportForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateStockImportFormDto;
    }) => stockApi.updateImportForm(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["stock", "import-forms"] });
      queryClient.invalidateQueries({
        queryKey: queryKeys.stockImportForm(id),
      });
    },
  });
}

export function useSubmitStockImportForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => stockApi.submitImportForm(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["stock", "import-forms"] });
      queryClient.invalidateQueries({
        queryKey: queryKeys.stockImportForm(id),
      });
    },
  });
}

export function useConfirmStockImportForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => stockApi.confirmImportForm(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["stock", "import-forms"] });
      queryClient.invalidateQueries({
        queryKey: queryKeys.stockImportForm(id),
      });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.stockInventory });
    },
  });
}

export function useCancelStockImportForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => stockApi.cancelImportForm(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["stock", "import-forms"] });
      queryClient.invalidateQueries({
        queryKey: queryKeys.stockImportForm(id),
      });
    },
  });
}

export function useRejectStockImportForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data?: RejectStockImportFormDto;
    }) => stockApi.rejectImportForm(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["stock", "import-forms"] });
      queryClient.invalidateQueries({
        queryKey: queryKeys.stockImportForm(id),
      });
    },
  });
}

export function useDirectBatchImport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ImportBatchDto) => stockApi.directBatchImport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.stockInventory });
    },
  });
}

export function useAdjustStockBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdjustStockDto }) =>
      stockApi.adjustBatch(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.stockInventory });
    },
  });
}

export function useStockInventory() {
  return useQuery({
    queryKey: queryKeys.stockInventory,
    queryFn: () => stockApi.listInventory(),
  });
}

export function useLowStockThreshold() {
  return useQuery({
    queryKey: queryKeys.lowStockThreshold,
    queryFn: () => stockApi.getLowStockThreshold(),
  });
}

export function useUpdateLowStockThreshold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (threshold: number) =>
      stockApi.updateLowStockThreshold(threshold),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.lowStockThreshold,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.stockInventory,
      });
    },
  });
}
