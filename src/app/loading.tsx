import { Container } from "@/components/ui";

export default function Loading() { return <div className="min-h-[60vh] bg-bg"><Container className="py-20"><div className="h-4 w-32 animate-pulse rounded bg-bg-sunken" /><div className="mt-5 h-12 max-w-2xl animate-pulse rounded-lg bg-bg-sunken" /><div className="mt-4 h-5 max-w-xl animate-pulse rounded bg-bg-sunken" /></Container></div>; }
