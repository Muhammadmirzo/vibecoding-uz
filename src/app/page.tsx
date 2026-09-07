import { HeroSection } from "@/components/sections/HeroSection";
import { ProofStats } from "@/components/sections/ProofStats";
import { CourseCards } from "@/components/sections/CourseCards";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProofStats />
      <CourseCards />
    </>
  );
}
