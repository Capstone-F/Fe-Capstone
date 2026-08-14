export interface Clinic {
  id: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  isActive: boolean;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankAccountHolder?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedClinicsResponse {
  items: Clinic[];
  total: number;
  page: number;
  limit: number;
}

export interface ListClinicsQuery {
  page?: number;
  limit?: number;
}
