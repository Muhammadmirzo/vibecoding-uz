import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button, Container, Heading } from "@/components/ui";
import { NextStepCTA } from "@/components/ui/NextStepCTA";

export default function NotFound() { return <div className="bg-bg text-ink"><Container className="flex min-h-[70vh] flex-col items-center justify-center py-20 text-center"><p className="font-mono text-7xl font-bold text-brand">404</p><Heading as="h1" className="mt-6">Bu sahifa topilmadi</Heading><p className="mt-4 max-w-md text-ink-muted">Ehtimol havola o‘zgargan yoki noto‘g‘ri kiritilgan. Bosh sahifadan davom eting.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Button href="/" size="lg"><ArrowLeft className="size-4" aria-hidden="true" /> Bosh sahifa</Button><Button href="/diagnostika" size="lg" variant="outline">Bepul diagnostika</Button></div><Link href="/blog" className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-brand underline underline-offset-4">Maqolalar bo‘limiga o‘tish</Link></Container><NextStepCTA /></div>; }
