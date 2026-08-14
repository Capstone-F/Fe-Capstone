export interface SeedDemoCustomerPayload {
  email?: string;
  password?: string;
  fullName?: string;
  historyDays?: number;
}

export interface SeedDemoCustomerResponse {
  credentials: {
    email: string;
    password: string;
    userId: string;
    customerId: string;
    keycloakSub: string;
  };
  routine: {
    routineId: string;
    title: string;
    activeFromDate: string;
    morningSteps: number;
    eveningSteps: number;
    sourceOrderId: string;
  };
  history: {
    completedDays: number;
    missedDays: number;
    currentStreak: number;
    checkInCount: number;
    from: string;
    to: string;
  };
  lowStock: {
    productVariantId: string;
    sku: string;
    productName: string;
    bottleMl: number;
    dailyMl: number;
    remainingMl: number | null;
    daysLeft: number | null;
    warning: "LOW" | "EMPTY";
    stepIds: string[];
  };
  nextSteps: string[];
}
