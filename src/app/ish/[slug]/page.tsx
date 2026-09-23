"use client";

import { useParams, notFound } from "next/navigation";
import { STATIC_JOB_OPENINGS } from "@/features/jobs/jobsData";
import { JobDetailHeader } from "./JobDetailHeader";
import { JobDescription } from "./JobDescription";
import { JobRequirements } from "./JobRequirements";
import { JobApplySection } from "./JobApplySection";

export default function JobDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const job = STATIC_JOB_OPENINGS.find((item) => item.slug === slug);

  if (!job) notFound();

  return (
    <div className="pt-28 pb-20 min-h-screen bg-cream">
      <div className="mx-auto w-full max-w-[1360px] px-5 md:px-8 lg:px-10 space-y-8">
        <JobDetailHeader job={job} />
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7 space-y-8">
            <JobDescription job={job} />
            <JobRequirements job={job} />
          </div>
          <JobApplySection job={job} />
        </div>
      </div>
    </div>
  );
}
