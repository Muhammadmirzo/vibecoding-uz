import type { Metadata } from "next";
import { Onest, Instrument_Serif, JetBrains_Mono, Unbounded } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { PwaRegister } from "@/components/layout/PwaRegister";
import { ClientModals } from "@/components/layout/ClientModals";
import { userSchema, User } from "@/lib/validations/auth";

const onest = Onest({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const unbounded = Unbounded({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://academy.mirzo.uz";
const title = "AI bilan mahsulot qurishni o'rganing";
const description =
  "Mirzo Academy'da AI va vibe coding yordamida g'oyadan jonli web ilova, bot va MVP yaratishni amaliy mentorlik bilan o'rganing.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s | Mirzo Academy",
  },
  description,
  keywords: ["Mirzo Academy", "vibecoding kursi", "vibe coding O'zbekiston", "Claude Code kursi", "AI bilan dasturlash"],
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    title: "Mirzo Academy",
    statusBarStyle: "default",
  },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: "Mirzo Academy",
    locale: "uz_UZ",
    type: "website",
    images: [
      {
        url: "/images/hero-banner.jpg",
        width: 1376,
        height: 768,
        alt: "Mirzo Academy — AI bilan mahsulot yaratish kurslari",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/images/hero-banner.jpg"],
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

  return (
    <html lang="uz" suppressHydrationWarning className={`${onest.variable} ${unbounded.variable} ${instrumentSerif.variable} ${jetBrainsMono.variable}`}>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} themes={["light", "dark"]}>
          <AuthProvider initialUser={initialUser}>
            <Header />
            <main id="main">{children}</main>
            <Footer />
            <ClientModals />
            <PwaRegister />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
