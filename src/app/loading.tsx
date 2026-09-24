import { Container } from "@/components/ui/Layout";

// Full viewport height on purpose: a shorter skeleton let the footer paint
// above the fold and then jump when the page streamed in (mobile CLS 0.27).
// NOTE: intentionally no shared-CSS import here — this boundary ships with
// every route, so it stays dependency-free (plain opacity pulse only).
export default function Loading() {
  return (
    <div className="min-h-[100dvh] bg-bg">
      <Container className="space-y-4 py-20" aria-hidden="true" role="presentation">
        <div className="h-8 w-56 animate-pulse rounded-md bg-bg-sunken" />
        <div className="h-28 w-full animate-pulse rounded-md bg-bg-sunken" />
        <div className="h-28 w-full animate-pulse rounded-md bg-bg-sunken" />
        <div className="h-28 w-full animate-pulse rounded-md bg-bg-sunken" />
      </Container>
    </div>
  );
}
