'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  getSession,
  saveSession,
  recordAnswer,
  type QuizSession,
  type AnswerRecord,
} from '../../lib/store';
import { questions, CHAPTERS, type Question } from '../../lib/questions';
import AIExplanationModal from '../../components/AIExplanationModal';

function getQuestionById(id: number): Question | undefined {
  return questions.find(q => q.id === id);
}

function getChapterTitle(chapterId: number): string {
  const chapter = CHAPTERS.find(c => c.id === chapterId);
  return chapter ? chapter.title : '';
}

export default function QuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');

  const [session, setSession] = useState<QuizSession | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!sessionId) {
      router.replace('/');
      return;
    }
    const s = getSession(sessionId);
    if (!s) {
      router.replace('/');
      return;
    }
    setSession(s);

    // Exam timer
    if (s.mode === 'exam') {
      const elapsed = Math.floor((Date.now() - s.startedAt) / 1000);
      const total = 90 * 60;
      setTimeLeft(Math.max(0, total - elapsed));
    }
  }, [sessionId, router]);

  // Countdown timer for exam mode
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t === null || t <= 1) {
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const currentQuestion = session
    ? getQuestionById(session.questionIds[session.currentIndex])
    : null;

  const alreadyAnswered = session && currentQuestion
    ? session.answers[currentQuestion.id]
    : null;

  // Pre-fill if already answered
  useEffect(() => {
    if (alreadyAnswered) {
      setSelectedAnswers(alreadyAnswered.selectedAnswers);
      setChecked(true);
    } else {
      setSelectedAnswers([]);
      setChecked(false);
    }
  }, [session?.currentIndex, alreadyAnswered]);

  const toggleAnswer = (id: string) => {
    if (checked) return;
    if (!currentQuestion) return;
    if (currentQuestion.type === 'single') {
      setSelectedAnswers([id]);
    } else {
      setSelectedAnswers(prev =>
        prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
      );
    }
  };

  const handleCheck = () => {
    if (!session || !currentQuestion || selectedAnswers.length === 0) return;
    const correct =
      selectedAnswers.length === currentQuestion.correctAnswers.length &&
      selectedAnswers.every(a => currentQuestion.correctAnswers.includes(a));

    const record: AnswerRecord = {
      questionId: currentQuestion.id,
      selectedAnswers,
      correct,
      timestamp: Date.now(),
    };

    recordAnswer(record);

    const updatedSession: QuizSession = {
      ...session,
      answers: { ...session.answers, [currentQuestion.id]: record },
    };
    saveSession(updatedSession);
    setSession(updatedSession);
    setChecked(true);
  };

  const navigate = useCallback((dir: 'prev' | 'next') => {
    if (!session) return;
    const newIndex = dir === 'next'
      ? Math.min(session.currentIndex + 1, session.questionIds.length - 1)
      : Math.max(session.currentIndex - 1, 0);
    const updated = { ...session, currentIndex: newIndex };
    saveSession(updated);
    setSession(updated);
    setChecked(false);
    setSelectedAnswers([]);
  }, [session]);

  if (!mounted || !session || !currentQuestion) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalQuestions = session.questionIds.length;
  const currentNum = session.currentIndex + 1;
  const answeredCount = Object.keys(session.answers).length;
  const correctCount = Object.values(session.answers).filter(a => a.correct).length;
  const chapterTitle = getChapterTitle(currentQuestion.chapter);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const getOptionStyle = (optionId: string) => {
    if (!checked) {
      const selected = selectedAnswers.includes(optionId);
      return selected
        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 dark:border-blue-400'
        : 'border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-700';
    }
    const isCorrect = currentQuestion.correctAnswers.includes(optionId);
    const isSelected = selectedAnswers.includes(optionId);
    if (isCorrect) return 'border-green-500 bg-green-50 dark:bg-green-950 dark:border-green-400';
    if (isSelected && !isCorrect) return 'border-red-500 bg-red-50 dark:bg-red-950 dark:border-red-400';
    return 'border-slate-200 dark:border-slate-600 opacity-60';
  };

  const getOptionIcon = (optionId: string) => {
    if (!checked) return null;
    const isCorrect = currentQuestion.correctAnswers.includes(optionId);
    const isSelected = selectedAnswers.includes(optionId);
    if (isCorrect) return (
      <span className="text-green-600 dark:text-green-400 font-bold text-lg">✓</span>
    );
    if (isSelected && !isCorrect) return (
      <span className="text-red-600 dark:text-red-400 font-bold text-lg">✗</span>
    );
    return null;
  };

  const isAnsweredCorrectly = checked && alreadyAnswered?.correct;
  const isAnsweredWrong = checked && alreadyAnswered && !alreadyAnswered.correct;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      {/* Top bar */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Menü
          </Link>

          <div className="flex items-center gap-4">
            {/* Question counter */}
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
              #{currentNum}
            </span>
            {/* Score */}
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">{correctCount}</span>
              <span className="text-sm text-slate-400">/</span>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{answeredCount}</span>
            </div>
            {/* Timer (exam mode) */}
            {timeLeft !== null && (
              <span className={`text-sm font-bold tabular-nums ${timeLeft < 300 ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-200'}`}>
                {formatTime(timeLeft)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-2">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {answeredCount} von {totalQuestions} Fragen beantwortet
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {Math.round((answeredCount / totalQuestions) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-4">
        {/* Question card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs font-medium px-2.5 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
              Kapitel {currentQuestion.chapter}
            </span>
            <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">
              {currentQuestion.type === 'multiple' ? 'Mehrfachauswahl' : 'Einzelauswahl'}
            </span>
            {currentQuestion.type === 'multiple' && (
              <span className="text-xs font-medium px-2.5 py-1 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 rounded-full">
                Reihenfolge variiert ↑
              </span>
            )}
          </div>

          {/* Chapter subtitle */}
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">{chapterTitle}</p>

          {/* Question text */}
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 leading-snug mb-4">
            <span className="text-blue-600 dark:text-blue-400 mr-2">#{session.questionIds[session.currentIndex]}</span>
            {currentQuestion.text}
          </h2>

          {/* Multiple choice info banner */}
          {currentQuestion.type === 'multiple' && !checked && (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Mehrere Antworten möglich — wähle alle richtigen aus
              </p>
            </div>
          )}

          {/* Result banner */}
          {checked && (
            <div className={`rounded-lg p-3 mb-4 flex items-center gap-2 ${
              isAnsweredCorrectly
                ? 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800'
            }`}>
              <span className="text-lg">{isAnsweredCorrectly ? '✅' : '❌'}</span>
              <p className={`text-sm font-semibold ${
                isAnsweredCorrectly ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
              }`}>
                {isAnsweredCorrectly ? 'Richtig!' : 'Falsch — sieh dir die korrekte Antwort an.'}
              </p>
            </div>
          )}

          {/* Answer options */}
          <div className="space-y-2">
            {currentQuestion.options.map(option => (
              <button
                key={option.id}
                onClick={() => toggleAnswer(option.id)}
                disabled={checked}
                className={`w-full text-left flex items-start gap-3 p-3 rounded-xl border-2 transition-all ${getOptionStyle(option.id)} ${checked ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <span className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border ${
                  checked
                    ? currentQuestion.correctAnswers.includes(option.id)
                      ? 'bg-green-500 border-green-500 text-white'
                      : selectedAnswers.includes(option.id)
                        ? 'bg-red-500 border-red-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-500 text-slate-600 dark:text-slate-300'
                    : selectedAnswers.includes(option.id)
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-500 text-slate-600 dark:text-slate-300'
                }`}>
                  {option.id}
                </span>
                <span className="flex-1 text-sm text-slate-700 dark:text-slate-200 leading-relaxed pt-0.5">
                  {option.text}
                </span>
                <span className="shrink-0 pt-0.5">{getOptionIcon(option.id)}</span>
              </button>
            ))}
          </div>

          {/* AI Help button */}
          <div className="mt-5 flex flex-col items-center gap-2">
            <button
              onClick={() => setShowAI(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m1.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              HILFE - Erklärung &amp; Rechtsgrundlage anfordern
            </button>
            <button className="text-xs text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors underline">
              Fehler melden
            </button>
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="sticky bottom-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate('prev')}
            disabled={session.currentIndex === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Zurück
          </button>

          {!checked ? (
            <button
              onClick={handleCheck}
              disabled={selectedAnswers.length === 0}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 text-white font-semibold text-sm rounded-xl transition-colors disabled:cursor-not-allowed"
            >
              Prüfen
            </button>
          ) : (
            <button
              onClick={() => navigate('next')}
              disabled={session.currentIndex === totalQuestions - 1}
              className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 text-white font-semibold text-sm rounded-xl transition-colors disabled:cursor-not-allowed"
            >
              Weiter →
            </button>
          )}

          <button
            onClick={() => navigate('next')}
            disabled={session.currentIndex === totalQuestions - 1}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Vor
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Progress indicator */}
        <div className="max-w-3xl mx-auto px-4 pb-2">
          <p className="text-center text-xs text-slate-400 dark:text-slate-500">
            Frage {currentNum} von {totalQuestions}
          </p>
        </div>
      </div>

      {/* AI Modal */}
      {showAI && (
        <AIExplanationModal question={currentQuestion} onClose={() => setShowAI(false)} />
      )}
    </div>
  );
}
