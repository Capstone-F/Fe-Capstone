"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type SurveyAnswers = {
  // Baumann
  baumannOilyDry: "O" | "D" | "";
  baumannSensitiveResistant: "S" | "R" | "";
  baumannPigmentNon: "P" | "N" | "";
  baumannWrinkleTight: "W" | "T" | "";
  // Hydration
  hydration: 0 | 25 | 50 | 75 | 100 | "";
  // Current routine
  currentRoutineProducts: string;
  currentActiveIngredients: string[]; // Retinol, AHA, BHA, Vitamin C, Niacinamide, Benzoyl Peroxide
  morningRoutineText: string;
  eveningRoutineText: string;
  irritationStatus: "none" | "mild" | "redness" | "burning" | "itchy" | "";
  // Goals & Concern
  treatmentGoals: string[];
  primaryConcern: string;
  // Health
  pregnancy: "yes" | "no" | "declined" | "";
  breastfeeding: "yes" | "no" | "declined" | "";
  menstruation: "yes" | "no" | "declined" | "";
  hormonalChanges: "yes" | "no" | "declined" | "";
  otherDermatology: "yes" | "no" | "declined" | "";
  prescriptionMeds: "yes" | "no" | "declined" | "";
  // Photo
  photoUploaded: boolean;
  photoFile: string | null;
};

export type RoutineItem = {
  id: string;
  text: string;
  completed: boolean;
  description?: string;
  conflictWarning?: string;
  reason?: string;
};

export type FlowState =
  | "intro"
  | "survey"
  | "analyzing"
  | "report"
  | "plan"
  | "purchase"
  | "success"
  | "dashboard";

export type DashboardTab = "home" | "report" | "history" | "profile";

export type AiObservation = {
  acneSeverity: "Nhẹ" | "Trung bình" | "Nặng";
  darkSpots: "Nhẹ" | "Trung bình" | "Nặng";
  poreSize: "Mịn" | "Trung bình" | "Rộng";
  wrinkleDepth: "Thấp" | "Trung bình" | "Cao";
};

export type TreatmentData = {
  surveyAnswers: SurveyAnswers;
  surveyStep: number;
  flowState: FlowState;
  dashboardTab: DashboardTab;
  morningRoutine: RoutineItem[];
  eveningRoutine: RoutineItem[];
  aiObservation: AiObservation | null;
};

export type SkincareProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  brand: string;
  reason: string;
  conflict?: boolean;
  conflictWarning?: string;
};

const DEFAULT_ANSWERS: SurveyAnswers = {
  baumannOilyDry: "",
  baumannSensitiveResistant: "",
  baumannPigmentNon: "",
  baumannWrinkleTight: "",
  hydration: "",
  currentRoutineProducts: "",
  currentActiveIngredients: [],
  morningRoutineText: "",
  eveningRoutineText: "",
  irritationStatus: "",
  treatmentGoals: [],
  primaryConcern: "",
  pregnancy: "",
  breastfeeding: "",
  menstruation: "",
  hormonalChanges: "",
  otherDermatology: "",
  prescriptionMeds: "",
  photoUploaded: false,
  photoFile: null,
};

const LOCAL_STORAGE_KEY = "glowscan_treatment_data_v2";

type TreatmentContextType = {
  state: TreatmentData;
  updateAnswers: (answers: Partial<SurveyAnswers>) => void;
  setSurveyStep: (step: number) => void;
  setFlowState: (flowState: FlowState) => void;
  setDashboardTab: (tab: DashboardTab) => void;
  toggleRoutine: (id: string, type: "morning" | "evening") => void;
  generateRoutines: () => void;
  getRecommendedProducts: () => SkincareProduct[];
  resetAll: () => void;
};

const TreatmentContext = createContext<TreatmentContextType | undefined>(
  undefined,
);

export function TreatmentProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TreatmentData>(() => {
    const defaultState: TreatmentData = {
      surveyAnswers: DEFAULT_ANSWERS,
      surveyStep: 1,
      flowState: "intro",
      dashboardTab: "home",
      morningRoutine: [],
      eveningRoutine: [],
      aiObservation: null,
    };
    if (typeof window === "undefined") return defaultState;
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) return JSON.parse(stored) as TreatmentData;
    } catch {
      // ignore malformed storage
    }
    return defaultState;
  });

  // Persist changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save treatment data to localStorage", e);
    }
  }, [state]);

  const updateAnswers = (newAnswers: Partial<SurveyAnswers>) => {
    setState((prev) => ({
      ...prev,
      surveyAnswers: { ...prev.surveyAnswers, ...newAnswers },
    }));
  };

  const setSurveyStep = (step: number) => {
    setState((prev) => ({ ...prev, surveyStep: step }));
  };

  const setFlowState = (flowState: FlowState) => {
    setState((prev) => ({ ...prev, flowState }));
  };

  const setDashboardTab = (dashboardTab: DashboardTab) => {
    setState((prev) => ({ ...prev, dashboardTab }));
  };

  const toggleRoutine = (id: string, type: "morning" | "evening") => {
    setState((prev) => {
      const key = type === "morning" ? "morningRoutine" : "eveningRoutine";
      const updated = prev[key].map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      );
      return { ...prev, [key]: updated };
    });
  };

  // Logic to generate routines dynamically based on survey questionnaire answers
  const generateRoutines = () => {
    const answers = state.surveyAnswers;

    // 1. Check pregnancy safety
    const isPregnant = answers.pregnancy === "yes";

    // 2. Check hydration
    const isLowHydration = answers.hydration !== "" && answers.hydration <= 25;

    // 3. Check active ingredients conflict
    const hasRetinol = answers.currentActiveIngredients.includes("Retinol");

    // 4. Generate AI observations if photo uploaded
    let aiObs: AiObservation | null = null;
    if (answers.photoUploaded) {
      aiObs = {
        acneSeverity:
          answers.primaryConcern === "Mụn trứng cá" ? "Trung bình" : "Nhẹ",
        darkSpots: answers.primaryConcern === "Thâm sạm" ? "Trung bình" : "Nhẹ",
        poreSize:
          answers.primaryConcern === "Lỗ chân lông to" ? "Rộng" : "Trung bình",
        wrinkleDepth:
          answers.primaryConcern === "Lão hóa da" ? "Trung bình" : "Thấp",
      };
    }

    // 5. Build morning/evening routines dynamically
    const morning: RoutineItem[] = [];
    const evening: RoutineItem[] = [];

    // --- MORNING ROUTINE ---
    // Cleanser
    morning.push({
      id: "m_cleanse",
      text: "Sữa rửa mặt tạo bọt dịu nhẹ",
      description: "Glycerin, Ceramide NP, Niacinamide 2%",
      reason:
        "Làm sạch dịu nhẹ buổi sáng cho da dầu mụn mà không phá vỡ hàng rào ẩm.",
      completed: false,
    });

    // Serum (Niacinamide) - if acne, large pores or dark spots
    const needsNiacinamide =
      answers.primaryConcern === "Mụn trứng cá" ||
      answers.primaryConcern === "Thâm sạm" ||
      answers.primaryConcern === "Lỗ chân lông to" ||
      answers.treatmentGoals.includes("Giảm mụn") ||
      answers.treatmentGoals.includes("Cải thiện thâm sạm");

    if (needsNiacinamide) {
      morning.push({
        id: "m_niacinamide",
        text: "Tinh chất Niacinamide 10% + Kẽm (Zinc PCA 1%)",
        description: "Niacinamide 10%, Zinc PCA 1%",
        reason: "Điều tiết dầu thừa, kháng viêm cho mụn và làm mờ thâm sạm.",
        completed: false,
      });
    }

    // Moisturizer (Always oil-free for morning)
    morning.push({
      id: "m_moisturize",
      text: "Kem dưỡng ẩm kiềm dầu không dầu",
      description: "Hyaluronic Acid, Panthenol, Allantoin",
      reason: "Cấp ẩm nhẹ tênh dạng nước, ngăn bóng nhờn ban ngày.",
      completed: false,
    });

    // Sunscreen (Always required in morning)
    morning.push({
      id: "m_sunscreen",
      text: "Kem chống nắng dạng sữa SPF 50",
      description: "Zinc Oxide 10%, Tinosorb S",
      reason: `Bảo vệ da tối ưu trong khí hậu ${answers.baumannOilyDry === "O" ? "nóng ẩm của TP. HCM" : "nhiệt đới ẩm"}.`,
      completed: false,
    });

    // --- EVENING ROUTINE ---
    // Cleanser
    evening.push({
      id: "e_cleanse",
      text: "Sữa rửa mặt tạo bọt dịu nhẹ",
      description: "Glycerin, Ceramide NP, Niacinamide 2%",
      reason: "Làm sạch sâu bụi bẩn, dầu thừa tích tụ cả ngày.",
      completed: false,
    });

    // Toner/AHA-BHA treatment (Only if NOT pregnant)
    if (!isPregnant) {
      const needsExfoliator =
        answers.primaryConcern === "Mụn trứng cá" ||
        answers.primaryConcern === "Lỗ chân lông to" ||
        answers.primaryConcern === "Dầu thừa" ||
        answers.treatmentGoals.includes("Giảm mụn") ||
        answers.treatmentGoals.includes("Thu nhỏ lỗ chân lông");

      if (needsExfoliator) {
        evening.push({
          id: "e_exfoliator",
          text: "Nước hoa hồng AHA 7% + BHA 1%",
          description: "Glycolic Acid 7%, Salicylic Acid 1%",
          reason:
            "Tẩy tế bào chết hóa học, làm sạch sâu cổ nang lông, giảm bít tắc.",
          conflictWarning: hasRetinol
            ? "Lưu ý xung đột: Bạn đang dùng Retinol. Hãy giãn cách sử dụng AHA/BHA (ví dụ dùng xen kẽ chẵn lẻ hoặc cách ngày) để tránh kích ứng da."
            : undefined,
          completed: false,
        });
      }
    }

    // Evening Moisturizer - deeply hydrating if low hydration
    if (isLowHydration) {
      evening.push({
        id: "e_moisturize_deep",
        text: "Kem dưỡng ẩm ban đêm phục hồi lipid khóa ẩm sâu",
        description: "Ceramide, Squalane, Bơ hạt mỡ (Shea Butter)",
        reason:
          "Hỗ trợ phục hồi hàng rào ẩm sâu cho làn da đang khô ráp nghiêm trọng (độ ẩm dưới 25%).",
        completed: false,
      });
    } else {
      evening.push({
        id: "e_moisturize_light",
        text: "Kem dưỡng ẩm kiềm dầu không dầu",
        description: "Hyaluronic Acid, Panthenol, Allantoin",
        reason: "Cấp ẩm mỏng nhẹ, giữ bề mặt da thông thoáng qua đêm.",
        completed: false,
      });
    }

    setState((prev) => ({
      ...prev,
      morningRoutine: morning,
      eveningRoutine: evening,
      aiObservation: aiObs,
    }));
  };

  // Helper to generate recommended products dynamically for the checkout cart
  const getRecommendedProducts = (): SkincareProduct[] => {
    const products: SkincareProduct[] = [];
    const answers = state.surveyAnswers;
    const isPregnant = answers.pregnancy === "yes";
    const isLowHydration = answers.hydration !== "" && answers.hydration <= 25;
    const hasRetinol = answers.currentActiveIngredients.includes("Retinol");

    // Product 1: Cleanser (Always)
    products.push({
      id: "prod_cleanser",
      name: "Sữa rửa mặt tạo bọt dịu nhẹ GlowScan Derm",
      category: "Sữa rửa mặt",
      price: 210000,
      originalPrice: 250000,
      brand: "GlowScan Derm",
      reason: `Đề xuất cho da nhóm ${answers.baumannOilyDry || "O"}${answers.baumannSensitiveResistant || "S"} để làm sạch êm dịu, không rát đỏ.`,
    });

    // Product 2: Niacinamide Serum (If needed)
    const needsNiacinamide =
      answers.primaryConcern === "Mụn trứng cá" ||
      answers.primaryConcern === "Thâm sạm" ||
      answers.primaryConcern === "Lỗ chân lông to" ||
      answers.treatmentGoals.includes("Giảm mụn") ||
      answers.treatmentGoals.includes("Cải thiện thâm sạm");

    if (needsNiacinamide) {
      products.push({
        id: "prod_niacinamide",
        name: "Tinh chất phục hồi Niacinamide 10% + Zinc 1%",
        category: "Tinh chất điều trị",
        price: 390000,
        brand: "GlowScan Active",
        reason: "Kháng viêm cho mụn, giảm thâm đỏ và kiềm dầu hiệu quả.",
      });
    }

    // Product 3: AHA/BHA Toner (If needed & NOT pregnant)
    if (!isPregnant) {
      const needsExfoliator =
        answers.primaryConcern === "Mụn trứng cá" ||
        answers.primaryConcern === "Lỗ chân lông to" ||
        answers.primaryConcern === "Dầu thừa" ||
        answers.treatmentGoals.includes("Giảm mụn") ||
        answers.treatmentGoals.includes("Thu nhỏ lỗ chân lông");

      if (needsExfoliator) {
        products.push({
          id: "prod_exfoliator",
          name: "Nước hoa hồng tẩy tế bào chết AHA 7% + BHA 1%",
          category: "Tẩy tế bào chết",
          price: 290000,
          brand: "GlowScan Peel",
          reason:
            "Giải quyết bít tắc nang lông, thu nhỏ lỗ chân lông cho da dầu.",
          conflict: hasRetinol,
          conflictWarning: hasRetinol
            ? "Cảnh báo: Khả năng kích ứng với Retinol bạn đang dùng. Vui lòng giãn cách ngày sử dụng."
            : undefined,
        });
      }
    } else {
      // If pregnant, explain why AHA/BHA is excluded
      // No product pushed
    }

    // Product 4: Moisturizer (Deep barrier or oil-free depending on hydration)
    if (isLowHydration) {
      products.push({
        id: "prod_moisturizer_deep",
        name: "Kem dưỡng ẩm ban đêm phục hồi lipid khóa ẩm sâu GlowScan Barrier",
        category: "Kem dưỡng ẩm",
        price: 320000,
        brand: "GlowScan Barrier",
        reason: `Cung cấp Ceramide phục hồi màng ẩm cho da có mức độ ẩm rất thấp (${answers.hydration}%).`,
      });
    } else {
      products.push({
        id: "prod_moisturizer_light",
        name: "Gel dưỡng ẩm Hydrating Gel không chứa dầu GlowScan Aqua",
        category: "Kem dưỡng ẩm",
        price: 280000,
        brand: "GlowScan Aqua",
        reason:
          "Cấp nước nhẹ thông thoáng, thích hợp để duy trì kiềm dầu hàng ngày.",
      });
    }

    // Product 5: Sunscreen (Always)
    products.push({
      id: "prod_sunscreen",
      name: "Kem chống nắng dạng sữa SPF 50 GlowScan Sun",
      category: "Kem chống nắng",
      price: 420000,
      originalPrice: 480000,
      brand: "GlowScan Sun",
      reason: `Bảo vệ phổ rộng chống tia cực tím trong khí hậu ẩm nóng.`,
    });

    return products;
  };

  const resetAll = () => {
    setState({
      surveyAnswers: DEFAULT_ANSWERS,
      surveyStep: 1,
      flowState: "intro",
      dashboardTab: "home",
      morningRoutine: [],
      eveningRoutine: [],
      aiObservation: null,
    });
  };

  return (
    <TreatmentContext.Provider
      value={{
        state,
        updateAnswers,
        setSurveyStep,
        setFlowState,
        setDashboardTab,
        toggleRoutine,
        generateRoutines,
        getRecommendedProducts,
        resetAll,
      }}
    >
      {children}
    </TreatmentContext.Provider>
  );
}

export function useTreatment() {
  const context = useContext(TreatmentContext);
  if (!context) {
    throw new Error("useTreatment must be used within a TreatmentProvider");
  }
  return context;
}
