import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { PwaRegister } from "@/components/layout/PwaRegister";
import { ClientModals } from "@/components/layout/ClientModals";
import { userSchema, User } from "@/lib/validations/auth";

const onest = { variable: "font-sans" };
const instrumentSerif = { variable: "font-serif" };
const geistMono = { variable: "font-mono" };

export const metadata: Metadata = {
  title: "Mirzo Academy — AI bilan mahsulot qurishni jonli mentordan o'rganing | academy.mirzo.uz",
  description: "EduBaza (27 000+ o'qituvchi), Chatla (500+ biznes) — AI bilan qurilgan jonli mahsulotlar. Dasturlashsiz, g'oyadan jonli MVPgacha 8 haftada yetib boring.",
  keywords: ["Mirzo Academy", "vibecoding kursi", "vibe coding O'zbekiston", "Claude Code kursi", "AI bilan dasturlash"],
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
    title: "Mirzo Academy — academy.mirzo.uz",
    description: "EduBaza va Chatla loyihalarini 100% AI bilan qurgan mentordan o'rganing.",
    url: "https://academy.mirzo.uz",
    siteName: "Mirzo Academy",
    locale: "uz_UZ",
    type: "website",
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
    <html lang="uz" suppressHydrationWarning className={`${onest.variable} ${instrumentSerif.variable} ${geistMono.variable}`}>
      <body className="antialiased selection:bg-[var(--color-accent-soft)] selection:text-[var(--color-accent)]">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
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
