export interface BookingSettingsDto {
  confirmTimeoutMin: number;
  noShowGraceMin: number;
  minLeadTimeMin: number;
  warnings?: string[];
}

export type UpdateBookingSettingsDto = Partial<BookingSettingsDto>;
