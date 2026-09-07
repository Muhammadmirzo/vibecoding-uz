export interface CoursePricingInput {
  priceSum: number;
  oldPriceSum?: number | null;
  earlyPriceSum?: number | null;
  earlyDeadline?: Date | string | null;
  installmentMonths?: number;
  now?: Date;
}

export interface CalculatedPricing {
  effectivePrice: number;
  originalPrice: number;
  discountPercentage: number;
  savingsSum: number;
  monthlyInstallment: number;
  isEarlyBirdActive: boolean;
}

export interface PromoCodeParams {
  priceSum: number;
  code: string;
}

export interface PromoCodeResult {
  valid: boolean;
  code: string;
  discountAmount: number;
  finalPrice: number;
  message: string;
}

export interface InstallmentPlan {
  monthlyAmount: number;
  monthsCount: number;
  totalAmount: number;
}

/**
 * Formats a numeric currency amount into standard Uzbek UZS format (e.g. 1 200 000 so'm)
 */
export function formatUzbekSum(amount: number): string {
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${formatted} so'm`;
}

/**
 * Calculates effective course pricing taking into account early bird deadlines,
 * original prices, discount percentages, and installment amounts.
 */
export function calculateCoursePricing(input: CoursePricingInput): CalculatedPricing {
  const {
    priceSum,
    oldPriceSum,
    earlyPriceSum,
    earlyDeadline,
    installmentMonths = 3,
    now = new Date(),
  } = input;

  let isEarlyBirdActive = false;
  if (earlyPriceSum && earlyDeadline) {
    const deadlineDate = typeof earlyDeadline === "string" ? new Date(earlyDeadline) : earlyDeadline;
    if (deadlineDate.getTime() > now.getTime()) {
      isEarlyBirdActive = true;
    }
  }

  const effectivePrice = isEarlyBirdActive && earlyPriceSum ? earlyPriceSum : priceSum;
  const originalPrice = oldPriceSum || priceSum;

  const savingsSum = Math.max(0, originalPrice - effectivePrice);
  const discountPercentage =
    originalPrice > 0 ? Math.round((savingsSum / originalPrice) * 100) : 0;

  const monthlyInstallment =
    installmentMonths > 0 ? Math.ceil(effectivePrice / installmentMonths) : effectivePrice;

  return {
    effectivePrice,
    originalPrice,
    discountPercentage,
    savingsSum,
    monthlyInstallment,
    isEarlyBirdActive,
  };
}

/**
 * Applies promo codes to a price (e.g. VIBE20 -> 20% off, FIRST10 -> 10% off, UZBEK100K -> 100,000 UZS off)
 */
export function applyPromoCode(params: PromoCodeParams): PromoCodeResult {
  const { priceSum, code } = params;
  const normalizedCode = code.trim().toUpperCase();

  const VALID_PROMOS: Record<string, { type: "percent" | "fixed"; value: number }> = {
    VIBE20: { type: "percent", value: 20 },
    VIBE10: { type: "percent", value: 10 },
    START50: { type: "percent", value: 50 },
    UZB100K: { type: "fixed", value: 100000 },
  };

  const promo = VALID_PROMOS[normalizedCode];

  if (!promo) {
    return {
      valid: false,
      code: normalizedCode,
      discountAmount: 0,
      finalPrice: priceSum,
      message: "Promokod mavjud emas yoki muddati o'tgan.",
    };
  }

  let discountAmount = 0;
  if (promo.type === "percent") {
    discountAmount = Math.round((priceSum * promo.value) / 100);
  } else {
    discountAmount = Math.min(priceSum, promo.value);
  }

  const finalPrice = Math.max(0, priceSum - discountAmount);

  return {
    valid: true,
    code: normalizedCode,
    discountAmount,
    finalPrice,
    message: "Promokod muvaffaqiyatli qo'llanildi!",
  };
}

/**
 * Calculates monthly breakdown for multi-month installment plans
 */
export function calculateInstallmentPlan(totalSum: number, monthsCount: number): InstallmentPlan {
  const months = Math.max(1, monthsCount);
  const monthlyAmount = Math.ceil(totalSum / months);
  return {
    monthlyAmount,
    monthsCount: months,
    totalAmount: monthlyAmount * months,
  };
}
