"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  Controller,
  useWatch,
  type Control,
  type UseFormSetValue,
} from "react-hook-form";
import { Check, ChevronDown, Loader2, Search, X } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { cn } from "@/lib/utils";
import { normalizeVietnamese } from "@/shared/utils/string";
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
import type { ShippingAddressFormValues } from "@/features/commerce/schemas/commerce-forms.schema";
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
  control: Control<ShippingAddressFormValues>;
  setValue: UseFormSetValue<ShippingAddressFormValues>;
}

/**
 * Cascading GHN address picker. GHN needs its own province/district/ward identifiers —
 * free text cannot be turned into a valid shipping order — so all three come from the
 * master-data endpoints.
 *
 * Each field owns its own `Controller`, and the component is memoised on two stable
 * props, so typing writes exactly one field and never re-renders the three Selects.
 */
export const GhnAddressForm = memo(function GhnAddressForm({
  control,
  setValue,
}: GhnAddressFormProps) {
  // Only the two parent ids are watched here: they decide which child lists to load.
  // Watching the text fields would re-render the Selects on every keystroke.
  const provinceId = useWatch({ control, name: "provinceId" });
  const districtId = useWatch({ control, name: "districtId" });

  const provinces = useProvinces();
  const districts = useDistricts(provinceId);
  const wards = useWards(districtId);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Controller
        control={control}
        name="recipientName"
        render={({ field, fieldState }) => (
          <Field label={t.recipientName} error={fieldState.error?.message}>
            <Input
              {...field}
              maxLength={RECIPIENT_NAME_MAX_LENGTH}
              placeholder={t.namePlaceholder}
              className="text-sm"
            />
          </Field>
        )}
      />

      <RecipientPhoneField control={control} />

      <Controller
        control={control}
        name="provinceId"
        render={({ field, fieldState }) => (
          <Field label={t.province} error={fieldState.error?.message}>
            <LocationSelect
              value={field.value === null ? "" : `${field.value}`}
              placeholder={t.selectProvince}
              isLoading={provinces.isLoading}
              isError={provinces.isError}
              options={(provinces.data ?? []).map((province) => ({
                value: `${province.id}`,
                label: province.name,
              }))}
              onValueChange={(next) => {
                // Selecting a parent invalidates its children, so they reset together.
                field.onChange(Number(next));
                setValue("districtId", null, { shouldDirty: true });
                setValue("wardCode", null, { shouldDirty: true });
              }}
            />
          </Field>
        )}
      />

      <Controller
        control={control}
        name="districtId"
        render={({ field, fieldState }) => (
          <Field label={t.district} error={fieldState.error?.message}>
            <LocationSelect
              value={field.value === null ? "" : `${field.value}`}
              placeholder={
                provinceId === null ? t.districtNeedsProvince : t.selectDistrict
              }
              disabled={provinceId === null}
              isLoading={districts.isLoading && provinceId !== null}
              isError={districts.isError}
              options={(districts.data ?? []).map((district) => ({
                value: `${district.id}`,
                label: district.name,
              }))}
              onValueChange={(next) => {
                field.onChange(Number(next));
                setValue("wardCode", null, { shouldDirty: true });
              }}
            />
          </Field>
        )}
      />

      <Controller
        control={control}
        name="wardCode"
        render={({ field, fieldState }) => (
          <Field label={t.ward} error={fieldState.error?.message}>
            <LocationSelect
              value={field.value ?? ""}
              placeholder={
                districtId === null ? t.wardNeedsDistrict : t.selectWard
              }
              disabled={districtId === null}
              isLoading={wards.isLoading && districtId !== null}
              isError={wards.isError}
              options={(wards.data ?? []).map((ward) => ({
                value: ward.code,
                label: ward.name,
              }))}
              onValueChange={field.onChange}
            />
          </Field>
        )}
      />

      <div className="sm:col-span-2">
        <Controller
          control={control}
          name="streetAddress"
          render={({ field, fieldState }) => (
            <Field label={t.streetAddress} error={fieldState.error?.message}>
              <Input
                {...field}
                maxLength={STREET_ADDRESS_MAX_LENGTH}
                placeholder={t.streetPlaceholder}
                className="text-sm"
              />
            </Field>
          )}
        />
      </div>
    </div>
  );
});

/**
 * Own component so the debounced validity check re-renders this field alone —
 * a 10-digit number is invalid for its first nine keystrokes, so the error is held
 * back until typing settles, and dropped as soon as the number becomes valid.
 */
function RecipientPhoneField({
  control,
}: {
  control: Control<ShippingAddressFormValues>;
}) {
  return (
    <Controller
      control={control}
      name="recipientPhone"
      render={({ field, fieldState }) => (
        <PhoneInput field={field} error={fieldState.error?.message} />
      )}
    />
  );
}

interface PhoneInputProps {
  field: {
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
    name: string;
    ref: React.Ref<HTMLInputElement>;
  };
  error?: string;
}

function PhoneInput({ field, error }: PhoneInputProps) {
  const settledPhone = useDebounce(field.value, 350);
  const showPhoneError =
    settledPhone.trim() !== "" &&
    !isValidRecipientPhone(settledPhone) &&
    !isValidRecipientPhone(field.value);

  return (
    <Field
      label={t.recipientPhone}
      error={error ?? (showPhoneError ? t.phoneInvalid : undefined)}
    >
      <Input
        {...field}
        inputMode="numeric"
        placeholder={t.phonePlaceholder}
        aria-invalid={showPhoneError}
        className="text-sm"
      />
    </Field>
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
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 150);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value],
  );

  const filteredOptions = useMemo(() => {
    if (!debouncedSearch.trim()) return options;
    const query = normalizeVietnamese(debouncedSearch);
    return options.filter((opt) =>
      normalizeVietnamese(opt.label).includes(query),
    );
  }, [options, debouncedSearch]);

  if (isError) {
    return (
      <p className="bg-warning-soft text-warning rounded-lg px-3 py-2 text-xs">
        {t.loadError}
      </p>
    );
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSearch("");
      }}
    >
      <PopoverTrigger
        disabled={disabled || isLoading}
        className={cn(
          "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-10 w-full items-center justify-between rounded-xl border px-3 py-2 text-sm shadow-xs transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          !selectedOption && "text-muted-foreground",
        )}
      >
        <span className="truncate text-left">
          {isLoading
            ? t.loading
            : selectedOption
              ? selectedOption.label
              : placeholder}
        </span>
        {isLoading ? (
          <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin opacity-50" />
        ) : (
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        )}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        className="w-[280px] max-w-[90vw] p-0 shadow-lg sm:w-[320px]"
      >
        <div className="flex items-center border-b border-slate-100 px-3 py-2 dark:border-slate-800">
          <Search className="mr-2 h-4 w-4 shrink-0 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm nhanh..."
            className="flex h-7 w-full rounded-md bg-transparent text-xs outline-none placeholder:text-slate-400"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="max-h-60 overflow-y-auto p-1 text-xs">
          {options.length === 0 ? (
            <div className="px-3 py-4 text-center text-slate-400">
              {isLoading ? t.loading : t.empty}
            </div>
          ) : filteredOptions.length === 0 ? (
            <div className="px-3 py-4 text-center text-slate-400">
              Không tìm thấy kết quả phù hợp
            </div>
          ) : (
            filteredOptions.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onValueChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors hover:bg-slate-100 dark:hover:bg-slate-800",
                    isSelected &&
                      "bg-emerald-50 font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && (
                    <Check className="ml-2 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
