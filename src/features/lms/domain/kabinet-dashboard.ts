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
