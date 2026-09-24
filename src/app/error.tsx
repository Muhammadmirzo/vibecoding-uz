"use client";

import { TriangleAlert } from "lucide-react";
import { Button, Container, Heading } from "@/components/ui";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="bg-bg text-ink">
      <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-danger-soft text-danger" aria-hidden="true">
          <TriangleAlert className="size-7" />
        </span>
        <Heading as="h1" className="mt-6">Nimadir noto‘g‘ri ketdi</Heading>
        <p className="mt-4 max-w-md text-ink-muted">Sahifa yuklanmadi. Qayta urinib ko‘ring yoki bosh sahifaga o‘ting — ma’lumotlaringiz yo‘qolmaydi.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button type="button" onClick={() => reset()}>Qayta urinish</Button>
          <Button href="/" variant="outline">Bosh sahifa</Button>
        </div>
      </Container>
    </div>
  );
}
