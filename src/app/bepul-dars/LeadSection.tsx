import { Card } from "@/components/ui/Surfaces";
import { LeadCaptureForm } from "@/features/leads/ui/LeadCaptureForm";

const TELEGRAM_URL = "https://t.me/m/ODAfK_QIMjky";

export function BepulDarsLeadSection() {
  return (
    <Card className="p-6 sm:p-8" aria-label="Bepul darsga yozilish">
      <LeadCaptureForm
        source="free_lesson"
        ctaLabel="Dars havolasini olish"
        title="Bepul darsni ko'rish uchun so'rov qoldiring"
        description="Telefon raqamingizni kiriting. So'rov bazaga saqlanganini tasdiqlaymiz; dars havolasini Telegram orqali yuborish jarayoni alohida boshqariladi."
        revealUrl={TELEGRAM_URL}
        revealTitle="So'rovingiz qabul qilindi"
        revealText="So'rov saqlandi. Dars havolasini tezroq olish uchun quyidagi tugma orqali Telegram orqali murojaat qiling."
      />
      <p className="mt-4 text-center text-xs text-ink-subtle">
        Ma'lumotlaringiz xavfsiz saqlanadi va spam yuborilmaydi.
      </p>
    </Card>
  );
}
