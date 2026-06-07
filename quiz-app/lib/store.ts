import { Question } from './questions';

export type AnswerRecord = {
  questionId: number;
  selectedAnswers: string[];
  correct: boolean;
  timestamp: number;
};

export type QuizSession = {
  id: string;
  mode: 'exam' | 'all' | 'random' | 'new' | 'chapter';
  chapterId?: number;
  questionIds: number[];
  currentIndex: number;
  answers: Record<number, AnswerRecord>;
  startedAt: number;
  lastActiveAt: number;
  title: string;
};

export type UserProgress = {
  answeredQuestions: Record<number, AnswerRecord[]>;
  totalAnswered: number;
  totalCorrect: number;
};

const SESSIONS_KEY = 'quiz_sessions';
const PROGRESS_KEY = 'quiz_progress';
const NICKNAME_KEY = 'quiz_nickname';
const LEADERBOARD_KEY = 'quiz_leaderboard';

function safeLocalStorage() {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

// Sessions
export function getSessions(): QuizSession[] {
  const ls = safeLocalStorage();
  if (!ls) return [];
  try {
    return JSON.parse(ls.getItem(SESSIONS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveSession(session: QuizSession): void {
  const ls = safeLocalStorage();
  if (!ls) return;
  const sessions = getSessions().filter(s => s.id !== session.id);
  sessions.unshift({ ...session, lastActiveAt: Date.now() });
  ls.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function deleteSession(id: string): void {
  const ls = safeLocalStorage();
  if (!ls) return;
  const sessions = getSessions().filter(s => s.id !== id);
  ls.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function getSession(id: string): QuizSession | null {
  return getSessions().find(s => s.id === id) || null;
}

// Progress
export function getProgress(): UserProgress {
  const ls = safeLocalStorage();
  if (!ls) return { answeredQuestions: {}, totalAnswered: 0, totalCorrect: 0 };
  try {
    return JSON.parse(ls.getItem(PROGRESS_KEY) || 'null') || {
      answeredQuestions: {},
      totalAnswered: 0,
      totalCorrect: 0,
    };
  } catch {
    return { answeredQuestions: {}, totalAnswered: 0, totalCorrect: 0 };
  }
}

export function recordAnswer(answer: AnswerRecord): void {
  const ls = safeLocalStorage();
  if (!ls) return;
  const progress = getProgress();
  const existing = progress.answeredQuestions[answer.questionId] || [];
  // Only count first answer for totals
  const isFirst = existing.length === 0;
  existing.push(answer);
  progress.answeredQuestions[answer.questionId] = existing;
  if (isFirst) {
    progress.totalAnswered += 1;
    if (answer.correct) progress.totalCorrect += 1;
  }
  ls.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function getAnsweredQuestionIds(): Set<number> {
  const progress = getProgress();
  return new Set(Object.keys(progress.answeredQuestions).map(Number));
}

export function getNewQuestions(allQuestions: Question[]): Question[] {
  const answered = getAnsweredQuestionIds();
  return allQuestions.filter(q => !answered.has(q.id));
}

// Nickname
export function getNickname(): string {
  const ls = safeLocalStorage();
  if (!ls) return '';
  return ls.getItem(NICKNAME_KEY) || '';
}

export function saveNickname(nickname: string): void {
  const ls = safeLocalStorage();
  if (!ls) return;
  ls.setItem(NICKNAME_KEY, nickname);
}

// Leaderboard
export type LeaderboardEntry = {
  nickname: string;
  totalAnswered: number;
  totalCorrect: number;
  precision: number;
  timestamp: number;
};

export function getLeaderboard(): LeaderboardEntry[] {
  const ls = safeLocalStorage();
  if (!ls) return [];
  try {
    return JSON.parse(ls.getItem(LEADERBOARD_KEY) || '[]');
  } catch {
    return [];
  }
}

export function submitToLeaderboard(nickname: string): void {
  const ls = safeLocalStorage();
  if (!ls) return;
  const progress = getProgress();
  if (progress.totalAnswered < 30) return;
  const leaderboard = getLeaderboard().filter(e => e.nickname !== nickname);
  const entry: LeaderboardEntry = {
    nickname,
    totalAnswered: progress.totalAnswered,
    totalCorrect: progress.totalCorrect,
    precision: progress.totalAnswered > 0 ? progress.totalCorrect / progress.totalAnswered : 0,
    timestamp: Date.now(),
  };
  leaderboard.push(entry);
  ls.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
}

// Generate session ID
export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Format timestamp
export function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Shuffle array
export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
