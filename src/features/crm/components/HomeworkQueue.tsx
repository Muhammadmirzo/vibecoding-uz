"use client";
import { HomeworkFilters } from "./Homework/HomeworkFilters";
import { HomeworkQueueTable } from "./Homework/HomeworkQueueTable";
import { HomeworkReviewModal } from "./Homework/HomeworkReviewModal";
import { useHomeworkQueue } from "./Homework/useHomeworkQueue";
export function HomeworkQueue() { const data = useHomeworkQueue(); return <div className="space-y-6"><HomeworkFilters status={data.statusFilter} setStatus={data.setStatusFilter} /><HomeworkQueueTable submissions={data.submissions} loading={data.loading} onOpen={data.open} />{data.selected ? <HomeworkReviewModal submission={data.selected} criteria={data.criteria} feedbackMd={data.feedbackMd} setFeedbackMd={data.setFeedbackMd} submitting={data.submitting} error={data.error} onClose={() => data.setSelected(null)} onScore={(i, score) => data.setCriteria(prev => prev.map((c, n) => n === i ? { ...c, score } : c))} onTemplate={data.setFeedbackMd} onGrade={data.grade} /> : null}</div>; }
