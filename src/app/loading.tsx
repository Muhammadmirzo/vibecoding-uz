import { Container } from "@/components/ui";

// Full viewport height on purpose: a shorter skeleton let the footer paint
// above the fold and then jump when the page streamed in (mobile CLS 0.27).
export default function Loading() { return <div className="min-h-[100dvh] bg-bg"><Container className="py-20"><div className="h-4 w-32 animate-pulse rounded bg-bg-sunken" /><div className="mt-5 h-12 max-w-2xl animate-pulse rounded-lg bg-bg-sunken" /><div className="mt-4 h-5 max-w-xl animate-pulse rounded bg-bg-sunken" /></Container></div>; }
