import type { Metadata } from "next";
import { LeadCaptureForm } from "@/features/leads/ui/LeadCaptureForm";
import { Container, Heading, Eyebrow } from "@/components/ui";
import { Card } from "@/components/ui/Surfaces";
import { NextStepCTA } from "@/components/ui/NextStepCTA";

export const metadata: Metadata = { title: "Bepul AI resurslar", description: "Tadbirkor, marketolog va o‘qituvchilar uchun AI promptlari hamda amaliy qo‘llanmalar." };
const resources = [{ title: "Tadbirkorlar", count: "Promptlar va MVP checklist" }, { title: "Marketologlar", count: "Kontent va SMM starter" }, { title: "O‘qituvchilar", count: "Dars rejalari va mashqlar" }, { title: "Moliya mutaxassislari", count: "Hisobot va formulalar" }];
export default function Page() { return <div className="bg-bg text-ink"><Container className="py-20 sm:py-28"><Eyebrow>Bepul kutubxona</Eyebrow><Heading as="h1" className="mt-3">Sohangizga mos AI resurslari</Heading><p className="mt-4 max-w-2xl text-lg text-ink-muted">Telegram orqali yuklab olishdan oldin, resurslarni yuborish uchun ma’lumot qoldiring.</p><div className="mt-12 grid gap-5 sm:grid-cols-2">{resources.map(item => <Card key={item.title}><h2 className="text-xl font-bold">{item.title}</h2><p className="mt-2 text-sm text-ink-muted">{item.count}</p></Card>)}</div><Card className="mt-12 max-w-xl"><LeadCaptureForm source="resurslar" ctaLabel="Resurslarni olish" title="Telegram havolasini ochish" description="Ma’lumotlarni qoldirgandan keyin resurslar havolasi ko‘rsatiladi." revealUrl="https://t.me/m/ODAfK_QIMjky" revealText="Telegram orqali resurslarni yuklab oling." /></Card></Container><NextStepCTA title="Resurdan keyin o‘z loyihangizni boshlang" /></div>; }
