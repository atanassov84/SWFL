'use client';

import { useRouter } from 'next/navigation';
import { Chapter } from '../lib/questions';
import { generateId, saveSession, getAnsweredQuestionIds } from '../lib/store';
import { questions } from '../lib/questions';

interface ChapterCardProps {
  chapter: Chapter;
}

export default function ChapterCard({ chapter }: ChapterCardProps) {
  const router = useRouter();
  const answeredIds = getAnsweredQuestionIds();
  const chapterQuestions = questions.filter(q => q.chapter === chapter.id);
  const answeredInChapter = chapterQuestions.filter(q => answeredIds.has(q.id)).length;
  const total = chapterQuestions.length;
  const pct = total > 0 ? Math.round((answeredInChapter / total) * 100) : 0;

  const handleStart = () => {
    const session = {
      id: generateId(),
      mode: 'chapter' as const,
      chapterId: chapter.id,
      questionIds: chapterQuestions.map(q => q.id),
      currentIndex: 0,
      answers: {},
      startedAt: Date.now(),
      lastActiveAt: Date.now(),
      title: `Kapitel ${chapter.id}: ${chapter.title}`,
    };
    saveSession(session);
    router.push(`/quiz?session=${session.id}`);
  };

  const colors = [
    'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800',
    'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800',
    'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800',
    'bg-rose-50 dark:bg-rose-950 border-rose-200 dark:border-rose-800',
    'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800',
    'bg-teal-50 dark:bg-teal-950 border-teal-200 dark:border-teal-800',
  ];

  const numberColors = [
    'bg-blue-600',
    'bg-purple-600',
    'bg-green-600',
    'bg-rose-600',
    'bg-amber-600',
    'bg-teal-600',
  ];

  const colorIdx = chapter.id - 1;

  return (
    <button
      onClick={handleStart}
      className={`group w-full text-left border rounded-xl p-4 shadow-sm hover:shadow-md transition-all ${colors[colorIdx]}`}
    >
      <div className="flex items-start gap-3">
        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${numberColors[colorIdx]}`}>
          {chapter.id}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 leading-tight group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
            {chapter.title}
          </p>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {chapter.points} Pkt. · min. {chapter.minDuration} min
            </span>
          </div>
          <div className="mt-2">
            {answeredInChapter === 0 ? (
              <span className="text-xs text-slate-400 dark:text-slate-500">Noch nicht bearbeitet</span>
            ) : (
              <span className="text-xs text-slate-500 dark:text-slate-400">{answeredInChapter} von {total} beantwortet</span>
            )}
          </div>
          {answeredInChapter > 0 && (
            <div className="mt-2 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
