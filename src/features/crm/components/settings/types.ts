export type SettingsTab = "general" | "pricing" | "guarantee" | "integrations" | "features" | "security";

export type SettingsState = {
  siteTitle: string;
  supportPhone: string;
  supportTelegram: string;
  maintenanceMode: boolean;
  headerCtaText: string;
  headerCtaLink: string;
  enrollmentUrl: string;
  telegramBotLink: string;
  announcementBannerText: string;
  announcementBannerLink: string;
  enableAnnouncementBanner: boolean;
  defaultCoursePrice: string;
  installmentRate3Months: number;
  installmentRate6Months: number;
  guaranteeRefundDays: number;
  guaranteeTextUz: string;
  paymeMerchantId: string;
  paymeSecretKey: string;
  clickServiceId: string;
  clickSecretKey: string;
  telegramBotToken: string;
  smsApiKey: string;
  enableGamification: boolean;
  enableCommunityForum: boolean;
  enableInteractiveQuizzes: boolean;
  enableB2BEnterprise: boolean;
  enableCardReferrals: boolean;
  enableLevelGating: boolean;
  enableGuaranteeTrust: boolean;
  credPhone: string;
  credEmail: string;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type SettingsActions = {
  [K in keyof SettingsState]: SettingsState[K] extends boolean
    ? (value: SettingsState[K]) => void
    : SettingsState[K] extends number
      ? (value: number) => void
      : (value: SettingsState[K]) => void;
};

export type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "number" | "password";
  placeholder?: string;
  mono?: boolean;
};
