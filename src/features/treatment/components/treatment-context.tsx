"use client";

import React, { createContext, useState, useEffect, useCallback } from "react";
import { SurveyRecord } from "@/types/domain";
import {
  SurveyAnswers,
  RoutineItem,
  FlowState,
  DashboardTab,
  AiObservation,
  TreatmentData,
  SkincareProduct,
} from "../types/treatment";
import type {
  CustomerProfileResponseDto,
  RecommendationResponseDto,
} from "@/types/domain";
import { DEFAULT_ANSWERS, LOCAL_STORAGE_KEY } from "../constants/treatment";
import { treatmentApi } from "../api/treatment.api";
import { ApiError } from "@/core/api/errors";
import {
  mapRecommendationProducts,
  validateSurveyRecommendation,
} from "../lib/survey-flow";

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
  // Dynamic API methods
  startDynamicSurvey: () => Promise<void>;
  setDynamicAnswer: (
    questionId: string,
    labelCodes: string[],
    value?: string,
  ) => void;
  submitDynamicAnswersAndNext: (questionIds: string[]) => Promise<boolean>;
  completeDynamicSurvey: () => Promise<boolean>;
  fetchLatestRecommendations: () => Promise<RecommendationResponseDto | null>;
  fetchCustomerProfile: () => Promise<CustomerProfileResponseDto | null>;
  addRecommendationsToCart: (productVariantIds: string[]) => Promise<boolean>;
};

export const TreatmentContext = createContext<TreatmentContextType | undefined>(
  undefined,
);

function checkIs404Error(e: unknown): boolean {
  if (!e) return false;
  if (e instanceof ApiError) {
    if (e.status === 404) return true;
    if (
      e.message?.includes("404") ||
      e.message?.toLowerCase().includes("not found")
    )
      return true;
  }
  const errObj = e as {
    status?: number;
    statusCode?: number;
    response?: { status?: number };
    message?: string;
  };
  return (
    errObj.status === 404 ||
    errObj.statusCode === 404 ||
    errObj.response?.status === 404 ||
    Boolean(errObj.message?.includes("404")) ||
    Boolean(errObj.message?.toLowerCase().includes("not found"))
  );
}

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
      surveyHistory: [],
      surveySessionId: null,
      dynamicQuestions: [],
      dynamicAnswers: {},
      dynamicTextAnswers: {},
      recommendations: null,
      customerProfile: null,
      isLoadingDynamic: false,
      dynamicError: null,
    };
    if (typeof window === "undefined") return defaultState;
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as TreatmentData;
        const validFlows = [
          "intro",
          "survey",
          "analyzing",
          "report",
          "plan",
          "purchase",
          "success",
        ];
        const flowState = validFlows.includes(parsed.flowState)
          ? parsed.flowState
          : "intro";
        return {
          ...defaultState,
          ...parsed,
          flowState,
          dynamicQuestions: parsed.dynamicQuestions || [],
          dynamicAnswers: parsed.dynamicAnswers || {},
          dynamicTextAnswers: parsed.dynamicTextAnswers || {},
        };
      }
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
  const generateRoutines = useCallback(() => {
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

    const baumannCode = `${answers.baumannOilyDry || "O"}${answers.baumannSensitiveResistant || "S"}${answers.baumannPigmentNon || "N"}${answers.baumannWrinkleTight || "T"}`;
    const newHistoryRecord: SurveyRecord = {
      id: `surv_${Math.random().toString(36).substring(2, 9)}`,
      userId: "dev-bypass-id",
      baumannCode,
      answers: JSON.parse(JSON.stringify(answers)),
      createdAt: new Date().toISOString(),
    };

    setState((prev) => {
      const currentHistory = prev.surveyHistory || [];
      return {
        ...prev,
        morningRoutine: morning,
        eveningRoutine: evening,
        aiObservation: aiObs,
        surveyHistory: [newHistoryRecord, ...currentHistory],
      };
    });
  }, [state.surveyAnswers]);

  // Dynamic API methods
  const startDynamicSurvey = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      isLoadingDynamic: true,
      dynamicError: null,
    }));
    try {
      // 1. Fetch CORE survey questions from BE
      const questionsResponse = await treatmentApi.fetchQuestions();
      const questions = questionsResponse.data || [];

      // 2. Create Real Survey Session on BE
      const sessionResponse = await treatmentApi.createSurveySession();
      const session = sessionResponse.data;

      setState((prev) => ({
        ...prev,
        surveySessionId: session.id,
        dynamicQuestions: questions,
        dynamicAnswers: {},
        dynamicTextAnswers: {},
        recommendations: null,
        surveyStep: 1,
        isLoadingDynamic: false,
        dynamicError: null,
      }));
    } catch (e: unknown) {
      console.error("Failed to start dynamic survey via Real API:", e);
      const msg =
        e instanceof Error
          ? e.message
          : "Không thể kết nối đến hệ thống Backend để tải ngân hàng câu hỏi.";
      setState((prev) => ({
        ...prev,
        isLoadingDynamic: false,
        dynamicError: msg,
      }));
    }
  }, []);

  const setDynamicAnswer = useCallback(
    (questionId: string, labelCodes: string[], value?: string) => {
      setState((prev) => ({
        ...prev,
        dynamicAnswers: { ...prev.dynamicAnswers, [questionId]: labelCodes },
        dynamicTextAnswers:
          value !== undefined
            ? { ...prev.dynamicTextAnswers, [questionId]: value }
            : prev.dynamicTextAnswers,
      }));
    },
    [],
  );

  const fetchCustomerProfile =
    useCallback(async (): Promise<CustomerProfileResponseDto | null> => {
      try {
        const response = await treatmentApi.fetchCustomerProfile();
        const data = response.data;
        setState((prev) => ({ ...prev, customerProfile: data }));
        return data;
      } catch (e) {
        console.error("Failed to fetch customer profile:", e);
        return null;
      }
    }, []);

  const fetchLatestRecommendations =
    useCallback(async (): Promise<RecommendationResponseDto | null> => {
      setState((prev) => ({ ...prev, isLoadingDynamic: true }));
      try {
        const response = await treatmentApi.fetchLatestRecommendations();
        const data = response.data;
        setState((prev) => ({
          ...prev,
          recommendations: data,
          isLoadingDynamic: false,
        }));
        return data;
      } catch (e) {
        console.error("Failed to fetch latest recommendations:", e);
        setState((prev) => ({ ...prev, isLoadingDynamic: false }));
        return null;
      }
    }, []);

  const completeDynamicSurvey = useCallback(async (): Promise<boolean> => {
    if (!state.surveySessionId) return false;
    setState((prev) => ({
      ...prev,
      isLoadingDynamic: true,
      dynamicError: null,
    }));
    try {
      // Complete on backend
      try {
        await treatmentApi.completeSurvey(state.surveySessionId);
      } catch (err: unknown) {
        const errMsg = (err as Error)?.message?.toLowerCase() || "";
        const errObj = err as {
          status?: number;
          response?: { status?: number };
        };
        const isAlreadyCompleted =
          errObj.status === 400 ||
          errObj.response?.status === 400 ||
          errMsg.includes("already completed");

        if (isAlreadyCompleted) {
          console.warn(
            "Survey was already completed on BE. Proceeding to fetch recommendations...",
          );
        } else {
          throw err;
        }
      }

      // Fetch the canonical backend outputs for this survey.
      const [profile, recommendation] = await Promise.all([
        fetchCustomerProfile(),
        fetchLatestRecommendations(),
      ]);

      setState((prev) => ({
        ...prev,
        customerProfile: profile,
        recommendations: recommendation,
        isLoadingDynamic: false,
        flowState: "analyzing",
      }));
      return true;
    } catch (e: unknown) {
      console.error("Failed to complete dynamic survey:", e);
      if (checkIs404Error(e)) {
        console.warn(
          "Survey session 404 on complete. Restarting new survey session...",
        );
        await startDynamicSurvey();
        return false;
      }

      const msg =
        e instanceof Error
          ? e.message
          : "Không thể hoàn tất phân tích khảo sát.";
      setState((prev) => ({
        ...prev,
        isLoadingDynamic: false,
        dynamicError: msg,
      }));
      return false;
    }
  }, [
    state.surveySessionId,
    fetchCustomerProfile,
    fetchLatestRecommendations,
    startDynamicSurvey,
  ]);

  const submitDynamicAnswersAndNext = useCallback(
    async (questionIds: string[]): Promise<boolean> => {
      if (!state.surveySessionId) return false;
      setState((prev) => ({
        ...prev,
        isLoadingDynamic: true,
        dynamicError: null,
      }));
      try {
        const payloadAnswers = questionIds.map((qId) => ({
          questionId: qId,
          labelCodes: state.dynamicAnswers[qId] || [],
          value: state.dynamicTextAnswers[qId],
        }));

        await treatmentApi.submitSurveyAnswers(
          state.surveySessionId,
          payloadAnswers,
        );

        // Check if any conditional questions (L2) unlocked
        const nextQuestionsResponse = await treatmentApi.fetchQuestions(
          state.surveySessionId,
        );
        const nextQuestions = nextQuestionsResponse.data;

        setState((prev) => ({
          ...prev,
          dynamicQuestions: nextQuestions || prev.dynamicQuestions,
          isLoadingDynamic: false,
        }));
        return true;
      } catch (e: unknown) {
        console.error("Failed to submit answers:", e);
        if (checkIs404Error(e)) {
          console.warn("Survey session 404. Restarting new survey session...");
          await startDynamicSurvey();
          return false;
        }

        const errMsg =
          e instanceof ApiError
            ? e.message.toLowerCase()
            : (e as Error)?.message?.toLowerCase() || "";
        const errObj = e as { status?: number; response?: { status?: number } };
        const isAlreadyCompleted =
          errObj.status === 400 ||
          errObj.response?.status === 400 ||
          errMsg.includes("already completed") ||
          errMsg.includes("đã hoàn thành");

        if (isAlreadyCompleted) {
          console.warn(
            "Survey session was already completed on BE. Automatically creating a NEW survey session...",
          );
          try {
            // 1. Create a fresh survey session on BE
            const sessionResponse = await treatmentApi.createSurveySession();
            const newSession = sessionResponse.data;

            // 2. Re-submit current step answers to the new session
            const payloadAnswers = questionIds.map((qId) => ({
              questionId: qId,
              labelCodes: state.dynamicAnswers[qId] || [],
              value: state.dynamicTextAnswers[qId],
            }));

            await treatmentApi.submitSurveyAnswers(
              newSession.id,
              payloadAnswers,
            );

            // 3. Fetch any unlocked conditional questions
            const nextQuestionsResponse = await treatmentApi.fetchQuestions(
              newSession.id,
            );

            setState((prev) => ({
              ...prev,
              surveySessionId: newSession.id,
              dynamicQuestions:
                nextQuestionsResponse.data || prev.dynamicQuestions,
              isLoadingDynamic: false,
              dynamicError: null,
            }));
            return true;
          } catch (recoveryErr) {
            console.error(
              "Failed to recover with new survey session:",
              recoveryErr,
            );
            // Fallback to start fresh
            await startDynamicSurvey();
            return false;
          }
        }

        const msg =
          e instanceof Error
            ? e.message
            : "Không thể lưu câu trả lời khảo sát.";
        setState((prev) => ({
          ...prev,
          isLoadingDynamic: false,
          dynamicError: msg,
        }));
        return false;
      }
    },
    [
      state.surveySessionId,
      state.dynamicAnswers,
      state.dynamicTextAnswers,
      startDynamicSurvey,
    ],
  );

  const addRecommendationsToCart = useCallback(
    async (productVariantIds: string[]): Promise<boolean> => {
      try {
        const recommendationStatus = validateSurveyRecommendation(
          state.recommendations,
          state.surveySessionId,
        );

        if (recommendationStatus !== "ok") {
          throw new Error(
            "Khuyến nghị hiện tại không hợp lệ để thêm vào giỏ hàng.",
          );
        }

        const recommendationId = state.recommendations!.id;
        const validVariantIds = new Set(
          mapRecommendationProducts(state.recommendations).map(
            (product) => product.id,
          ),
        );

        for (const variantId of productVariantIds) {
          if (!validVariantIds.has(variantId)) {
            continue;
          }
          await treatmentApi.addRecommendationToCart(
            variantId,
            recommendationId,
          );
        }
        return true;
      } catch (e: unknown) {
        console.error("Failed to add recommendations to cart:", e);
        throw e;
      }
    },
    [state.recommendations, state.surveySessionId],
  );

  // Helper to generate recommended products dynamically for the checkout cart
  const getRecommendedProducts = (): SkincareProduct[] => {
    return mapRecommendationProducts(state.recommendations);
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
      surveyHistory: [],
      surveySessionId: null,
      dynamicQuestions: [],
      dynamicAnswers: {},
      dynamicTextAnswers: {},
      recommendations: null,
      customerProfile: null,
      isLoadingDynamic: false,
      dynamicError: null,
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
        startDynamicSurvey,
        setDynamicAnswer,
        submitDynamicAnswersAndNext,
        completeDynamicSurvey,
        fetchLatestRecommendations,
        fetchCustomerProfile,
        addRecommendationsToCart,
      }}
    >
      {children}
    </TreatmentContext.Provider>
  );
}

export { useTreatment } from "../hooks/useTreatment";
