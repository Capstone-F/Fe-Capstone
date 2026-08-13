export type DashboardRange = "7d" | "30d" | "90d";

export interface DashboardPeriod {
  range: DashboardRange;
  from: string;
  to: string;
  timezone: "Asia/Ho_Chi_Minh";
}

export interface AdminDashboardResponse {
  period: DashboardPeriod;
  metrics: {
    activeCustomers: number;
    activeExperts: number;
    activeClinics: number;
    paidOrders: number;
    netProductRevenueVnd: number;
    netConsultationFeesVnd: number;
  };
  attention: {
    submittedStockForms: number;
    openCancellations: number;
    failedWorkflows: number;
    expertsMissingProfile: number;
  };
  trend: Array<{
    date: string;
    newCustomers: number;
    netProductRevenueVnd: number;
    netConsultationFeesVnd: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    description: string | null;
    amountVnd: number | null;
    occurredAt: string;
  }>;
}

export interface ExpertBookingQueueItem {
  id: string;
  customerName: string | null;
  reason: string | null;
  scheduledAt: string;
  isFollowUp: boolean;
  feeChargedVnd: number;
}

export interface ExpertDashboardResponse {
  period: DashboardPeriod;
  metrics: {
    appointmentsToday: number;
    paidPendingConfirmation: number;
    completedConsultations: number;
    followUpConsultations: number;
    netConsultationFeesVnd: number;
    averageRating: number;
    ratingCount: number;
  };
  trend: Array<{
    date: string;
    completedConsultations: number;
    netConsultationFeesVnd: number;
  }>;
  pendingConfirmation: ExpertBookingQueueItem[];
  upcomingBookings: ExpertBookingQueueItem[];
}

export interface StaffDashboardResponse {
  period: DashboardPeriod;
  metrics: {
    unassignedOpenSupport: number;
    myActiveSupport: number;
    submittedStockForms: number;
    returnsReadyForInspection: number;
    failedWorkflows: number;
  };
  trend: Array<{
    date: string;
    openedSupportSessions: number;
    closedSupportSessions: number;
    submittedStockForms: number;
    confirmedStockForms: number;
  }>;
  queues: {
    openSupportSessions: Array<{
      id: string;
      customerName: string | null;
      subject: string | null;
      waitingSince: string;
    }>;
    submittedStockForms: Array<{
      id: string;
      sku: string;
      productName: string;
      quantity: number;
      submittedAt: string;
    }>;
    readyReturns: Array<{
      id: string;
      orderId: string;
      refundAmountVnd: number;
      returnedAt: string;
    }>;
    workflowFailures: Array<{
      id: string;
      orderId: string;
      status: string;
      lastError: string | null;
      updatedAt: string;
    }>;
  };
}
