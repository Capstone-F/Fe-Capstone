import { z } from "zod";

export const guestSurveyBaseProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Họ và tên phải có ít nhất 2 ký tự.")
    .max(100, "Họ và tên không được vượt quá 100 ký tự."),
  phone: z
    .string()
    .trim()
    .regex(/^0\d{9}$/, "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0."),
  dateOfBirth: z
    .string()
    .min(1, "Vui lòng chọn ngày sinh.")
    .refine((value) => {
      const date = new Date(`${value}T00:00:00`);
      return !Number.isNaN(date.getTime()) && date <= new Date();
    }, "Ngày sinh không hợp lệ hoặc nằm trong tương lai."),
  gender: z.enum(["MALE", "FEMALE", "NOT_PREFER_TO_SAY"], {
    message: "Vui lòng chọn giới tính.",
  }),
  allergyCodes: z.array(z.string()),
});

const guestSurveySessionSchema = z.object({
  guestToken: z.string().min(1),
  surveyId: z.string().min(1),
  baseProfile: guestSurveyBaseProfileSchema,
  createdAt: z.string().datetime(),
});

export type GuestSurveyBaseProfile = z.infer<
  typeof guestSurveyBaseProfileSchema
>;
export type GuestSurveySession = z.infer<typeof guestSurveySessionSchema>;

const STORAGE_KEY = "glowscan_guest_survey_v1";

export const guestSurveyStorage = {
  get(): GuestSurveySession | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = guestSurveySessionSchema.safeParse(JSON.parse(raw));
      if (!parsed.success) {
        window.localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return parsed.data;
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  },

  set(session: GuestSurveySession): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  },

  clear(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_KEY);
  },
};
