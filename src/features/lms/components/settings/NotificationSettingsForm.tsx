import { Send } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";
import type { NotificationState } from "./settingsTypes";
import { NotificationToggles } from "./NotificationToggles";

export function NotificationSettingsForm(props: NotificationState) {
  return (
    <section className="rounded-2xl border border-border bg-bg-elevated p-6 md:p-8">
      <div className="border-b border-border pb-5">
        <h2 className="font-display text-xl font-semibold text-ink">Bildirishnomalar</h2>
        <p className="mt-2 text-base leading-relaxed text-ink-muted">Qaysi kanal va mavzular orqali xabar olishni tanlang. sozlamalar hozircha faqat ushbu sahifada saqlanadi.</p>
      </div>
      <div className="mt-6 flex flex-col gap-4 rounded-xl border border-border bg-bg-sunken p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold text-ink">Telegram bot</h3>
          <p className="mt-1 text-sm text-ink-muted">Bot orqali ulanish yoki sozlamalarni yangilash uchun Telegram&apos;da oching.</p>
        </div>
        <a href="https://t.me/m/ODAfK_QIMjky" target="_blank" rel="noreferrer" className={`${buttonVariants({ variant: "telegram" })} shrink-0`}>
          <Send className="h-4 w-4" aria-hidden="true" /> Telegram&apos;da ochish
        </a>
      </div>
      <NotificationToggles {...props} />
    </section>
  );
}
