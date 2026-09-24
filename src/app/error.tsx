"use client";

import { Button, Container, Heading } from "@/components/ui";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <div className="bg-bg text-ink"><Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center"><Heading as="h1">Nimadir noto‘g‘ri ketdi</Heading><p className="mt-4 max-w-md text-ink-muted">Sahifa yuklanmadi. Qayta urinib ko‘ring yoki bosh sahifaga o‘ting.</p><Button type="button" onClick={() => reset()} className="mt-7">Qayta urinish</Button></Container></div>; }
