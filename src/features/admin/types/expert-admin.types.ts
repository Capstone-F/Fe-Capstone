/**
 * Types for the admin-side expert maintenance calls (consultation fee + weekly availability).
 *
 * The BE keys both endpoints by the expert PROFILE id, which is a different value from the
 * user id shown in the account table — see `resolveExpertProfileId` in the management view.
 */

/** Mirrors `ExpertResponseDto`. Note it exposes no `userId`, so the profile is matched by email. */
export interface AdminExpertProfile {
  id: string;
  name: string | null;
  email: string | null;
  clinicId: string | null;
  clinicName: string | null;
  specialization: string;
  consultationFee: number | string;
  isActive: boolean;
}

/** A weekly recurring window. Hours are GMT+7 and must stay inside business hours 09–20. */
export interface ExpertAvailabilityBlock {
  id: string;
  expertId: string;
  /** 0 = Sunday .. 6 = Saturday. */
  dayOfWeek: number;
  /** Inclusive, 9–19. */
  startHour: number;
  /** Exclusive, 10–20, and greater than startHour. */
  endHour: number;
}

/** `GET /experts/:expertId/availability` answers with a wrapper, not a bare array. */
export interface ExpertAvailabilityList {
  items: ExpertAvailabilityBlock[];
}

export interface CreateAvailabilityPayload {
  dayOfWeek: number;
  startHour: number;
  endHour: number;
}

export type UpdateAvailabilityPayload = Partial<CreateAvailabilityPayload>;

export const AVAILABILITY_MIN_START_HOUR = 9;
export const AVAILABILITY_MAX_END_HOUR = 20;

export const DAY_OF_WEEK_LABELS: readonly string[] = [
  "Chủ nhật",
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
];
