import { Expert } from "@/types/domain";
import { appConfig } from "@/lib/env";
import { apiJson } from "@/lib/api/client";

// Centralized endpoints for Experts
export const EXPERT_API_PATHS = {
  GET_EXPERTS: "/experts",
  GET_EXPERT_DETAIL: (id: string) => `/experts/${id}`,
  GET_SPECIALTIES: "/experts/meta/specialties",
};

const MOCK_EXPERTS: Expert[] = [
  {
    id: "exp_1",
    name: "ThS. BS. Nguyễn Mai Anh",
    title: "Chuyên khoa I - Da liễu thẩm mỹ",
    clinic: "Seoul Skincare Clinic (Cầu Giấy, HN)",
    rating: 4.9,
    reviews: 142,
    fee: 250000,
    specialties: ["Trị mụn", "Phục hồi da", "Sẹo rỗ"],
    distance: 2.5,
    bio: "Hơn 8 năm kinh nghiệm trong điều trị các bệnh lý trứng cá nặng, phục hồi da nhiễm corticoid và trị sẹo chuyên sâu.",
  },
  {
    id: "exp_2",
    name: "BS. Lê Hoàng Long",
    title: "Bác sĩ nội trú Da liễu",
    clinic: "GlowScan Partner Clinic (Quận 3, HCM)",
    rating: 4.8,
    reviews: 98,
    fee: 200000,
    specialties: ["Chống lão hóa", "Nám & Tàn nhang", "Peel da"],
    distance: 5.0,
    bio: "Chuyên gia về thiết kế routine chống lão hóa và ứng dụng công nghệ chemical peel trong điều trị sắc tố da.",
  },
  {
    id: "exp_3",
    name: "BS. Trần Thu Hà",
    title: "Thạc sĩ Y khoa - Da liễu",
    clinic: "Phòng khám Da liễu Hà Nội (Đống Đa, HN)",
    rating: 4.7,
    reviews: 76,
    fee: 300000,
    specialties: ["Trị mụn", "Nám & Tàn nhang"],
    distance: 1.2,
    bio: "Nguyên bác sĩ khoa Da liễu bệnh viện Bạch Mai, chuyên điều trị nám má nội tiết và mụn nội tiết tố.",
  },
  {
    id: "exp_4",
    name: "BS. Phạm Minh Quân",
    title: "Chuyên gia Laser & Thiết bị năng lượng",
    clinic: "GlowScan Partner Clinic (Quận 1, HCM)",
    rating: 4.5,
    reviews: 45,
    fee: 150000,
    specialties: ["Sẹo rỗ", "Peel da"],
    distance: 10.5,
    bio: "Có thế mạnh về phục hồi sẹo lõm bằng công nghệ laser CO2 fractional kết hợp tiêm Meso phục hồi.",
  },
];

// Helper to map specialization ENUM from BE to Vietnamese display name
function translateSpecialization(spec: string): string {
  switch (spec) {
    case "DERMATOLOGY":
      return "Da liễu tổng quát";
    case "COSMETIC_DERMATOLOGY":
      return "Phục hồi da";
    case "ACNE_TREATMENT":
      return "Trị mụn";
    case "ANTI_AGING":
      return "Chống lão hóa";
    case "PIGMENTATION":
      return "Nám & Tàn nhang";
    case "LASER_THERAPY":
      return "Sẹo rỗ";
    case "AESTHETIC_MEDICINE":
      return "Peel da";
    default:
      return spec;
  }
}

// Map BE specialization to FE query filter enum
function mapSpecialtyToBackend(specialty: string): string | null {
  switch (specialty) {
    case "Trị mụn":
      return "ACNE_TREATMENT";
    case "Phục hồi da":
      return "COSMETIC_DERMATOLOGY";
    case "Chống lão hóa":
      return "ANTI_AGING";
    case "Nám & Tàn nhang":
      return "PIGMENTATION";
    case "Sẹo rỗ":
      return "LASER_THERAPY";
    case "Peel da":
      return "AESTHETIC_MEDICINE";
    case "Da liễu tổng quát":
      return "DERMATOLOGY";
    default:
      return null;
  }
}

interface BackendExpert {
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

// Map Expert response DTO from Backend to Frontend schema
function mapBackendExpertToFrontend(be: BackendExpert): Expert {
  return {
    id: be.id,
    name: be.name || "Chuyên gia da liễu",
    title: translateSpecialization(be.specialization),
    clinic: be.clinicName || "Phòng khám GlowScan Partner",
    rating: be.rating || 5.0,
    reviews: 50, // BE does not track reviews count yet
    fee: Number(be.consultationFee) || 0,
    specialties: [translateSpecialization(be.specialization)],
    distance: be.distanceKm !== null ? Number(be.distanceKm) : undefined,
    bio: be.bio || "",
  };
}

export async function getExperts(filters?: {
  specialty?: string;
  search?: string;
  minRating?: number;
  maxFee?: number;
  maxDistance?: number;
}): Promise<Expert[]> {
  if (appConfig.useMockApi) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    let result = [...MOCK_EXPERTS];

    if (filters) {
      const { specialty, search, minRating, maxFee, maxDistance } = filters;

      if (specialty && specialty !== "Tất cả") {
        result = result.filter((e) => e.specialties.includes(specialty));
      }
      if (search) {
        const q = search.toLowerCase();
        result = result.filter(
          (e) =>
            e.name.toLowerCase().includes(q) ||
            e.title.toLowerCase().includes(q) ||
            e.clinic.toLowerCase().includes(q),
        );
      }
      if (minRating) {
        result = result.filter((e) => e.rating >= minRating);
      }
      if (maxFee) {
        result = result.filter((e) => e.fee <= maxFee);
      }
      if (maxDistance) {
        result = result.filter(
          (e) => e.distance !== undefined && e.distance <= maxDistance,
        );
      }
    }

    return result;
  }

  // Real API Logic
  let url = EXPERT_API_PATHS.GET_EXPERTS;
  const queryParams = new URLSearchParams();

  if (filters) {
    const { specialty, minRating, maxFee, maxDistance } = filters;
    if (specialty && specialty !== "Tất cả") {
      const spec = mapSpecialtyToBackend(specialty);
      if (spec) queryParams.set("specialization", spec);
    }
    if (minRating) {
      queryParams.set("minRating", minRating.toString());
    }
    if (maxFee) {
      queryParams.set("maxFee", maxFee.toString());
    }
    if (maxDistance) {
      queryParams.set("radiusKm", maxDistance.toString());
      // Default to central coords for distance calculation if geolocation not provided
      queryParams.set("lat", "10.7769");
      queryParams.set("lng", "106.7009");
    }
  }

  const queryString = queryParams.toString();
  if (queryString) {
    url += `?${queryString}`;
  }

  // BE returns PaginatedResponse: { items: ExpertResponseDto[], total: number, page: number, limit: number }
  const response = await apiJson<{ items: BackendExpert[] }>(url);
  let experts = response.items.map(mapBackendExpertToFrontend);

  // Perform search locally as BE doesn't support text query on this endpoint
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    experts = experts.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.title.toLowerCase().includes(q) ||
        e.clinic.toLowerCase().includes(q),
    );
  }

  return experts;
}

export async function getExpertById(id: string): Promise<Expert> {
  if (appConfig.useMockApi) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const exp = MOCK_EXPERTS.find((e) => e.id === id);
    if (!exp) {
      throw new Error(`Bác sĩ với ID ${id} không tồn tại`);
    }
    return exp;
  }

  const beExpert = await apiJson<BackendExpert>(
    EXPERT_API_PATHS.GET_EXPERT_DETAIL(id),
  );
  return mapBackendExpertToFrontend(beExpert);
}

export async function getSpecialties(): Promise<string[]> {
  if (appConfig.useMockApi) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const specialties = new Set<string>();
    MOCK_EXPERTS.forEach((e) =>
      e.specialties.forEach((s) => specialties.add(s)),
    );
    return Array.from(specialties);
  }

  return [
    "Trị mụn",
    "Phục hồi da",
    "Sẹo rỗ",
    "Chống lão hóa",
    "Nám & Tàn nhang",
    "Peel da",
  ];
}
