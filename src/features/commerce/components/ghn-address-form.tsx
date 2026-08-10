"use client";

import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  useDistricts,
  useProvinces,
  useWards,
} from "@/features/commerce/hooks/useDelivery";
import {
  RECIPIENT_NAME_MAX_LENGTH,
  STREET_ADDRESS_MAX_LENGTH,
  isValidRecipientPhone,
} from "@/features/commerce/lib/shipping-address";
import type { ShippingAddressDraft } from "@/features/commerce/types/delivery";
import useDebounce from "@/shared/hooks/useDebounce";

const t = {
  recipientName: "Họ và tên người nhận",
  recipientPhone: "Số điện thoại",
  province: "Tỉnh / Thành phố",
  district: "Quận / Huyện",
  ward: "Phường / Xã",
  streetAddress: "Địa chỉ (số nhà, tên đường)",
  selectProvince: "Chọn tỉnh / thành phố",
  selectDistrict: "Chọn quận / huyện",
  selectWard: "Chọn phường / xã",
  districtNeedsProvince: "Chọn tỉnh / thành phố trước",
  wardNeedsDistrict: "Chọn quận / huyện trước",
  loading: "Đang tải...",
  loadError: "Không tải được danh sách. Vui lòng thử lại.",
  empty: "Không có dữ liệu",
  phoneInvalid: "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0.",
  namePlaceholder: "Nguyễn Văn A",
  phonePlaceholder: "0901234567",
  streetPlaceholder: "123 Lê Lợi, toà nhà ABC",
};

interface GhnAddressFormProps {
  value: ShippingAddressDraft;
  onChange: (next: ShippingAddressDraft) => void;
  errors?: Partial<Record<keyof ShippingAddressDraft, string>>;
}

/**
 * Cascading GHN address picker. GHN needs its own province/district/ward identifiers —
 * free text cannot be turned into a valid shipping order — so all three come from the
 * master-data endpoints.
 */
export function GhnAddressForm({
  value,
  onChange,
  errors = {},
}: GhnAddressFormProps) {
  const provinces = useProvinces();
  const districts = useDistricts(value.provinceId);
  const wards = useWards(value.districtId);

  // A 10-digit number is invalid for its first nine keystrokes, so the error is held
  // back until typing settles — and dropped as soon as the number becomes valid.
  const settledPhone = useDebounce(value.recipientPhone, 350);
  const showPhoneError =
    settledPhone.trim() !== "" &&
    !isValidRecipientPhone(settledPhone) &&
    !isValidRecipientPhone(value.recipientPhone);

  // Selecting a parent invalidates its children, so they reset together.
  const handleProvinceChange = (provinceId: number) => {
    onChange({ ...value, provinceId, districtId: null, wardCode: null });
  };

  const handleDistrictChange = (districtId: number) => {
    onChange({ ...value, districtId, wardCode: null });
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Field label={t.recipientName} error={errors.recipientName}>
        <Input
          value={value.recipientName}
          maxLength={RECIPIENT_NAME_MAX_LENGTH}
          placeholder={t.namePlaceholder}
          onChange={(e) =>
            onChange({ ...value, recipientName: e.target.value })
          }
          className="text-sm"
        />
      </Field>

      <Field
        label={t.recipientPhone}
        error={
          errors.recipientPhone ?? (showPhoneError ? t.phoneInvalid : undefined)
        }
      >
        <Input
          value={value.recipientPhone}
          inputMode="numeric"
          placeholder={t.phonePlaceholder}
          aria-invalid={showPhoneError}
          onChange={(e) =>
            onChange({ ...value, recipientPhone: e.target.value })
          }
          className="text-sm"
        />
      </Field>

      <Field label={t.province} error={errors.provinceId}>
        <LocationSelect
          value={value.provinceId === null ? "" : `${value.provinceId}`}
          placeholder={t.selectProvince}
          isLoading={provinces.isLoading}
          isError={provinces.isError}
          options={(provinces.data ?? []).map((province) => ({
            value: `${province.id}`,
            label: province.name,
          }))}
          onValueChange={(next) => handleProvinceChange(Number(next))}
        />
      </Field>

      <Field label={t.district} error={errors.districtId}>
        <LocationSelect
          value={value.districtId === null ? "" : `${value.districtId}`}
          placeholder={
            value.provinceId === null
              ? t.districtNeedsProvince
              : t.selectDistrict
          }
          disabled={value.provinceId === null}
          isLoading={districts.isLoading && value.provinceId !== null}
          isError={districts.isError}
          options={(districts.data ?? []).map((district) => ({
            value: `${district.id}`,
            label: district.name,
          }))}
          onValueChange={(next) => handleDistrictChange(Number(next))}
        />
      </Field>

      <Field label={t.ward} error={errors.wardCode}>
        <LocationSelect
          value={value.wardCode ?? ""}
          placeholder={
            value.districtId === null ? t.wardNeedsDistrict : t.selectWard
          }
          disabled={value.districtId === null}
          isLoading={wards.isLoading && value.districtId !== null}
          isError={wards.isError}
          options={(wards.data ?? []).map((ward) => ({
            value: ward.code,
            label: ward.name,
          }))}
          onValueChange={(next) => onChange({ ...value, wardCode: next })}
        />
      </Field>

      <div className="sm:col-span-2">
        <Field label={t.streetAddress} error={errors.streetAddress}>
          <Input
            value={value.streetAddress}
            maxLength={STREET_ADDRESS_MAX_LENGTH}
            placeholder={t.streetPlaceholder}
            onChange={(e) =>
              onChange({ ...value, streetAddress: e.target.value })
            }
            className="text-sm"
          />
        </Field>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-semibold text-slate-700">{label}</Label>
      {children}
      {error && <span className="text-destructive text-xs">{error}</span>}
    </div>
  );
}

interface LocationSelectProps {
  value: string;
  placeholder: string;
  options: { value: string; label: string }[];
  onValueChange: (value: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  isError?: boolean;
}

function LocationSelect({
  value,
  placeholder,
  options,
  onValueChange,
  disabled,
  isLoading,
  isError,
}: LocationSelectProps) {
  if (isError) {
    return (
      <p className="bg-warning-soft text-warning rounded-lg px-3 py-2 text-xs">
        {t.loadError}
      </p>
    );
  }

  return (
    <Select
      // Base UI's SelectValue renders the raw value (the GHN id) unless the root
      // is given the value -> label pairs to look the selected name up from.
      items={options}
      value={value}
      // The primitive can emit null on clear; there is nothing to select then.
      onValueChange={(next) => next !== null && onValueChange(next)}
      disabled={disabled || isLoading}
    >
      <SelectTrigger className="w-full text-sm">
        <SelectValue placeholder={isLoading ? t.loading : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.length === 0 ? (
          <div className="text-muted-foreground px-3 py-2 text-xs">
            {isLoading ? t.loading : t.empty}
          </div>
        ) : (
          options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
