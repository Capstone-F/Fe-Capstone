import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import {
  AdjustStockDto,
  CreateStockImportFormDto,
  ImportBatchDto,
  ListStockImportFormsQueryDto,
  PaginatedStockImportFormsDto,
  RejectStockImportFormDto,
  StockImportFormResponseDto,
  UpdateStockImportFormDto,
} from "../types/stock.types";

export const stockApi = {
  listImportForms: async (params?: ListStockImportFormsQueryDto) => {
    const response = await apiClient.get<PaginatedStockImportFormsDto>(
      API_ENDPOINTS.STOCK.IMPORT_FORMS,
      { params },
    );
    return response.data;
  },

  getImportForm: async (id: string) => {
    const response = await apiClient.get<StockImportFormResponseDto>(
      API_ENDPOINTS.STOCK.IMPORT_FORM_DETAIL(id),
    );
    return response.data;
  },

  createImportForm: async (data: CreateStockImportFormDto) => {
    const response = await apiClient.post<StockImportFormResponseDto>(
      API_ENDPOINTS.STOCK.IMPORT_FORMS,
      data,
    );
    return response.data;
  },

  updateImportForm: async (id: string, data: UpdateStockImportFormDto) => {
    const response = await apiClient.patch<StockImportFormResponseDto>(
      API_ENDPOINTS.STOCK.IMPORT_FORM_DETAIL(id),
      data,
    );
    return response.data;
  },

  submitImportForm: async (id: string) => {
    const response = await apiClient.post<StockImportFormResponseDto>(
      API_ENDPOINTS.STOCK.SUBMIT_IMPORT_FORM(id),
    );
    return response.data;
  },

  confirmImportForm: async (id: string) => {
    const response = await apiClient.patch<StockImportFormResponseDto>(
      API_ENDPOINTS.STOCK.CONFIRM_IMPORT_FORM(id),
    );
    return response.data;
  },

  cancelImportForm: async (id: string) => {
    const response = await apiClient.post<StockImportFormResponseDto>(
      API_ENDPOINTS.STOCK.CANCEL_IMPORT_FORM(id),
    );
    return response.data;
  },

  rejectImportForm: async (id: string, data?: RejectStockImportFormDto) => {
    const response = await apiClient.post<StockImportFormResponseDto>(
      API_ENDPOINTS.STOCK.REJECT_IMPORT_FORM(id),
      data,
    );
    return response.data;
  },

  directBatchImport: async (data: ImportBatchDto) => {
    const response = await apiClient.post(API_ENDPOINTS.STOCK.BATCHES, data);
    return response.data;
  },

  adjustBatch: async (id: string, data: AdjustStockDto) => {
    const response = await apiClient.post(
      API_ENDPOINTS.STOCK.ADJUST_BATCH(id),
      data,
    );
    return response.data;
  },
};
