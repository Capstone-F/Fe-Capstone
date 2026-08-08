"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { FormController } from "@/shared/components/form/form-controller";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { treatmentApi } from "@/features/treatment/api/treatment.api";
import type { AllergyLabelResponse } from "@/features/profile/types/profile.types";

import {
  guestSurveyBaseProfileSchema,
  type GuestSurveyBaseProfile,
} from "../lib/guest-survey-storage";

type GuestSurveyProfileFormProps = {
  isSubmitting: boolean;
  onSubmit: (profile: GuestSurveyBaseProfile) => Promise<void>;
};

export function GuestSurveyProfileForm({
  isSubmitting,
  onSubmit,
}: GuestSurveyProfileFormProps) {
  const [allergyOptions, setAllergyOptions] = useState<AllergyLabelResponse[]>(
    [],
  );
  const [allergyLoadFailed, setAllergyLoadFailed] = useState(false);
  const form = useForm<GuestSurveyBaseProfile>({
    resolver: zodResolver(guestSurveyBaseProfileSchema),
    defaultValues: {
      name: "",
      phone: "",
      dateOfBirth: "",
      gender: "NOT_PREFER_TO_SAY",
      allergyCodes: [],
    },
  });
  const selectedAllergies = useWatch({
    control: form.control,
    name: "allergyCodes",
  });

  useEffect(() => {
    let active = true;
    treatmentApi
      .fetchAllergyOptionsForGuest()
      .then((response) => {
        if (active) setAllergyOptions(response.data);
      })
      .catch(() => {
        if (active) setAllergyLoadFailed(true);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <form
      className="mx-auto w-full max-w-xl space-y-5 text-left"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      <div className="space-y-1 text-center">
        <h2 className="font-heading text-2xl font-bold text-[#131336]">
          Thông tin cơ bản
        </h2>
        <p className="text-sm text-[#131336]/65">
          Thông tin này giúp kết quả khảo sát phù hợp hơn và sẽ được dùng để
          điền sẵn khi bạn tạo tài khoản.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormController control={form.control} name="name" label="Họ và tên">
          {(field) => (
            <Input
              {...field}
              id={field.name}
              autoComplete="name"
              placeholder="Nguyễn Văn An"
              aria-invalid={Boolean(form.formState.errors.name)}
            />
          )}
        </FormController>

        <FormController
          control={form.control}
          name="phone"
          label="Số điện thoại"
        >
          {(field) => (
            <Input
              {...field}
              id={field.name}
              inputMode="tel"
              autoComplete="tel"
              placeholder="0912345678"
              aria-invalid={Boolean(form.formState.errors.phone)}
            />
          )}
        </FormController>

        <FormController
          control={form.control}
          name="dateOfBirth"
          label="Ngày sinh"
        >
          {(field) => (
            <Input
              {...field}
              id={field.name}
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              aria-invalid={Boolean(form.formState.errors.dateOfBirth)}
            />
          )}
        </FormController>

        <FormController control={form.control} name="gender" label="Giới tính">
          {(field) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger
                id={field.name}
                className="h-9 w-full"
                aria-invalid={Boolean(form.formState.errors.gender)}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FEMALE">Nữ</SelectItem>
                <SelectItem value="MALE">Nam</SelectItem>
                <SelectItem value="NOT_PREFER_TO_SAY">
                  Không muốn cung cấp
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        </FormController>
      </div>

      <FormController
        control={form.control}
        name="allergyCodes"
        label="Thành phần dị ứng hoặc kích ứng"
        description="Có thể bỏ qua nếu bạn chưa biết hoặc không có dị ứng."
      >
        {(field) => (
          <div className="grid gap-2 sm:grid-cols-2">
            {allergyOptions.map((option) => {
              const checked = selectedAllergies.includes(option.code);
              return (
                <label
                  key={option.code}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(nextChecked) => {
                      field.onChange(
                        nextChecked
                          ? [...selectedAllergies, option.code]
                          : selectedAllergies.filter(
                              (code) => code !== option.code,
                            ),
                      );
                    }}
                  />
                  <span>{option.name}</span>
                </label>
              );
            })}
          </div>
        )}
      </FormController>

      {allergyLoadFailed && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Chưa tải được danh sách dị ứng</AlertTitle>
          <AlertDescription>
            Bạn vẫn có thể tiếp tục khảo sát mà không chọn thông tin này và cập
            nhật lại sau khi đăng nhập.
          </AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-12 w-full rounded-xl bg-[#6b5cf6] font-bold text-white hover:bg-[#5a4ae5]"
      >
        {isSubmitting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            Bắt đầu khảo sát
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}
