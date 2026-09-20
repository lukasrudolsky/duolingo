import { LessonRunner } from "@/components/lesson/lesson-runner";
import { startLessonAction } from "./actions";

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { sessionId, items } = await startLessonAction(id);

  return <LessonRunner sessionId={sessionId} items={items} />;
}
