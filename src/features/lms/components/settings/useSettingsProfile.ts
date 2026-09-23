"use client";

import * as React from "react";
import { useAuth } from "@/context/AuthContext";
import {
  updateStudentProfileSchema,
  studentChangePasswordSchema,
} from "@/lib/validations/student";
import type { SettingsTab } from "./settingsTypes";

export function useSettingsProfile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState<SettingsTab>("profile");
  const [fullName, setFullName] = React.useState(
    user?.fullName || "Jamshid Alimov",
  );
  const [email, setEmail] = React.useState(user?.email || "jamshid@example.uz");
  const [phone, setPhone] = React.useState(user?.phone || "+998901234567");
  const [city, setCity] = React.useState("Toshkent");
  const [profession, setProfession] = React.useState("Startap asoschisi");
  const [goal, setGoal] = React.useState(
    "AI vositalari orqali 1 oyda SaaS mahsulotimni yaratish",
  );
  const [bio, setBio] = React.useState(
    "Vibe coding bilan qiziqaman, mahsulotlarni tezroq bozorga chiqarishni xohlayman.",
  );
  const [avatarUrl, setAvatarUrl] = React.useState(user?.avatarUrl || "");
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [telegramNotify, setTelegramNotify] = React.useState(true);
  const [emailNotify, setEmailNotify] = React.useState(true);
  const [smsNotify, setSmsNotify] = React.useState(false);
  const [homeworkDeadlines, setHomeworkDeadlines] = React.useState(true);
  const [mentorReviews, setMentorReviews] = React.useState(true);
  const [liveMeetReminders, setLiveMeetReminders] = React.useState(true);
  const [profileLoading, setProfileLoading] = React.useState(false);
  const [profileSuccess, setProfileSuccess] = React.useState(false);
  const [profileError, setProfileError] = React.useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = React.useState(false);
  const [passwordSuccess, setPasswordSuccess] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState<string | null>(null);
  const [notifSaved, setNotifSaved] = React.useState(false);
  React.useEffect(() => {
    if (user) {
      if (user.fullName) setFullName(user.fullName);
      if (user.email) setEmail(user.email);
      if (user.phone) setPhone(user.phone);
      if (user.avatarUrl) setAvatarUrl(user.avatarUrl);
    }
  }, [user]);
  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);
    const payload = {
      fullName: fullName.trim(),
      email: email.trim() || undefined,
      phone: phone.trim(),
      avatarUrl: avatarUrl.trim() || undefined,
      city: city.trim(),
      profession: profession.trim(),
      goal: goal.trim(),
      bio: bio.trim(),
    };
    const parseResult = updateStudentProfileSchema.safeParse(payload);
    if (!parseResult.success) {
      setProfileError(
        parseResult.error.errors[0]?.message ||
          "Ma'lumotlar noto'g'ri kiritildi",
      );
      return;
    }
    setProfileLoading(true);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parseResult.data),
      });
      const data: { error?: string } = await res.json();
      if (!res.ok) {
        setProfileError(data.error || "Profilni saqlashda xatolik yuz berdi");
        return;
      }
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch {
      setProfileError("Tarmoq xatosi. Iltimos qayta urinib ko'ring.");
    } finally {
      setProfileLoading(false);
    }
  };
  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);
    const payload = { currentPassword, newPassword, confirmPassword };
    const parseResult = studentChangePasswordSchema.safeParse(payload);
    if (!parseResult.success) {
      setPasswordError(
        parseResult.error.errors[0]?.message ||
          "Parollar bir-biriga mos kelmadi",
      );
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await fetch("/api/me/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data: { error?: string } = await res.json();
      if (!res.ok) {
        setPasswordError(
          data.error || "Parolni o'zgartirishda xatolik yuz berdi",
        );
        return;
      }
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch {
      setPasswordError("Server bilan aloqa uzildi.");
    } finally {
      setPasswordLoading(false);
    }
  };
  const handleSaveNotifications = () => {
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 3000);
  };
  return {
    user,
    activeTab,
    setActiveTab,
    fullName,
    email,
    phone,
    city,
    profession,
    goal,
    bio,
    avatarUrl,
    currentPassword,
    newPassword,
    confirmPassword,
    telegramNotify,
    emailNotify,
    smsNotify,
    homeworkDeadlines,
    mentorReviews,
    liveMeetReminders,
    profileLoading,
    profileSuccess,
    profileError,
    passwordLoading,
    passwordSuccess,
    passwordError,
    notifSaved,
    setFullName,
    setEmail,
    setCity,
    setProfession,
    setGoal,
    setBio,
    setAvatarUrl,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    setTelegramNotify,
    setEmailNotify,
    setSmsNotify,
    setHomeworkDeadlines,
    setMentorReviews,
    setLiveMeetReminders,
    handleProfileSubmit,
    handlePasswordSubmit,
    handleSaveNotifications,
  };
}
