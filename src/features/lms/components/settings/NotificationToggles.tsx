import { Save } from "lucide-react";
import { Button } from "@/components/ui";
import type { NotificationState } from "./settingsTypes";

export function NotificationToggles(props: NotificationState) {
  const { notifSaved, handleSaveNotifications } = props;
  const groups = [
    { title: "Kanal", items: [
      { label: "Telegram xabarnomalari", description: "Muhim hodisalar haqida Telegram orqali xabar olish.", checked: props.telegramNotify, onChange: props.setTelegramNotify },
      { label: "Email eslatmalari", description: "Dars va topshiriq bo&apos;yicha email yuborish.", checked: props.emailNotify, onChange: props.setEmailNotify },
      { label: "SMS eslatmalari", description: "SMS orqali eslatma yuborish.", checked: props.smsNotify, onChange: props.setSmsNotify },
    ] },
    { title: "Mavzu", items: [
      { label: "Uy vazifalari muddati", description: "Topshiriq muddati tugashidan oldin eslatish.", checked: props.homeworkDeadlines, onChange: props.setHomeworkDeadlines },
      { label: "Mentor izohlari", description: "Mentor bahosi yoki izohi berilganda xabar olish.", checked: props.mentorReviews, onChange: props.setMentorReviews },
      { label: "Jonli uchrashuvlar", description: "Jonli uchrashuvlar haqida eslatma olish.", checked: props.liveMeetReminders, onChange: props.setLiveMeetReminders },
    ] },
  ];
  return <div className="mt-6 space-y-6">
    {groups.map((group) => <fieldset key={group.title}><legend className="text-sm font-semibold text-ink">{group.title}</legend><div className="mt-3 grid gap-3">{group.items.map((item) => <label key={item.label} className="flex min-h-16 cursor-pointer items-center justify-between gap-4 rounded-lg border border-border bg-bg-elevated p-4 hover:border-brand"><span><span className="block text-sm font-semibold text-ink">{item.label}</span><span className="mt-1 block text-sm text-ink-muted">{item.description}</span></span><input type="checkbox" checked={item.checked} onChange={(event) => item.onChange(event.target.checked)} className="h-5 w-5 shrink-0 accent-brand" /></label>)}</div></fieldset>)}
    <div className="flex flex-col items-end gap-3 border-t border-border pt-5"><Button onClick={handleSaveNotifications}><Save className="h-4 w-4" aria-hidden="true" />{notifSaved ? "Tanlovlar saqlandi" : "Tanlovlarni saqlash"}</Button><p className="text-sm text-ink-subtle">Serverga saqlash API&apos;si ulanmagan.</p></div>
  </div>;
}
