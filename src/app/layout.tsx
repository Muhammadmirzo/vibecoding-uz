import type { Metadata } from "next";
import { Onest, JetBrains_Mono, Unbounded } from "next/font/google";
import { cookies, headers } from "next/headers";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeaderVisibility } from "@/components/layout/HeaderVisibility";
import { AuthProvider } from "@/context/AuthContext";
import { ClientModals } from "@/components/layout/ClientModals";
import { userSchema, User } from "@/lib/validations/auth";
import { BRAND } from "@/config/brand";
import { MotionRoot } from "@/features/motion/ui/MotionRoot";
import { RevealRoot } from "@/features/motion/ui/RevealRoot";
import { getMotionSettings } from "@/features/motion/server/motion-settings";
import { ChatLauncher } from "@/features/chat/ui/ChatLauncher";
import { AnalyticsTracker } from "@/features/analytics/client/AnalyticsTracker";

const onest = Onest({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  // "optional": no late font swap → no layout shift (CLS). Measured 0.45 with
  // "swap" under mobile throttling. Fallback metrics are size-adjusted by next/font.
  display: "optional",
});

const unbounded = Unbounded({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "optional",
  preload: true,
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
});

const siteUrl = BRAND.url;
const title = "AI bilan mahsulot qurishni o'rganing";
const description = `${BRAND.name}da AI va vibe coding yordamida g'oyadan jonli web ilova, bot va MVP yaratishni amaliy mentorlik bilan o'rganing.`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: `%s — ${BRAND.name}`,
  },
  description,
  applicationName: BRAND.name,
  keywords: ["Naqsh", "naqsh maktabi", "vibe coding O'zbekiston", "Claude Code kursi", "AI bilan dasturlash"],
  alternates: {},
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon",
  },
  appleWebApp: {
    capable: true,
    title: BRAND.name,
    statusBarStyle: "default",
  },
  openGraph: {
    title,
    description,
    url: undefined,
    siteName: BRAND.name,
    locale: BRAND.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

async function getInitialUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("auth_session");

    if (!sessionCookie || !sessionCookie.value) {
      return null;
    }

    const data = JSON.parse(sessionCookie.value);
    const parsed = userSchema.safeParse(data);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialUser = await getInitialUser();
  const motionSettings = await getMotionSettings();
  // Per-request CSP nonce set by middleware; inline scripts need it to run.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <MotionRoot
      settings={motionSettings}
      className={`${onest.variable} ${unbounded.variable} ${jetBrainsMono.variable}`}
    >
      <body className="antialiased">
        <a href="#main" className="skip-to-content">Asosiy kontentga o'tish</a>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} themes={["light", "dark"]} nonce={nonce}>
          <AuthProvider initialUser={initialUser}>
            <RevealRoot />
            <AnalyticsTracker />
            <Header />
            <main id="main">{children}</main>
            {/* Admin has its own shell: hide the public footer there, like the header. */}
            <HeaderVisibility><Footer /></HeaderVisibility>
            <ClientModals />
            <ChatLauncher />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </MotionRoot>
  );
}
