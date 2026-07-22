export interface Expert {
  id: string;
  name: string;
  title: string;
  clinic: string;
  rating: number;
  reviews: number;
  fee: number;
  specialties: string[];
  price?: string;
  tags?: string[];
  avatar?: string;
  bio?: string;
  distance?: number; // in km
}

export interface BackendExpert {
  id: string;
  name: string | null;
  email: string | null;
  clinicId: string | null;
  clinicName: string | null;
  specialization: string;
  licenseNumber: string | null;
  bio: string | null;
  rating: number;
  consultationFee: number | string;
  distanceKm: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExpertFilters {
  specialty?: string;
  search?: string;
  minRating?: number;
  maxFee?: number;
  maxDistance?: number;
  lat?: number;
  lng?: number;
}
