export type NotificationChannel = "telegram" | "email" | "sms" | "all";
export type NotificationAudience = "all_users" | "active_students" | "leads_new" | "leads_consultation" | "cohort_students";
export type NotificationStatus = "draft" | "sent" | "failed";
export interface BroadcastItem { id: string; title: string; channel: NotificationChannel; targetAudience: NotificationAudience; cohortId: string | null; messageBody: string; status: NotificationStatus; recipientsCount: number; sentAt: string | null; createdAt: string; }
export interface Cohort { id: string; name: string; }
export const audienceLabels: Record<NotificationAudience, string> = { all_users: "Barcha foydalanuvchilar", active_students: "Faol talabalar", leads_new: "Yangi leadlar (Quiz)", leads_consultation: "Konsultatsiyadagilar", cohort_students: "Muayyan guruh talabalari" };
