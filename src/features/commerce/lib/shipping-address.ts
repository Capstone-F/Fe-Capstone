import type {
  ShippingAddressDraft,
  ShippingAddressInput,
} from "../types/delivery";

/** Mirrors the backend's ShippingAddressDto validation. */
const PHONE_PATTERN = /^0\d{9}$/;
const MAX_TEXT_LENGTH = 1024;

export const RECIPIENT_NAME_MAX_LENGTH = MAX_TEXT_LENGTH;
export const STREET_ADDRESS_MAX_LENGTH = MAX_TEXT_LENGTH;

export function isValidRecipientPhone(value: string): boolean {
  return PHONE_PATTERN.test(value.trim());
}

export function emptyShippingAddressDraft(): ShippingAddressDraft {
  return {
    recipientName: "",
    recipientPhone: "",
    provinceId: null,
    districtId: null,
    wardCode: null,
    streetAddress: "",
  };
}

/**
 * Narrows an in-progress form draft to a payload the backend will accept, or returns
 * null while anything is still missing or invalid. The single source of truth for
 * "is this address usable yet" — used both to gate the wizard and to enable the fee quote.
 */
export function toShippingAddressInput(
  draft: ShippingAddressDraft,
): ShippingAddressInput | null {
  const recipientName = draft.recipientName.trim();
  const recipientPhone = draft.recipientPhone.trim();
  const streetAddress = draft.streetAddress.trim();

  if (recipientName === "" || recipientName.length > MAX_TEXT_LENGTH) {
    return null;
  }
  if (!isValidRecipientPhone(recipientPhone)) {
    return null;
  }
  if (streetAddress === "" || streetAddress.length > MAX_TEXT_LENGTH) {
    return null;
  }
  if (
    draft.provinceId === null ||
    draft.districtId === null ||
    draft.wardCode === null ||
    draft.wardCode === ""
  ) {
    return null;
  }

  return {
    recipientName,
    recipientPhone,
    provinceId: draft.provinceId,
    districtId: draft.districtId,
    wardCode: draft.wardCode,
    streetAddress,
  };
}
