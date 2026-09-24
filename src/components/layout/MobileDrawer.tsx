"use client";

import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui";

const links = [["Kurslar", "/#kurs-tanlash"], ["Xizmatlar", "/xizmatlar"], ["Portfolio", "/portfolio"], ["Blog", "/blog"], ["Resurslar", "/resurslar"], ["Diagnostika", "/diagnostika"], ["Bepul dars", "/bepul-dars"]] as const;

export function MobileDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { user, openAuthModal } = useAuth();
  const close = () => onOpenChange(false);
  return <Dialog.Root open={open} onOpenChange={onOpenChange}><Dialog.Trigger asChild><button type="button" className="inline-flex size-11 items-center justify-center rounded-lg text-ink hover:bg-bg-sunken lg:hidden" aria-label="Navigatsiyani ochish"><Menu className="size-5" aria-hidden="true" /></button></Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40" /><Dialog.Content className="fixed inset-y-0 right-0 z-50 w-[min(88vw,360px)] overflow-y-auto border-l border-border bg-bg p-6 shadow-lg" aria-describedby={undefined}><div className="flex items-center justify-between"><Dialog.Title className="font-display text-lg font-semibold text-ink">Navigatsiya</Dialog.Title><Dialog.Close asChild><button type="button" className="inline-flex size-11 items-center justify-center rounded-lg hover:bg-bg-sunken" aria-label="Navigatsiyani yopish"><X className="size-5" aria-hidden="true" /></button></Dialog.Close></div><nav className="mt-8 space-y-1" aria-label="Mobil navigatsiya">{links.map(([label, href]) => <Dialog.Close asChild key={href}><Link href={href} onClick={close} className="block rounded-lg px-3 py-3 font-semibold text-ink hover:bg-bg-sunken">{label}</Link></Dialog.Close>)}</nav><div className="mt-8 border-t border-border pt-6"><Button href="/diagnostika" onClick={close} className="w-full">Bepul diagnostika</Button>{user ? <Button href="/kabinet" onClick={close} variant="outline" className="mt-3 w-full">Kabinet</Button> : <Button type="button" onClick={() => { close(); openAuthModal("login"); }} variant="outline" className="mt-3 w-full">Tizimga kirish</Button>}</div></Dialog.Content></Dialog.Portal></Dialog.Root>;
}
