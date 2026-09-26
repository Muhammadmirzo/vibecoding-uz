import { notFound } from "next/navigation";
import LessonPlayerView from "@/features/lms/components/LessonPlayerView";

type LessonPageProps = { params: Promise<{ id: string; lessonId: string }> };

// L13: an unknown course/lesson id must 404, not render an empty player with a 200.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function LessonPlayerPage({ params }: LessonPageProps) {
  const { id, lessonId } = await params;
  if (!id?.trim() || !lessonId?.trim() || !UUID.test(id) || !UUID.test(lessonId)) notFound();
  return <LessonPlayerView courseId={id} lessonId={lessonId} />;
}
