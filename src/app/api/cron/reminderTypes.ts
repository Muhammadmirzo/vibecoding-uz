/**
 * Backwards-compatible re-exports. Canonical reminder types live in
 * `src/features/crm/server/reminders.repository.ts`.
 */
import type { DripEnrollment } from "@/features/crm/server/reminders.repository";

export type {
  ActiveStudent, DripEnrollment, DripLesson, HomeworkAssignment,
  InactiveUser, ReminderDetails,
} from "@/features/crm/server/reminders.repository";

export interface DripUnlock extends DripEnrollment {
  lessonTitle: string;
}
