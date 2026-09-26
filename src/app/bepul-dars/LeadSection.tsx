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
        description="Telefon raqamingizni yoki Telegram username yozing. Keyingi qadam — dars havolasi — shu yerda ochiladi."
        revealUrl={TELEGRAM_URL}
        revealTitle="Dars havolasi shu yeda"
        revealText="Endi quyidagi tugmani bosing: biz Telegram'da siz bilan bog'lanib, dars havolasini yuboramiz."
      />
      <p className="mt-4 text-center text-xs text-ink-subtle">
        Ma'lumotlaringiz xavfsiz saqlanadi va spam yuborilmaydi.
      </p>
    </Card>
  );
}
