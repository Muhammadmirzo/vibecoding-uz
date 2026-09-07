export interface RefundEligibilityParams {
  enrolledAt: Date;
  completedModulesCount: number;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  amountSum: number;
  now?: Date;
}

export type RefundReasonCode =
  | "ELIGIBLE"
  | "EXPIRED_7_DAYS"
  | "EXCEEDED_MODULE_LIMIT"
  | "NOT_PAID"
  | "ALREADY_REFUNDED";

export interface RefundEligibilityResult {
  eligible: boolean;
  reason: RefundReasonCode;
  refundAmount: number;
  daysSinceEnrollment: number;
  daysRemaining: number;
  message: string;
}

export const GUARANTEE_DAYS = 7;
export const MAX_ALLOWED_MODULES_FOR_REFUND = 2;

/**
 * Evaluates 100% money-back guarantee eligibility based on the 7-day rule
 * and first 2 modules completion constraint.
 */
export function checkRefundEligibility(params: RefundEligibilityParams): RefundEligibilityResult {
  const { enrolledAt, completedModulesCount, paymentStatus, amountSum, now = new Date() } = params;

  const diffMs = now.getTime() - enrolledAt.getTime();
  const diffDays = Math.max(0, diffMs / (1000 * 60 * 60 * 24));
  const daysSinceEnrollment = Math.floor(diffDays);
  const daysRemaining = Math.max(0, Math.ceil(GUARANTEE_DAYS - diffDays));

  if (paymentStatus === "refunded") {
    return {
      eligible: false,
      reason: "ALREADY_REFUNDED",
      refundAmount: 0,
      daysSinceEnrollment,
      daysRemaining: 0,
      message: "To'lov allaqachon qaytarilgan.",
    };
  }

  if (paymentStatus !== "paid") {
    return {
      eligible: false,
      reason: "NOT_PAID",
      refundAmount: 0,
      daysSinceEnrollment,
      daysRemaining,
      message: "To'lov amalga oshirilmagan yoki kutilmoqda.",
    };
  }

  if (diffDays > GUARANTEE_DAYS) {
    return {
      eligible: false,
      reason: "EXPIRED_7_DAYS",
      refundAmount: 0,
      daysSinceEnrollment,
      daysRemaining: 0,
      message: "7 kunlik kafolat muddati o'tgan.",
    };
  }

  if (completedModulesCount > MAX_ALLOWED_MODULES_FOR_REFUND) {
    return {
      eligible: false,
      reason: "EXCEEDED_MODULE_LIMIT",
      refundAmount: 0,
      daysSinceEnrollment,
      daysRemaining,
      message: "2 tadan ortiq modul o'zlashtirilgan bo'lsa pul qaytarilmaydi.",
    };
  }

  return {
    eligible: true,
    reason: "ELIGIBLE",
    refundAmount: amountSum,
    daysSinceEnrollment,
    daysRemaining,
    message: "100% pul qaytarish kafolati amalda.",
  };
}
