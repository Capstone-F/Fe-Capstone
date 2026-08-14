import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type { AxiosResponse } from "axios";
import type { WalletCheckoutResponse } from "../types/order";

export interface CheckoutResponse {
  paymentId: string;
  paymentUrl: string;
}

export interface PaymentStatusResponse {
  id: string;
  orderId: string;
  status: string;
  provider: string;
  amountVnd: string;
  paidAt: string | null;
}

export const paymentsApi = {
  startCheckout: (
    orderId: string,
  ): Promise<AxiosResponse<CheckoutResponse>> => {
    return apiClient.post<CheckoutResponse>(API_ENDPOINTS.PAYMENTS.CHECKOUT, {
      orderId,
      client: "web",
    });
  },

  /** Settles the order from the customer wallet — no gateway redirect, PAID on return. */
  checkoutWithWallet: (
    orderId: string,
  ): Promise<AxiosResponse<WalletCheckoutResponse>> => {
    return apiClient.post<WalletCheckoutResponse>(
      API_ENDPOINTS.PAYMENTS.CHECKOUT_WALLET,
      { orderId },
    );
  },

  getPaymentStatus: (
    paymentId: string,
  ): Promise<AxiosResponse<PaymentStatusResponse>> => {
    return apiClient.get<PaymentStatusResponse>(
      API_ENDPOINTS.PAYMENTS.STATUS(paymentId),
    );
  },
};
