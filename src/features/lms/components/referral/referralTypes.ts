export interface ReferralLead {
  id: string;
  name: string;
  date: string;
  course: string;
  status: "paid" | "registered" | "consulting";
  bonusAmount: string;
}
export interface ReferralStats {
  clicks: number;
  registered: number;
  paid: number;
  balance: number;
}
export type PayoutMethod = "uzcard_humo" | "course_balance";
