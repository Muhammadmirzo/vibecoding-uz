import type { Lead, LeadSource, LeadStatus } from "@/features/crm/types";

export type { Lead, LeadSource, LeadStatus };

export type CourseOption = { id: string; title: string };
export type LeadStatusValue = LeadStatus;
export type LeadSourceValue = LeadSource;
export type LeadUpdate = Partial<Lead>;
