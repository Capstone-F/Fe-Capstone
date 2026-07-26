export interface Ingredient {
  id: string;
  name: string;
  category: string; // e.g. "Exfoliant", "Moisturizer", "Anti-acne"
  description?: string;
}

export interface RoutineStep {
  id: string;
  order: number;
  timeOfDay: "AM" | "PM" | "BOTH";
  stepName: string; // e.g. "Rửa mặt", "Toner", "Serum", "Kem dưỡng", "Kem chống nắng"
  productId?: string;
  productName?: string;
  productImage?: string;
  frequencyPreset: "Hàng ngày" | "Cách ngày" | "2-3 lần/tuần" | "Tùy chỉnh";
  frequencyCustom?: string;
  instructionPreset:
    | "Dùng 2-3 giọt"
    | "Thoa mỏng toàn mặt"
    | "Chấm điểm mụn"
    | "Tùy chỉnh";
  instructionCustom?: string;
}

export interface TreatmentPhase {
  id: string;
  phaseNumber: number;
  title: string; // e.g. "Giai đoạn 1: Phục hồi da & Giảm viêm"
  durationWeeks: number;
  status: "UPCOMING" | "ACTIVE" | "COMPLETED";
  targetIngredients: Ingredient[];
  amSteps: RoutineStep[];
  pmSteps: RoutineStep[];
  notes?: string;
}

export interface TreatmentPlan {
  id: string;
  customerId: string;
  customerName: string;
  expertId: string;
  expertName: string;
  title: string; // e.g. "Phác đồ điều trị mụn ẩn & thâm đỏ 8 tuần"
  totalFeeVnd: number;
  status: "DRAFT" | "PENDING_PAYMENT" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  phases: TreatmentPhase[];
  currentPhaseNumber: number;
  createdAt: string;
  updatedAt: string;
}
