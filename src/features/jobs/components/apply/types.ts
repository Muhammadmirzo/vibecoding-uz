import type * as React from "react";
import type { z } from "zod";
import type { applyJobSchema } from "@/lib/validations/jobs";

export type ApplyJobPayload = z.infer<typeof applyJobSchema>;

export interface ApplyJobTarget {
  id?: string;
  slug?: string;
  title: string;
  department: string;
}

export interface ApplyJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: ApplyJobTarget;
}

export interface ApplyFormState {
  fullName: string;
  phone: string;
  telegramUsername: string;
  resumeUrl: string;
  portfolioUrl: string;
  experience: string;
  coverLetter: string;
  loading: boolean;
  success: boolean;
  errors: Record<string, string>;
  setFullName: React.Dispatch<React.SetStateAction<string>>;
  setPhone: React.Dispatch<React.SetStateAction<string>>;
  setTelegramUsername: React.Dispatch<React.SetStateAction<string>>;
  setResumeUrl: React.Dispatch<React.SetStateAction<string>>;
  setPortfolioUrl: React.Dispatch<React.SetStateAction<string>>;
  setExperience: React.Dispatch<React.SetStateAction<string>>;
  setCoverLetter: React.Dispatch<React.SetStateAction<string>>;
  handlePhoneChange: React.ChangeEventHandler<HTMLInputElement>;
  handleSubmit: React.FormEventHandler<HTMLFormElement>;
  resetForAnotherApplication: () => void;
}
