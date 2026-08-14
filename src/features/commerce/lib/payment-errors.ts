import { ApiError } from "@/core/api/errors";

const CARRIER_UNAVAILABLE =
  "Không kết nối được đơn vị vận chuyển. Vui lòng thử lại sau ít phút.";
const EMPTY_CART =
  "Giỏ hàng đang trống. Vui lòng thêm sản phẩm trước khi đặt hàng.";
const NOT_PAYABLE = "Đơn hàng không còn ở trạng thái chờ thanh toán.";

/**
 * Turn a checkout failure into Vietnamese copy. Shared by the checkout wizard and
 * the pay-again button so both explain the same backend errors the same way; the
 * caller supplies the fallback because "could not place order" and "could not pay"
 * are different sentences.
 */
export function toPaymentErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (!(error instanceof ApiError)) {
    return fallback;
  }
  if (error.status === 502) {
    return CARRIER_UNAVAILABLE;
  }
  if (error.status === 400) {
    if (/cart is empty/i.test(error.message)) {
      return EMPTY_CART;
    }
    if (/not payable/i.test(error.message)) {
      return NOT_PAYABLE;
    }
  }
  return fallback;
}

/**
 * Wallet checkout failures come back as ready-to-show Vietnamese sentences
 * ("Số dư ví không đủ", "Ví không hoạt động", ...), so they are surfaced as-is
 * instead of being flattened into one generic line.
 */
export function toWalletPaymentErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (
    error instanceof ApiError &&
    error.status !== undefined &&
    error.status >= 400 &&
    error.status < 500 &&
    error.message
  ) {
    return error.message;
  }
  return fallback;
}

/** Balance was short when the wallet debit ran — the caller offers a top-up. */
export function isInsufficientWalletBalance(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status === 400 &&
    /số dư ví không đủ/i.test(error.message)
  );
}

/** The order left PENDING elsewhere (paid or cancelled in another tab). */
export function isOrderNotPayable(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status === 400 &&
    /not payable/i.test(error.message)
  );
}
