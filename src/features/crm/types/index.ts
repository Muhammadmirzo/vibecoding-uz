export type LeadStatus =
  | "new"
  | "contacted"
  | "consultation"
  | "pending"
  | "paid"
  | "rejected"
  | "cancelled";

export type LeadSource =
  | "quiz"
  | "free_lesson"
  | "form"
  | "telegram"
  | "expert"
  | "referral"
  | "manual";

export interface Lead {
  id: string;
  name: string;
  phone: string;
  source: LeadSource;
  quizAnswers?: Record<string, unknown> | null;
  recommendedCourseId?: string | null;
  recommendedCourseTitle?: string | null;
  utm?: Record<string, unknown> | null;
  status: LeadStatus;
  assignedManagerId?: string | null;
  assignedManagerName?: string | null;
  nextContactAt?: string | null;
  createdAt: string;
}

export interface Cohort {
  id: string;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  name: string;
  startsAt: string;
  endsAt?: string | null;
  seats: number;
  enrolledSeats: number;
  remainingSeats: number;
  priceSum: string;
  earlyPriceSum?: string | null;
  earlyDeadline?: string | null;
  isEarlyBirdActive: boolean;
  earlyBirdDaysLeft: number;
  telegramChatId?: string | null;
  status: string;
}

export interface CriterionResult {
  criterion: string;
  score: number;
  maxScore: number;
  feedback?: string;
}

export interface HomeworkSubmission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  assignmentDescription: string;
  acceptanceCriteria?: Array<{ criterion: string; weight: number }> | null;
  lessonId: string;
  lessonTitle: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  studentAvatar?: string | null;
  attemptNo: number;
  payload: {
    githubUrl?: string;
    fileUrls?: string[];
    note?: string;
    [key: string]: unknown;
  };
  status: "submitted" | "reviewing" | "approved" | "rejected";
  submittedAt: string;
  review?: {
    id: string;
    score: string;
    feedbackMd?: string | null;
    criteriaResults?: CriterionResult[] | null;
    reviewedAt: string;
  } | null;
}

export interface FunnelStage {
  stage: string;
  count: number;
  conversionRate: string;
  dropOffRate: string;
  dropOffCount: number;
}

export interface AnalyticsData {
  period: string;
  summary: {
    totalLeads: number;
    newLeadsCount: number;
    paidCount: number;
    cancelledCount: number;
    totalRevenueUzS: number;
    averageOrderValueUzS: number;
    activeStudentsCount: number;
    overallFillRate: string;
    pendingHomeworkCount: number;
    reviewedHomeworkCount: number;
  };
  funnel: FunnelStage[];
  revenueByProvider: {
    payme: number;
    click: number;
    manual: number;
  };
  sources: Array<{
    name: string;
    count: number;
    percentage: string;
  }>;
}
