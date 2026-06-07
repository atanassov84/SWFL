'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import {
  getNickname,
  saveNickname,
  getLeaderboard,
  submitToLeaderboard,
  getProgress,
  type LeaderboardEntry,
} from '../../lib/store';

type SortMode = 'questions' | 'precision';
type PageSize = 10 | 25 | 50;

// Generate fake leaderboard entries for demo
function generateDemoEntries(): LeaderboardEntry[] {
  const names = [
    'MaxMuster', 'AnnaSchmidt', 'QuizProfi', 'VersicherungsAss', 'IHKChampion',
    'Lernfuchs42', 'PrüfungsKing', 'TopVermittler', 'GewO34d', 'FachmannXL',
    'TalentzPro', 'StudienFleiß', 'BesteLernerin', 'KapitelMeister', 'RechtGuru',
    'VersicherungsNerd', 'ExamAce', 'LernBiene', 'SachkundeProfi', 'QuizWeltmeister',
  ];
  return names.map((name, i) => {
    const total = 200 - i * 7 + Math.floor(Math.random() * 10);
    const correct = Math.floor(total * (0.95 - i * 0.02 + Math.random() * 0.05));
    return {
      nickname: name,
      totalAnswered: total,
      totalCorrect: correct,
      precision: correct / total,
      timestamp: Date.now() - i * 3600000,
    };
  });
}

export default function LeaderboardPage() {
  const [nickname, setNickname] = useState('');
  const [inputNick, setInputNick] = useState('');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>('questions');
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [page, setPage] = useState(1);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const nick = getNickname();
    setNickname(nick);
    setInputNick(nick);
    const progress = getProgress();
    setTotalAnswered(progress.totalAnswered);

    // Merge real leaderboard with demo entries
    const real = getLeaderboard();
    const demo = generateDemoEntries();
    // Remove demo entries that have same nickname as real
    const realNicks = new Set(real.map(e => e.nickname));
    const merged = [...real, ...demo.filter(e => !realNicks.has(e.nickname))];
    setEntries(merged);
  }, []);

  const handleSaveNick = () => {
    if (!inputNick.trim()) return;
    const nick = inputNick.trim();
    saveNickname(nick);
    setNickname(nick);
    if (totalAnswered >= 30) {
      submitToLeaderboard(nick);
      const real = getLeaderboard();
      const demo = generateDemoEntries();
      const realNicks = new Set(real.map(e => e.nickname));
      setEntries([...real, ...demo.filter(e => !realNicks.has(e.nickname))]);
    }
  };

  const sorted = [...entries].sort((a, b) => {
    if (sortMode === 'questions') return b.totalAnswered - a.totalAnswered;
    return b.precision - a.precision;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageEntries = sorted.slice((page - 1) * pageSize, page * pageSize);

  const getPrecisionColor = (pct: number) => {
    if (pct >= 0.8) return 'text-green-600 dark:text-green-400';
    if (pct >= 0.65) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getMedal = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
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
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Zurück zum Quiz
        </Link>

        {/* Title */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">🏆 Bestenliste</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Vergleiche dich mit anderen Nutzern — gib dir einen Spitznamen!
          </p>
        </div>

        {/* Nickname input */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Dein Spitzname</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputNick}
              onChange={e => setInputNick(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSaveNick()}
              placeholder="Spitzname eingeben..."
              maxLength={30}
              className="flex-1 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={handleSaveNick}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Speichern
            </button>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
            {totalAnswered >= 30
              ? `Du bist mit "${nickname || inputNick}" in der Rangliste sichtbar.`
              : `Du brauchst mindestens 30 beantwortete Fragen für die Rangliste. Aktuell: ${totalAnswered} Fragen.`}
          </p>
        </div>

        {/* Min questions info */}
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Beantworte mindestens <strong>30 Fragen</strong> um in der Rangliste zu erscheinen
          </p>
        </div>

        {/* Table card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          {/* Tabs + page size */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex-wrap gap-2">
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden">
              <button
                onClick={() => { setSortMode('questions'); setPage(1); }}
                className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                  sortMode === 'questions'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                Nach Fragen
              </button>
              <button
                onClick={() => { setSortMode('precision'); setPage(1); }}
                className={`px-4 py-1.5 text-sm font-medium transition-colors border-l border-slate-200 dark:border-slate-600 ${
                  sortMode === 'precision'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                Nach Präzision
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Einträge pro Seite:</span>
              {([10, 25, 50] as PageSize[]).map(n => (
                <button
                  key={n}
                  onClick={() => { setPageSize(n); setPage(1); }}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    pageSize === n
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50">
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-4 py-2">#</th>
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-4 py-2">Nutzer</th>
                  <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 px-4 py-2">Fragen</th>
                  <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 px-4 py-2">Quote</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {pageEntries.map((entry, idx) => {
                  const rank = (page - 1) * pageSize + idx + 1;
                  const medal = getMedal(rank);
                  const isMe = entry.nickname === nickname && nickname !== '';
                  return (
                    <tr
                      key={entry.nickname + rank}
                      className={`transition-colors ${
                        isMe
                          ? 'bg-blue-50 dark:bg-blue-950'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
                      }`}
                    >
                      <td className="px-4 py-3 text-sm">
                        <span className="font-bold text-slate-600 dark:text-slate-300">
                          {medal || rank}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-medium ${
                          isMe ? 'text-blue-700 dark:text-blue-300' : 'text-slate-800 dark:text-slate-100'
                        }`}>
                          {entry.nickname}
                          {isMe && <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 px-1.5 py-0.5 rounded">Du</span>}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-slate-700 dark:text-slate-200">
                        {entry.totalAnswered}
                      </td>
                      <td className={`px-4 py-3 text-right text-sm font-semibold ${getPrecisionColor(entry.precision)}`}>
                        {Math.round(entry.precision * 100)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {sorted.length} Nutzer · Seite {page} / {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Zurück
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Weiter →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
