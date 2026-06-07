'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import SubscriptionBanner from '../components/SubscriptionBanner';
import QuizModeCard from '../components/QuizModeCard';
import ChapterCard from '../components/ChapterCard';
import {
  getSessions,
  deleteSession,
  getProgress,
  getNewQuestions,
  formatTimestamp,
  generateId,
  saveSession,
  type QuizSession,
} from '../lib/store';
import { CHAPTERS, TOTAL_POINTS, questions } from '../lib/questions';

const FREE_QUESTIONS = 30;

export default function HomePage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<QuizSession[]>([]);
  const [jumpTo, setJumpTo] = useState('');
  const [newCount, setNewCount] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSessions(getSessions());
    const progress = getProgress();
    setTotalAnswered(progress.totalAnswered);
    setNewCount(getNewQuestions(questions).length);
  }, []);

  const handleDiscard = (id: string) => {
    deleteSession(id);
    setSessions(getSessions());
  };

  const handleResume = (session: QuizSession) => {
    router.push(`/quiz?session=${session.id}`);
  };

  const handleJump = () => {
    const n = parseInt(jumpTo, 10);
    if (!n || n < 1 || n > questions.length) {
      alert(`Bitte eine Zahl zwischen 1 und ${questions.length} eingeben.`);
      return;
    }
    const session = {
      id: generateId(),
      mode: 'all' as const,
      questionIds: questions.map(q => q.id),
      currentIndex: n - 1,
      answers: {},
      startedAt: Date.now(),
      lastActiveAt: Date.now(),
      title: `Direkt zu Frage ${n}`,
    };
    saveSession(session);
    router.push(`/quiz?session=${session.id}`);
  };

  const getSessionScore = (session: QuizSession) => {
    const correct = Object.values(session.answers).filter(a => a.correct).length;
    const total = Object.values(session.answers).length;
    return { correct, total };
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Hero */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">§34d-Quiz</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Trainings-App für die IHK-Sachkundeprüfung §34d GewO</p>
        </div>

        {/* Subscription banner */}
        <SubscriptionBanner questionsUsed={totalAnswered} questionsTotal={FREE_QUESTIONS} />

        {/* Jump to question */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Direkt zu Frage springen</p>
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              max={questions.length}
              value={jumpTo}
              onChange={e => setJumpTo(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleJump()}
              placeholder={`1 – ${questions.length}`}
              className="w-32 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={handleJump}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Springen
            </button>
          </div>
        </div>

        {/* Active sessions */}
        {sessions.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">
              Fortsetzen ({sessions.length})
            </h2>
            <div className="space-y-3">
              {sessions.map(session => {
                const { correct, total } = getSessionScore(session);
                const pct = session.questionIds.length > 0
                  ? Math.round((session.currentIndex / session.questionIds.length) * 100)
                  : 0;
                return (
                  <div
                    key={session.id}
                    className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{session.title}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          Gestartet: {formatTimestamp(session.startedAt)} · Zuletzt aktiv: {formatTimestamp(session.lastActiveAt)}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Ergebnis: {correct} / {total} richtig · Frage {session.currentIndex + 1} von {session.questionIds.length}
                        </p>
                        <div className="mt-2 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <button
                          onClick={() => handleResume(session)}
                          className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Fortsetzen
                        </button>
                        <button
                          onClick={() => handleDiscard(session.id)}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        >
                          Verwerfen
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Quiz Modes */}
        <section>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">Quiz-Modus wählen</h2>
          <div className="space-y-3">
            <QuizModeCard
              mode="exam"
              iconBg="bg-orange-100 dark:bg-orange-900"
              icon={<span className="text-orange-600 dark:text-orange-300">🕐</span>}
              title="Prüfungssimulation"
              description="50 Fragen in 90 Minuten"
              badge="90 Minuten"
              badgeColor="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
            />
            <QuizModeCard
              mode="all"
              iconBg="bg-blue-100 dark:bg-blue-900"
              icon={<span className="text-blue-600 dark:text-blue-300">📖</span>}
              title="Alle Fragen (der Reihe nach)"
              description={`Alle ${questions.length} Fragen in Reihenfolge`}
            />
            <QuizModeCard
              mode="random"
              iconBg="bg-purple-100 dark:bg-purple-900"
              icon={<span className="text-purple-600 dark:text-purple-300">🔀</span>}
              title="Zufällige 50"
              description="50 zufällig gemischte Fragen"
            />
            <QuizModeCard
              mode="new"
              iconBg="bg-green-100 dark:bg-green-900"
              icon={<span className="text-green-600 dark:text-green-300">➕</span>}
              title="Neue Fragen (noch nie gehabt)"
              description="Nur Fragen die du noch nie beantwortet hast"
              badge={`${newCount} offen`}
              badgeColor="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              disabled={newCount === 0}
            />
          </div>
        </section>

        {/* Chapter learning */}
        <section>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Nach Kapitel lernen</h2>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Gesamt: {TOTAL_POINTS} Punkte</span>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl p-3 mb-4 flex items-start gap-2">
            <svg className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              <strong>Bestehensvoraussetzung:</strong> In jedem Themengebiet mindestens 50%
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CHAPTERS.map(chapter => (
              <ChapterCard key={chapter.id} chapter={chapter} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
