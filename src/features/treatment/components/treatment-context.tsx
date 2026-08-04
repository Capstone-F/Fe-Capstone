"use client";

import React, { createContext, useState, useEffect, useCallback } from "react";
import {
  FlowState,
  DashboardTab,
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
  setSurveyStep: (step: number) => void;
  setFlowState: (flowState: FlowState) => void;
  setDashboardTab: (tab: DashboardTab) => void;
  toggleRoutine: (id: string, type: "morning" | "evening") => void;
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
        setSurveyStep,
        setFlowState,
        setDashboardTab,
        toggleRoutine,
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
