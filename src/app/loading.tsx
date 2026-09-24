import { Container } from "@/components/ui";
import { PageSkeleton } from "@/components/pages/PageBits";

// Full viewport height on purpose: a shorter skeleton let the footer paint
// above the fold and then jump when the page streamed in (mobile CLS 0.27).
export default function Loading() {
  return (
    <div className="min-h-[100dvh] bg-bg">
      <Container className="py-20">
        <PageSkeleton rows={3} />
      </Container>
    </div>
  );
}
