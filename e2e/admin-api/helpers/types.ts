/**
 * Response shapes used by the admin API suite.
 *
 * These mirror the BE DTOs (`Be-Capstone/src/**\/dto`) rather than the FE domain types on
 * purpose: the suite asserts on what the API actually returns, so a drift between BE and
 * the FE mappers shows up here instead of being hidden by a mapper.
 */

export interface Paginated<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
}

export interface UserResponse {
  readonly id: string;
  readonly keycloakSub: string;
  readonly email: string | null;
  readonly name: string | null;
  readonly roles: readonly string[];
  readonly clinicId: string | null;
  readonly isActive: boolean;
}

export interface ClinicResponse {
  readonly id: string;
  readonly name: string;
  readonly address: string | null;
  readonly latitude: number | null;
  readonly longitude: number | null;
  readonly isActive: boolean;
}

export interface ExpertResponse {
  readonly id: string;
  readonly userId: string;
  readonly clinicId: string | null;
  readonly specialization: string;
  readonly licenseNumber: string | null;
  readonly bio: string | null;
  readonly avatarUrl: string | null;
  readonly consultationFee: number | string;
  readonly sessionLengthHours: number;
  readonly isActive: boolean;
}

export interface AvailabilityBlock {
  readonly id: string;
  readonly expertId: string;
  readonly dayOfWeek: number;
  readonly startHour: number;
  readonly endHour: number;
}

export interface SurveyQuestionOption {
  readonly labelCode?: string;
  readonly label?: { readonly code: string };
  readonly displayOrder: number;
}

export interface AdminSurveyQuestion {
  readonly id: string;
  readonly code: string;
  readonly text: string;
  readonly questionType: string;
  readonly displayOrder: number;
  readonly priority: string;
  readonly category: string;
  readonly intent: string | null;
  readonly isActive: boolean;
  readonly options: readonly SurveyQuestionOption[];
}

export interface ComboDiscountSetting {
  readonly percent: number;
  readonly minSubtotalVnd: number;
}

export interface WalletBalance {
  readonly balanceVnd: number | string;
}

export interface ProductVariant {
  readonly id: string;
  readonly sku: string;
  readonly priceVnd: number;
  readonly isActive: boolean;
  readonly imageUrl: string | null;
}

export interface ProductResponse {
  readonly id: string;
  readonly name: string;
  readonly variants: readonly ProductVariant[];
}

export interface ProductDetailResponse {
  readonly product: ProductResponse;
}

export interface StockBatchResponse {
  readonly id: string;
  readonly productVariantId: string;
  readonly quantity?: number;
  readonly remainingQuantity: number;
  readonly batchCode: string | null;
}

export interface StockImportFormResponse {
  readonly id: string;
  readonly status: string;
  readonly productVariantId: string;
  readonly quantity: number;
  readonly stockBatchId: string | null;
}

export interface SupportSessionResponse {
  readonly id: string;
  readonly status: string;
  readonly assignedStaffUserId: string | null;
  readonly customerUserId?: string;
}

export interface SupportMessageResponse {
  readonly id: string;
  readonly seq: number;
  readonly content: string;
  readonly senderRole: string;
}

export interface OrderItemResponse {
  readonly id: string;
  readonly productVariantId: string;
  readonly quantity: number;
  readonly unitPriceVnd: number;
  readonly lineTotalVnd: number;
}

export interface OrderResponse {
  readonly id: string;
  readonly status: string;
  readonly subtotalVnd: number;
  readonly discountVnd: number;
  readonly shippingFeeVnd: number;
  readonly totalVnd: number;
  readonly items: readonly OrderItemResponse[];
}

export interface DeliveryAdminResponse {
  readonly id: string;
  readonly orderId: string;
  readonly status: string;
  readonly providerOrderCode: string | null;
  readonly providerStatus: string | null;
  readonly handedOverAt: string | null;
  readonly handedOverByUserId: string | null;
}

export interface DeliveryTransition {
  readonly deliveryId: string;
  readonly providerStatus: string;
  readonly deliveryStatus: string | null;
}

export interface AdvanceDeliveryResponse {
  readonly delivery: DeliveryAdminResponse;
  readonly transitions: readonly DeliveryTransition[];
}

export interface CancellationItem {
  readonly id: string;
  readonly orderItemId: string;
  readonly expectedQuantity: number;
  readonly goodQuantity: number | null;
  readonly damagedQuantity: number | null;
}

export interface OrderCancellationResponse {
  readonly id: string;
  readonly orderId: string;
  readonly status: string;
  readonly requestedByActor: string;
  readonly refundAmountVnd: string;
  readonly refundedAt: string | null;
  readonly items: readonly CancellationItem[];
}

export interface AdvanceCancellationResponse {
  readonly cancellation: OrderCancellationResponse;
  readonly transitions: readonly {
    readonly from: string;
    readonly to: string;
  }[];
}

export interface CheckoutResponse {
  readonly paymentId: string;
  readonly paymentUrl: string;
}

/** `GET /customers/me` wraps the profile plus its allergy/survey/treatment history. */
export interface CustomerMeResponse {
  readonly customer: {
    readonly id: string;
    readonly phone: string | null;
    readonly skinType: string | null;
  };
  readonly allergies: readonly {
    readonly code?: string;
    readonly labelCode?: string;
  }[];
}

export interface GhnProvince {
  readonly provinceId?: number;
  readonly ProvinceID?: number;
  readonly provinceName?: string;
  readonly ProvinceName?: string;
}

export interface GhnDistrict {
  readonly districtId?: number;
  readonly DistrictID?: number;
}

export interface GhnWard {
  readonly wardCode?: string;
  readonly WardCode?: string;
}
