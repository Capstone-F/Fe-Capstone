import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type { AxiosResponse } from "axios";

export interface ClinicWalletResponse {
  clinicId: string;
  balanceVnd: string; // bigint string (e.g. "270000")
  heldEscrowVnd: string;
  pendingWithdrawalsVnd: string;
  isActive: boolean;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountHolder: string | null;
}

export interface UpdateBankAccountDto {
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
}

export const clinicWalletApi = {
  getWallet: (): Promise<AxiosResponse<ClinicWalletResponse>> => {
    return apiClient.get<ClinicWalletResponse>(API_ENDPOINTS.CLINIC.WALLET);
  },

  updateBankAccount: (
    dto: UpdateBankAccountDto,
  ): Promise<AxiosResponse<ClinicWalletResponse>> => {
    return apiClient.put<ClinicWalletResponse>(
      API_ENDPOINTS.CLINIC.BANK_ACCOUNT,
      dto,
    );
  },
};
