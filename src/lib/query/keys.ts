export const queryKeys = {
  session: ["session"] as const,
  experts: (filters: unknown) => ["experts", filters] as const,
  expert: (id: string) => ["expert", id] as const,
  specialties: ["specialties"] as const,
  slots: (expertId: string) => ["slots", expertId] as const,
  bookings: ["bookings"] as const,
  booking: (id: string) => ["booking", id] as const,
  profile: ["profile"] as const,
  surveyHistory: ["surveyHistory"] as const,
};
