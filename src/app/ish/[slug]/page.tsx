import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { STATIC_JOB_OPENINGS } from "@/features/jobs/jobsData";
import { JobDetailHeader } from "./JobDetailHeader";
import { JobDescription } from "./JobDescription";
import { JobRequirements } from "./JobRequirements";
import { JobApplySection } from "./JobApplySection";
import { NextStepCTA } from "@/components/ui/NextStepCTA";

interface Props { params: Promise<{ slug: string }> }
export function generateStaticParams() { return STATIC_JOB_OPENINGS.map(job => ({ slug: job.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { slug } = await params; const job = STATIC_JOB_OPENINGS.find(item => item.slug === slug); return job ? { title: `${job.title} — ish o‘rni`, description: job.descriptionMd } : { title: "Ish topilmadi" }; }
export default async function Page({ params }: Props) { const { slug } = await params; const job = STATIC_JOB_OPENINGS.find(item => item.slug === slug); if (!job) notFound(); return <div className="min-h-screen bg-bg pt-28 text-ink"><div className="mx-auto max-w-container space-y-8 px-5 pb-20 sm:px-8"><JobDetailHeader job={job} /><div className="grid items-start gap-10 lg:grid-cols-12"><div className="space-y-8 lg:col-span-7"><JobDescription job={job} /><JobRequirements job={job} /></div><JobApplySection job={job} /></div><NextStepCTA title="Ish o‘rnini topishga tayyor bo‘ling" /></div></div>; }
