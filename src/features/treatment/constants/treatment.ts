import { SurveyAnswers } from "../types/treatment";

export const DEFAULT_ANSWERS: SurveyAnswers = {
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

export const LOCAL_STORAGE_KEY = "glowscan_treatment_data_v2";
