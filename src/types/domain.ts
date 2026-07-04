export interface Expert {
  id: string;
  name: string;
  title: string;
  clinic: string;
  rating: number;
  reviews: number;
  fee: number;
  specialties: string[];
  avatar?: string;
  bio?: string;
  distance?: number; // in km
}

export interface TimeSlot {
  id: string;
  expertId: string;
  dateTime: string; // ISO string
  isBooked: boolean;
}

export interface ConsultationBooking {
  id: string;
  expertId: string;
  expertName: string;
  userId: string;
  slotId: string;
  dateTime: string;
  symptoms: string;
  status: "pending" | "confirmed" | "cancelled" | "paid";
  amount: number;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  allergies: string[];
  baumannCode?: string;
}

export interface SurveyAnswers {
  baumannOilyDry: "O" | "D" | "";
  baumannSensitiveResistant: "S" | "R" | "";
  baumannPigmentNon: "P" | "N" | "";
  baumannWrinkleTight: "W" | "T" | "";
  hydration: 0 | 25 | 50 | 75 | 100 | "";
  currentRoutineProducts: string;
  currentActiveIngredients: string[];
  morningRoutineText: string;
  eveningRoutineText: string;
  irritationStatus: "none" | "mild" | "redness" | "burning" | "itchy" | "";
  treatmentGoals: string[];
  primaryConcern: string;
  pregnancy: "yes" | "no" | "declined" | "";
  breastfeeding: "yes" | "no" | "declined" | "";
  menstruation: "yes" | "no" | "declined" | "";
  hormonalChanges: "yes" | "no" | "declined" | "";
  otherDermatology: "yes" | "no" | "declined" | "";
  prescriptionMeds: "yes" | "no" | "declined" | "";
  photoUploaded: boolean;
  photoFile: string | null;
}

export interface SurveyRecord {
  id: string;
  userId: string;
  baumannCode: string;
  answers: SurveyAnswers;
  createdAt: string;
}
