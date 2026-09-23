export type CourseCtaState = "login" | "checkout" | "contact";

export interface CourseCtaInput {
  isAuthenticated: boolean;
  hasConfiguredProvider: boolean;
}

export function getCourseCtaState({ isAuthenticated, hasConfiguredProvider }: CourseCtaInput): CourseCtaState {
  if (!isAuthenticated) return "login";
  if (hasConfiguredProvider) return "checkout";
  return "contact";
}
