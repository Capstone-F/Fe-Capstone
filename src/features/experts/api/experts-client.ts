import { Expert } from "@/types/domain";

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

export async function getExperts(filters?: {
  specialty?: string;
  search?: string;
  minRating?: number;
  maxFee?: number;
  maxDistance?: number;
}): Promise<Expert[]> {
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

export async function getExpertById(id: string): Promise<Expert> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const exp = MOCK_EXPERTS.find((e) => e.id === id);
  if (!exp) {
    throw new Error(`Bác sĩ với ID ${id} không tồn tại`);
  }
  return exp;
}

export async function getSpecialties(): Promise<string[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  const specialties = new Set<string>();
  MOCK_EXPERTS.forEach((e) => e.specialties.forEach((s) => specialties.add(s)));
  return Array.from(specialties);
}
