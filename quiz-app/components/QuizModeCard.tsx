'use client';

import { useRouter } from 'next/navigation';
import {
  generateId,
  saveSession,
  getNewQuestions,
  shuffleArray,
} from '../lib/store';
import { questions, EXAM_QUESTION_COUNT, RANDOM_QUIZ_COUNT } from '../lib/questions';

type Mode = 'exam' | 'all' | 'random' | 'new';

interface QuizModeCardProps {
  mode: Mode;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  disabled?: boolean;
}

export default function QuizModeCard({
  mode,
  icon,
  iconBg,
  title,
  description,
  badge,
  badgeColor = 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  disabled = false,
}: QuizModeCardProps) {
  const router = useRouter();

  const handleStart = () => {
    if (disabled) return;
    let questionIds: number[] = [];

    if (mode === 'exam') {
      questionIds = shuffleArray(questions.map(q => q.id)).slice(0, EXAM_QUESTION_COUNT);
    } else if (mode === 'all') {
      questionIds = questions.map(q => q.id);
    } else if (mode === 'random') {
      questionIds = shuffleArray(questions.map(q => q.id)).slice(0, Math.min(RANDOM_QUIZ_COUNT, questions.length));
    } else if (mode === 'new') {
      const newQs = getNewQuestions(questions);
      questionIds = newQs.map(q => q.id);
    }

    if (questionIds.length === 0) {
      alert('Keine Fragen verfügbar.');
      return;
    }

    const titles: Record<Mode, string> = {
      exam: 'Prüfungssimulation',
      all: 'Alle Fragen (der Reihe nach)',
      random: 'Zufällige 50',
      new: 'Neue Fragen',
    };

    const session = {
      id: generateId(),
      mode,
      questionIds,
      currentIndex: 0,
      answers: {},
      startedAt: Date.now(),
      lastActiveAt: Date.now(),
      title: titles[mode],
    };

    saveSession(session);
    router.push(`/quiz?session=${session.id}`);
  };

  return (
    <button
      onClick={handleStart}
      disabled={disabled}
      className={`group w-full text-left bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500 transition-all ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-xl ${iconBg}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {title}
            </span>
            {badge && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeColor}`}>
                {badge}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
        </div>
        <svg className="shrink-0 w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-blue-400 transition-colors mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}
