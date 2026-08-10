"use client";

import React, { createContext, useState, useEffect, useCallback } from "react";
import {
  FlowState,
  DashboardTab,
  TreatmentData,
  SkincareProduct,
  SurveyMode,
} from "../types/treatment";
import type {
  CustomerProfileResponseDto,
  RecommendationResponseDto,
  SurveyResponseDto,
} from "@/types/domain";
import { DEFAULT_ANSWERS, LOCAL_STORAGE_KEY } from "../constants/treatment";
import { treatmentApi } from "../api/treatment.api";
import { ApiError } from "@/core/api/errors";
import {
  mapRecommendationProducts,
  validateSurveyRecommendation,
} from "../lib/survey-flow";
import { appConfig } from "@/lib/env";
import { tokenStorage } from "@/features/auth/utils/token-storage";
import {
  guestSurveyStorage,
  type GuestSurveyBaseProfile,
} from "@/features/survey/lib/guest-survey-storage";

type TreatmentContextType = {
  state: TreatmentData;
  setSurveyStep: (step: number) => void;
  setFlowState: (flowState: FlowState) => void;
  setDashboardTab: (tab: DashboardTab) => void;
  toggleRoutine: (id: string, type: "morning" | "evening") => void;
  getRecommendedProducts: () => SkincareProduct[];
  resetAll: () => void;
  // Dynamic API methods
  startDynamicSurvey: (profile?: GuestSurveyBaseProfile) => Promise<boolean>;
  setDynamicAnswer: (
    questionId: string,
    labelCodes: string[],
    value?: string,
  ) => void;
  submitDynamicAnswersAndNext: (questionIds: string[]) => Promise<boolean>;
  scanSurveyFace: (file: File) => Promise<SurveyResponseDto>;
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

function checkIs401Error(e: unknown): boolean {
  if (e instanceof ApiError) return e.status === 401;
  const errObj = e as {
    status?: number;
    response?: { status?: number };
    message?: string;
  };
  return (
    errObj.status === 401 ||
    errObj.response?.status === 401 ||
    Boolean(errObj.message?.toLowerCase().includes("guest token expired"))
  );
}

export function TreatmentProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TreatmentData>(() => ({
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
    faceImageUrl: null,
    faceScannedAt: null,
    faceLabels: [],
    recommendations: null,
    customerProfile: null,
    isLoadingDynamic: false,
    dynamicError: null,
    surveyMode: "authenticated",
  }));

  const isHydratedRef = React.useRef(false);

  // Hydrate state from localStorage AFTER mount to avoid SSR hydration mismatch
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as TreatmentData;
        const hasToken = Boolean(tokenStorage.getAccessToken());

        // If user logged out or storage belongs to old authenticated flow, purge it
        if (!hasToken && parsed.surveyMode === "authenticated") {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
          return;
        }

        // Only restore if flow is actively mid-survey
        if (parsed.flowState === "survey") {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setState((prev) => ({
            ...prev,
            ...parsed,
            surveyMode: hasToken ? "authenticated" : "guest",
            flowState: "survey",
            dynamicQuestions: parsed.dynamicQuestions || [],
            dynamicAnswers: parsed.dynamicAnswers || {},
            dynamicTextAnswers: parsed.dynamicTextAnswers || {},
          }));
        } else {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      }
    } catch {
      // ignore malformed storage
    } finally {
      isHydratedRef.current = true;
    }
  }, []);

  // Persist changes to localStorage ONLY while actively mid-survey
  useEffect(() => {
    if (!isHydratedRef.current) return;
    try {
      if (state.flowState === "survey") {
        // Save draft answers only (do not store completed recommendations in localStorage)
        const draftData = {
          flowState: "survey",
          surveyStep: state.surveyStep,
          surveyMode: state.surveyMode,
          dynamicQuestions: state.dynamicQuestions,
          dynamicAnswers: state.dynamicAnswers,
          dynamicTextAnswers: state.dynamicTextAnswers,
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(draftData));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    } catch (e) {
      console.error("Failed to save treatment data to localStorage", e);
    }
  }, [state]);

  const setSurveyStep = useCallback((step: number) => {
    setState((prev) => ({ ...prev, surveyStep: step }));
  }, []);

  const setFlowState = useCallback((flowState: FlowState) => {
    setState((prev) => {
      if (flowState === "intro") {
        return {
          ...prev,
          flowState,
          surveySessionId: null,
          dynamicQuestions: [],
          dynamicAnswers: {},
          dynamicTextAnswers: {},
          faceImageUrl: null,
          faceScannedAt: null,
          faceLabels: [],
          recommendations: null,
          surveyStep: 1,
          isLoadingDynamic: false,
          dynamicError: null,
        };
      }
      return { ...prev, flowState };
    });
  }, []);

  const setDashboardTab = useCallback((dashboardTab: DashboardTab) => {
    setState((prev) => ({ ...prev, dashboardTab }));
  }, []);

  const toggleRoutine = useCallback(
    (id: string, type: "morning" | "evening") => {
      setState((prev) => {
        const key = type === "morning" ? "morningRoutine" : "eveningRoutine";
        const updated = prev[key].map((item) =>
          item.id === id ? { ...item, completed: !item.completed } : item,
        );
        return { ...prev, [key]: updated };
      });
    },
    [],
  );

  const startDynamicSurvey = useCallback(
    async (profile?: GuestSurveyBaseProfile): Promise<boolean> => {
      setState((prev) => ({
        ...prev,
        surveySessionId: null,
        dynamicAnswers: {},
        dynamicTextAnswers: {},
        recommendations: null,
        isLoadingDynamic: true,
        dynamicError: null,
      }));
      try {
        const mode: SurveyMode =
          appConfig.devBypassAuth || tokenStorage.getAccessToken()
            ? "authenticated"
            : "guest";
        const guestProfile = profile ?? guestSurveyStorage.get()?.baseProfile;

        if (mode === "guest" && !guestProfile) {
          throw new ApiError({
            message:
              "Vui lòng nhập thông tin cơ bản trước khi bắt đầu khảo sát.",
            status: 400,
          });
        }

        // 1. Create Real Survey Session on BE
        const sessionResponse = await treatmentApi.createSurveySession(
          mode,
          guestProfile,
        );
        const session = sessionResponse.data;

        if (mode === "guest") {
          if (!session.guestToken || !guestProfile) {
            throw new ApiError({
              message:
                "Khảo sát dành cho khách vãng lai hiện chưa khả dụng. Vui lòng thử lại sau.",
              status: 503,
            });
          }
          guestSurveyStorage.set({
            guestToken: session.guestToken,
            surveyId: session.id,
            baseProfile: guestProfile,
            createdAt: new Date().toISOString(),
          });
        }

        // 2. Fetch CORE survey questions from BE with created session context
        const questionsResponse = await treatmentApi.fetchQuestions(
          session.id,
          { guestToken: session.guestToken },
          mode,
        );
        const questions = questionsResponse.data || [];

        setState((prev) => ({
          ...prev,
          surveySessionId: session.id,
          dynamicQuestions: questions,
          dynamicAnswers: {},
          dynamicTextAnswers: {},
          faceImageUrl: session.faceImageUrl || null,
          faceScannedAt: session.faceScannedAt || null,
          faceLabels: session.faceLabels || [],
          recommendations: null,
          surveyStep: 1,
          isLoadingDynamic: false,
          dynamicError: null,
          surveyMode: mode,
        }));
        return true;
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
        return false;
      }
    },
    [],
  );

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

  const scanSurveyFace = useCallback(
    async (file: File): Promise<SurveyResponseDto> => {
      if (state.surveyMode === "guest") {
        throw new ApiError({
          message: "Vui lòng đăng nhập để sử dụng tính năng quét khuôn mặt.",
          status: 401,
        });
      }
      if (!state.surveySessionId) {
        throw new ApiError({
          message: "Phiên khảo sát không tồn tại. Vui lòng làm lại khảo sát.",
          status: 404,
        });
      }

      const response = await treatmentApi.scanSurveyFace(
        state.surveySessionId,
        file,
      );
      const survey = response.data;
      setState((prev) => ({
        ...prev,
        faceImageUrl: survey.faceImageUrl || null,
        faceScannedAt: survey.faceScannedAt || null,
        faceLabels: survey.faceLabels || [],
      }));
      return survey;
    },
    [state.surveyMode, state.surveySessionId],
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
        const response = await treatmentApi.fetchLatestRecommendations({
          guestToken:
            state.surveyMode === "guest"
              ? guestSurveyStorage.get()?.guestToken
              : undefined,
        });
        const data = response.data;
        setState((prev) => ({
          ...prev,
          recommendations: data,
          isLoadingDynamic: false,
        }));
        return data;
      } catch (e) {
        console.error("Failed to fetch latest recommendations:", e);
        if (state.surveyMode === "guest" && checkIs401Error(e)) {
          guestSurveyStorage.clear();
          setState((prev) => ({
            ...prev,
            surveySessionId: null,
            flowState: "intro",
            isLoadingDynamic: false,
            dynamicError:
              "Phiên khảo sát guest đã hết hạn. Vui lòng bắt đầu lại.",
          }));
          return null;
        }
        setState((prev) => ({ ...prev, isLoadingDynamic: false }));
        return null;
      }
    }, [state.surveyMode]);

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
        await treatmentApi.completeSurvey(state.surveySessionId, {
          guestToken:
            state.surveyMode === "guest"
              ? guestSurveyStorage.get()?.guestToken
              : undefined,
        });
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
        state.surveyMode === "authenticated"
          ? fetchCustomerProfile()
          : Promise.resolve(null),
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
      if (state.surveyMode === "guest" && checkIs401Error(e)) {
        guestSurveyStorage.clear();
        setState((prev) => ({
          ...prev,
          surveySessionId: null,
          flowState: "intro",
          isLoadingDynamic: false,
          dynamicError:
            "Phiên khảo sát guest đã hết hạn. Vui lòng bắt đầu lại.",
        }));
        return false;
      }
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
    state.surveyMode,
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
          {
            guestToken:
              state.surveyMode === "guest"
                ? guestSurveyStorage.get()?.guestToken
                : undefined,
          },
        );

        // Check if any conditional questions (L2) unlocked
        const nextQuestionsResponse = await treatmentApi.fetchQuestions(
          state.surveySessionId,
          {
            guestToken:
              state.surveyMode === "guest"
                ? guestSurveyStorage.get()?.guestToken
                : undefined,
          },
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
        if (state.surveyMode === "guest" && checkIs401Error(e)) {
          guestSurveyStorage.clear();
          setState((prev) => ({
            ...prev,
            surveySessionId: null,
            flowState: "intro",
            isLoadingDynamic: false,
            dynamicError:
              "Phiên khảo sát guest đã hết hạn. Vui lòng bắt đầu lại.",
          }));
          return false;
        }
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
            const guestProfile = guestSurveyStorage.get()?.baseProfile;
            const sessionResponse = await treatmentApi.createSurveySession(
              state.surveyMode,
              guestProfile,
            );
            const newSession = sessionResponse.data;

            if (state.surveyMode === "guest") {
              if (!newSession.guestToken || !guestProfile) {
                throw new Error("Backend không trả về guestToken hợp lệ.");
              }
              guestSurveyStorage.set({
                guestToken: newSession.guestToken,
                surveyId: newSession.id,
                baseProfile: guestProfile,
                createdAt: new Date().toISOString(),
              });
            }

            // 2. Re-submit current step answers to the new session
            const payloadAnswers = questionIds.map((qId) => ({
              questionId: qId,
              labelCodes: state.dynamicAnswers[qId] || [],
              value: state.dynamicTextAnswers[qId],
            }));

            await treatmentApi.submitSurveyAnswers(
              newSession.id,
              payloadAnswers,
              {
                guestToken:
                  state.surveyMode === "guest"
                    ? newSession.guestToken
                    : undefined,
              },
            );

            // 3. Fetch any unlocked conditional questions
            const nextQuestionsResponse = await treatmentApi.fetchQuestions(
              newSession.id,
              {
                guestToken:
                  state.surveyMode === "guest"
                    ? newSession.guestToken
                    : undefined,
              },
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
      state.surveyMode,
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
  const getRecommendedProducts = useCallback((): SkincareProduct[] => {
    return mapRecommendationProducts(state.recommendations);
  }, [state.recommendations]);

  const resetAll = useCallback(() => {
    guestSurveyStorage.clear();
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      // ignore
    }
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
      faceImageUrl: null,
      faceScannedAt: null,
      faceLabels: [],
      recommendations: null,
      customerProfile: null,
      isLoadingDynamic: false,
      dynamicError: null,
      surveyMode: "authenticated",
    });
  }, []);

  // Listen to logout event to wipe React state in memory immediately upon logout
  useEffect(() => {
    const handleLogout = () => {
      resetAll();
    };
    window.addEventListener("glowscan-logout", handleLogout);
    return () => {
      window.removeEventListener("glowscan-logout", handleLogout);
    };
  }, [resetAll]);

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
        scanSurveyFace,
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
