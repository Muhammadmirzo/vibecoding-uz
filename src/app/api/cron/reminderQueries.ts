/**
 * Backwards-compatible re-exports. Canonical implementation lives in
 * `src/features/crm/server/reminders.repository.ts` (Drizzle) and
 * `src/features/crm/server/reminders.service.ts` (orchestration).
 */
export { drizzleRemindersRepository } from "@/features/crm/server/reminders.repository";
export type {
  ActiveStudent, DripEnrollment, DripLesson, HomeworkAssignment,
  InactiveUser, ReminderDetails, RemindersRepository,
} from "@/features/crm/server/reminders.repository";
