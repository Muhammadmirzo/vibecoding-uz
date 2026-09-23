import type React from "react";

export type SettingsTab = "profile" | "password" | "notifications";

export interface SettingsProfileState {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  profession: string;
  goal: string;
  bio: string;
  avatarUrl: string;
  profileLoading: boolean;
  profileSuccess: boolean;
  profileError: string | null;
  setFullName: (value: string) => void;
  setEmail: (value: string) => void;
  setCity: (value: string) => void;
  setProfession: (value: string) => void;
  setGoal: (value: string) => void;
  setBio: (value: string) => void;
  setAvatarUrl: (value: string) => void;
  handleProfileSubmit: (
    event: React.FormEvent<HTMLFormElement>,
  ) => Promise<void>;
}

export interface CredentialsState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  passwordLoading: boolean;
  passwordSuccess: boolean;
  passwordError: string | null;
  setCurrentPassword: (value: string) => void;
  setNewPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  handlePasswordSubmit: (
    event: React.FormEvent<HTMLFormElement>,
  ) => Promise<void>;
}

export interface NotificationState {
  telegramNotify: boolean;
  emailNotify: boolean;
  smsNotify: boolean;
  homeworkDeadlines: boolean;
  mentorReviews: boolean;
  liveMeetReminders: boolean;
  notifSaved: boolean;
  setTelegramNotify: (value: boolean) => void;
  setEmailNotify: (value: boolean) => void;
  setSmsNotify: (value: boolean) => void;
  setHomeworkDeadlines: (value: boolean) => void;
  setMentorReviews: (value: boolean) => void;
  setLiveMeetReminders: (value: boolean) => void;
  handleSaveNotifications: () => void;
}
