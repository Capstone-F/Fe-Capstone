import { ApiClient } from "./api";

/**
 * State shared across the TC-ADM cases.
 *
 * The plan runs as one ordered scenario (clinic -> expert -> availability, order ->
 * handover, order -> cancellation -> restock), so later cases need ids produced by
 * earlier ones. `need` turns a missing id into a readable failure that names the case
 * that should have produced it, instead of an "undefined is not a string" further down.
 */

export interface Actor {
  readonly token: string;
  readonly userId: string;
  readonly email: string;
}

export interface OrderFixture {
  readonly orderId: string;
  readonly deliveryId: string;
  readonly totalVnd: number;
  readonly subtotalVnd: number;
  readonly discountVnd: number;
  readonly shippingFeeVnd: number;
  readonly items: readonly {
    readonly orderItemId: string;
    readonly quantity: number;
  }[];
}

export interface AdminSuiteContext {
  readonly admin: ApiClient;
  readonly anon: ApiClient;
  /** Unique per run so the suite can be re-run without colliding on unique columns. */
  readonly runId: string;

  adminUserId?: string;
  customer?: Actor;
  customerClient?: ApiClient;
  customerProfileId?: string;
  createdStaffUserId?: string;
  clinicId?: string;
  expertUserId?: string;
  expertId?: string;
  availabilityId?: string;
  surveyQuestionId?: string;
  originalComboDiscount?: {
    readonly percent: number;
    readonly minSubtotalVnd: number;
  };
  productVariantId?: string;
  stockBatchId?: string;
  importFormId?: string;
  supportSessionId?: string;
  handoverOrder?: OrderFixture;
  cancellationOrder?: OrderFixture;
}

export function need<T>(value: T | null | undefined, what: string): T {
  if (value === undefined || value === null) {
    throw new Error(
      `Missing ${what} — the case that produces it did not complete. Run the whole suite in order.`,
    );
  }
  return value;
}
