import { applyJobSchema } from "@/lib/validations/jobs";
import type { ApplyJobPayload, ApplyJobTarget } from "./types";

export function normalizePhone(value: string): string {
  let normalized = value;
  if (!normalized.startsWith("+998")) normalized = "+998";
  return normalized.replace(/[^0-9+]/g, "").slice(0, 13);
}

export function createApplyPayload(
  job: ApplyJobTarget,
  values: Omit<ApplyJobPayload, "jobId" | "jobSlug" | "jobTitle">
): ApplyJobPayload {
  return applyJobSchema.parse({
    jobId: job.id,
    jobSlug: job.slug,
    jobTitle: job.title,
    ...values,
  });
}

export function getFieldErrors(error: ReturnType<typeof applyJobSchema.safeParse>): Record<string, string> {
  if (error.success) return {};
  const fieldErrors: Record<string, string> = {};
  error.error.errors.forEach((err) => {
    if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
  });
  return fieldErrors;
}
