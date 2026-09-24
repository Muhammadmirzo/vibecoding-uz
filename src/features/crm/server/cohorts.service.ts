import { ServiceError } from "@/lib/http/errors";
import type { CreateCohortInput, UpdateCohortInput } from "@/lib/validations/crm";
import { earlyBirdInfo, remainingSeats } from "../domain/cohort-policy";
import type { CohortRow, CohortsRepository } from "./cohorts.repository";

export interface FormattedCohort {
  id: string;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  name: string;
  startsAt: Date;
  endsAt: Date | null;
  seats: number;
  enrolledSeats: number;
  remainingSeats: number;
  priceSum: string;
  earlyPriceSum: string | null;
  earlyDeadline: Date | null;
  isEarlyBirdActive: boolean;
  earlyBirdDaysLeft: number;
  telegramChatId: string | null;
  status: string;
}

export async function listCohorts(repo: CohortsRepository, now: Date = new Date()): Promise<FormattedCohort[]> {
  const rows = await repo.listCohorts();
  return rows.map((item) => {
    const c = item.cohort;
    const early = earlyBirdInfo(c.earlyDeadline, now);
    return {
      id: c.id,
      courseId: c.courseId,
      courseTitle: item.courseTitle || "Noma'lum kurs",
      courseSlug: item.courseSlug || "",
      name: c.name,
      startsAt: c.startsAt,
      endsAt: c.endsAt,
      seats: c.seats,
      enrolledSeats: item.enrolledCount,
      remainingSeats: remainingSeats(c.seats, item.enrolledCount),
      priceSum: c.priceSum,
      earlyPriceSum: c.earlyPriceSum,
      earlyDeadline: c.earlyDeadline,
      isEarlyBirdActive: early.isEarlyBirdActive,
      earlyBirdDaysLeft: early.earlyBirdDaysLeft,
      telegramChatId: c.telegramChatId,
      status: c.status,
    };
  });
}

export async function createCohort(repo: CohortsRepository, input: CreateCohortInput): Promise<CohortRow> {
  return repo.createCohort(input);
}

export async function updateCohort(repo: CohortsRepository, id: string, patch: UpdateCohortInput): Promise<CohortRow> {
  const updated = await repo.updateCohort(id, patch);
  if (!updated) throw new ServiceError("NOT_FOUND", "Guruh topilmadi", 404);
  return updated;
}

export async function deleteCohort(repo: CohortsRepository, id: string): Promise<CohortRow> {
  const deleted = await repo.deleteCohort(id);
  if (!deleted) throw new ServiceError("NOT_FOUND", "Guruh topilmadi", 404);
  return deleted;
}
