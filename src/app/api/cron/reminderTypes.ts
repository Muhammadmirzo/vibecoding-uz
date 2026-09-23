export interface DripEnrollment {
  userEmail: string | null;
  userFullName: string;
  tgUserId: string | null;
  cohortStartsAt: Date | null;
  courseId: string;
}

export interface DripLesson {
  title: string;
  dripValue: string | null;
}

export interface DripUnlock extends DripEnrollment {
  lessonTitle: string;
}

export interface HomeworkAssignment {
  assignmentId: string;
  assignmentTitle: string;
  courseId: string;
}

export interface ActiveStudent {
  userId: string;
  fullName: string;
  tgUserId: string | null;
}

export interface InactiveUser {
  fullName: string;
  phone: string | null;
  tgUserId: string | null;
  lastLoginAt: Date | null;
}

export interface ReminderDetails {
  dripNotifications: string[];
  homeworkAlerts: string[];
  inactivityNudges: string[];
}
