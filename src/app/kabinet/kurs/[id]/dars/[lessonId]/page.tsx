import LessonPlayerView from "@/features/lms/components/LessonPlayerView";

type LessonPageProps = { params: Promise<{ id: string; lessonId: string }> };

export default async function LessonPlayerPage({ params }: LessonPageProps) {
  const { id, lessonId } = await params;
  return <LessonPlayerView courseId={id} lessonId={lessonId} />;
}
