import { apiJson } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { PaymentStatus } from "@/types/domain";

export interface CheckoutResponse {
  paymentId: string;
  paymentUrl: string;
}

interface PaymentStatusResponse {
  id: string;
  orderId: string;
  status: string;
  provider: string;
  amountVnd: string;
  paidAt: string | null;
}

/** Creates (or reuses) a Payment for the order and returns the VNPay redirect URL. */
export async function startCheckout(
  orderId: string,
): Promise<CheckoutResponse> {
  return apiJson<CheckoutResponse>(API_ENDPOINTS.PAYMENTS.CHECKOUT, {
    method: "POST",
    body: { orderId, client: "web" },
  });
}

export async function getPaymentStatus(
  paymentId: string,
): Promise<PaymentStatus> {
  const response = await apiJson<PaymentStatusResponse>(
    API_ENDPOINTS.PAYMENTS.STATUS(paymentId),
  );
  return {
    id: response.id,
    orderId: response.orderId,
    status: response.status as PaymentStatus["status"],
    provider: response.provider as PaymentStatus["provider"],
    amountVnd: response.amountVnd,
    paidAt: response.paidAt,
  };
}
