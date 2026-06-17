import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import type { Difficulty, Quiz } from '../data/quizzes';
import { db } from './firebase';

export type UserStats = {
  uid: string;
  username: string;
  points: number;
  stones: number;
  rank: string;
  correctCount: number;
  totalCount: number;
  historyLimit: number;
  seasonPoints: number;
  grade: string;
};

export type QuizAnswerResult = {
  question: Quiz;
  userAnswer: number;
  isCorrect: boolean;
};

export type HistoryItem = {
  id: string;
  question: string;
  options: string[];
  correct: number;
  userAnswer: number;
  isCorrect: boolean;
  points: number;
  difficulty: Difficulty;
  explanation: string;
  mode: string;
  grade: string;
  timestamp?: unknown;
};

const rankThresholds = [
  { minPoints: 1500, rankName: '最高地優吾' },
  { minPoints: 700, rankName: 'おやーンズ' },
  { minPoints: 350, rankName: 'サタスペリスナー' },
  { minPoints: 150, rankName: 'チムスト' },
  { minPoints: 50, rankName: '見習いストーンズ' },
  { minPoints: 0, rankName: '新規リスナー' },
];

export function getPointsForDifficulty(difficulty: Difficulty): number {
  switch (difficulty) {
    case '上級':
      return 3;
    case '中級':
      return 2;
    case '初級':
    default:
      return 1;
  }
}

export function getRankForPoints(points: number): string {
  return rankThresholds.find((threshold) => points >= threshold.minPoints)?.rankName ?? '新規リスナー';
}

export function getDefaultStats(user?: User | null): UserStats {
  const username = user?.displayName || user?.email?.split('@')[0] || 'ゲスト リスナー';
  return {
    uid: user?.uid ?? '',
    username,
    points: 0,
    stones: 0,
    rank: '新規リスナー',
    correctCount: 0,
    totalCount: 0,
    historyLimit: 5,
    seasonPoints: 0,
    grade: '-',
  };
}

function normalizeStats(uid: string, value: Record<string, unknown>, user?: User | null): UserStats {
  const fallback = getDefaultStats(user);
  const points = typeof value.points === 'number' ? value.points : fallback.points;
  return {
    uid,
    username: typeof value.username === 'string' && value.username ? value.username : fallback.username,
    points,
    stones: typeof value.stones === 'number' ? value.stones : fallback.stones,
    rank: typeof value.rank === 'string' ? value.rank : getRankForPoints(points),
    correctCount: typeof value.correctCount === 'number' ? value.correctCount : fallback.correctCount,
    totalCount: typeof value.totalCount === 'number' ? value.totalCount : fallback.totalCount,
    historyLimit: typeof value.historyLimit === 'number' ? value.historyLimit : fallback.historyLimit,
    seasonPoints: typeof value.seasonPoints === 'number' ? value.seasonPoints : fallback.seasonPoints,
    grade: typeof value.grade === 'string' ? value.grade : fallback.grade,
  };
}

export async function loadUserStats(user: User): Promise<UserStats> {
  const reference = doc(db, 'users', user.uid);
  const snapshot = await getDoc(reference);
  if (!snapshot.exists()) {
    const initialStats = getDefaultStats(user);
    await setDoc(reference, {
      ...initialStats,
      updatedAt: serverTimestamp(),
    });
    return initialStats;
  }

  return normalizeStats(user.uid, snapshot.data(), user);
}

export async function saveQuizRun(user: User, results: QuizAnswerResult[]): Promise<number> {
  const earnedPoints = results.reduce(
    (sum, result) => sum + (result.isCorrect ? getPointsForDifficulty(result.question.difficulty) : 0),
    0,
  );
  const correctCount = results.filter((result) => result.isCorrect).length;
  const userReference = doc(db, 'users', user.uid);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(userReference);
    const current = snapshot.exists()
      ? normalizeStats(user.uid, snapshot.data(), user)
      : getDefaultStats(user);
    const nextPoints = current.points + earnedPoints;
    transaction.set(
      userReference,
      {
        ...current,
        username: current.username || getDefaultStats(user).username,
        points: increment(earnedPoints),
        seasonPoints: increment(earnedPoints),
        correctCount: increment(correctCount),
        totalCount: increment(results.length),
        rank: getRankForPoints(nextPoints),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  });

  for (const result of results) {
    await addDoc(collection(db, 'history', user.uid, 'items'), {
      question: result.question.question,
      options: result.question.options,
      correct: result.question.correct,
      userAnswer: result.userAnswer,
      isCorrect: result.isCorrect,
      points: result.isCorrect ? getPointsForDifficulty(result.question.difficulty) : 0,
      difficulty: result.question.difficulty,
      explanation: result.question.explanation || '',
      mode: 'free',
      grade: '',
      timestamp: serverTimestamp(),
    });
  }

  return earnedPoints;
}

export async function loadHistory(user: User, itemLimit = 20): Promise<HistoryItem[]> {
  const snapshot = await getDocs(
    query(collection(db, 'history', user.uid, 'items'), orderBy('timestamp', 'desc'), limit(itemLimit)),
  );

  return snapshot.docs.map((item) => {
    const value = item.data();
    return {
      id: item.id,
      question: String(value.question ?? ''),
      options: Array.isArray(value.options) ? value.options.map(String) : [],
      correct: typeof value.correct === 'number' ? value.correct : 0,
      userAnswer: typeof value.userAnswer === 'number' ? value.userAnswer : -1,
      isCorrect: Boolean(value.isCorrect),
      points: typeof value.points === 'number' ? value.points : 0,
      difficulty: (value.difficulty || '初級') as Difficulty,
      explanation: typeof value.explanation === 'string' ? value.explanation : '',
      mode: typeof value.mode === 'string' ? value.mode : 'free',
      grade: typeof value.grade === 'string' ? value.grade : '',
      timestamp: value.timestamp,
    };
  });
}
