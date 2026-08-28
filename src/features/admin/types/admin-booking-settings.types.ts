export interface BookingSettingsDto {
  confirmTimeoutMin: number;
  noShowGraceMin: number;
  minLeadTimeMin: number;
}

export type UpdateBookingSettingsDto = Partial<BookingSettingsDto>;
