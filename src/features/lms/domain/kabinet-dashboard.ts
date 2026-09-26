/** Pure, I/O-free rules for the /kabinet dashboard (shared by server and client). */

export interface KabinetDashboardUser {
  fullName: string | null;
}

export interface KabinetDashboardPayment {
  enrollmentId: string | null;
  status: string;
}

export interface KabinetInitialData {
  user: KabinetDashboardUser | null;
  payments: KabinetDashboardPayment[];
}

/** A paid row that carries an enrollment is what unlocks the course area. */
export function hasActiveEnrollment(payments: KabinetDashboardPayment[]): boolean {
  return payments.some((payment) => payment.status === "paid" && Boolean(payment.enrollmentId));
}

/** Where a logged-out visitor is sent back to, landing on /kabinet again after login. */
export const RELOGIN_HREF = "/?auth=1&redirect=%2Fkabinet";

export interface KabinetErrorState {
  /** 401 = the session is gone: reloading can never fix it, the user must log in again. */
  unauthorized: boolean;
  title: string;
  description: string;
  /** Login link for an expired session; null means "retry" (a reload button is shown). */
  action: { label: string; href: string } | null;
}

/**
 * Maps a failed /api/me (or /api/me/payments) response to the state the dashboard
 * shows. A 401 on an expired session used to render the generic "technical
 * problems" box with a reload button, which loops forever.
 */
export function kabinetErrorState(status: number, message?: string | null): KabinetErrorState {
  if (status === 401) {
    return {
      unauthorized: true,
      title: "Sessiya tugadi, qayta kiring",
      description: message || "Sessiya muddati tugagan. Qayta kiring va kabinetingizni ko'ring.",
      action: { label: "Qayta kiring", href: RELOGIN_HREF },
    };
  }
  return {
    unauthorized: false,
    title: "Texnik xizmat vaqtincha ishlamayapti",
    description: message || "Texnik xizmat vaqtincha ishlamayapti",
    action: null,
  };
}
